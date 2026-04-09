import {
  Children,
  Suspense,
  isValidElement,
  lazy,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { catalogByPath, findCatalogTarget, makeHeadingId, resolveRelativePath } from '../catalog';
import type { CatalogItem, LightboxState, OutlineItem } from '../types';
import { StealthScrollArea } from './StealthScrollArea';
import {
  AUTOMATIC_HEAVY_PRIORITY,
  AUTOMATIC_LIGHT_PRIORITY,
  countDiagramMetrics,
  HEAVY_AUTO_RENDER_DELAY,
  HEAVY_VIEWPORT_ROOT_MARGIN,
  isHeavyMermaidDiagram,
  LIGHT_VIEWPORT_ROOT_MARGIN,
  scheduleIdleWork,
  USER_PRIORITY
} from './mermaid-shared';

const MermaidBlock = lazy(() =>
  import('./MermaidBlock').then((module) => ({ default: module.MermaidBlock }))
);

interface MarkdownArticleProps {
  item: CatalogItem;
  onOutlineReady?: (outline: OutlineItem[]) => void;
  onOpenLightbox: (lightbox: LightboxState) => void;
}

interface MermaidBlockSlotProps {
  blockIndex: number;
  chart: string;
  onOpenLightbox: (lightbox: LightboxState) => void;
  title: string;
  totalBlocks: number;
}

function MermaidBlockFallback({ title }: { title: string }) {
  return (
    <div className="mermaid-figure grid gap-[var(--reader-block-gap)] rounded-[1.65rem] border border-border/70 bg-card/82 p-[var(--reader-figure-padding)] shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <span className="inline-flex w-fit rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Mermaid 图表
          </span>
          <strong className="text-base font-semibold text-foreground">{title}</strong>
        </div>
        <span className="inline-flex h-9 w-28 rounded-full bg-accent/70" />
      </div>
      <div className="h-[min(52vh,42rem)] rounded-[1.45rem] border border-border/60 bg-background/88" />
    </div>
  );
}

function MermaidDeferredPlaceholder({
  chars,
  isHeavyDiagram,
  isQueued,
  lines,
  onRenderNow,
  title
}: {
  chars: number;
  isHeavyDiagram: boolean;
  isQueued: boolean;
  lines: number;
  onRenderNow: () => void;
  title: string;
}) {
  return (
    <div className="mermaid-figure grid gap-[var(--reader-block-gap)] rounded-[1.65rem] border border-border/70 bg-card/82 p-[var(--reader-figure-padding)] shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <span className="inline-flex w-fit rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Mermaid 图表
          </span>
          <strong className="text-base font-semibold text-foreground">{title}</strong>
        </div>
        {isHeavyDiagram ? (
          <Button type="button" variant="secondary" size="sm" onClick={onRenderNow} disabled={isQueued}>
            {isQueued ? '正在准备渲染' : '立即渲染'}
          </Button>
        ) : (
          <span className="inline-flex h-9 w-28 rounded-full bg-accent/70" />
        )}
      </div>
      <div className="grid gap-3 rounded-[1.45rem] border border-border/60 bg-background/88 p-[var(--reader-figure-padding)]">
        <div className="h-[min(52vh,42rem)] rounded-[1.25rem] bg-accent/45" />
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1">{lines} 行</span>
          <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1">{chars} 字符</span>
          <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            {isQueued ? '已进入等待队列' : isHeavyDiagram ? '进入视口后延后渲染' : '接近视口后自动渲染'}
          </span>
        </div>
      </div>
    </div>
  );
}

function MermaidBlockSlot({ blockIndex, chart, onOpenLightbox, title, totalBlocks }: MermaidBlockSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [loadPriority, setLoadPriority] = useState<number | null>(null);
  const [shouldLoadBlock, setShouldLoadBlock] = useState(false);
  const diagramMetrics = useMemo(() => countDiagramMetrics(chart), [chart]);
  const isHeavyDiagram = useMemo(() => isHeavyMermaidDiagram(chart, totalBlocks), [chart, totalBlocks]);
  const isQueued = shouldLoadBlock || loadPriority != null;

  useEffect(() => {
    setIsNearViewport(false);
    setLoadPriority(null);
    setShouldLoadBlock(false);
  }, [chart, totalBlocks]);

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
  }, [blockIndex, isHeavyDiagram, shouldLoadBlock, totalBlocks]);

  useEffect(() => {
    if (shouldLoadBlock || loadPriority != null || !isNearViewport) {
      return undefined;
    }

    if (isHeavyDiagram) {
      const timer = globalThis.setTimeout(() => {
        setLoadPriority((current) => current ?? AUTOMATIC_HEAVY_PRIORITY);
        setShouldLoadBlock(true);
      }, HEAVY_AUTO_RENDER_DELAY);

      return () => globalThis.clearTimeout(timer);
    }

    return scheduleIdleWork(() => {
      setLoadPriority((current) => current ?? AUTOMATIC_LIGHT_PRIORITY);
      setShouldLoadBlock(true);
    });
  }, [isHeavyDiagram, isNearViewport, loadPriority, shouldLoadBlock]);

  const handleRenderNow = () => {
    setLoadPriority(USER_PRIORITY);
    setShouldLoadBlock(true);
  };

  if (!shouldLoadBlock) {
    return (
      <div ref={containerRef}>
        <MermaidDeferredPlaceholder
          chars={diagramMetrics.chars}
          isHeavyDiagram={isHeavyDiagram}
          isQueued={isQueued}
          lines={diagramMetrics.lines}
          onRenderNow={handleRenderNow}
          title={title}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <Suspense fallback={<MermaidBlockFallback title={title} />}>
        <MermaidBlock
          blockIndex={blockIndex}
          chart={chart}
          initialRenderPriority={loadPriority}
          title={title}
          totalBlocks={totalBlocks}
          onOpenLightbox={onOpenLightbox}
        />
      </Suspense>
    </div>
  );
}

function buildOutlineFromHeadings(headings: HTMLElement[]) {
  const counts = new Map<string, number>();

  return headings
    .map((heading) => {
      const text = heading.textContent?.replace(/\s+/g, ' ').trim();
      if (!text) {
        return null;
      }

      const occurrence = counts.get(text) ?? 0;
      counts.set(text, occurrence + 1);

      return {
        id: makeHeadingId(text, occurrence),
        level: Number(heading.tagName.slice(1)),
        text
      };
    })
    .filter((entry): entry is OutlineItem => Boolean(entry));
}

export function MarkdownArticle({ item, onOpenLightbox, onOutlineReady }: MarkdownArticleProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const totalMermaidBlocks = useMemo(() => item.rawText?.match(/```mermaid\b/g)?.length ?? 0, [item.rawText]);

  useLayoutEffect(() => {
    const article = articleRef.current;
    if (!article) {
      return;
    }

    let frameId = 0;
    let timeoutId = 0;

    const syncOutline = () => {
      const headings = Array.from(article.querySelectorAll<HTMLElement>('h1, h2, h3, h4'));
      const domOutline = buildOutlineFromHeadings(headings);

      headings.forEach((heading, index) => {
        const entry = domOutline[index];
        if (entry) {
          heading.id = entry.id;
        } else {
          heading.removeAttribute('id');
        }
      });

      onOutlineReady?.(domOutline);
    };

    syncOutline();

    // Reader route首次挂载时，文章节点有时会在首帧后才完全稳定，再补测一轮避免初次进入出现空目录。
    frameId = window.requestAnimationFrame(syncOutline);
    timeoutId = window.setTimeout(syncOutline, 160);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [item.id, item.rawText, onOutlineReady]);

  const components = useMemo(() => {
    let mermaidBlockIndex = 0;

    return {
      pre: ({ children }: { children?: ReactNode }) => {
        const hasMermaid = Children.toArray(children).some(
          (child) => isValidElement(child) && child.type === MermaidBlockSlot
        );

        return hasMermaid ? <>{children}</> : <pre>{children}</pre>;
      },
      a: ({ href, children }: { href?: string; children?: ReactNode }) => {
        if (!href) {
          return <span>{children}</span>;
        }

        const target = findCatalogTarget(item.relativePath, href);
        if (target) {
          return <Link to={`/read/${target.id}`}>{children}</Link>;
        }

        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      },
      img: ({ src, alt }: { src?: string; alt?: string }) => {
        if (!src) {
          return null;
        }

        const resolvedPath = resolveRelativePath(item.relativePath, src);
        const target = resolvedPath ? catalogByPath.get(resolvedPath) : undefined;
        const assetSrc = target?.assetUrl ?? src;
        const title = alt || target?.title || '文档配图';

        return (
          <figure className="inline-figure">
            <div className="inline-figure__media">
              <img src={assetSrc} alt={title} onClick={() => onOpenLightbox({ src: assetSrc, title })} />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="inline-figure__action"
                onClick={() => onOpenLightbox({ src: assetSrc, title })}
              >
                放大查看
              </Button>
            </div>
            {title ? <figcaption>{title}</figcaption> : null}
          </figure>
        );
      },
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="article-callout">{children}</blockquote>
      ),
      table: ({ children }: { children?: ReactNode }) => (
        <div className="article-table-block">
          <div className="article-table-hint">左右滑动查看表格</div>
          <StealthScrollArea axis="x" className="article-table-shell overflow-x-auto">
            <table>{children}</table>
          </StealthScrollArea>
        </div>
      ),
      code: ({
        className,
        children
      }: {
        className?: string;
        children?: ReactNode;
      }) => {
        const code = String(children ?? '').replace(/\n$/, '');

        if (className?.includes('language-mermaid')) {
          mermaidBlockIndex += 1;
          return (
            <MermaidBlockSlot
              blockIndex={mermaidBlockIndex}
              chart={code}
              title={`${item.title} - Mermaid 图表`}
              totalBlocks={totalMermaidBlocks}
              onOpenLightbox={onOpenLightbox}
            />
          );
        }

        return <code className={className}>{children}</code>;
      }
    };
  }, [item.relativePath, item.title, onOpenLightbox, totalMermaidBlocks]);

  return (
    <article ref={articleRef} className="markdown-article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {item.rawText ?? ''}
      </ReactMarkdown>
    </article>
  );
}
