import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  lazy,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  READER_DESKTOP_SHELL_QUERY,
  ReaderContentFallback,
  readReaderSidebarCollapsed,
  usePrefersReducedMotion,
  writeReaderSidebarCollapsed
} from '@/shell-core';
import { activeDocItems } from '@/active-docs';
import { archiveDocs, catalogById, debugKnowledgeDocs, loadCatalogItemById, preloadCatalogItemById } from '@/catalog';
import { MarkdownArticle } from '@/components/MarkdownArticle';
import { ReaderSidebar, type ReaderSidebarPanel } from '@/components/ReaderSidebar';
import { StealthScrollArea } from '@/components/StealthScrollArea';
import { cn } from '@/lib/utils';
import { COLLECTION_LABELS } from '@/shell-core';
import type { CatalogItem, LightboxState, OutlineItem, ResourceCollection } from '@/types';

const loadPdfViewerModule = () => import('@/components/PdfViewer');
const PdfViewer = lazy(() => loadPdfViewerModule().then((module) => ({ default: module.PdfViewer })));

const MERMAID_BLOCK_RENDERED_EVENT = 'mermaid:block-rendered';
const DESKTOP_PROGRESS_STEP = 5;

function preloadInitialReaderDocument() {
  if (typeof window === 'undefined') {
    return;
  }

  const match = window.location.pathname.match(/\/read\/([^/?#]+)/);
  const initialId = match?.[1];
  if (!initialId) {
    return;
  }

  preloadCatalogItemById(decodeURIComponent(initialId));
}

preloadInitialReaderDocument();

export interface ReaderMobileNavigationState {
  activeHeadingId?: string;
  activePanel: ReaderSidebarPanel;
  collectionLabel: string;
  collectionMeta: string;
  item: CatalogItem;
  onPanelChange: (panel: ReaderSidebarPanel) => void;
  onSelectHeading: (headingId: string) => void;
  outline: OutlineItem[];
  sequenceItems: CatalogItem[];
}

interface ReaderRouteProps {
  mobileNavOpen: boolean;
  onReaderCollectionChange: (collection: ResourceCollection | null) => void;
  onReaderMobileNavigationChange: (state: ReaderMobileNavigationState | null) => void;
  onRegisterReaderScrollContainer: (node: HTMLDivElement | null) => void;
  onZoom: (lightbox: LightboxState) => void;
}

function outlinesMatch(left: OutlineItem[], right: OutlineItem[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every(
    (entry, index) =>
      entry.id === right[index]?.id &&
      entry.level === right[index]?.level &&
      entry.text === right[index]?.text
  );
}

function getWindowScrollMetrics() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { clientHeight: 0, scrollHeight: 0, scrollTop: 0 };
  }

  const root = document.documentElement;
  const body = document.body;

  return {
    clientHeight: window.innerHeight,
    scrollHeight: Math.max(
      root.scrollHeight,
      root.offsetHeight,
      body?.scrollHeight ?? 0,
      body?.offsetHeight ?? 0
    ),
    scrollTop: window.scrollY
  };
}

function getScrollProgress(scrollTop: number, scrollHeight: number, clientHeight: number) {
  const scrollableDistance = Math.max(scrollHeight - clientHeight, 0);
  if (scrollableDistance <= 1) {
    return 100;
  }

  return Math.min(Math.max((scrollTop / scrollableDistance) * 100, 0), 100);
}

function normalizeScrollProgress(progress: number, desktopReaderShell: boolean) {
  if (!desktopReaderShell) {
    return progress;
  }

  return Math.min(100, Math.round(progress / DESKTOP_PROGRESS_STEP) * DESKTOP_PROGRESS_STEP);
}

export default function ReaderRoute({
  mobileNavOpen,
  onReaderCollectionChange,
  onReaderMobileNavigationChange,
  onRegisterReaderScrollContainer,
  onZoom
}: ReaderRouteProps) {
  const { id } = useParams();
  const baseItem = id ? catalogById.get(id) : undefined;
  const [item, setItem] = useState<CatalogItem | undefined>(baseItem);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readReaderSidebarCollapsed());
  const [sidebarPanel, setSidebarPanel] = useState<ReaderSidebarPanel>('outline');
  const [activeHeadingId, setActiveHeadingId] = useState<string | undefined>();
  const [renderedOutline, setRenderedOutline] = useState<OutlineItem[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [desktopReaderShell, setDesktopReaderShell] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(READER_DESKTOP_SHELL_QUERY).matches : false
  );
  const shouldReduceMotion = usePrefersReducedMotion();
  const articleScrollRef = useRef<HTMLDivElement | null>(null);
  const headingOffsetsRef = useRef<Array<{ id: string; top: number }>>([]);
  const effectiveOutline = renderedOutline;
  const isRenderableItem = Boolean(item && item.type !== 'image');
  const activeItem = isRenderableItem ? item : undefined;
  const sequenceItems = useMemo(() => {
    if (!activeItem) {
      return [];
    }

    if (activeItem.collection === 'active-docs') {
      return activeDocItems;
    }

    const collectionItems = activeItem.collection === 'debug-kb' ? debugKnowledgeDocs : archiveDocs;
    const groupItems = collectionItems.filter((candidate) => candidate.group === activeItem.group);

    return groupItems.length ? groupItems : collectionItems;
  }, [activeItem]);
  const currentIndex = activeItem ? sequenceItems.findIndex((entry) => entry.id === activeItem.id) : -1;
  const currentStep = Math.max(currentIndex + 1, 1);
  const collectionLabel = activeItem ? COLLECTION_LABELS[activeItem.collection] : '';
  const collectionMeta = activeItem
    ? [`第 ${String(currentStep).padStart(2, '0')} 篇`, activeItem.group].filter(Boolean).join(' / ')
    : '';
  const railWidth = sidebarCollapsed ? 88 : 304;
  const railTransitionMs = shouldReduceMotion ? 0 : 220;
  const panelTransitionMs = shouldReduceMotion ? 0 : 180;

  useLayoutEffect(() => {
    if (!baseItem) {
      return undefined;
    }

    if (baseItem.type === 'pdf') {
      void loadPdfViewerModule();
    } else {
      preloadCatalogItemById(baseItem.id);
    }
    return undefined;
  }, [baseItem]);

  useLayoutEffect(() => {
    setRenderedOutline([]);
    setItem(baseItem);
    if (!baseItem || baseItem.type !== 'markdown') {
      return undefined;
    }

    let cancelled = false;

    loadCatalogItemById(baseItem.id).then((loadedItem) => {
      if (!cancelled && loadedItem) {
        setItem({ ...loadedItem });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [baseItem]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia(READER_DESKTOP_SHELL_QUERY);
    const updateReaderShell = () => setDesktopReaderShell(media.matches);

    updateReaderShell();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateReaderShell);
      return () => media.removeEventListener('change', updateReaderShell);
    }

    media.addListener(updateReaderShell);
    return () => media.removeListener(updateReaderShell);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (articleScrollRef.current) {
      articleScrollRef.current.scrollTop = 0;
    }
    headingOffsetsRef.current = [];
    setActiveHeadingId(undefined);
    setScrollProgress(0);
    setSidebarPanel('outline');
  }, [activeItem?.id]);

  useEffect(() => {
    writeReaderSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    setActiveHeadingId(effectiveOutline[0]?.id);
  }, [activeItem, effectiveOutline]);

  useEffect(() => {
    onReaderCollectionChange(activeItem?.collection ?? null);
  }, [activeItem?.collection, onReaderCollectionChange]);

  const attachArticleScrollContainer = useCallback(
    (node: HTMLDivElement | null) => {
      articleScrollRef.current = node;
      onRegisterReaderScrollContainer(node);
    },
    [onRegisterReaderScrollContainer]
  );

  const handleOutlineReady = useCallback((nextOutline: OutlineItem[]) => {
    setRenderedOutline((current) => (outlinesMatch(current, nextOutline) ? current : nextOutline));
  }, []);

  const handleSelectHeading = useCallback(
    (headingId: string) => {
      const target = document.getElementById(headingId);
      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: 'auto',
        block: 'start'
      });
      setActiveHeadingId(headingId);
    },
    []
  );

  const readerContent = useMemo(() => {
    if (!activeItem) {
      return null;
    }

    if (activeItem.type === 'markdown') {
      return activeItem.rawText ? (
        <MarkdownArticle item={activeItem} onOpenLightbox={onZoom} onOutlineReady={handleOutlineReady} />
      ) : (
        <ReaderContentFallback mode="markdown" />
      );
    }

    if (activeItem.type === 'pdf' && activeItem.assetUrl) {
      return <PdfViewer src={activeItem.assetUrl} title={activeItem.title} />;
    }

    return null;
  }, [activeItem, handleOutlineReady, onZoom]);

  const measureHeadingOffsets = useCallback(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !effectiveOutline.length) {
      headingOffsetsRef.current = [];
      return;
    }

    const scrollContainer = desktopReaderShell ? articleScrollRef.current : null;
    const containerTop = scrollContainer ? scrollContainer.getBoundingClientRect().top : 0;
    const baseScrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

    headingOffsetsRef.current = effectiveOutline
      .map((entry) => {
        const target = document.getElementById(entry.id);
        if (!target) {
          return null;
        }

        const top = scrollContainer
          ? baseScrollTop + target.getBoundingClientRect().top - containerTop
          : window.scrollY + target.getBoundingClientRect().top;

        return { id: entry.id, top };
      })
      .filter((entry): entry is { id: string; top: number } => Boolean(entry));
  }, [desktopReaderShell, effectiveOutline]);

  useEffect(() => {
    if (!activeItem) {
      headingOffsetsRef.current = [];
      setScrollProgress(0);
      return undefined;
    }

    const scrollContainer = desktopReaderShell ? articleScrollRef.current : null;
    let syncFrame = 0;
    let measureFrame = 0;

    const syncReaderState = () => {
      syncFrame = 0;

      const metrics = scrollContainer
        ? {
            clientHeight: scrollContainer.clientHeight,
            scrollHeight: scrollContainer.scrollHeight,
            scrollTop: scrollContainer.scrollTop
          }
        : getWindowScrollMetrics();

      const nextProgress = normalizeScrollProgress(
        getScrollProgress(metrics.scrollTop, metrics.scrollHeight, metrics.clientHeight),
        desktopReaderShell
      );
      startTransition(() => {
        setScrollProgress((current) => (current === nextProgress ? current : nextProgress));
      });

      if (!headingOffsetsRef.current.length) {
        if (effectiveOutline.length) {
          scheduleMeasure();
        }
        return;
      }

      const threshold = scrollContainer ? 96 : 148;
      const activeAnchor = metrics.scrollTop + threshold;
      const nextActiveHeading =
        [...headingOffsetsRef.current].reverse().find((entry) => entry.top <= activeAnchor + 1) ??
        headingOffsetsRef.current[0];

      if (nextActiveHeading?.id) {
        startTransition(() => {
          setActiveHeadingId((previous) =>
            previous === nextActiveHeading.id ? previous : nextActiveHeading.id
          );
        });
      }
    };

    const runMeasure = () => {
      measureFrame = 0;
      measureHeadingOffsets();
      if (!syncFrame) {
        syncFrame = window.requestAnimationFrame(syncReaderState);
      }
    };

    const scheduleMeasure = () => {
      if (measureFrame) {
        return;
      }

      measureFrame = window.requestAnimationFrame(runMeasure);
    };

    const scheduleSync = () => {
      if (syncFrame) {
        return;
      }

      syncFrame = window.requestAnimationFrame(syncReaderState);
    };

    const handleMermaidRendered = () => {
      scheduleMeasure();
    };

    scheduleMeasure();

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', scheduleSync, { passive: true });
    } else {
      window.addEventListener('scroll', scheduleSync, { passive: true });
    }

    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener(MERMAID_BLOCK_RENDERED_EVENT, handleMermaidRendered);

    return () => {
      if (syncFrame) {
        window.cancelAnimationFrame(syncFrame);
      }
      if (measureFrame) {
        window.cancelAnimationFrame(measureFrame);
      }

      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', scheduleSync);
      } else {
        window.removeEventListener('scroll', scheduleSync);
      }

      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener(MERMAID_BLOCK_RENDERED_EVENT, handleMermaidRendered);
    };
  }, [activeItem, desktopReaderShell, effectiveOutline, measureHeadingOffsets]);

  useEffect(() => () => onReaderMobileNavigationChange(null), [onReaderMobileNavigationChange]);
  useEffect(() => () => onReaderCollectionChange(null), [onReaderCollectionChange]);

  useEffect(() => {
    if (!activeItem) {
      onReaderMobileNavigationChange(null);
      return;
    }

    if (!mobileNavOpen) {
      return;
    }

    onReaderMobileNavigationChange({
      activeHeadingId,
      activePanel: sidebarPanel,
      collectionLabel,
      collectionMeta,
      item: activeItem,
      onPanelChange: setSidebarPanel,
      onSelectHeading: handleSelectHeading,
      outline: effectiveOutline,
      sequenceItems
    });
  }, [
    activeHeadingId,
    activeItem,
    collectionLabel,
    collectionMeta,
    effectiveOutline,
    handleSelectHeading,
    mobileNavOpen,
    onReaderMobileNavigationChange,
    sequenceItems,
    sidebarPanel
  ]);

  if (!activeItem) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page-safe-top reader-workspace-safe-top mx-auto w-full max-w-[1460px] px-4 pb-24 md:px-6 min-[1200px]:h-dvh min-[1200px]:overflow-hidden min-[1200px]:pb-3">
      <div className="flex items-start gap-6 xl:gap-8 min-[1200px]:h-[calc(100dvh-var(--reader-workspace-offset)-0.75rem)]">
        <aside
          className="relative hidden shrink-0 min-[1200px]:block min-[1200px]:h-full transition-[width] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: railWidth, transitionDuration: `${railTransitionMs}ms` }}
        >
          <button
            type="button"
            data-perf-id="reader-sidebar-toggle"
            className="absolute right-[-16px] top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-floating)] transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={sidebarCollapsed ? '展开目录' : '收起目录'}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <div className="relative h-full">
            <div
              className={cn(
                'absolute inset-0 h-full overflow-hidden rounded-[2rem] border border-sidebar-border/80 bg-sidebar/95 p-3.5 shadow-[var(--shadow-panel)] transition-[opacity,transform,visibility] ease-out',
                sidebarCollapsed
                  ? 'pointer-events-none invisible -translate-x-3 opacity-0'
                  : 'pointer-events-auto visible translate-x-0 opacity-100'
              )}
              style={{ transitionDuration: `${panelTransitionMs}ms` }}
            >
              <div className="h-full">
                <ReaderSidebar
                  activeHeadingId={activeHeadingId}
                  activePanel={sidebarPanel}
                  collectionLabel={collectionLabel}
                  collectionMeta={collectionMeta}
                  item={activeItem}
                  onPanelChange={setSidebarPanel}
                  onSelectHeading={handleSelectHeading}
                  outline={effectiveOutline}
                  scrollProgress={scrollProgress}
                  sequenceItems={sequenceItems}
                />
              </div>
            </div>
            <div
              className={cn(
                'absolute inset-0 grid content-center justify-items-center gap-4 rounded-[1.8rem] border border-sidebar-border/80 bg-sidebar/92 px-3 py-5 text-sidebar-foreground shadow-[var(--shadow-panel)] transition-[opacity,transform,visibility] ease-out',
                sidebarCollapsed
                  ? 'pointer-events-auto visible translate-x-0 opacity-100'
                  : 'pointer-events-none invisible translate-x-2 opacity-0'
              )}
              style={{ transitionDuration: `${panelTransitionMs}ms` }}
              aria-hidden={!sidebarCollapsed}
            >
              <strong className="font-serif text-2xl text-primary">{String(currentStep).padStart(2, '0')}</strong>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-[var(--layout-panel-gap)] min-[1200px]:flex min-[1200px]:h-full min-[1200px]:min-h-0 min-[1200px]:flex-col min-[1200px]:space-y-0">
          <div className="layout-panel-padding mx-auto w-full max-w-[var(--reader-max)] rounded-[2rem] border border-border/70 bg-card/92 shadow-[var(--shadow-panel)] min-[1200px]:flex min-[1200px]:h-full min-[1200px]:min-h-0 min-[1200px]:max-w-none min-[1200px]:flex-1 min-[1200px]:flex-col min-[1200px]:overflow-hidden min-[1200px]:p-[var(--reader-shell-padding)]">
            <StealthScrollArea
              ref={attachArticleScrollContainer}
              axis="y"
              data-perf-id="reader-scroll-container"
              className="reader-scroll-shell min-[1200px]:h-full min-[1200px]:overflow-y-auto min-[1200px]:pb-[var(--reader-content-end-space)]"
            >
              <Suspense fallback={<ReaderContentFallback mode={activeItem.type === 'pdf' ? 'pdf' : 'markdown'} />}>
                {readerContent}
              </Suspense>
            </StealthScrollArea>
          </div>
        </section>
      </div>
    </main>
  );
}
