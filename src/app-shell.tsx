import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenText,
  FolderArchive,
  LibraryBig,
  Palette,
  Search,
  Type,
  Wrench,
  type LucideIcon
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { activeDocsInOrder, archiveDocs, debugKnowledgeDocs } from './catalog';
import { ACTIVE_DOC_BY_SECTION, ACTIVE_DOC_SECTIONS } from './siteMeta';
import type { CatalogItem, ResourceCollection } from './types';

export interface GroupSection {
  id: string;
  label: string;
  kicker: string;
  description?: string;
  items: CatalogItem[];
}

export interface NavItemConfig {
  id: string;
  label: string;
  to: string;
  isActive: (pathname: string, currentItem?: CatalogItem) => boolean;
}

export interface HomeSecondaryLink {
  description: string;
  icon: LucideIcon;
  id: string;
  title: string;
  to: string;
}

export const COLLECTION_ROUTES: Record<ResourceCollection, string> = {
  'active-docs': '/docs',
  'debug-kb': '/debug-kb',
  archive: '/archive'
};

export const COLLECTION_LABELS: Record<ResourceCollection, string> = {
  'active-docs': '开发文档',
  'debug-kb': '调试知识库',
  archive: '归档'
};

export const COLLECTION_SUMMARIES: Record<ResourceCollection, string> = {
  'active-docs': '按推荐阅读顺序查看需求、闭环、架构、平台集成与验证文档。',
  'debug-kb': '高等数学资料仅用于联调、检索验证与回归样例，不代表正式产品学科能力。',
  archive: '历史方案、腾讯资料与比赛材料统一下沉，默认只作为参考入口。'
};

export const COLLECTION_NOTES: Record<ResourceCollection, string> = {
  'active-docs': '这里不再拆分平台需求和子引擎需求，所有正文都围绕同一产品与统一架构。',
  'debug-kb': '调试知识库只服务于实现验证，不参与开发文档叙事。',
  archive: '归档资料不进入默认阅读顺序，只用于回看旧方案或补充对照。'
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
    label: '开发文档',
    to: '/docs',
    isActive: (pathname, currentItem) =>
      pathname.startsWith('/docs') || currentItem?.collection === 'active-docs'
  },
  {
    id: 'debug-kb',
    label: '调试知识库',
    to: '/debug-kb',
    isActive: (pathname, currentItem) =>
      pathname.startsWith('/debug-kb') || currentItem?.collection === 'debug-kb'
  },
  {
    id: 'archive',
    label: '归档',
    to: '/archive',
    isActive: (pathname, currentItem) =>
      pathname.startsWith('/archive') || currentItem?.collection === 'archive'
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
    title: '归档资料',
    description: '历史方案、腾讯资料和比赛材料集中到这里，不干扰当前开发文档。',
    to: '/archive',
    icon: FolderArchive
  }
];

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

export function getCollectionItems(collection: ResourceCollection) {
  if (collection === 'active-docs') {
    return activeDocsInOrder;
  }

  if (collection === 'debug-kb') {
    return debugKnowledgeDocs;
  }

  return archiveDocs;
}

export function getCollectionRoute(collection: ResourceCollection) {
  return COLLECTION_ROUTES[collection];
}

export function getCollectionKicker(collection: ResourceCollection) {
  if (collection === 'active-docs') {
    return '开发文档';
  }
  if (collection === 'debug-kb') {
    return '调试资料';
  }
  return '历史归档';
}

export function buildSections(items: CatalogItem[], collection: ResourceCollection): GroupSection[] {
  if (collection === 'active-docs') {
    return ACTIVE_DOC_SECTIONS.map((section) => ({
      id: section.id,
      label: section.label,
      kicker: '开发文档',
      description: section.summary,
      items: (ACTIVE_DOC_BY_SECTION.get(section.id) ?? [])
        .map((meta) => activeDocsInOrder.find((item) => item.relativePath === meta.path))
        .filter((item): item is CatalogItem => Boolean(item))
        .filter((item) => items.some((candidate) => candidate.id === item.id))
    })).filter((section) => section.items.length > 0);
  }

  const groups = new Map<string, CatalogItem[]>();

  items.forEach((item) => {
    const current = groups.get(item.group) ?? [];
    current.push(item);
    groups.set(item.group, current);
  });

  return Array.from(groups.entries()).map(([group, groupItems]) => ({
    id: group,
    label: group,
    kicker: collection === 'debug-kb' ? '调试模块' : '归档分组',
    items: groupItems
  }));
}

export function getSequenceItems(item: CatalogItem) {
  if (item.collection === 'active-docs') {
    return activeDocsInOrder;
  }

  const collectionItems = getCollectionItems(item.collection);
  const groupItems = collectionItems.filter((candidate) => candidate.group === item.group);

  return groupItems.length ? groupItems : collectionItems;
}

export function getRowMeta(item: CatalogItem) {
  if (item.collection === 'active-docs') {
    return `第 ${String(item.order + 1).padStart(2, '0')} 篇`;
  }

  if (item.group === item.resourceKind) {
    return item.group;
  }

  return `${item.group} · ${item.resourceKind}`;
}

export function AppBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-[-8rem] top-6 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--glow-primary) / 0.4) 0%, transparent 72%)' }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 32, 0],
                y: [0, 18, 0]
              }
        }
        transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[-6rem] top-40 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--glow-secondary) / 0.34) 0%, transparent 72%)' }}
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -24, 0],
                y: [0, 24, 0]
              }
        }
        transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
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
  fontScaleId: FontScaleId;
  onFontScaleChange: (fontScaleId: FontScaleId) => void;
  onThemeChange: (themeId: ThemeId) => void;
  themeId: ThemeId;
}

export function AppearanceControls({
  fontScaleId,
  onFontScaleChange,
  onThemeChange,
  themeId
}: AppearanceControlsProps) {
  return (
    <div className="grid gap-[var(--layout-panel-gap)]" aria-label="阅读外观">
      <section className="grid gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Palette className="h-4 w-4 text-primary" />
          主题配色
        </div>
        <div className="grid gap-2">
          {THEME_OPTIONS.map((theme) => (
            <Button
              key={theme.id}
              type="button"
              variant={theme.id === themeId ? 'default' : 'secondary'}
              className="h-auto justify-between rounded-[1.4rem] px-4 py-3 text-left"
              onClick={() => onThemeChange(theme.id)}
            >
              <span className="grid gap-0.5">
                <span>{theme.label}</span>
                <span
                  className={cn(
                    'text-xs leading-5',
                    theme.id === themeId ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {theme.description}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Type className="h-4 w-4 text-primary" />
          字号密度
        </div>
        <div className="grid gap-2">
          {FONT_SCALE_OPTIONS.map((scale) => (
            <Button
              key={scale.id}
              type="button"
              variant={scale.id === fontScaleId ? 'default' : 'secondary'}
              className="h-auto justify-between rounded-[1.4rem] px-4 py-3 text-left"
              onClick={() => onFontScaleChange(scale.id)}
            >
              <span className="grid gap-0.5">
                <span>{scale.label}</span>
                <span
                  className={cn(
                    'text-xs leading-5',
                    scale.id === fontScaleId ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  )}
                >
                  {scale.description}
                </span>
              </span>
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
    <main className="page-safe-top reader-workspace-safe-top mx-auto w-full max-w-[1460px] px-4 pb-24 md:px-6 lg:h-dvh lg:overflow-hidden lg:pb-3">
      <div className="flex items-start gap-6 xl:gap-8 lg:h-[calc(100dvh-var(--reader-workspace-offset)-0.75rem)]">
        <aside className="hidden shrink-0 lg:block lg:h-full lg:w-[304px]">
          <div className="grid h-full gap-4 rounded-[2rem] border border-sidebar-border/80 bg-sidebar/95 p-3.5 shadow-[var(--shadow-panel)] backdrop-blur-xl">
            <div className="h-16 rounded-[1.6rem] bg-accent/55" />
            <div className="h-32 rounded-[1.8rem] bg-background/76" />
            <div className="min-h-0 flex-1 rounded-[1.8rem] bg-background/72" />
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="layout-panel-padding mx-auto w-full max-w-[var(--reader-max)] rounded-[2rem] border border-border/70 bg-card/84 shadow-[var(--shadow-panel)] backdrop-blur-2xl lg:flex lg:h-full lg:min-h-0 lg:max-w-none lg:flex-1 lg:flex-col lg:overflow-hidden">
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
      <nav className="grid gap-3" aria-label="移动端导航占位">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <Button
            key={item.id}
            variant="secondary"
            className="h-auto justify-between rounded-[1.4rem] px-4 py-4"
            disabled
          >
            <span>{item.label}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ))}
      </nav>

      <Separator />

      <div className="grid gap-3 rounded-[1.6rem] border border-border/70 bg-card/72 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <Palette className="h-4 w-4 text-primary" />
          阅读外观
        </div>
        <div className="h-10 rounded-full bg-accent/60" />
        <div className="h-10 rounded-full bg-accent/60" />
      </div>
    </div>
  );
}

export const COLLECTION_CARD_ICONS = {
  'active-docs': BookOpenText,
  'debug-kb': Wrench,
  archive: LibraryBig
} as const;

export const COLLECTION_SEARCH_ICON = Search;
