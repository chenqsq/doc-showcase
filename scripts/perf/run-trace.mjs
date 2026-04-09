import path from 'node:path';
import {
  ENV_CONFIGS,
  PROFILE_CONFIGS,
  average,
  buildRouteUrl,
  ensureDir,
  max,
  median,
  quantile,
  round,
  routeOutputDir,
  runOutputDir,
  sleep,
  toMs,
  writeJson
} from './config.mjs';
import {
  closeChromeSession,
  createInstrumentedPage,
  getPerfAuditState,
  launchChromeForAudit,
  measureInteraction
} from './browser.mjs';

function formatResourceName(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

async function gotoAndSettle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(500);
}

async function collectPerformanceSnapshot(page) {
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource').map((entry) => ({
      name: entry.name,
      initiatorType: entry.initiatorType,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
      startTime: entry.startTime,
      responseEnd: entry.responseEnd
    }));

    return {
      navigation: navigation
        ? {
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            loadEventEndMs: navigation.loadEventEnd,
            responseEndMs: navigation.responseEnd,
            transferSize: navigation.transferSize,
            encodedBodySize: navigation.encodedBodySize,
            decodedBodySize: navigation.decodedBodySize,
            type: navigation.type
          }
        : null,
      resources
    };
  });
}

function summarizeResources(resources) {
  const normalized = resources.map((resource) => ({
    ...resource,
    name: formatResourceName(resource.name),
    duration: toMs(resource.duration),
    transferSize: resource.transferSize ?? 0,
    startTime: toMs(resource.startTime),
    responseEnd: toMs(resource.responseEnd)
  }));

  const slowResources = [...normalized]
    .sort((left, right) => right.duration - left.duration)
    .slice(0, 10);

  const blockingResources = normalized
    .filter(
      (resource) =>
        ['script', 'link', 'css', 'fetch'].includes(resource.initiatorType) &&
        resource.startTime <= 2000 &&
        resource.duration >= 100
    )
    .sort((left, right) => right.duration - left.duration)
    .slice(0, 10);

  const criticalChain = [...normalized]
    .filter((resource) => ['script', 'link', 'css', 'fetch'].includes(resource.initiatorType))
    .sort((left, right) => left.responseEnd - right.responseEnd)
    .slice(0, 10);

  return {
    requestCount: normalized.length,
    totalTransferSize: normalized.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
    slowResources,
    blockingResources,
    criticalChain
  };
}

function summarizeLongTasks(longTasks) {
  const normalized = longTasks.map((task) => ({
    ...task,
    startTime: toMs(task.startTime),
    duration: toMs(task.duration),
    blockingTime: toMs(Math.max(task.duration - 50, 0))
  }));

  return {
    taskCount: normalized.length,
    tasksOver50ms: normalized.length,
    tasksOver50msFirst5s: normalized.filter((task) => task.startTime <= 5000).length,
    totalBlockingTimeMs: toMs(normalized.reduce((sum, task) => sum + (task.blockingTime || 0), 0)),
    maxTaskDurationMs: max(normalized.map((task) => task.duration).filter((value) => value != null)),
    tasks: normalized
  };
}

async function runScrollJankProbe(page) {
  return page.evaluate(async () => {
    const getScroller = () => {
      const element = document.querySelector('[data-perf-id="reader-scroll-container"]');
      if (
        element instanceof HTMLElement &&
        element.scrollHeight > element.clientHeight + 8 &&
        getComputedStyle(element).overflowY !== 'visible'
      ) {
        return element;
      }
      return document.scrollingElement || document.documentElement;
    };

    const scroller = getScroller();
    const deltas = [];
    let frames = 0;
    let done = false;
    let last = performance.now();

    const rafLoop = (timestamp) => {
      deltas.push(timestamp - last);
      last = timestamp;
      frames += 1;
      if (!done) {
        requestAnimationFrame(rafLoop);
      }
    };

    requestAnimationFrame(rafLoop);
    const startTop = scroller.scrollTop;
    const scrollDistance = Math.max(scroller.scrollHeight - scroller.clientHeight, 0);
    const targetTop = Math.min(startTop + Math.max(scrollDistance * 0.45, 480), scrollDistance);
    const start = performance.now();

    while (performance.now() - start < 5000) {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / 5000, 1);
      scroller.scrollTop = startTop + (targetTop - startTop) * progress;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    done = true;
    scroller.scrollTop = startTop;

    if (!deltas.length) {
      return null;
    }

    const sorted = [...deltas].sort((left, right) => left - right);
    const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)] ?? null;
    const averageDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;

    return {
      durationMs: 5000,
      frames,
      avgFps: Number((1000 / averageDelta).toFixed(2)),
      p95FrameDeltaMs: Number(p95.toFixed(2)),
      framesOver24ms: deltas.filter((value) => value > 24).length,
      framesOver50ms: deltas.filter((value) => value > 50).length
    };
  });
}

async function readScrollPosition(page) {
  return page.evaluate(() => {
    const element = document.querySelector('[data-perf-id="reader-scroll-container"]');
    if (
      element instanceof HTMLElement &&
      element.scrollHeight > element.clientHeight + 8 &&
      getComputedStyle(element).overflowY !== 'visible'
    ) {
      return element.scrollTop;
    }
    return window.scrollY;
  });
}

async function runGenericMobileInteractions(page, interactions) {
  const hamburger = await page.$('[data-perf-id="site-mobile-nav-trigger"]');
  if (!hamburger) {
    return;
  }

  interactions.push(
    await measureInteraction(
      page,
      'mobile-menu-open',
      async () => {
        await page.click('[data-perf-id="site-mobile-nav-trigger"]');
      },
      async () => {
        await page.waitForSelector('[data-perf-id="mobile-sheet"]', { visible: true, timeout: 10000 });
      }
    )
  );

  interactions.push(
    await measureInteraction(
      page,
      'mobile-menu-close',
      async () => {
        await page.click('[data-perf-id="mobile-sheet-close"]');
      },
      async () => {
        await page.waitForFunction(
          () => !document.querySelector('[data-perf-id="mobile-sheet"]'),
          { timeout: 10000 }
        );
      }
    )
  );
}

async function runDocsInteractions(page, profileKey, interactions) {
  if (profileKey === 'mobile') {
    await runGenericMobileInteractions(page, interactions);
  }

  const firstLink = await page.$('[data-perf-id="collection-doc-link"]');
  if (!firstLink) {
    return;
  }

  interactions.push(
    await measureInteraction(
      page,
      `${profileKey}-docs-open-first-doc`,
      async () => {
        await firstLink.click();
      },
      async () => {
        await page.waitForSelector('[data-perf-id="reader-scroll-container"]', { visible: true, timeout: 15000 });
      }
    )
  );
}

async function runReaderInteractions(page, profileKey, interactions) {
  if (profileKey === 'mobile') {
    await runGenericMobileInteractions(page, interactions);

    const trigger = await page.$('[data-perf-id="site-mobile-nav-trigger"]');
    if (!trigger) {
      return;
    }

    await trigger.click();
    await page.waitForSelector('[data-perf-id="mobile-sheet"]', { visible: true, timeout: 10000 });

    if (await page.$('[data-perf-id="reader-mobile-context"]')) {
      interactions.push(
        await measureInteraction(
          page,
          'mobile-reader-tab-sequence',
          async () => {
            await page.click('[data-perf-id="reader-mobile-context"] [data-perf-id="reader-tab-sequence"]');
          },
          async () => {
            await page.waitForSelector(
              '[data-perf-id="reader-mobile-context"] [data-perf-id="reader-tab-sequence"][data-state="active"]',
              { visible: true, timeout: 10000 }
            );
          }
        )
      );

      interactions.push(
        await measureInteraction(
          page,
          'mobile-reader-tab-outline',
          async () => {
            await page.click('[data-perf-id="reader-mobile-context"] [data-perf-id="reader-tab-outline"]');
          },
          async () => {
            await page.waitForSelector(
              '[data-perf-id="reader-mobile-context"] [data-perf-id="reader-tab-outline"][data-state="active"]',
              { visible: true, timeout: 10000 }
            );
          }
        )
      );

      const outlineLinks = await page.$$('[data-perf-id="reader-mobile-context"] [data-perf-id="reader-outline-link"]');
      const target = outlineLinks[1] ?? outlineLinks[0];
      if (target) {
        const previousScroll = await readScrollPosition(page);
        interactions.push(
          await measureInteraction(
            page,
            'mobile-reader-outline-jump',
            async () => {
              await target.click();
            },
            async () => {
              await page.waitForFunction(
                (previous) => {
                  const element = document.querySelector('[data-perf-id="reader-scroll-container"]');
                  const current =
                    element instanceof HTMLElement &&
                    element.scrollHeight > element.clientHeight + 8 &&
                    getComputedStyle(element).overflowY !== 'visible'
                      ? element.scrollTop
                      : window.scrollY;
                  return Math.abs(current - previous) > 32;
                },
                { timeout: 10000 },
                previousScroll
              );
              await page.waitForFunction(
                () => !document.querySelector('[data-perf-id="mobile-sheet"]'),
                { timeout: 10000 }
              );
            }
          )
        );
      }
    }

    if (await page.$('[data-perf-id="mobile-sheet-close"]')) {
      await page.click('[data-perf-id="mobile-sheet-close"]');
      await page.waitForFunction(
        () => !document.querySelector('[data-perf-id="mobile-sheet"]'),
        { timeout: 10000 }
      );
    }

    return;
  }

  const sequenceTab = await page.$('[data-perf-id="reader-tab-sequence"]');
  if (sequenceTab) {
    interactions.push(
      await measureInteraction(
        page,
        'desktop-reader-tab-sequence',
        async () => {
          await page.click('[data-perf-id="reader-tab-sequence"]');
        },
        async () => {
          await page.waitForSelector('[data-perf-id="reader-tab-sequence"][data-state="active"]', {
            visible: true,
            timeout: 10000
          });
        }
      )
    );
  }

  const outlineTab = await page.$('[data-perf-id="reader-tab-outline"]');
  if (outlineTab) {
    interactions.push(
      await measureInteraction(
        page,
        'desktop-reader-tab-outline',
        async () => {
          await page.click('[data-perf-id="reader-tab-outline"]');
        },
        async () => {
          await page.waitForSelector('[data-perf-id="reader-tab-outline"][data-state="active"]', {
            visible: true,
            timeout: 10000
          });
        }
      )
    );
  }

  const outlineLinks = await page.$$('[data-perf-id="reader-outline-link"]');
  const target = outlineLinks[1] ?? outlineLinks[0];
  if (target) {
    const previousScroll = await readScrollPosition(page);
    interactions.push(
      await measureInteraction(
        page,
        'desktop-reader-outline-jump',
        async () => {
          await target.click();
        },
        async () => {
          await page.waitForFunction(
            (previous) => {
              const element = document.querySelector('[data-perf-id="reader-scroll-container"]');
              const current =
                element instanceof HTMLElement &&
                element.scrollHeight > element.clientHeight + 8 &&
                getComputedStyle(element).overflowY !== 'visible'
                  ? element.scrollTop
                  : window.scrollY;
              return Math.abs(current - previous) > 32;
            },
            { timeout: 10000 },
            previousScroll
          );
        }
      )
    );
  }
}

async function runInteractions(page, routeSpec, profileKey) {
  const interactions = [];

  if (routeSpec.type === 'collection') {
    await runDocsInteractions(page, profileKey, interactions);
  } else if (routeSpec.type === 'reader') {
    await runReaderInteractions(page, profileKey, interactions);
  } else if (profileKey === 'mobile') {
    await runGenericMobileInteractions(page, interactions);
  }

  return interactions;
}

function aggregateResources(runWaterfalls) {
  const resourcesByName = new Map();

  for (const run of runWaterfalls) {
    for (const resource of run.slowResources) {
      const entry = resourcesByName.get(resource.name) ?? {
        name: resource.name,
        occurrences: 0,
        durations: [],
        transferSizes: []
      };

      entry.occurrences += 1;
      entry.durations.push(resource.duration);
      entry.transferSizes.push(resource.transferSize || 0);
      resourcesByName.set(resource.name, entry);
    }
  }

  return [...resourcesByName.values()]
    .map((entry) => ({
      name: entry.name,
      occurrences: entry.occurrences,
      avgDurationMs: toMs(average(entry.durations)),
      maxDurationMs: max(entry.durations),
      avgTransferSize: Math.round(average(entry.transferSizes) ?? 0)
    }))
    .sort((left, right) => (right.avgDurationMs ?? 0) - (left.avgDurationMs ?? 0))
    .slice(0, 10);
}

function aggregateInteractions(runs) {
  const grouped = new Map();

  for (const run of runs) {
    for (const interaction of run) {
      const values = grouped.get(interaction.label) ?? [];
      values.push(interaction.durationMs);
      grouped.set(interaction.label, values);
    }
  }

  return [...grouped.entries()]
    .map(([label, values]) => ({
      label,
      sampleCount: values.length,
      medianDurationMs: toMs(median(values)),
      worstDurationMs: max(values)
    }))
    .sort((left, right) => (right.medianDurationMs ?? 0) - (left.medianDurationMs ?? 0));
}

export async function runTraceAudit({
  envKey,
  profileKeys,
  routeSpecs,
  baseUrlOverride = null,
  maxRuns = null
}) {
  const envConfig = ENV_CONFIGS[envKey];
  if (!envConfig) {
    throw new Error(`未知 Trace 环境: ${envKey}`);
  }

  for (const profileKey of profileKeys) {
    const profile = PROFILE_CONFIGS[profileKey];

    for (const routeSpec of routeSpecs) {
      const outputDir = routeOutputDir(envKey, profileKey, routeSpec.key);
      const runsDir = runOutputDir(envKey, profileKey, routeSpec.key);
      ensureDir(runsDir);

      const runCount = maxRuns == null ? envConfig.traceRuns : Math.min(envConfig.traceRuns, maxRuns);
      const url = buildRouteUrl(baseUrlOverride ?? envConfig.baseUrl, routeSpec.path);
      const runResults = [];

      for (let index = 0; index < runCount; index += 1) {
        const chromeSession = await launchChromeForAudit();
        try {
          const { page } = await createInstrumentedPage(chromeSession.browser, envKey, profileKey);
          await gotoAndSettle(page, url);

          const snapshot = await collectPerformanceSnapshot(page);
          const perfState = await getPerfAuditState(page);
          const scrollJank =
            routeSpec.collectScrollJank && routeSpec.type === 'reader' ? await runScrollJankProbe(page) : null;
          const interactions = await runInteractions(page, routeSpec, profileKey);
          const longTasks = summarizeLongTasks(perfState.longTasks ?? []);
          const waterfall = summarizeResources(snapshot.resources ?? []);

          const runResult = {
            runIndex: index + 1,
            fetchedAt: new Date().toISOString(),
            url,
            navigation: snapshot.navigation
              ? {
                  domContentLoadedMs: toMs(snapshot.navigation.domContentLoadedMs),
                  loadEventEndMs: toMs(snapshot.navigation.loadEventEndMs),
                  responseEndMs: toMs(snapshot.navigation.responseEndMs),
                  transferSize: snapshot.navigation.transferSize ?? 0,
                  encodedBodySize: snapshot.navigation.encodedBodySize ?? 0,
                  decodedBodySize: snapshot.navigation.decodedBodySize ?? 0,
                  type: snapshot.navigation.type ?? 'navigate'
                }
              : null,
            waterfall,
            longTasks,
            scrollJank,
            interactions
          };

          runResults.push(runResult);
          writeJson(path.join(runsDir, `trace-${String(index + 1).padStart(2, '0')}.json`), runResult);
          await page.close();
        } finally {
          await closeChromeSession(chromeSession);
        }
      }

      const waterfalls = runResults.map((result) => result.waterfall);
      const longTaskSummaries = runResults.map((result) => result.longTasks);
      const interactions = runResults.map((result) => result.interactions);
      const scrollRuns = runResults.map((result) => result.scrollJank).filter(Boolean);

      const waterfallJson = {
        env: envConfig.label,
        envKey,
        profile: profile.label,
        profileKey,
        route: {
          key: routeSpec.key,
          label: routeSpec.label,
          path: routeSpec.path,
          url
        },
        aggregate: {
          requestCountMedian: median(waterfalls.map((run) => run.requestCount)),
          totalTransferSizeMedian: median(waterfalls.map((run) => run.totalTransferSize)),
          topSlowResources: aggregateResources(waterfalls),
          criticalChains: waterfalls.map((run, index) => ({
            runIndex: index + 1,
            resources: run.criticalChain.slice(0, 6)
          }))
        },
        runs: waterfalls
      };

      const interactionsJson = {
        env: envConfig.label,
        envKey,
        profile: profile.label,
        profileKey,
        route: {
          key: routeSpec.key,
          label: routeSpec.label,
          path: routeSpec.path,
          url
        },
        aggregate: aggregateInteractions(interactions),
        runs: interactions
      };

      const traceJson = {
        env: envConfig.label,
        envKey,
        profile: profile.label,
        profileKey,
        route: {
          key: routeSpec.key,
          label: routeSpec.label,
          path: routeSpec.path,
          url
        },
        aggregate: {
          domContentLoadedMedianMs: toMs(
            median(runResults.map((result) => result.navigation?.domContentLoadedMs).filter(Boolean))
          ),
          loadEventEndMedianMs: toMs(
            median(runResults.map((result) => result.navigation?.loadEventEndMs).filter(Boolean))
          ),
          longTaskCountMedian: median(longTaskSummaries.map((result) => result.tasksOver50ms)),
          longTaskFirst5sMedian: median(longTaskSummaries.map((result) => result.tasksOver50msFirst5s)),
          totalBlockingTimeMedianMs: toMs(
            median(longTaskSummaries.map((result) => result.totalBlockingTimeMs).filter(Boolean))
          ),
          maxSingleLongTaskMs: max(
            longTaskSummaries.map((result) => result.maxTaskDurationMs).filter((value) => value != null)
          ),
          scrollJank:
            scrollRuns.length > 0
              ? {
                  avgFpsMedian: round(median(scrollRuns.map((run) => run.avgFps).filter(Boolean)), 2),
                  p95FrameDeltaMedianMs: toMs(
                    median(scrollRuns.map((run) => run.p95FrameDeltaMs).filter(Boolean))
                  ),
                  severeFramesOver50Median: median(scrollRuns.map((run) => run.framesOver50ms))
                }
              : null
        },
        runs: runResults
      };

      const summaryJson = {
        env: envConfig.label,
        envKey,
        profile: profile.label,
        profileKey,
        route: {
          key: routeSpec.key,
          label: routeSpec.label,
          path: routeSpec.path,
          url
        },
        waterfall: waterfallJson.aggregate,
        longtasks: {
          runCount: longTaskSummaries.length,
          tasksOver50msMedian: median(longTaskSummaries.map((result) => result.tasksOver50ms)),
          tasksOver50msFirst5sMedian: median(longTaskSummaries.map((result) => result.tasksOver50msFirst5s)),
          totalBlockingTimeMedianMs: toMs(
            median(longTaskSummaries.map((result) => result.totalBlockingTimeMs).filter(Boolean))
          ),
          maxSingleLongTaskMs: max(
            longTaskSummaries.map((result) => result.maxTaskDurationMs).filter((value) => value != null)
          )
        },
        'scroll-jank':
          scrollRuns.length > 0
            ? {
                avgFpsMedian: round(median(scrollRuns.map((run) => run.avgFps).filter(Boolean)), 2),
                p95FrameDeltaMs: toMs(median(scrollRuns.map((run) => run.p95FrameDeltaMs).filter(Boolean))),
                severeFramesOver50Median: median(scrollRuns.map((run) => run.framesOver50ms))
              }
            : null,
        interaction: interactionsJson.aggregate
      };

      writeJson(path.join(outputDir, 'waterfall.json'), waterfallJson);
      writeJson(path.join(outputDir, 'interactions.json'), interactionsJson);
      writeJson(path.join(outputDir, 'trace.json'), traceJson);
      writeJson(path.join(outputDir, 'summary.json'), summaryJson);
    }
  }
}
