import path from 'node:path';
import lighthouse from 'lighthouse';
import {
  ENV_CONFIGS,
  PROFILE_CONFIGS,
  average,
  buildRouteUrl,
  ensureDir,
  max,
  median,
  min,
  routeOutputDir,
  runOutputDir,
  toMs,
  toPercent,
  writeJson
} from './config.mjs';
import { closeChromeSession, launchChromeForAudit, warmPage } from './browser.mjs';

function getLighthouseMetrics(lhr) {
  const audits = lhr.audits;
  return {
    performanceScore: toPercent(lhr.categories.performance?.score ?? 0),
    firstContentfulPaintMs: toMs(audits['first-contentful-paint']?.numericValue),
    largestContentfulPaintMs: toMs(audits['largest-contentful-paint']?.numericValue),
    totalBlockingTimeMs: toMs(audits['total-blocking-time']?.numericValue),
    cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue ?? null,
    interactionToNextPaintMs: toMs(audits['interaction-to-next-paint']?.numericValue),
    speedIndexMs: toMs(audits['speed-index']?.numericValue)
  };
}

function buildLighthouseConfig(envKey, profileKey, disableStorageReset) {
  const envConfig = ENV_CONFIGS[envKey];
  const profile = PROFILE_CONFIGS[profileKey];

  return {
    extends: 'lighthouse:default',
    settings: {
      onlyCategories: ['performance'],
      formFactor: profile.formFactor,
      screenEmulation: {
        mobile: profile.mobile,
        width: profile.width,
        height: profile.height,
        deviceScaleFactor: profile.deviceScaleFactor,
        disabled: false
      },
      throttlingMethod: envConfig.throttlingMethod,
      throttling: envConfig.throttling ?? undefined,
      disableStorageReset
    }
  };
}

async function runSingleLighthouse(url, envKey, profileKey, warmCache) {
  const chromeSession = await launchChromeForAudit();

  try {
    if (warmCache) {
      const warmPageSession = await chromeSession.browser.newPage();
      const profile = PROFILE_CONFIGS[profileKey];
      await warmPageSession.setViewport({
        width: profile.width,
        height: profile.height,
        deviceScaleFactor: profile.deviceScaleFactor,
        isMobile: profile.mobile,
        hasTouch: profile.hasTouch
      });
      await warmPage(warmPageSession, url);
      await warmPageSession.close();
    }

    const result = await lighthouse(
      url,
      {
        port: chromeSession.chrome.port,
        output: 'json',
        logLevel: 'error',
        disableStorageReset: warmCache
      },
      buildLighthouseConfig(envKey, profileKey, warmCache)
    );

    if (!result?.lhr) {
      throw new Error(`Lighthouse 未返回有效结果: ${url}`);
    }

    return {
      fetchedAt: new Date().toISOString(),
      runType: warmCache ? 'warm' : 'cold',
      requestedUrl: result.lhr.requestedUrl,
      finalUrl: result.lhr.finalUrl,
      metrics: getLighthouseMetrics(result.lhr),
      audits: {
        resourceSummary: result.lhr.audits['resource-summary']?.details?.items ?? [],
        networkRequests: result.lhr.audits['network-requests']?.details?.items?.slice(0, 20) ?? []
      },
      categories: {
        performance: result.lhr.categories.performance?.score ?? null
      }
    };
  } finally {
    await closeChromeSession(chromeSession);
  }
}

function aggregateRuns(runs) {
  const metrics = [
    'performanceScore',
    'firstContentfulPaintMs',
    'largestContentfulPaintMs',
    'totalBlockingTimeMs',
    'cumulativeLayoutShift',
    'interactionToNextPaintMs',
    'speedIndexMs'
  ];

  const medianMetrics = Object.fromEntries(
    metrics.map((metric) => [
      metric,
      metric === 'cumulativeLayoutShift'
        ? median(runs.map((run) => run.metrics[metric]).filter((value) => value != null))
        : toMs(median(runs.map((run) => run.metrics[metric]).filter((value) => value != null)))
    ])
  );

  const worstMetrics = Object.fromEntries(
    metrics.map((metric) => {
      const values = runs.map((run) => run.metrics[metric]).filter((value) => value != null);
      if (!values.length) {
        return [metric, null];
      }
      if (metric === 'performanceScore') {
        return [metric, min(values)];
      }
      if (metric === 'cumulativeLayoutShift') {
        return [metric, max(values)];
      }
      return [metric, toMs(max(values))];
    })
  );

  return {
    runCount: runs.length,
    coldRunCount: runs.filter((run) => run.runType === 'cold').length,
    warmRunCount: runs.filter((run) => run.runType === 'warm').length,
    medianMetrics,
    worstMetrics,
    averagePerformanceScore: average(runs.map((run) => run.metrics.performanceScore).filter(Boolean))
  };
}

export async function runLighthouseAudit({
  envKey,
  profileKeys,
  routeSpecs,
  baseUrlOverride = null,
  maxRuns = null
}) {
  const envConfig = ENV_CONFIGS[envKey];
  if (!envConfig) {
    throw new Error(`未知 Lighthouse 环境: ${envKey}`);
  }

  for (const profileKey of profileKeys) {
    ensureDir(path.join(runOutputDir(envKey, profileKey, 'noop')));

    for (const routeSpec of routeSpecs) {
      const outputDir = routeOutputDir(envKey, profileKey, routeSpec.key);
      const runsDir = runOutputDir(envKey, profileKey, routeSpec.key);
      ensureDir(runsDir);

      const coldRunCount = maxRuns == null ? envConfig.coldRuns : Math.min(envConfig.coldRuns, maxRuns);
      const warmRunCount = maxRuns == null ? envConfig.warmRuns : Math.min(envConfig.warmRuns, maxRuns);
      const runs = [];
      const url = buildRouteUrl(baseUrlOverride ?? envConfig.baseUrl, routeSpec.path);

      for (let index = 0; index < coldRunCount; index += 1) {
        const run = await runSingleLighthouse(url, envKey, profileKey, false);
        runs.push(run);
        writeJson(path.join(runsDir, `lighthouse-cold-${String(index + 1).padStart(2, '0')}.json`), run);
      }

      for (let index = 0; index < warmRunCount; index += 1) {
        const run = await runSingleLighthouse(url, envKey, profileKey, true);
        runs.push(run);
        writeJson(path.join(runsDir, `lighthouse-warm-${String(index + 1).padStart(2, '0')}.json`), run);
      }

      writeJson(path.join(outputDir, 'lighthouse.json'), {
        env: envConfig.label,
        envKey,
        profile: PROFILE_CONFIGS[profileKey].label,
        profileKey,
        route: {
          key: routeSpec.key,
          label: routeSpec.label,
          path: routeSpec.path,
          url
        },
        aggregate: aggregateRuns(runs),
        runs
      });
    }
  }
}
