import { Expand } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_THEME, type ThemeId, getMermaidTheme } from '@/appearance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AUTOMATIC_HEAVY_PRIORITY,
  AUTOMATIC_LIGHT_PRIORITY,
  countDiagramMetrics,
  getMermaidThemeId,
  HEAVY_AUTO_RENDER_DELAY,
  HEAVY_IDLE_SCHEDULE_TIMEOUT,
  HEAVY_VIEWPORT_ROOT_MARGIN,
  isHeavyMermaidDiagram,
  LIGHT_VIEWPORT_ROOT_MARGIN,
  MERMAID_BLOCK_RENDERED_EVENT,
  scheduleIdleWork,
  SYSTEM_SANS_STACK,
  USER_PRIORITY
} from './mermaid-shared';
import { StealthScrollArea } from './StealthScrollArea';
import type { LightboxState } from '../types';

interface MermaidBlockProps {
  blockIndex: number;
  chart: string;
  initialRenderPriority?: number | null;
  title: string;
  totalBlocks: number;
  onOpenLightbox: (lightbox: LightboxState) => void;
}

interface DiagramSize {
  height: number;
  width: number;
}

interface QueuedRenderTask {
  execute: () => Promise<void>;
  key: string;
  priority: number;
  started: boolean;
}

const svgMarkupCache = new Map<string, string>();
const pendingRenderCache = new Map<string, { promise: Promise<string>; task: QueuedRenderTask }>();

let mermaidModulePromise: Promise<typeof import('mermaid').default> | null = null;
let queuedRenderTasks: QueuedRenderTask[] = [];
let isQueueRunning = false;
let renderSequence = 0;

function parseSvgDimension(value?: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const nextValue = Number.parseFloat(match[0]);
  return Number.isFinite(nextValue) ? nextValue : null;
}

function readSvgSize(markup: string): DiagramSize | null {
  const viewBoxMatch = markup.match(/viewBox=["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const values = viewBoxMatch[1]
      .trim()
      .split(/[\s,]+/)
      .map((part) => Number.parseFloat(part))
      .filter((part) => Number.isFinite(part));

    if (values.length === 4 && values[2] > 0 && values[3] > 0) {
      return { width: values[2], height: values[3] };
    }
  }

  const widthMatch = markup.match(/\swidth=["']([^"']+)["']/i);
  const heightMatch = markup.match(/\sheight=["']([^"']+)["']/i);
  const width = parseSvgDimension(widthMatch?.[1]);
  const height = parseSvgDimension(heightMatch?.[1]);

  if (width && height) {
    return { width, height };
  }

  return null;
}

function getRenderCacheKey(chart: string, themeId: ThemeId) {
  return `${themeId}::${chart}`;
}

function sortQueuedTasks() {
  queuedRenderTasks.sort((left, right) => right.priority - left.priority);
}

function runMermaidQueue() {
  if (isQueueRunning) {
    return;
  }

  const nextTask = queuedRenderTasks.shift();
  if (!nextTask) {
    return;
  }

  isQueueRunning = true;
  nextTask.started = true;

  nextTask
    .execute()
    .finally(() => {
      isQueueRunning = false;
      runMermaidQueue();
    })
    .catch(() => {
      // Errors are handled by the task promise itself.
    });
}

async function getMermaidModule() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid').then((module) => module.default);
  }

  return mermaidModulePromise;
}

function requestMermaidSvg(chart: string, themeId: ThemeId, priority: number) {
  const cacheKey = getRenderCacheKey(chart, themeId);
  const cachedMarkup = svgMarkupCache.get(cacheKey);
  if (cachedMarkup) {
    return Promise.resolve(cachedMarkup);
  }

  const pendingEntry = pendingRenderCache.get(cacheKey);
  if (pendingEntry) {
    if (!pendingEntry.task.started && priority > pendingEntry.task.priority) {
      pendingEntry.task.priority = priority;
      sortQueuedTasks();
    }

    return pendingEntry.promise;
  }

  let resolvePromise: ((svg: string) => void) | undefined;
  let rejectPromise: ((error: unknown) => void) | undefined;

  const promise = new Promise<string>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;
  });

  const task: QueuedRenderTask = {
    key: cacheKey,
    priority,
    started: false,
    execute: async () => {
      try {
        const mermaid = await getMermaidModule();
        const mermaidTheme = getMermaidTheme(themeId);

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          darkMode: mermaidTheme.darkMode,
          themeVariables: mermaidTheme.themeVariables,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true
          },
          fontFamily: SYSTEM_SANS_STACK
        });

        const { svg } = await mermaid.render(`mermaid-${renderSequence += 1}`, chart);
        svgMarkupCache.set(cacheKey, svg);
        pendingRenderCache.delete(cacheKey);
        resolvePromise?.(svg);
      } catch (error) {
        pendingRenderCache.delete(cacheKey);
        rejectPromise?.(error);
      }
    }
  };

  pendingRenderCache.set(cacheKey, { promise, task });
  queuedRenderTasks.push(task);
  sortQueuedTasks();
  runMermaidQueue();

  return promise;
}

function MermaidPlaceholder({
  canRenderNow,
  chars,
  isQueued,
  lines,
  onRenderNow
}: {
  canRenderNow: boolean;
  chars: number;
  isQueued: boolean;
  lines: number;
  onRenderNow: () => void;
}) {
  return (
    <div className="mermaid-figure__placeholder">
      <div className="grid gap-3">
        <strong className="text-base font-semibold text-foreground">图表将在需要时再渲染</strong>
        <p className="mermaid-figure__placeholder-copy">
          当前图表会在滚动到附近后自动排队渲染。需要立刻查看时，可以直接手动触发。
        </p>
      </div>

      <div className="mermaid-figure__placeholder-meta">
        <span className="mermaid-figure__placeholder-chip">{lines} 行</span>
        <span className="mermaid-figure__placeholder-chip">{chars} 字符</span>
        <span className="mermaid-figure__placeholder-chip">{isQueued ? '排队中' : '延迟渲染'}</span>
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={onRenderNow} disabled={!canRenderNow}>
        {isQueued ? '正在准备渲染' : '立即渲染'}
      </Button>
    </div>
  );
}

export function MermaidBlock({
  blockIndex,
  chart,
  initialRenderPriority = null,
  title,
  totalBlocks,
  onOpenLightbox
}: MermaidBlockProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [themeId, setThemeId] = useState<ThemeId>(() => getMermaidThemeId());
  const [desktopViewport, setDesktopViewport] = useState<DiagramSize>({ width: 0, height: 0 });
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 960px)').matches : false
  );
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderPriority, setRenderPriority] = useState<number | null>(initialRenderPriority);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const diagramSize = useMemo(() => readSvgSize(svg), [svg]);
  const svgDataUrl = useMemo(
    () => (svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : ''),
    [svg]
  );
  const diagramMetrics = useMemo(() => countDiagramMetrics(chart), [chart]);
  const isHeavyDiagram = useMemo(() => isHeavyMermaidDiagram(chart, totalBlocks), [chart, totalBlocks]);
  const fitScale = useMemo(() => {
    if (!isDesktopViewport || !diagramSize || desktopViewport.width <= 0 || desktopViewport.height <= 0) {
      return 1;
    }

    const widthScale = desktopViewport.width / diagramSize.width;
    const heightScale = desktopViewport.height / diagramSize.height;

    return Math.min(widthScale, heightScale, 1);
  }, [desktopViewport.height, desktopViewport.width, diagramSize, isDesktopViewport]);
  const scaledDiagramSize = useMemo(() => {
    if (!diagramSize) {
      return null;
    }

    return {
      width: Math.max(diagramSize.width * fitScale, 0),
      height: Math.max(diagramSize.height * fitScale, 0)
    };
  }, [diagramSize, fitScale]);
  const isRenderQueued = renderPriority != null && !svg && !error;

  useEffect(() => {
    setSvg('');
    setError('');
    setIsNearViewport(false);
    setIsRendering(false);
    setRenderPriority(initialRenderPriority);
  }, [chart, initialRenderPriority, totalBlocks]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setThemeId((root.dataset.theme as ThemeId) || DEFAULT_THEME);
    });

    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svg || typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new CustomEvent(MERMAID_BLOCK_RENDERED_EVENT));
  }, [svg]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia('(min-width: 960px)');
    const updateViewportMode = () => setIsDesktopViewport(media.matches);

    updateViewportMode();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateViewportMode);
      return () => media.removeEventListener('change', updateViewportMode);
    }

    media.addListener(updateViewportMode);
    return () => media.removeListener(updateViewportMode);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const node = viewportRef.current;
    if (!node) {
      return undefined;
    }

    const measureViewport = () => {
      const styles = window.getComputedStyle(node);
      const inlinePadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const blockPadding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);

      setDesktopViewport({
        width: Math.max(node.clientWidth - inlinePadding, 0),
        height: Math.max(window.innerHeight * 0.52 - blockPadding, 240)
      });
    };

    measureViewport();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => measureViewport()) : null;
    resizeObserver?.observe(node);
    window.addEventListener('resize', measureViewport);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measureViewport);
    };
  }, [svg]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return undefined;
    }

    const node = containerRef.current;
    if (!node) {
      return undefined;
    }

    const root = node.closest('[data-perf-id="reader-scroll-container"]');
    const observer = new IntersectionObserver(
      (entries) => {
        setIsNearViewport(entries.some((entry) => entry.isIntersecting));
      },
      {
        root: root instanceof Element ? root : null,
        rootMargin: isHeavyDiagram ? HEAVY_VIEWPORT_ROOT_MARGIN : LIGHT_VIEWPORT_ROOT_MARGIN
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [blockIndex, isHeavyDiagram, totalBlocks]);

  useEffect(() => {
    if (svg || error || isHeavyDiagram || renderPriority != null || !isNearViewport) {
      return undefined;
    }

    return scheduleIdleWork(() => {
      setRenderPriority((current) => current ?? AUTOMATIC_LIGHT_PRIORITY);
    });
  }, [error, isHeavyDiagram, isNearViewport, renderPriority, svg]);

  useEffect(() => {
    if (svg || error || !isHeavyDiagram || renderPriority != null || !isNearViewport) {
      return undefined;
    }

    let cancelIdleWork: (() => void) | undefined;
    const timer = globalThis.setTimeout(() => {
      cancelIdleWork = scheduleIdleWork(() => {
        setRenderPriority((current) => current ?? AUTOMATIC_HEAVY_PRIORITY);
      }, HEAVY_IDLE_SCHEDULE_TIMEOUT);
    }, HEAVY_AUTO_RENDER_DELAY);

    return () => {
      globalThis.clearTimeout(timer);
      cancelIdleWork?.();
    };
  }, [error, isHeavyDiagram, isNearViewport, renderPriority, svg]);

  useEffect(() => {
    if (renderPriority == null) {
      return undefined;
    }

    let cancelled = false;
    setIsRendering(true);
    setError('');

    requestMermaidSvg(chart, themeId, renderPriority)
      .then((renderedSvg) => {
        if (!cancelled) {
          setSvg(renderedSvg);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Mermaid 渲染失败');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsRendering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, renderPriority, themeId]);

  const openLightbox = () => {
    if (!svgDataUrl) {
      return;
    }

    onOpenLightbox({ src: svgDataUrl, title });
  };

  const renderNow = () => {
    setRenderPriority(USER_PRIORITY);
  };

  if (error) {
    return (
      <div
        ref={containerRef}
        className="mermaid-figure rounded-[1.5rem] border border-dashed border-border bg-card/70 p-[var(--reader-figure-padding)]"
      >
        <Badge variant="outline">Mermaid 渲染失败</Badge>
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-figure grid gap-[var(--reader-block-gap)] rounded-[1.65rem] border border-border/70 bg-card/82 p-[var(--reader-figure-padding)] shadow-[var(--shadow-soft)] backdrop-blur-sm"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <Badge variant="outline" className="w-fit">
            Mermaid 图表
          </Badge>
          <strong className="text-base font-semibold text-foreground">{title}</strong>
        </div>
        {isHeavyDiagram && !svg ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={renderNow}
            disabled={isRenderQueued}
          >
            {isRenderQueued ? '正在准备渲染' : '立即渲染'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={openLightbox}
            disabled={!svg}
          >
            <Expand className="h-4 w-4" />
            放大查看
          </Button>
        )}
      </div>

      <button
        type="button"
        className="mermaid-figure__mobile-preview"
        onClick={openLightbox}
        disabled={!svg}
        aria-label={`放大查看 ${title}`}
      >
        {svg ? <img src={svgDataUrl} alt={title} /> : <span className="mermaid-figure__skeleton" />}
      </button>

      <StealthScrollArea
        ref={viewportRef}
        axis="both"
        className="mermaid-figure__viewport overflow-auto rounded-[1.45rem] border border-border/60 bg-background/88 p-[var(--reader-figure-padding)] text-left transition-colors"
        onClick={svg ? openLightbox : undefined}
        onKeyDown={
          svg
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openLightbox();
                }
              }
            : undefined
        }
        aria-label={svg ? `放大查看 ${title}` : `${title} 占位态`}
        role={svg ? 'button' : undefined}
        tabIndex={svg ? 0 : -1}
      >
        {svg ? (
          <span
            className="mermaid-figure__frame"
            style={
              scaledDiagramSize
                ? {
                    width: `${scaledDiagramSize.width}px`,
                    height: `${scaledDiagramSize.height}px`
                  }
                : undefined
            }
          >
            <span
              className="mermaid-figure__canvas"
              style={
                diagramSize
                  ? {
                      width: `${diagramSize.width}px`,
                      height: `${diagramSize.height}px`,
                      transform: `scale(${fitScale})`
                    }
                  : undefined
              }
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </span>
        ) : isHeavyDiagram ? (
          <MermaidPlaceholder
            canRenderNow={!isRenderQueued}
            chars={diagramMetrics.chars}
            isQueued={isRendering || isRenderQueued}
            lines={diagramMetrics.lines}
            onRenderNow={renderNow}
          />
        ) : (
          <div className="mermaid-figure__placeholder">
            <span className="mermaid-figure__skeleton" />
            <span className="mermaid-figure__status">
              {isRenderQueued ? '正在空闲时段准备渲染图表。' : '滚动到附近后会自动渲染图表。'}
            </span>
          </div>
        )}
      </StealthScrollArea>
    </div>
  );
}
