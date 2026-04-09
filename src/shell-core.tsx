import { ArrowRight, FolderArchive, Palette, Type, Wrench, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DEFAULT_FONT_SCALE,
  DEFAULT_THEME,
  FONT_SCALE_OPTIONS,
  SITE_THEMES,
  THEME_OPTIONS,
  type FontScaleId,
  type ThemeId
} from '@/appearance';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ResourceCollection } from '@/types';

export interface NavItemConfig {
  id: string;
  label: string;
  to: string;
  isActive: (pathname: string, currentCollection?: ResourceCollection) => boolean;
}

export interface HomeSecondaryLink {
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
  to: string;
}

export const COLLECTION_LABELS: Record<ResourceCollection, string> = {
  'active-docs': '作品文档',
  'debug-kb': '调试知识库',
  archive: '参考与归档'
};

export const COLLECTION_SUMMARIES: Record<ResourceCollection, string> = {
  'active-docs':
    '按推荐阅读顺序查看 AI 主导学习生命周期平台的需求、页面、架构、算法、接口与比赛交付文档。',
  'debug-kb':
    '高等数学调试知识库只服务于联调、检索验证与回归样例，不参与作品主叙事。',
  archive: '平台技术溯源、工程参考、腾讯资料和比赛材料统一收在这里，按需查阅。'
};

export const COLLECTION_NOTES: Record<ResourceCollection, string> = {
  'active-docs':
    '这里是比赛正式交付包，默认从作品总览进入学生主线，再按需进入后台和技术参考。',
  'debug-kb': '调试知识库只服务于实现验证，不参与作品主叙事。',
  archive: '参考与归档资料不进入默认阅读顺序，只在追溯实现、补充证明或查看旧方案时使用。'
};

export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: '首页',
    to: '/',
    isActive: (pathname) => pathname === '/'
  },
  {
    id: 'docs',
    label: '作品文档',
    to: '/docs',
    isActive: (pathname, currentCollection) =>
      pathname.startsWith('/docs') || currentCollection === 'active-docs'
  },
  {
    id: 'debug-kb',
    label: '调试知识库',
    to: '/debug-kb',
    isActive: (pathname, currentCollection) =>
      pathname.startsWith('/debug-kb') || currentCollection === 'debug-kb'
  },
  {
    id: 'archive',
    label: '参考与归档',
    to: '/archive',
    isActive: (pathname, currentCollection) =>
      pathname.startsWith('/archive') || currentCollection === 'archive'
  }
];

export const HOME_SECONDARY_LINKS: HomeSecondaryLink[] = [
  {
    id: 'debug-kb',
    title: '调试知识库',
    description: '保留高数调试资料，专门用于流程联调、检索命中和回归验证。',
    to: '/debug-kb',
    icon: Wrench
  },
  {
    id: 'archive',
    title: '参考与归档',
    description: '平台溯源、工程参考、腾讯资料和比赛材料集中到这里，按需追溯。',
    to: '/archive',
    icon: FolderArchive
  }
];

export const READER_DESKTOP_SHELL_QUERY = '(min-width: 1200px)';
export const HEADER_DESKTOP_QUERY = '(min-width: 1024px)';

const READER_SIDEBAR_KEY = 'doc-reader-sidebar-collapsed';
const THEME_STORAGE_KEY = 'doc-showcase-theme';
const FONT_SCALE_STORAGE_KEY = 'doc-showcase-font-scale';

export function readReaderSidebarCollapsed() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(READER_SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeReaderSidebarCollapsed(collapsed: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(READER_SIDEBAR_KEY, collapsed ? '1' : '0');
  } catch {
    // Ignore persistence failures.
  }
}

function isThemeId(value: string | null | undefined): value is ThemeId {
  return Boolean(value && value in SITE_THEMES);
}

export function readThemePreference(): ThemeId {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeId(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeThemePreference(themeId: ThemeId) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // Ignore persistence failures.
  }
}

function isFontScaleId(value: string | null | undefined): value is FontScaleId {
  return value === 'compact' || value === 'standard' || value === 'large';
}

export function readFontScalePreference(): FontScaleId {
  if (typeof window === 'undefined') {
    return DEFAULT_FONT_SCALE;
  }

  try {
    const stored = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    return isFontScaleId(stored) ? stored : DEFAULT_FONT_SCALE;
  } catch {
    return DEFAULT_FONT_SCALE;
  }
}

export function writeFontScalePreference(fontScaleId: FontScaleId) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, fontScaleId);
  } catch {
    // Ignore persistence failures.
  }
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia(query);
    const updateMatches = () => setMatches(media.matches);

    updateMatches();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateMatches);
      return () => media.removeEventListener('change', updateMatches);
    }

    media.addListener(updateMatches);
    return () => media.removeListener(updateMatches);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function getCollectionKicker(collection: ResourceCollection) {
  if (collection === 'active-docs') {
    return '作品文档';
  }

  if (collection === 'debug-kb') {
    return '调试资料';
  }

  return '技术参考';
}

export type AmbientMode = 'default' | 'reader' | 'off';

export function AppBackground({ ambientMode = 'default' }: { ambientMode?: AmbientMode }) {
  const shouldReduceMotion = usePrefersReducedMotion();
  const isDesktopAmbient = useMediaQuery('(min-width: 768px)');
  const effectiveAmbientMode = shouldReduceMotion ? 'off' : ambientMode;
  const isReaderAmbient = effectiveAmbientMode === 'reader';
  const shouldAnimateAmbient = effectiveAmbientMode !== 'off' && isDesktopAmbient;
  const primaryOpacity = isReaderAmbient ? (shouldAnimateAmbient ? 0.22 : 0.17) : shouldAnimateAmbient ? 0.4 : 0.28;
  const secondaryOpacity = isReaderAmbient
    ? shouldAnimateAmbient
      ? 0.16
      : 0.12
    : shouldAnimateAmbient
      ? 0.34
      : 0.24;
  const gridOpacity =
    effectiveAmbientMode === 'reader' ? (isDesktopAmbient ? 0.18 : 0.1) : effectiveAmbientMode === 'off' ? 0.14 : isDesktopAmbient ? 0.3 : 0.12;
  const ambientMotionClass = shouldAnimateAmbient
    ? isReaderAmbient
      ? 'app-ambient-orb-motion-reader'
      : 'app-ambient-orb-motion'
    : '';

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className={cn(
          'absolute left-[-8rem] top-6 h-60 w-60 rounded-full blur-3xl md:h-72 md:w-72',
          ambientMotionClass
        )}
        data-ambient-orb="primary"
        style={{
          background: `radial-gradient(circle, hsl(var(--glow-primary) / ${primaryOpacity}) 0%, transparent 72%)`
        }}
      />
      <div
        className={cn(
          'absolute right-[-4rem] top-32 h-64 w-64 rounded-full blur-3xl md:right-[-6rem] md:top-40 md:h-80 md:w-80',
          ambientMotionClass
        )}
        data-ambient-orb="secondary"
        style={{
          background: `radial-gradient(circle, hsl(var(--glow-secondary) / ${secondaryOpacity}) 0%, transparent 72%)`
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: gridOpacity,
          backgroundImage:
            'linear-gradient(hsl(var(--border) / 0.18) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.65), transparent 78%)'
        }}
      />
    </div>
  );
}

interface AppearanceControlsProps {
  compact?: boolean;
  fontScaleId: FontScaleId;
  onFontScaleChange: (fontScaleId: FontScaleId) => void;
  onThemeChange: (themeId: ThemeId) => void;
  themeId: ThemeId;
}

export function AppearanceControls({
  compact = false,
  fontScaleId,
  onFontScaleChange,
  onThemeChange,
  themeId
}: AppearanceControlsProps) {
  return (
    <div className={cn('grid gap-4', compact ? 'gap-2.5' : '')} aria-label="阅读外观">
      <section className={cn('grid gap-2.5', compact ? 'gap-1.5' : '')}>
        <div
          className={cn(
            'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
            compact ? 'text-[10px]' : ''
          )}
        >
          <Palette className="h-4 w-4 text-primary" />
          主题配色
        </div>
        <div className={cn('grid grid-cols-2 gap-2', compact ? 'gap-1.5' : '')}>
          {THEME_OPTIONS.map((theme) => (
            <Button
              key={theme.id}
              type="button"
              variant={theme.id === themeId ? 'default' : 'secondary'}
              className={cn(
                'h-auto min-h-[3.15rem] items-start justify-start rounded-[0.82rem] px-3 py-2.5 text-left shadow-none',
                compact ? 'min-h-[2.4rem] rounded-[0.72rem] px-2.5 py-1.5' : ''
              )}
              onClick={() => onThemeChange(theme.id)}
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                    aria-hidden="true"
                  />
                  <span className={cn('truncate', compact ? 'text-[0.8rem]' : '')}>{theme.label}</span>
                </span>
              </span>
            </Button>
          ))}
        </div>
      </section>

      <section className={cn('grid gap-2.5', compact ? 'gap-1.5' : '')}>
        <div
          className={cn(
            'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
            compact ? 'text-[10px]' : ''
          )}
        >
          <Type className="h-4 w-4 text-primary" />
          字号密度
        </div>
        <div className={cn('grid grid-cols-3 gap-2', compact ? 'gap-1.5' : '')}>
          {FONT_SCALE_OPTIONS.map((scale) => (
            <Button
              key={scale.id}
              type="button"
              variant={scale.id === fontScaleId ? 'default' : 'secondary'}
              className={cn(
                'h-10 rounded-[0.82rem] px-2.5 text-center shadow-none',
                compact ? 'h-[2.05rem] rounded-[0.72rem] px-2 text-[0.78rem]' : ''
              )}
              onClick={() => onFontScaleChange(scale.id)}
            >
              <span>{scale.label}</span>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PageRouteFallback() {
  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-24 md:px-6">
      <section className="layout-panel-padding grid gap-4 rounded-[2.4rem] border border-border/70 bg-card/80 shadow-[var(--shadow-panel)] backdrop-blur-2xl">
        <div className="h-7 w-24 rounded-full bg-accent/70" />
        <div className="grid gap-3">
          <div className="h-16 max-w-[32rem] rounded-[1.8rem] bg-secondary/75" />
          <div className="h-6 max-w-[28rem] rounded-full bg-accent/60" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 rounded-full bg-primary/18" />
          <div className="h-12 w-36 rounded-full bg-secondary/70" />
        </div>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-border/70 bg-card/74 p-6 shadow-[var(--shadow-soft)]">
        <div className="h-6 w-24 rounded-full bg-accent/70" />
        <div className="grid gap-3">
          <div className="h-24 rounded-[1.6rem] bg-background/72" />
          <div className="h-24 rounded-[1.6rem] bg-background/72" />
        </div>
      </section>
    </main>
  );
}

export function ReaderRouteFallback() {
  return (
    <main className="page-safe-top reader-workspace-safe-top mx-auto w-full max-w-[1460px] px-4 pb-24 md:px-6 min-[1200px]:h-dvh min-[1200px]:overflow-hidden min-[1200px]:pb-3">
      <div className="flex flex-col items-start gap-4 xl:gap-6 min-[1200px]:h-[calc(100dvh-var(--reader-workspace-offset-current)-0.5rem)] min-[1200px]:flex-row">
        <aside className="hidden shrink-0 min-[1200px]:block min-[1200px]:h-full min-[1200px]:w-[var(--reader-sidebar-width-expanded)]">
          <div className="grid h-full gap-4 rounded-[2rem] border border-sidebar-border/80 bg-sidebar/95 p-3.5 shadow-[var(--shadow-panel)] backdrop-blur-xl">
            <div className="h-16 rounded-[1.6rem] bg-accent/55" />
            <div className="h-32 rounded-[1.8rem] bg-background/76" />
            <div className="min-h-0 flex-1 rounded-[1.8rem] bg-background/72" />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="layout-panel-padding mx-auto w-full max-w-[var(--reader-max)] rounded-[2rem] border border-border/70 bg-card/84 shadow-[var(--shadow-panel)] min-[1200px]:flex min-[1200px]:h-full min-[1200px]:min-h-0 min-[1200px]:max-w-none min-[1200px]:flex-1 min-[1200px]:flex-col min-[1200px]:overflow-hidden">
            <div className="grid gap-5">
              <div className="h-16 max-w-[34rem] rounded-[1.8rem] bg-secondary/75" />
              <div className="h-12 max-w-[42rem] rounded-[1.4rem] bg-accent/60" />
              <div className="h-72 rounded-[1.8rem] bg-background/72" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export function ReaderContentFallback({ mode = 'markdown' }: { mode?: 'markdown' | 'pdf' }) {
  if (mode === 'pdf') {
    return (
      <div className="grid gap-4">
        <div className="h-7 w-24 rounded-full bg-accent/70" />
        <div className="h-10 max-w-[20rem] rounded-[1.2rem] bg-secondary/75" />
        <div className="grid gap-4 lg:grid-cols-[136px,minmax(0,1fr)]">
          <div className="h-[22rem] rounded-[1.6rem] bg-background/72" />
          <div className="h-[32rem] rounded-[1.8rem] bg-background/72" />
        </div>
      </div>
    );
  }

  return (
    <article className="grid gap-5">
      <div className="h-14 max-w-[28rem] rounded-[1.6rem] bg-secondary/75" />
      <div className="h-6 max-w-[42rem] rounded-full bg-accent/60" />
      <div className="h-64 rounded-[1.8rem] bg-background/72" />
    </article>
  );
}

export function LightboxFallback() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/72 p-4 backdrop-blur-xl">
      <div className="grid h-[min(92vh,920px)] w-[min(100%,1320px)] gap-4 rounded-[2rem] border border-border/70 bg-card/92 p-4 shadow-[var(--shadow-panel)]">
        <div className="h-10 w-28 rounded-full bg-accent/70" />
        <div className="min-h-0 flex-1 rounded-[1.7rem] bg-background/72" />
      </div>
    </div>
  );
}

export function MobileNavFallback() {
  return (
    <div className="grid gap-[var(--layout-panel-gap)]">
      <nav className="grid gap-2.5" aria-label="移动端站点导航占位">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            variant="secondary"
            className="h-10 justify-between rounded-[0.85rem] px-3.5 shadow-none"
            disabled
          >
            <span>{item.label}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ))}
      </nav>

      <Separator />

      <div className="grid gap-3 rounded-[1rem] border border-border/70 bg-card/72 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Palette className="h-4 w-4 text-primary" />
          阅读外观
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-[0.9rem] bg-accent/60" />
          <div className="h-14 rounded-[0.9rem] bg-accent/60" />
        </div>
        <div className="h-10 rounded-[0.9rem] bg-accent/60" />
      </div>
    </div>
  );
}
