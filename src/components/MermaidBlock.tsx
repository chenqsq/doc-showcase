import { Expand } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { DEFAULT_THEME, type ThemeId, getMermaidTheme } from '@/appearance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StealthScrollArea } from './StealthScrollArea';
import type { LightboxState } from '../types';

interface MermaidBlockProps {
  chart: string;
  title: string;
  onOpenLightbox: (lightbox: LightboxState) => void;
}

interface DiagramSize {
  height: number;
  width: number;
}

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

export function MermaidBlock({ chart, title, onOpenLightbox }: MermaidBlockProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    if (typeof document === 'undefined') {
      return DEFAULT_THEME;
    }

    return (document.documentElement.dataset.theme as ThemeId) || DEFAULT_THEME;
  });
  const [desktopViewport, setDesktopViewport] = useState<DiagramSize>({ width: 0, height: 0 });
  const [isDesktopViewport, setIsDesktopViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 960px)').matches : false
  );
  const elementId = useId().replace(/:/g, '-');
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const diagramSize = useMemo(() => readSvgSize(svg), [svg]);
  const svgDataUrl = useMemo(
    () => (svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : ''),
    [svg]
  );
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
    let cancelled = false;
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
      fontFamily:
        '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
    });

    mermaid
      .render(`mermaid-${elementId}`, chart)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError('');
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Mermaid 渲染失败');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, elementId, themeId]);

  const openLightbox = () => {
    if (!svgDataUrl) {
      return;
    }

    onOpenLightbox({ src: svgDataUrl, title });
  };

  if (error) {
    return (
      <div className="mermaid-figure rounded-[var(--surface-card-radius)] border border-dashed border-border bg-background/84 p-[var(--reader-figure-padding)] md:bg-card/70">
        <Badge variant="outline">Mermaid 渲染失败</Badge>
        <pre>{chart}</pre>
      </div>
    );
  }

  return (
    <div className="mermaid-figure grid gap-[var(--reader-block-gap)] rounded-[var(--surface-card-radius)] border border-border/60 bg-background/84 p-[var(--reader-figure-padding)] md:border-border/70 md:bg-card/82 md:shadow-[var(--shadow-soft)] md:backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <Badge variant="outline" className="w-fit">
            Mermaid 图表
          </Badge>
          <strong className="text-base font-semibold text-foreground">{title}</strong>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-fit rounded-[var(--surface-control-radius)] shadow-none"
          onClick={openLightbox}
          disabled={!svg}
        >
          <Expand className="h-4 w-4" />
          放大查看
        </Button>
      </div>

      <button
        type="button"
        className="mermaid-figure__mobile-preview"
        onClick={openLightbox}
        disabled={!svg}
        aria-label={`放大查看 ${title}`}
      >
        {svg ? <img src={svgDataUrl} alt={title} /> : <span className="block h-40 w-full" />}
      </button>

      <StealthScrollArea
        ref={viewportRef}
        axis="both"
        className="mermaid-figure__viewport overflow-auto rounded-[1rem] border border-border/60 bg-background/90 p-[var(--reader-figure-padding)] text-left transition-colors md:rounded-[1.05rem]"
        onClick={openLightbox}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLightbox();
          }
        }}
        aria-label={`放大查看 ${title}`}
        role="button"
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
        ) : (
          <span className="block min-h-[16rem] w-full" />
        )}
      </StealthScrollArea>
    </div>
  );
}
