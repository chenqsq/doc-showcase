import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  COLLECTION_LABELS,
  READER_DESKTOP_SHELL_QUERY,
  ReaderContentFallback,
  getCollectionRoute,
  getSequenceItems,
  readReaderSidebarCollapsed,
  writeReaderSidebarCollapsed
} from '@/app-shell';
import { catalogById, extractOutline, loadCatalogItemById } from '@/catalog';
import { ReaderSidebar, type ReaderSidebarPanel } from '@/components/ReaderSidebar';
import { StealthScrollArea } from '@/components/StealthScrollArea';
import { cn } from '@/lib/utils';
import type { CatalogItem, LightboxState, ReaderMobileNavigationState } from '@/types';

const MarkdownArticle = lazy(() =>
  import('@/components/MarkdownArticle').then((module) => ({ default: module.MarkdownArticle }))
);
const PdfViewer = lazy(() =>
  import('@/components/PdfViewer').then((module) => ({ default: module.PdfViewer }))
);

interface ReaderRouteProps {
  onReaderMobileNavigationChange: (navigation: ReaderMobileNavigationState | null) => void;
  onReaderScrollStateChange: (scrollTop: number) => void;
  onRegisterReaderScrollContainer: (node: HTMLDivElement | null) => void;
  onZoom: (lightbox: LightboxState) => void;
}

export default function ReaderRoute({
  onReaderMobileNavigationChange,
  onReaderScrollStateChange,
  onRegisterReaderScrollContainer,
  onZoom
}: ReaderRouteProps) {
  const { id } = useParams();
  const baseItem = id ? catalogById.get(id) : undefined;
  const [item, setItem] = useState<CatalogItem | undefined>(baseItem);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readReaderSidebarCollapsed());
  const [sidebarPanel, setSidebarPanel] = useState<ReaderSidebarPanel>('outline');
  const [activeHeadingId, setActiveHeadingId] = useState<string | undefined>();
  const [desktopReaderShell, setDesktopReaderShell] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(READER_DESKTOP_SHELL_QUERY).matches : false
  );
  const shouldReduceMotion = useReducedMotion();
  const articleScrollRef = useRef<HTMLDivElement | null>(null);
  const outline = useMemo(() => extractOutline(item?.rawText), [item?.rawText]);
  const panelMountScope = useMemo(
    () => `${item?.id ?? 'unknown'}:${desktopReaderShell ? 'desktop' : 'single'}`,
    [desktopReaderShell, item?.id]
  );

  useEffect(() => {
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
    setSidebarPanel('outline');
  }, [desktopReaderShell, item?.id]);

  useEffect(() => {
    writeReaderSidebarCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  const attachArticleScrollContainer = useCallback(
    (node: HTMLDivElement | null) => {
      articleScrollRef.current = node;
      onRegisterReaderScrollContainer(node);
    },
    [onRegisterReaderScrollContainer]
  );

  useEffect(() => {
    setActiveHeadingId(outline[0]?.id);
  }, [item?.id, outline]);

  useEffect(() => {
    if (!outline.length) {
      setActiveHeadingId(undefined);
      return undefined;
    }

    const scrollContainer = desktopReaderShell ? articleScrollRef.current : null;

    const updateActiveHeading = () => {
      const containerTop = scrollContainer ? scrollContainer.getBoundingClientRect().top : 0;
      const threshold = scrollContainer ? 96 : 148;
      const visible = outline
        .map((entry) => {
          const target = document.getElementById(entry.id);
          if (!target) {
            return null;
          }

          const top = scrollContainer
            ? target.getBoundingClientRect().top - containerTop
            : target.getBoundingClientRect().top;

          return { entry, top };
        })
        .filter((candidate): candidate is { entry: (typeof outline)[number]; top: number } => Boolean(candidate));

      const current =
        [...visible].reverse().find((candidate) => candidate.top <= threshold) ??
        visible.find((candidate) => candidate.top > threshold) ??
        visible[0];

      if (current?.entry.id) {
        setActiveHeadingId(current.entry.id);
      }
    };

    updateActiveHeading();

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateActiveHeading, { passive: true });
      window.addEventListener('resize', updateActiveHeading);

      return () => {
        scrollContainer.removeEventListener('scroll', updateActiveHeading);
        window.removeEventListener('resize', updateActiveHeading);
      };
    }

    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [desktopReaderShell, outline]);

  const handleSelectHeading = useCallback(
    (headingId: string) => {
      const target = document.getElementById(headingId);
      if (!target) {
        return;
      }

      target.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start'
      });
      setActiveHeadingId(headingId);
    },
    [shouldReduceMotion]
  );

  const sequenceItems = useMemo(() => (item ? getSequenceItems(item) : []), [item]);
  const currentIndex = useMemo(
    () => (item ? sequenceItems.findIndex((entry) => entry.id === item.id) : -1),
    [item, sequenceItems]
  );
  const previousItem = currentIndex > 0 ? sequenceItems[currentIndex - 1] : undefined;
  const nextItem =
    currentIndex >= 0 && currentIndex < sequenceItems.length - 1 ? sequenceItems[currentIndex + 1] : undefined;
  const collectionLabel = item ? COLLECTION_LABELS[item.collection] : '';
  const collectionRoute = item ? getCollectionRoute(item.collection) : '/';
  const collectionMeta = item ? `第 ${String(Math.max(currentIndex + 1, 1)).padStart(2, '0')} 篇` : '';
  const railWidth = sidebarCollapsed ? 88 : 368;
  const mobileNavigation = useMemo<ReaderMobileNavigationState | null>(() => {
    if (!item || item.type === 'image') {
      return null;
    }

    return {
      activeHeadingId,
      collectionLabel,
      collectionMeta,
      collectionRoute,
      currentIndex,
      item,
      nextItem,
      onSelectHeading: handleSelectHeading,
      outline,
      previousItem,
      sequenceItems
    };
  }, [
    activeHeadingId,
    collectionLabel,
    collectionMeta,
    collectionRoute,
    currentIndex,
    handleSelectHeading,
    item,
    nextItem,
    outline,
    previousItem,
    sequenceItems
  ]);

  useEffect(() => {
    if (!mobileNavigation) {
      onReaderMobileNavigationChange(null);
      return undefined;
    }

    onReaderMobileNavigationChange(mobileNavigation);

    return () => {
      onReaderMobileNavigationChange(null);
    };
  }, [mobileNavigation, onReaderMobileNavigationChange]);

  if (!item || item.type === 'image') {
    return <Navigate to="/" replace />;
  }

  return (
    <main
      className={cn(
        'page-safe-top reader-workspace-safe-top mx-auto w-full max-w-[1460px] px-3 md:px-6',
        desktopReaderShell ? 'h-dvh overflow-hidden pb-1' : 'pb-20 sm:px-4 md:pb-24'
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 xl:gap-4',
          desktopReaderShell ? 'h-[calc(100dvh-var(--reader-workspace-offset-current)-0.2rem)]' : 'flex-col'
        )}
      >
        <motion.aside
          className={cn('relative shrink-0', desktopReaderShell ? 'block h-full' : 'hidden')}
          style={desktopReaderShell ? { width: railWidth } : undefined}
          animate={shouldReduceMotion || !desktopReaderShell ? undefined : { width: railWidth }}
          initial={false}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="absolute right-[-16px] top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-floating)] transition-[background-color,color,transform,box-shadow] duration-[220ms] ease-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.96]"
            aria-label={sidebarCollapsed ? '展开侧栏' : '收起侧栏'}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <AnimatePresence initial={false}>
            {!sidebarCollapsed ? (
              <motion.div
                key="sidebar"
                className="h-full overflow-hidden rounded-[var(--surface-panel-radius)] border border-sidebar-border/80 bg-sidebar/92 p-2.5 shadow-[var(--shadow-panel)] backdrop-blur-md"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -16 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <ReaderSidebar
                  activeHeadingId={activeHeadingId}
                  activePanel={sidebarPanel}
                  collectionLabel={collectionLabel}
                  collectionMeta={collectionMeta}
                  collectionRoute={collectionRoute}
                  currentIndex={currentIndex}
                  item={item}
                  nextItem={nextItem}
                  onPanelChange={setSidebarPanel}
                  onSelectHeading={handleSelectHeading}
                  outline={outline}
                  panelMountScope={panelMountScope}
                  previousItem={previousItem}
                  sequenceItems={sequenceItems}
                />
              </motion.div>
            ) : (
              <motion.div
                key="mini-rail"
                className="grid h-full content-center justify-items-center gap-4 rounded-[var(--surface-panel-radius)] border border-sidebar-border/80 bg-sidebar/92 px-3 py-5 text-sidebar-foreground shadow-[var(--shadow-panel)] backdrop-blur-md"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <strong className="font-serif text-2xl text-primary">
                  {String(currentIndex + 1).padStart(2, '0')}
                </strong>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <section className={cn('min-w-0 flex-1', desktopReaderShell ? 'flex h-full min-h-0 flex-col' : 'space-y-4')}>
          <div
            className={cn(
              'mx-auto w-full max-w-[var(--reader-max)] bg-transparent p-0 shadow-none',
              desktopReaderShell
                ? 'flex h-full min-h-0 max-w-none flex-1 flex-col overflow-hidden rounded-[var(--surface-panel-radius)] border border-border/70 bg-card/82 px-[var(--reader-shell-padding)] py-[var(--reader-shell-padding)] shadow-[var(--shadow-panel)] backdrop-blur-xl'
                : 'md:rounded-[var(--surface-panel-radius)] md:border md:border-border/65 md:bg-card/76 md:px-[var(--layout-panel-padding)] md:py-[var(--layout-panel-padding)] md:shadow-[var(--shadow-soft)] md:backdrop-blur-sm'
            )}
          >
            <StealthScrollArea
              ref={attachArticleScrollContainer}
              axis={desktopReaderShell ? 'y' : 'x'}
              className={cn(
                'reader-scroll-shell overflow-visible pb-[var(--reader-content-end-space)]',
                desktopReaderShell ? 'h-full overflow-y-auto overflow-x-hidden' : ''
              )}
              onScroll={(event) => onReaderScrollStateChange(event.currentTarget.scrollTop)}
            >
              <Suspense fallback={<ReaderContentFallback mode={item.type === 'pdf' ? 'pdf' : 'markdown'} />}>
                {item.type === 'markdown' ? (
                  item.rawText ? (
                    <MarkdownArticle item={item} outline={outline} onOpenLightbox={onZoom} />
                  ) : (
                    <ReaderContentFallback mode="markdown" />
                  )
                ) : null}
                {item.type === 'pdf' && item.assetUrl ? <PdfViewer src={item.assetUrl} title={item.title} /> : null}
              </Suspense>
            </StealthScrollArea>
          </div>
        </section>
      </div>
    </main>
  );
}
