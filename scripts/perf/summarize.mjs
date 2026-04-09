import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  OUTPUT_ROOT,
  PROFILE_KEYS,
  ROUTE_KEYS,
  ENV_CONFIGS,
  PROFILE_CONFIGS,
  listFilesRecursively,
  readJson,
  routeOutputDir,
  writeJson,
  writeText
} from './config.mjs';

const READER_DESKTOP_SCROLL_P95_THRESHOLD_MS = 34;
const READER_DESKTOP_SEVERE_FRAMES_THRESHOLD = 1;

function evaluateThresholds(summary, lighthouse) {
  const failures = [];
  const routeKey = summary.route.key;
  const envKey = summary.envKey;
  const profileKey = summary.profileKey;
  const lighthouseMedian = lighthouse?.aggregate?.medianMetrics ?? {};
  const interactionSummary = summary.interaction ?? [];

  const interactionByLabel = Object.fromEntries(
    interactionSummary.map((entry) => [entry.label, entry.medianDurationMs ?? null])
  );

  if (envKey === 'pages' && profileKey === 'mobile' && ['home', 'docs'].includes(routeKey)) {
    if ((lighthouseMedian.largestContentfulPaintMs ?? 0) > 3000) {
      failures.push({
        severity: 'P0',
        metric: 'LCP',
        detail: `${routeKey} Pages mobile LCP ${lighthouseMedian.largestContentfulPaintMs}ms > 3000ms`
      });
    }

    if ((lighthouseMedian.totalBlockingTimeMs ?? 0) > 200) {
      failures.push({
        severity: 'P0',
        metric: 'TBT',
        detail: `${routeKey} Pages mobile TBT ${lighthouseMedian.totalBlockingTimeMs}ms > 200ms`
      });
    }

    if ((summary.longtasks?.tasksOver50msFirst5sMedian ?? 0) > 3) {
      failures.push({
        severity: 'P1',
        metric: 'Long Tasks',
        detail: `${routeKey} 前 5 秒长任务中位数 ${summary.longtasks.tasksOver50msFirst5sMedian} > 3`
      });
    }
  }

  if (envKey === 'pages' && profileKey === 'mobile' && routeKey === 'read-heavy') {
    if ((lighthouseMedian.largestContentfulPaintMs ?? 0) > 3800) {
      failures.push({
        severity: 'P0',
        metric: 'LCP',
        detail: `重型阅读页 Pages mobile LCP ${lighthouseMedian.largestContentfulPaintMs}ms > 3800ms`
      });
    }

    if ((lighthouseMedian.totalBlockingTimeMs ?? 0) > 300) {
      failures.push({
        severity: 'P0',
        metric: 'TBT',
        detail: `重型阅读页 Pages mobile TBT ${lighthouseMedian.totalBlockingTimeMs}ms > 300ms`
      });
    }

    if ((summary.longtasks?.maxSingleLongTaskMs ?? 0) > 250) {
      failures.push({
        severity: 'P0',
        metric: 'Max Long Task',
        detail: `重型阅读页单个长任务 ${summary.longtasks.maxSingleLongTaskMs}ms > 250ms`
      });
    }
  }

  if (['preview', 'pages'].includes(envKey) && profileKey === 'desktop' && routeKey === 'read-heavy') {
    if ((summary['scroll-jank']?.p95FrameDeltaMs ?? 0) > READER_DESKTOP_SCROLL_P95_THRESHOLD_MS) {
      failures.push({
        severity: 'P1',
        metric: 'Scroll P95',
        detail: `重型阅读页 ${envKey} desktop p95 帧间隔 ${summary['scroll-jank'].p95FrameDeltaMs}ms > ${READER_DESKTOP_SCROLL_P95_THRESHOLD_MS}ms`
      });
    }

    if ((summary['scroll-jank']?.severeFramesOver50Median ?? 0) > READER_DESKTOP_SEVERE_FRAMES_THRESHOLD) {
      failures.push({
        severity: 'P1',
        metric: 'Severe Frames',
        detail: `重型阅读页 ${envKey} desktop 超过 50ms 帧数中位数 ${summary['scroll-jank'].severeFramesOver50Median} > ${READER_DESKTOP_SEVERE_FRAMES_THRESHOLD}`
      });
    }
  }

  if (envKey === 'pages' && profileKey === 'mobile') {
    if ((interactionByLabel['mobile-menu-open'] ?? 0) > 180) {
      failures.push({
        severity: 'P1',
        metric: 'Mobile Menu Open',
        detail: `移动端汉堡打开 ${interactionByLabel['mobile-menu-open']}ms > 180ms`
      });
    }

    if ((interactionByLabel['mobile-menu-close'] ?? 0) > 180) {
      failures.push({
        severity: 'P1',
        metric: 'Mobile Menu Close',
        detail: `移动端汉堡关闭 ${interactionByLabel['mobile-menu-close']}ms > 180ms`
      });
    }

    if ((interactionByLabel['mobile-reader-tab-sequence'] ?? 0) > 180) {
      failures.push({
        severity: 'P1',
        metric: 'Mobile Reader Tab',
        detail: `移动端目录/顺序切换 ${interactionByLabel['mobile-reader-tab-sequence']}ms > 180ms`
      });
    }

    if ((interactionByLabel['mobile-docs-open-first-doc'] ?? 0) > 300) {
      failures.push({
        severity: 'P1',
        metric: 'Docs to Reader',
        detail: `移动端列表到阅读页 ${interactionByLabel['mobile-docs-open-first-doc']}ms > 300ms`
      });
    }
  }

  return failures;
}

function getSlowResourceHint(waterfall) {
  const top = waterfall?.aggregate?.topSlowResources?.[0];
  if (!top) {
    return null;
  }
  return `${top.name} 平均 ${top.avgDurationMs}ms`;
}

export function buildOptimizationMatrix(entries) {
  const matrix = {
    P0: [],
    P1: [],
    P2: []
  };

  for (const entry of entries) {
    const hint = getSlowResourceHint(entry.waterfall);
    const failures = entry.failures;

    if (failures.length) {
      for (const failure of failures) {
        matrix[failure.severity].push({
          env: entry.summary.envKey,
          profile: entry.summary.profileKey,
          route: entry.summary.route.key,
          metric: failure.metric,
          detail: hint ? `${failure.detail}; 资源归因: ${hint}` : failure.detail
        });
      }
      continue;
    }

    if (hint) {
      matrix.P2.push({
        env: entry.summary.envKey,
        profile: entry.summary.profileKey,
        route: entry.summary.route.key,
        metric: 'Observation',
        detail: `当前最慢资源: ${hint}`
      });
    }
  }

  return matrix;
}

function toMarkdown(entries, matrix) {
  const lines = [
    '# 文档站双基线性能审计报告',
    '',
    `生成时间：${new Date().toISOString()}`,
    '',
    '## 基线',
    '',
    '- `preview`：本地 `vite preview` 工程基线',
    '- `pages`：GitHub Pages 发布基线',
    '',
    '## 结果摘要',
    ''
  ];

  for (const envKey of Object.keys(ENV_CONFIGS)) {
    lines.push(`### ${ENV_CONFIGS[envKey].label}`);
    lines.push('');

    for (const profileKey of PROFILE_KEYS) {
      lines.push(`#### ${PROFILE_CONFIGS[profileKey].label}`);
      lines.push('');
      lines.push('| 路由 | LCP(ms) | TBT(ms) | 长任务首 5 秒 | 交互最慢(ms) | 滚动 P95(ms) |');
      lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');

      for (const routeKey of ROUTE_KEYS) {
        const entry = entries.find(
          (candidate) =>
            candidate.summary.envKey === envKey &&
            candidate.summary.profileKey === profileKey &&
            candidate.summary.route.key === routeKey
        );

        if (!entry) {
          lines.push(`| ${routeKey} | - | - | - | - | - |`);
          continue;
        }

        const interactionWorst = entry.summary.interaction?.[0]?.medianDurationMs ?? '-';
        lines.push(
          `| ${routeKey} | ${entry.lighthouse?.aggregate?.medianMetrics?.largestContentfulPaintMs ?? '-'} | ${
            entry.lighthouse?.aggregate?.medianMetrics?.totalBlockingTimeMs ?? '-'
          } | ${entry.summary.longtasks?.tasksOver50msFirst5sMedian ?? '-'} | ${interactionWorst} | ${
            entry.summary['scroll-jank']?.p95FrameDeltaMs ?? '-'
          } |`
        );
      }

      lines.push('');
    }
  }

  lines.push('## 异常与优化优先级');
  lines.push('');

  for (const severity of ['P0', 'P1', 'P2']) {
    lines.push(`### ${severity}`);
    lines.push('');
    if (!matrix[severity].length) {
      lines.push('- 无');
      lines.push('');
      continue;
    }
    for (const entry of matrix[severity]) {
      lines.push(
        `- [${entry.env}/${entry.profile}/${entry.route}] ${entry.metric}: ${entry.detail}`
      );
    }
    lines.push('');
  }

  lines.push('## 明细文件');
  lines.push('');
  lines.push('- `output/perf/<env>/<profile>/<route>/lighthouse.json`');
  lines.push('- `output/perf/<env>/<profile>/<route>/trace.json`');
  lines.push('- `output/perf/<env>/<profile>/<route>/waterfall.json`');
  lines.push('- `output/perf/<env>/<profile>/<route>/interactions.json`');
  lines.push('- `output/perf/<env>/<profile>/<route>/summary.json`');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

export function summarizePerfOutputs() {
  const summaryFiles = listFilesRecursively(OUTPUT_ROOT, 'summary.json');
  const entries = summaryFiles
    .map((filePath) => {
      const summary = readJson(filePath);
      const baseDir = path.dirname(filePath);
      const lighthousePath = path.join(baseDir, 'lighthouse.json');
      const waterfallPath = path.join(baseDir, 'waterfall.json');
      const interactionsPath = path.join(baseDir, 'interactions.json');
      return {
        summary,
        lighthouse: fs.existsSync(lighthousePath) ? readJson(lighthousePath) : null,
        waterfall: fs.existsSync(waterfallPath) ? readJson(waterfallPath) : null,
        interactions: fs.existsSync(interactionsPath) ? readJson(interactionsPath) : null
      };
    })
    .map((entry) => ({
      ...entry,
      failures: evaluateThresholds(entry.summary, entry.lighthouse)
    }))
    .sort((left, right) => {
      const leftKey = `${left.summary.envKey}/${left.summary.profileKey}/${left.summary.route.key}`;
      const rightKey = `${right.summary.envKey}/${right.summary.profileKey}/${right.summary.route.key}`;
      return leftKey.localeCompare(rightKey, 'en');
    });

  const regressionSummary = {
    generatedAt: new Date().toISOString(),
    environments: Object.keys(ENV_CONFIGS),
    profiles: PROFILE_KEYS,
    routes: ROUTE_KEYS,
    entries: entries.map((entry) => ({
      env: entry.summary.envKey,
      profile: entry.summary.profileKey,
      route: entry.summary.route.key,
      lcpMs: entry.lighthouse?.aggregate?.medianMetrics?.largestContentfulPaintMs ?? null,
      tbtMs: entry.lighthouse?.aggregate?.medianMetrics?.totalBlockingTimeMs ?? null,
      longTasksFirst5s: entry.summary.longtasks?.tasksOver50msFirst5sMedian ?? null,
      interactionWorstMs: entry.summary.interaction?.[0]?.medianDurationMs ?? null,
      scrollP95Ms: entry.summary['scroll-jank']?.p95FrameDeltaMs ?? null,
      failures: entry.failures
    })),
    optimizationMatrix: buildOptimizationMatrix(entries)
  };

  writeJson(path.join(OUTPUT_ROOT, 'regression-summary.json'), regressionSummary);
  writeText(path.join(OUTPUT_ROOT, 'report.md'), toMarkdown(entries, regressionSummary.optimizationMatrix));
  return regressionSummary;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  summarizePerfOutputs();
}
