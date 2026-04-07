import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import {
  COLLECTION_LABELS,
  ReaderContentFallback,
  getCollectionRoute,
  getSequenceItems,
  readReaderSidebarCollapsed,
  writeReaderSidebarCollapsed
} from '@/app-shell';
import { catalogById, extractOutline, loadCatalogItemById } from '@/catalog';
import { MobileSheet } from '@/components/MobileSheet';
import { ReaderSidebar, type ReaderSidebarPanel } from '@/components/ReaderSidebar';
import { StealthScrollArea } from '@/components/StealthScrollArea';
import { Button } from '@/components/ui/button';
import type { CatalogItem, LightboxState } from '@/types';

const MarkdownArticle = lazy(() =>
  import('@/components/MarkdownArticle').then((module) => ({ default: module.MarkdownArticle }))
);
const PdfViewer = lazy(() =>
  import('@/components/PdfViewer').then((module) => ({ default: module.PdfViewer }))
);

interface ReaderRouteProps {
  onReaderScrollStateChange: (scrollTop: number) => void;
  onRegisterReaderScrollContainer: (node: HTMLDivElement | null) => void;
  onZoom: (lightbox: LightboxState) => void;
}

export default function ReaderRoute({
  onReaderScrollStateChange,
  onRegisterReaderScrollContainer,
  onZoom
}: ReaderRouteProps) {
  const { id } = useParams();
  const baseItem = id ? catalogById.get(id) : undefined;
  const [item, setItem] = useState<CatalogItem | undefined>(baseItem);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readReaderSidebarCollapsed());
  const [sidebarPanel, setSidebarPanel] = useState<ReaderSidebarPanel>('outline');
  const [activeHeadingId, setActiveHeadingId] = useState<string | undefined>();
  const [desktopReaderShell, setDesktopReaderShell] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false
  );
  const shouldReduceMotion = useReducedMotion();
  const articleScrollRef = useRef<HTMLDivElement | null>(null);
  const outline = useMemo(() => extractOutline(item?.rawText), [item?.rawText]);

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

    const media = window.matchMedia('(min-width: 1024px)');
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
    setMobileOutlineOpen(false);
    setSidebarPanel('outline');
  }, [item?.id]);

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

  if (!item || item.type === 'image') {
    return <Navigate to="/" replace />;
  }

  const sequenceItems = getSequenceItems(item);
  const currentIndex = sequenceItems.findIndex((entry) => entry.id === item.id);
  const previousItem = currentIndex > 0 ? sequenceItems[currentIndex - 1] : undefined;
  const nextItem =
    currentIndex >= 0 && currentIndex < sequenceItems.length - 1 ? sequenceItems[currentIndex + 1] : undefined;
  const collectionLabel = COLLECTION_LABELS[item.collection];
  const collectionRoute = getCollectionRoute(item.collection);
  const railWidth = sidebarCollapsed ? 88 : 304;
  const collectionMeta = [`第 ${String(currentIndex + 1).padStart(2, '0')} 篇`, item.group]
    .filter(Boolean)
    .join(' · ');

  useEffect(() => {
    setActiveHeadingId(outline[0]?.id);
  }, [item.id, outline]);

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

  const handleSelectHeading = (headingId: string) => {
    const target = document.getElementById(headingId);
    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
    setActiveHeadingId(headingId);
  };

  return (
    <main className="page-safe-top reader-workspace-safe-top mx-auto w-full max-w-[1460px] px-4 pb-24 md:px-6 lg:h-dvh lg:overflow-hidden lg:pb-3">
      <div className="flex items-start gap-6 xl:gap-8 lg:h-[calc(100dvh-var(--reader-workspace-offset)-0.75rem)]">
        <motion.aside
          className="relative hidden shrink-0 lg:block lg:h-full"
          style={{ width: railWidth }}
          animate={shouldReduceMotion ? undefined : { width: railWidth }}
          initial={false}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            className="absolute right-[-16px] top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-floating)] transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={sidebarCollapsed ? '展开导航' : '收起导航'}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <AnimatePresence initial={false}>
            {!sidebarCollapsed ? (
              <motion.div
                key="sidebar"
                className="h-full overflow-hidden rounded-[2rem] border border-sidebar-border/80 bg-sidebar/95 p-3.5 shadow-[var(--shadow-panel)] backdrop-blur-xl"
                initial={shouldReduceMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
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
                  previousItem={previousItem}
                  sequenceItems={sequenceItems}
                />
              </motion.div>
            ) : (
              <motion.div
                key="mini-rail"
                className="grid h-full content-center justify-items-center gap-4 rounded-[1.8rem] border border-sidebar-border/80 bg-sidebar/92 px-3 py-5 text-sidebar-foreground shadow-[var(--shadow-panel)] backdrop-blur-xl"
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <strong className="font-serif text-2xl text-primary">{String(currentIndex + 1).padStart(2, '0')}</strong>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        <section className="min-w-0 flex-1 space-y-[var(--layout-panel-gap)] lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:space-y-0">
          <div className="lg:hidden">
            <Button type="button" variant="secondary" onClick={() => setMobileOutlineOpen(true)}>
              打开目录
            </Button>
          </div>

          <div className="layout-panel-padding mx-auto w-full max-w-[var(--reader-max)] rounded-[2rem] border border-border/70 bg-card/84 shadow-[var(--shadow-panel)] backdrop-blur-2xl lg:flex lg:h-full lg:min-h-0 lg:max-w-none lg:flex-1 lg:flex-col lg:overflow-hidden lg:p-[var(--reader-shell-padding)]">
            <StealthScrollArea
              ref={attachArticleScrollContainer}
              axis="y"
              className="reader-scroll-shell lg:h-full lg:overflow-y-auto lg:pb-[var(--reader-content-end-space)]"
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

      <MobileSheet
        open={mobileOutlineOpen}
        onOpenChange={setMobileOutlineOpen}
        side="left"
        title="阅读导航"
        description="查看本文目录、文档顺序和上一篇下一篇。"
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
          onSelectLink={() => setMobileOutlineOpen(false)}
          outline={outline}
          previousItem={previousItem}
          sequenceItems={sequenceItems}
        />
      </MobileSheet>
    </main>
  );
}
