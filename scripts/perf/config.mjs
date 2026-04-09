import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const OUTPUT_ROOT = path.join(REPO_ROOT, 'output', 'perf');
export const PREVIEW_PORT = 4274;
export const PAGES_BASE_URL = 'https://chenqsq.github.io/doc-showcase';

export const ROUTE_KEYS = ['home', 'docs', 'read-lite', 'read-heavy', 'read-pdf'];
export const PROFILE_KEYS = ['desktop', 'mobile'];

export const PROFILE_CONFIGS = {
  desktop: {
    key: 'desktop',
    label: 'Desktop 1280x900',
    width: 1280,
    height: 900,
    mobile: false,
    deviceScaleFactor: 1,
    hasTouch: false,
    formFactor: 'desktop'
  },
  mobile: {
    key: 'mobile',
    label: 'Mobile 390x844',
    width: 390,
    height: 844,
    mobile: true,
    deviceScaleFactor: 2,
    hasTouch: true,
    formFactor: 'mobile'
  }
};

const FAST_4G = {
  rttMs: 150,
  throughputKbps: 1638.4,
  requestLatencyMs: 562.5,
  downloadThroughputKbps: 1474.56,
  uploadThroughputKbps: 675
};

export const ENV_CONFIGS = {
  preview: {
    key: 'preview',
    label: 'Local Preview',
    baseUrl: null,
    cpuSlowdownMultiplier: 4,
    coldRuns: 1,
    warmRuns: 1,
    traceRuns: 1,
    throttlingMethod: 'provided',
    throttling: null
  },
  pages: {
    key: 'pages',
    label: 'GitHub Pages',
    baseUrl: PAGES_BASE_URL,
    cpuSlowdownMultiplier: 4,
    coldRuns: 3,
    warmRuns: 2,
    traceRuns: 3,
    throttlingMethod: 'devtools',
    throttling: {
      requestLatencyMs: FAST_4G.requestLatencyMs,
      downloadThroughputKbps: FAST_4G.downloadThroughputKbps,
      uploadThroughputKbps: FAST_4G.uploadThroughputKbps,
      cpuSlowdownMultiplier: 4
    },
    cdpNetwork: {
      offline: false,
      latency: FAST_4G.rttMs,
      downloadThroughput: Math.floor((FAST_4G.throughputKbps * 1024) / 8),
      uploadThroughput: Math.floor((FAST_4G.uploadThroughputKbps * 1024) / 8),
      connectionType: 'cellular4g'
    }
  }
};

const STATIC_ROUTES = {
  home: {
    key: 'home',
    label: '首页',
    path: '/',
    type: 'home',
    collectScrollJank: false
  },
  docs: {
    key: 'docs',
    label: '作品文档列表',
    path: '/docs',
    type: 'collection',
    collectScrollJank: false
  },
  'read-lite': {
    key: 'read-lite',
    label: '轻量阅读页',
    path: '/read/r1vxsnpg',
    type: 'reader',
    collectScrollJank: false
  },
  'read-heavy': {
    key: 'read-heavy',
    label: '重型阅读页',
    path: '/read/r885px4',
    type: 'reader',
    collectScrollJank: true
  }
};

function normalizeSlash(value) {
  return value.replace(/\\/g, '/');
}

function isPdfPath(relativePath) {
  return (
    relativePath.endsWith('.pdf') &&
    (relativePath.startsWith('doc/智能体文档/') ||
      relativePath.startsWith('doc/腾讯平台使用文档/') ||
      relativePath.startsWith('doc/比赛资料/'))
  );
}

function walkFiles(rootDir, relativeDir = '') {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const nextRelative = normalizeSlash(path.join(relativeDir, entry.name));
    if (entry.isDirectory()) {
      return walkFiles(rootDir, nextRelative);
    }
    return [nextRelative];
  });
}

export function hashCatalogPath(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `r${(hash >>> 0).toString(36)}`;
}

export function findRepresentativePdfRoute() {
  const candidateRoots = [
    path.join(REPO_ROOT, 'doc', '智能体文档'),
    path.join(REPO_ROOT, 'doc', '腾讯平台使用文档'),
    path.join(REPO_ROOT, 'doc', '比赛资料')
  ];

  const matches = candidateRoots
    .flatMap((rootDir) => {
      const baseName = path.basename(rootDir);
      return walkFiles(rootDir).map((relative) => normalizeSlash(path.join('doc', baseName, relative)));
    })
    .filter(isPdfPath)
    .sort((left, right) => left.localeCompare(right, 'zh-CN'));

  if (!matches.length) {
    throw new Error('未找到可用的 PDF 文档，无法生成代表性 PDF 路由。');
  }

  const relativePath = matches[0];
  return {
    key: 'read-pdf',
    label: '代表性 PDF 阅读页',
    path: `/read/${hashCatalogPath(relativePath)}`,
    type: 'pdf',
    relativePath,
    collectScrollJank: false
  };
}

export function resolveRouteSpecs(routeKeys = ROUTE_KEYS) {
  const pdfRoute = findRepresentativePdfRoute();
  const routeMap = {
    ...STATIC_ROUTES,
    'read-pdf': pdfRoute
  };

  return routeKeys.map((key) => {
    const spec = routeMap[key];
    if (!spec) {
      throw new Error(`未知审计路由: ${key}`);
    }
    return spec;
  });
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value, 'utf8');
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function listFilesRecursively(rootDir, fileName) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  return walkFiles(rootDir)
    .filter((relativePath) => path.basename(relativePath) === fileName)
    .map((relativePath) => path.join(rootDir, relativePath));
}

export function routeOutputDir(envKey, profileKey, routeKey) {
  return path.join(OUTPUT_ROOT, envKey, profileKey, routeKey);
}

export function runOutputDir(envKey, profileKey, routeKey) {
  return path.join(routeOutputDir(envKey, profileKey, routeKey), 'runs');
}

export function buildRouteUrl(baseUrl, routePath) {
  const trimmedBase = baseUrl.replace(/\/$/, '');
  if (routePath === '/') {
    return `${trimmedBase}/`;
  }
  return `${trimmedBase}${routePath}`;
}

export function createPreviewBaseUrl(port) {
  return `http://127.0.0.1:${port}/doc-showcase`;
}

export function median(values) {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

export function average(values) {
  if (!values.length) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function quantile(values, ratio) {
  if (!values.length) {
    return null;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1));
  return sorted[index];
}

export function max(values) {
  return values.length ? Math.max(...values) : null;
}

export function min(values) {
  return values.length ? Math.min(...values) : null;
}

export function round(value, digits = 2) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return Number(value.toFixed(digits));
}

export function clamp(value, lower, upper) {
  return Math.min(Math.max(value, lower), upper);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toMs(value) {
  return round(value, 2);
}

export function toPercent(value) {
  return round(value * 100, 1);
}

export function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

export function parseCliArgs(argv) {
  const options = {};

  for (const arg of argv) {
    if (!arg.startsWith('--')) {
      continue;
    }

    const [rawKey, rawValue] = arg.slice(2).split('=');
    options[rawKey] = rawValue ?? 'true';
  }

  const parsed = {
    routes: options.routes ? options.routes.split(',').filter(Boolean) : null,
    profiles: options.profiles ? options.profiles.split(',').filter(Boolean) : null,
    maxRuns: options['max-runs'] ? Number(options['max-runs']) : null
  };

  if (parsed.maxRuns != null && (!Number.isFinite(parsed.maxRuns) || parsed.maxRuns <= 0)) {
    throw new Error(`无效的 --max-runs 参数: ${options['max-runs']}`);
  }

  return parsed;
}
