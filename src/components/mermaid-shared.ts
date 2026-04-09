import { DEFAULT_THEME, type ThemeId } from '@/appearance';

export const HEAVY_DIAGRAM_LINE_THRESHOLD = 12;
export const HEAVY_DIAGRAM_CHAR_THRESHOLD = 240;
export const HEAVY_PAGE_BLOCK_THRESHOLD = 2;
export const LIGHT_VIEWPORT_ROOT_MARGIN = '800px 0px';
export const HEAVY_VIEWPORT_ROOT_MARGIN = '0px 0px';
export const HEAVY_AUTO_RENDER_DELAY = 6000;
export const LIGHT_IDLE_SCHEDULE_TIMEOUT = 1500;
export const HEAVY_IDLE_SCHEDULE_TIMEOUT = 1500;
export const AUTOMATIC_HEAVY_PRIORITY = 1;
export const AUTOMATIC_LIGHT_PRIORITY = 2;
export const USER_PRIORITY = 3;
export const MERMAID_BLOCK_RENDERED_EVENT = 'mermaid:block-rendered';
export const SYSTEM_SANS_STACK = '"PingFang SC", "Microsoft YaHei", "Segoe UI", system-ui, sans-serif';

export interface DiagramMetrics {
  chars: number;
  lines: number;
}

export function countDiagramMetrics(chart: string): DiagramMetrics {
  const nonEmptyLines = chart
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    chars: chart.trim().length,
    lines: nonEmptyLines.length
  };
}

export function getMermaidThemeId() {
  if (typeof document === 'undefined') {
    return DEFAULT_THEME;
  }

  return (document.documentElement.dataset.theme as ThemeId) || DEFAULT_THEME;
}

export function isHeavyMermaidDiagram(chart: string, totalBlocks: number) {
  const metrics = countDiagramMetrics(chart);

  return (
    metrics.lines >= HEAVY_DIAGRAM_LINE_THRESHOLD ||
    metrics.chars >= HEAVY_DIAGRAM_CHAR_THRESHOLD ||
    totalBlocks >= HEAVY_PAGE_BLOCK_THRESHOLD
  );
}

export function scheduleIdleWork(callback: () => void, timeout = LIGHT_IDLE_SCHEDULE_TIMEOUT) {
  if (typeof window === 'undefined') {
    callback();
    return () => undefined;
  }

  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback(handle);
  }

  const handle = globalThis.setTimeout(callback, 0);
  return () => globalThis.clearTimeout(handle);
}
