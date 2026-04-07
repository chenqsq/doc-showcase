import * as Collapsible from '@radix-ui/react-collapsible';
import { ArrowRight, ChevronDown, Palette } from 'lucide-react';
import { Suspense, lazy, memo, startTransition, useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  AppearanceControls,
  AppBackground,
  LightboxFallback,
  PageRouteFallback,
  PRIMARY_NAV_ITEMS,
  READER_DESKTOP_SHELL_QUERY,
  ReaderRouteFallback,
  readFontScalePreference,
  readThemePreference,
  useMediaQuery,
  writeFontScalePreference,
  writeThemePreference
} from '@/app-shell';
import { catalogById } from '@/catalog';
import { MobileReaderNavigation } from '@/components/MobileReaderNavigation';
import { MobileSheet } from '@/components/MobileSheet';
import { SiteHeader, type HeaderNavLink, type HeaderSurface } from '@/components/SiteHeader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { FontScaleId, ThemeId } from '@/appearance';
import type { LightboxState, ReaderMobileNavigationState } from '@/types';

const HomeRoute = lazy(() => import('@/routes/HomeRoute'));
const CollectionRoute = lazy(() => import('@/routes/CollectionRoute'));
const ReaderRoute = lazy(() => import('@/routes/ReaderRoute'));
const ZoomLightbox = lazy(() =>
  import('@/components/ZoomLightbox').then((module) => ({ default: module.ZoomLightbox }))
);

function RouteElement({
  children,
  fallback
}: {
  children: ReactNode;
  fallback: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

const AppRoutes = memo(function AppRoutes({
  onReaderMobileNavigationChange,
  onReaderScrollStateChange,
  onRegisterReaderScrollContainer,
  onZoom
}: {
  onReaderMobileNavigationChange: (navigation: ReaderMobileNavigationState | null) => void;
  onReaderScrollStateChange: (scrollTop: number) => void;
  onRegisterReaderScrollContainer: (node: HTMLDivElement | null) => void;
  onZoom: (lightbox: LightboxState) => void;
}) {
  return (
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
            <CollectionRoute collection="active-docs" />
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
              onReaderMobileNavigationChange={onReaderMobileNavigationChange}
              onReaderScrollStateChange={onReaderScrollStateChange}
              onRegisterReaderScrollContainer={onRegisterReaderScrollContainer}
              onZoom={onZoom}
            />
          </RouteElement>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
});

export default function App() {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [fontScaleId, setFontScaleId] = useState<FontScaleId>(() => readFontScalePreference());
  const [themeId, setThemeId] = useState<ThemeId>(() => readThemePreference());
  const [headerCompact, setHeaderCompact] = useState(false);
  const [mobileAppearanceOpen, setMobileAppearanceOpen] = useState(false);
  const [renderMobileAppearance, setRenderMobileAppearance] = useState(false);
  const [readerMobileNavigation, setReaderMobileNavigation] = useState<ReaderMobileNavigationState | null>(null);
  const [readerScrollContainer, setReaderScrollContainer] = useState<HTMLDivElement | null>(null);
  const location = useLocation();
  const isDesktopHeader = useMediaQuery('(min-width: 768px)');
  const usesReaderScrollShell = useMediaQuery(READER_DESKTOP_SHELL_QUERY);
  const currentId = location.pathname.startsWith('/read/') ? location.pathname.slice('/read/'.length) : '';
  const currentItem = currentId ? catalogById.get(currentId) : undefined;
  const isReaderPage = location.pathname.startsWith('/read/');
  const surface: HeaderSurface = isReaderPage ? 'reader' : location.pathname === '/' ? 'home' : 'collection';

  const handleReaderShellScroll = useCallback(
    (scrollTop: number) => {
      if (surface === 'reader' && usesReaderScrollShell) {
        setHeaderCompact(scrollTop > 96);
      }
    },
    [surface, usesReaderScrollShell]
  );

  useEffect(() => {
    setMobileNavOpen(false);
    setMobileAppearanceOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) {
      setMobileAppearanceOpen(false);
    }
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileAppearanceOpen) {
      setRenderMobileAppearance(false);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      startTransition(() => {
        setRenderMobileAppearance(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [mobileAppearanceOpen]);

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
    const readerWorkspaceOffsetExpanded =
      'calc(var(--header-expanded-height) + var(--header-floating-top) + 0.48rem)';
    const readerWorkspaceOffsetCompact =
      'calc(var(--header-compact-height) + var(--header-floating-top) + 0.04rem)';
    const mobileTopSafeOffset = 'calc(var(--mobile-nav-button-size) + var(--header-floating-top) + 1rem)';
    const currentReaderWorkspaceOffset =
      surface === 'reader' && usesReaderScrollShell && headerCompact
        ? readerWorkspaceOffsetCompact
        : readerWorkspaceOffsetExpanded;

    root.style.setProperty('--header-expanded-height', '5rem');
    root.style.setProperty('--header-compact-height', '3.5rem');
    root.style.setProperty('--header-floating-top', '1rem');
    root.style.setProperty('--mobile-nav-button-size', '3rem');
    root.style.setProperty('--mobile-content-gutter', 'clamp(0.68rem, 3vw, 0.82rem)');
    root.style.setProperty('--mobile-drawer-width-compact', 'min(76vw, 17rem)');
    root.style.setProperty('--reader-sidebar-width-expanded', '368px');
    root.style.setProperty('--header-layout-offset', headerLayoutOffset);
    root.style.setProperty('--header-safe-offset', headerLayoutOffset);
    root.style.setProperty('--mobile-top-safe-offset', mobileTopSafeOffset);
    root.style.setProperty(
      '--layout-section-gap',
      isDesktopHeader ? 'clamp(2.75rem, 5vw, 4.5rem)' : 'clamp(1.9rem, 8vw, 2.7rem)'
    );
    root.style.setProperty('--layout-panel-gap', isDesktopHeader ? 'clamp(0.95rem, 2vw, 1.4rem)' : '0.8rem');
    root.style.setProperty('--layout-panel-padding', isDesktopHeader ? 'clamp(1.2rem, 2vw, 1.7rem)' : '0.95rem');
    root.style.setProperty('--surface-hero-radius', isDesktopHeader ? '2.15rem' : '1.4rem');
    root.style.setProperty('--surface-panel-radius', isDesktopHeader ? '1.6rem' : '1.02rem');
    root.style.setProperty('--surface-card-radius', isDesktopHeader ? '1.2rem' : '0.9rem');
    root.style.setProperty('--surface-control-radius', isDesktopHeader ? '1rem' : '0.82rem');
    root.style.setProperty('--reader-shell-padding', usesReaderScrollShell ? 'clamp(0.68rem, 0.95vw, 0.82rem)' : '0');
    root.style.setProperty('--reader-block-gap', isDesktopHeader ? 'clamp(0.68rem, 0.95vw, 0.88rem)' : '0.68rem');
    root.style.setProperty('--reader-figure-padding', isDesktopHeader ? 'clamp(0.62rem, 0.9vw, 0.8rem)' : '0.7rem');
    root.style.setProperty('--reader-table-cell-padding', isDesktopHeader ? 'clamp(0.64rem, 0.9vw, 0.84rem)' : '0.72rem');
    root.style.setProperty('--reader-workspace-offset-expanded', readerWorkspaceOffsetExpanded);
    root.style.setProperty('--reader-workspace-offset-compact', readerWorkspaceOffsetCompact);
    root.style.setProperty('--reader-workspace-offset-current', currentReaderWorkspaceOffset);
    root.style.setProperty('--reader-workspace-offset', currentReaderWorkspaceOffset);
    root.style.setProperty('--reader-content-end-space', isDesktopHeader ? 'clamp(1.2rem, 1.5vw, 1.45rem)' : '1rem');
    root.style.setProperty('--reader-chart-max-height', usesReaderScrollShell ? 'min(48vh, 38rem)' : 'min(44vh, 26rem)');
    root.style.setProperty(
      '--reader-offset',
      surface === 'reader'
        ? usesReaderScrollShell
          ? currentReaderWorkspaceOffset
          : isDesktopHeader
            ? headerLayoutOffset
            : mobileTopSafeOffset
        : headerLayoutOffset
    );
  }, [headerCompact, isDesktopHeader, surface, usesReaderScrollShell]);

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
      root.dataset.viewportScrollbarActive = nearRightEdge || nearBottomEdge ? 'true' : 'false';
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
      setReaderMobileNavigation(null);
      setReaderScrollContainer(null);
    }
  }, [surface]);

  useEffect(() => {
    const scrollContainer = surface === 'reader' && usesReaderScrollShell ? readerScrollContainer : null;
    const updateCompactState = () => {
      const nextCompact = scrollContainer ? scrollContainer.scrollTop > 96 : window.scrollY > 160;
      setHeaderCompact((current) => (current === nextCompact ? current : nextCompact));
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
  }, [location.pathname, readerScrollContainer, surface, usesReaderScrollShell]);

  const navItems: HeaderNavLink[] = PRIMARY_NAV_ITEMS.map((item) => ({
    id: item.id,
    label: item.label,
    to: item.to,
    isActive: item.isActive(location.pathname, currentItem)
  }));

  return (
    <div className="relative min-h-screen overflow-x-clip pb-10">
      <AppBackground />

      <SiteHeader
        compact={headerCompact}
        fontScaleId={fontScaleId}
        mobileNavOpen={mobileNavOpen}
        navItems={navItems}
        onFontScaleChange={setFontScaleId}
        onOpenMobileNav={() => setMobileNavOpen((open) => !open)}
        onThemeChange={setThemeId}
        surface={surface}
        themeId={themeId}
      />

      <MobileSheet
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        side="left"
        title="站点导航"
        description={readerMobileNavigation ? '切换入口、目录和外观。' : '切换入口和外观。'}
      >
        <div className="grid gap-[var(--layout-panel-gap)]">
          <nav className="grid gap-1.5" aria-label="移动端站点导航">
            {navItems.map((item) => (
              <Button
                key={item.id}
                asChild
                variant={item.isActive ? 'default' : 'secondary'}
                className="h-8.5 w-full justify-between rounded-[0.72rem] px-[0.7rem] text-[0.88rem] shadow-none"
              >
                <Link to={item.to} onClick={() => setMobileNavOpen(false)}>
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </nav>

          {readerMobileNavigation ? (
            <>
              <Separator />
              <MobileReaderNavigation
                navigation={readerMobileNavigation}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </>
          ) : null}

          <Separator />

          <Collapsible.Root open={mobileAppearanceOpen} onOpenChange={setMobileAppearanceOpen}>
            <Collapsible.Trigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-[0.76rem] border border-border/60 bg-background/72 px-[0.7rem] py-[0.58rem] text-left transition-[background-color,color,transform,box-shadow] duration-[220ms] ease-out hover:bg-accent/22 active:scale-[0.992] active:bg-accent/36"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-[0.66rem] bg-secondary text-secondary-foreground">
                    <Palette className="h-4 w-4" />
                  </span>
                  <span className="grid gap-0.5">
                    <span className="text-[0.9rem] font-medium text-foreground">阅读外观</span>
                    <span className="text-[10px] leading-4 text-muted-foreground">主题与字号</span>
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-[220ms] ease-out ${mobileAppearanceOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </Collapsible.Trigger>
            {mobileAppearanceOpen ? (
              <div className="pt-2">
                {renderMobileAppearance ? (
                  <div className="animate-in fade-in-0 slide-in-from-top-1 duration-[160ms] ease-out [contain:layout_paint_style] [content-visibility:auto]">
                    <AppearanceControls
                      compact
                      fontScaleId={fontScaleId}
                      onFontScaleChange={setFontScaleId}
                      onThemeChange={setThemeId}
                      themeId={themeId}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </Collapsible.Root>
        </div>
      </MobileSheet>

      <AppRoutes
        onReaderMobileNavigationChange={setReaderMobileNavigation}
        onReaderScrollStateChange={handleReaderShellScroll}
        onRegisterReaderScrollContainer={setReaderScrollContainer}
        onZoom={setLightbox}
      />

      {lightbox ? (
        <Suspense fallback={<LightboxFallback />}>
          <ZoomLightbox lightbox={lightbox} onClose={() => setLightbox(null)} />
        </Suspense>
      ) : null}
    </div>
  );
}
