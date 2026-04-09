import { ArrowRight } from 'lucide-react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { type FontScaleId, type ThemeId } from '@/appearance';
import {
  AppBackground,
  AppearanceControls,
  HEADER_DESKTOP_QUERY,
  LightboxFallback,
  PRIMARY_NAV_ITEMS,
  PageRouteFallback,
  READER_DESKTOP_SHELL_QUERY,
  ReaderRouteFallback,
  readFontScalePreference,
  readThemePreference,
  useMediaQuery,
  writeFontScalePreference,
  writeThemePreference
} from '@/shell-core';
import { MobileSheet } from '@/components/MobileSheet';
import { ReaderSidebar } from '@/components/ReaderSidebar';
import { SiteHeader, type HeaderNavLink, type HeaderSurface } from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { ReaderMobileNavigationState } from '@/routes/ReaderRoute';
import type { LightboxState, ResourceCollection } from '@/types';

const HomeRoute = lazy(() => import('@/routes/HomeRoute'));
const DocsRoute = lazy(() => import('@/routes/DocsRoute'));
const CollectionRoute = lazy(() => import('@/routes/CollectionRoute'));
const ReaderRoute = lazy(() => import('@/routes/ReaderRoute'));
const ZoomLightbox = lazy(() =>
  import('@/components/ZoomLightbox').then((module) => ({ default: module.ZoomLightbox }))
);

function RouteElement({
  fallback,
  children
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

const DEFAULT_HEADER_COMPACT_SCROLL = 160;
const READER_HEADER_COMPACT_ENTER_SCROLL = 104;
const READER_HEADER_COMPACT_EXIT_SCROLL = 72;

export default function App() {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [fontScaleId, setFontScaleId] = useState<FontScaleId>(() => readFontScalePreference());
  const [themeId, setThemeId] = useState<ThemeId>(() => readThemePreference());
  const [headerCompact, setHeaderCompact] = useState(false);
  const [readerScrollContainer, setReaderScrollContainer] = useState<HTMLDivElement | null>(null);
  const [readerCollection, setReaderCollection] = useState<ResourceCollection | null>(null);
  const [readerMobileNavigation, setReaderMobileNavigation] = useState<ReaderMobileNavigationState | null>(null);
  const location = useLocation();
  const isDesktopHeader = useMediaQuery(HEADER_DESKTOP_QUERY);
  const usesReaderScrollShell = useMediaQuery(READER_DESKTOP_SHELL_QUERY);
  const currentId = location.pathname.startsWith('/read/') ? location.pathname.slice('/read/'.length) : '';
  const isReaderPage = location.pathname.startsWith('/read/');
  const surface: HeaderSurface = isReaderPage ? 'reader' : location.pathname === '/' ? 'home' : 'collection';

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
    writeThemePreference(themeId);
  }, [themeId]);

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScaleId;
    writeFontScalePreference(fontScaleId);
  }, [fontScaleId]);

  useEffect(() => {
    const root = document.documentElement;
    const headerLayoutOffset = 'calc(var(--header-expanded-height) + var(--header-floating-top) + 1.25rem)';
    const readerWorkspaceOffset =
      'calc(var(--header-expanded-height) + var(--header-floating-top) + 0.875rem)';
    const mobileTopSafeOffset = 'calc(var(--mobile-nav-button-size) + var(--header-floating-top) + 1rem)';

    root.style.setProperty('--header-expanded-height', '5rem');
    root.style.setProperty('--header-compact-height', '3.5rem');
    root.style.setProperty('--header-floating-top', '1rem');
    root.style.setProperty('--mobile-nav-button-size', '3.75rem');
    root.style.setProperty('--header-layout-offset', headerLayoutOffset);
    root.style.setProperty('--header-safe-offset', headerLayoutOffset);
    root.style.setProperty('--mobile-top-safe-offset', mobileTopSafeOffset);
    root.style.setProperty('--layout-section-gap', 'clamp(2.75rem, 5vw, 4.5rem)');
    root.style.setProperty('--layout-panel-gap', 'clamp(1rem, 2vw, 1.5rem)');
    root.style.setProperty('--layout-panel-padding', 'clamp(1.25rem, 2vw, 1.75rem)');
    root.style.setProperty('--reader-shell-padding', 'clamp(0.85rem, 1.2vw, 1rem)');
    root.style.setProperty('--reader-block-gap', 'clamp(0.72rem, 1vw, 0.92rem)');
    root.style.setProperty('--reader-figure-padding', 'clamp(0.72rem, 1vw, 0.92rem)');
    root.style.setProperty('--reader-table-cell-padding', 'clamp(0.72rem, 1vw, 0.95rem)');
    root.style.setProperty('--reader-workspace-offset', readerWorkspaceOffset);
    root.style.setProperty('--reader-content-end-space', 'clamp(1.35rem, 1.8vw, 1.6rem)');
    root.style.setProperty('--reader-chart-max-height', 'min(52vh, 42rem)');
    root.style.setProperty(
      '--reader-offset',
      surface === 'reader'
        ? usesReaderScrollShell
          ? readerWorkspaceOffset
          : isDesktopHeader
            ? headerLayoutOffset
            : mobileTopSafeOffset
        : headerLayoutOffset
    );
  }, [isDesktopHeader, surface, usesReaderScrollShell]);

  useEffect(() => {
    const root = document.documentElement;
    const isDesktopReader = surface === 'reader' && usesReaderScrollShell;

    root.dataset.readerScrollMode = isDesktopReader ? 'desktop' : 'default';

    return () => {
      delete root.dataset.readerScrollMode;
    };
  }, [surface, usesReaderScrollShell]);

  useEffect(() => {
    const root = document.documentElement;
    const activateViewportScrollbar = (event: MouseEvent) => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const nearRightEdge = event.clientX >= viewportWidth - 12;
      const nearBottomEdge = event.clientY >= viewportHeight - 12;
      const nextActive = nearRightEdge || nearBottomEdge;
      root.dataset.viewportScrollbarActive = nextActive ? 'true' : 'false';
    };
    const resetViewportScrollbar = () => {
      root.dataset.viewportScrollbarActive = 'false';
    };

    window.addEventListener('mousemove', activateViewportScrollbar, { passive: true });
    window.addEventListener('mouseleave', resetViewportScrollbar);

    return () => {
      window.removeEventListener('mousemove', activateViewportScrollbar);
      window.removeEventListener('mouseleave', resetViewportScrollbar);
      delete root.dataset.viewportScrollbarActive;
    };
  }, []);

  useEffect(() => {
    if (surface !== 'reader') {
      setReaderCollection(null);
      setReaderScrollContainer(null);
      setReaderMobileNavigation(null);
    }
  }, [surface]);

  useEffect(() => {
    if (isReaderPage) {
      setReaderCollection(null);
    }
  }, [currentId, isReaderPage]);

  useEffect(() => {
    const isDesktopReaderShell = surface === 'reader' && usesReaderScrollShell;
    const scrollContainer = isDesktopReaderShell ? readerScrollContainer : null;
    const updateCompactState = () => {
      const scrollTop = scrollContainer ? scrollContainer.scrollTop : window.scrollY;

      setHeaderCompact((current) => {
        if (isDesktopReaderShell) {
          if (current) {
            return scrollTop <= READER_HEADER_COMPACT_EXIT_SCROLL ? false : current;
          }

          return scrollTop >= READER_HEADER_COMPACT_ENTER_SCROLL;
        }

        const nextCompact = scrollTop > DEFAULT_HEADER_COMPACT_SCROLL;
        return current === nextCompact ? current : nextCompact;
      });
    };

    updateCompactState();

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateCompactState, { passive: true });
      window.addEventListener('resize', updateCompactState);

      return () => {
        scrollContainer.removeEventListener('scroll', updateCompactState);
        window.removeEventListener('resize', updateCompactState);
      };
    }

    window.addEventListener('scroll', updateCompactState, { passive: true });
    window.addEventListener('resize', updateCompactState);

    return () => {
      window.removeEventListener('scroll', updateCompactState);
      window.removeEventListener('resize', updateCompactState);
    };
  }, [
    location.pathname,
    readerScrollContainer,
    surface,
    usesReaderScrollShell
  ]);

  const navItems: HeaderNavLink[] = PRIMARY_NAV_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    to: item.to,
    isActive: item.isActive(location.pathname, readerCollection ?? undefined)
  }));

  return (
    <div className="relative min-h-screen overflow-x-clip pb-10">
      <AppBackground ambientMode={surface === 'reader' ? 'reader' : 'default'} />

      <SiteHeader
        compact={headerCompact}
        fontScaleId={fontScaleId}
        navItems={navItems}
        onFontScaleChange={setFontScaleId}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onThemeChange={setThemeId}
        surface={surface}
        themeId={themeId}
      />

      <MobileSheet
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        side="left"
        title="站点导航"
        description="切换主文档、辅助区块和阅读外观。"
      >
        <div className="grid gap-[var(--layout-panel-gap)]">
          <nav className="grid gap-3" aria-label="移动端站点导航">
            {navItems.map((item) => (
              <Button
                key={item.id}
                asChild
                variant={item.isActive ? 'default' : 'secondary'}
                className="h-auto justify-between rounded-[1.4rem] px-4 py-4"
              >
                <Link
                  to={item.to}
                  data-perf-id="site-mobile-nav-link"
                  data-nav-id={item.id}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </nav>

          {mobileNavOpen && readerMobileNavigation ? (
            <>
              <Separator />

              <section className="grid gap-3" data-perf-id="reader-mobile-context">
                <div className="grid gap-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    当前文档
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    在这里查看当前文档目录和推荐阅读顺序。
                  </p>
                </div>

                <div className="h-[min(72vh,42rem)] min-h-[24rem] overflow-hidden rounded-[1.6rem] border border-sidebar-border/80 bg-sidebar/95 p-3.5 shadow-[var(--shadow-panel)] backdrop-blur-xl">
                  <ReaderSidebar
                    activeHeadingId={readerMobileNavigation.activeHeadingId}
                    activePanel={readerMobileNavigation.activePanel}
                    collectionLabel={readerMobileNavigation.collectionLabel}
                    collectionMeta={readerMobileNavigation.collectionMeta}
                    item={readerMobileNavigation.item}
                    onPanelChange={readerMobileNavigation.onPanelChange}
                    onSelectHeading={readerMobileNavigation.onSelectHeading}
                    onSelectLink={() => setMobileNavOpen(false)}
                    outline={readerMobileNavigation.outline}
                    sequenceItems={readerMobileNavigation.sequenceItems}
                  />
                </div>
              </section>
            </>
          ) : null}

          <Separator />

          <AppearanceControls
            fontScaleId={fontScaleId}
            onFontScaleChange={setFontScaleId}
            onThemeChange={setThemeId}
            themeId={themeId}
          />
        </div>
      </MobileSheet>

      <Routes>
        <Route
          path="/"
          element={
            <RouteElement fallback={<PageRouteFallback />}>
              <HomeRoute />
            </RouteElement>
          }
        />
        <Route
          path="/docs"
          element={
            <RouteElement fallback={<PageRouteFallback />}>
              <DocsRoute />
            </RouteElement>
          }
        />
        <Route
          path="/debug-kb"
          element={
            <RouteElement fallback={<PageRouteFallback />}>
              <CollectionRoute collection="debug-kb" />
            </RouteElement>
          }
        />
        <Route
          path="/archive"
          element={
            <RouteElement fallback={<PageRouteFallback />}>
              <CollectionRoute collection="archive" />
            </RouteElement>
          }
        />
        <Route path="/platform" element={<Navigate to="/docs" replace />} />
        <Route path="/math" element={<Navigate to="/debug-kb" replace />} />
        <Route path="/library" element={<Navigate to="/docs" replace />} />
        <Route
          path="/read/:id"
          element={
            <RouteElement fallback={<ReaderRouteFallback />}>
              <ReaderRoute
                mobileNavOpen={mobileNavOpen}
                onReaderCollectionChange={setReaderCollection}
                onReaderMobileNavigationChange={setReaderMobileNavigation}
                onRegisterReaderScrollContainer={setReaderScrollContainer}
                onZoom={setLightbox}
              />
            </RouteElement>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {lightbox ? (
        <Suspense fallback={<LightboxFallback />}>
          <ZoomLightbox lightbox={lightbox} onClose={() => setLightbox(null)} />
        </Suspense>
      ) : null}
    </div>
  );
}
