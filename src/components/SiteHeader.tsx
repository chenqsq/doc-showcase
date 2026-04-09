import { useEffect, useId, useRef, useState } from 'react';
import { Cloud, Leaf, Menu, MoonStar, Palette, SunMedium, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_THEME,
  FONT_SCALE_OPTIONS,
  THEME_OPTIONS,
  type FontScaleId,
  type ThemeId
} from '@/appearance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type HeaderSurface = 'home' | 'collection' | 'reader';

export interface HeaderNavLink {
  id: string;
  label: string;
  to: string;
  isActive: boolean;
}

interface SiteHeaderProps {
  compact?: boolean;
  fontScaleId: FontScaleId;
  navItems: HeaderNavLink[];
  onFontScaleChange: (fontScaleId: FontScaleId) => void;
  onOpenMobileNav: () => void;
  onThemeChange: (themeId: ThemeId) => void;
  surface: HeaderSurface;
  themeId: ThemeId;
}

const themeIconMap = {
  cloud: Cloud,
  mist: Leaf,
  sand: SunMedium,
  night: MoonStar,
  obsidian: MoonStar
} satisfies Record<ThemeId, typeof Cloud>;

function HeaderNavigation({
  compact,
  navItems,
  surface
}: {
  compact: boolean;
  navItems: HeaderNavLink[];
  surface: HeaderSurface;
}) {
  const isReaderSurface = surface === 'reader';

  return (
    <nav
      className={cn(
        'hidden flex-1 items-center justify-center md:flex',
        compact ? 'gap-1' : isReaderSurface ? 'gap-1.5' : 'gap-1'
      )}
      aria-label="主导航"
    >
      {navItems.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          className={cn(
            'rounded-full text-[length:var(--type-nav)] font-medium text-muted-foreground transition-[background-color,color,box-shadow,transform,padding] duration-200',
            compact ? 'px-3.5 py-1.5' : 'px-4 py-2',
            isReaderSurface
              ? 'hover:bg-accent/80 hover:text-accent-foreground'
              : 'hover:bg-accent hover:text-accent-foreground',
            item.isActive ? 'bg-accent text-accent-foreground shadow-[var(--shadow-soft)]' : ''
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function AppearanceMenu({
  ActiveThemeIcon,
  activeScaleLabel,
  compact,
  fontScaleId,
  onFontScaleChange,
  onThemeChange,
  surface,
  themeId
}: {
  ActiveThemeIcon: typeof Cloud;
  activeScaleLabel: string;
  compact: boolean;
  fontScaleId: FontScaleId;
  onFontScaleChange: (fontScaleId: FontScaleId) => void;
  onThemeChange: (themeId: ThemeId) => void;
  surface: HeaderSurface;
  themeId: ThemeId;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const label = '阅读外观';
  const isReaderSurface = surface === 'reader';

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || containerRef.current?.contains(event.target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <Button
        type="button"
        variant="secondary"
        size={compact ? 'icon' : 'default'}
        className={cn(
          'shrink-0 transition-[transform,background-color,border-color,color,box-shadow] duration-150',
          isReaderSurface ? 'border-border/70 bg-background/82 hover:border-primary/30 hover:bg-card/92' : ''
        )}
        aria-label="打开阅读外观"
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="dialog"
        title={`阅读外观：${activeScaleLabel}`}
        onClick={() => setOpen((current) => !current)}
      >
        <ActiveThemeIcon className="h-4 w-4" />
        {compact ? null : (
          <>
            <span className="hidden md:inline-flex">{label}</span>
            <Palette className="hidden h-4 w-4 md:inline-flex" />
          </>
        )}
      </Button>

      <div
        id={menuId}
        className={cn(
          'absolute right-0 top-full z-50 mt-3 w-80 origin-top-right rounded-[1.5rem] border border-border/70 bg-popover/95 p-2 text-popover-foreground shadow-[var(--shadow-panel)] transition-[opacity,transform,visibility] duration-150 ease-out',
          open
            ? 'visible translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none invisible -translate-y-1 scale-[0.98] opacity-0'
        )}
        role="dialog"
        aria-label={label}
        aria-hidden={!open}
      >
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          主题配色
        </div>
        <div className="my-1 h-px bg-border/60" />
        <div className="grid gap-1">
          {THEME_OPTIONS.map((theme) => {
            const ThemeIcon = themeIconMap[theme.id];
            const active = theme.id === themeId;

            return (
              <button
                key={theme.id}
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-[1rem] px-3 py-2.5 text-left transition-[background-color,transform] duration-150',
                  active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70'
                )}
                onClick={() => {
                  onThemeChange(theme.id);
                  setOpen(false);
                }}
              >
                <ThemeIcon className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{theme.label}</div>
                  <div className="text-xs text-muted-foreground">{theme.description}</div>
                </div>
                <span
                  className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full border border-primary/40 transition-colors duration-150',
                    active ? 'bg-primary' : 'bg-transparent'
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        <div className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          字号密度
        </div>
        <div className="my-1 h-px bg-border/60" />
        <div className="grid gap-1">
          {FONT_SCALE_OPTIONS.map((scale) => {
            const active = scale.id === fontScaleId;

            return (
              <button
                key={scale.id}
                type="button"
                className={cn(
                  'flex w-full items-center gap-3 rounded-[1rem] px-3 py-2.5 text-left transition-[background-color,transform] duration-150',
                  active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70'
                )}
                onClick={() => {
                  onFontScaleChange(scale.id);
                  setOpen(false);
                }}
              >
                <Type className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground">{scale.label}</div>
                  <div className="text-xs text-muted-foreground">{scale.description}</div>
                </div>
                <span
                  className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full border border-primary/40 transition-colors duration-150',
                    active ? 'bg-primary' : 'bg-transparent'
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({
  compact = false,
  fontScaleId,
  navItems,
  onFontScaleChange,
  onOpenMobileNav,
  onThemeChange,
  surface,
  themeId
}: SiteHeaderProps) {
  const ActiveThemeIcon = themeIconMap[themeId] ?? themeIconMap[DEFAULT_THEME];
  const activeScaleLabel = FONT_SCALE_OPTIONS.find((option) => option.id === fontScaleId)?.label ?? '标准';
  const isReaderSurface = surface === 'reader';
  const navigation = <HeaderNavigation compact={compact} navItems={navItems} surface={surface} />;
  const appearanceMenu = (
    <AppearanceMenu
      ActiveThemeIcon={ActiveThemeIcon}
      activeScaleLabel={activeScaleLabel}
      compact={compact}
      fontScaleId={fontScaleId}
      onFontScaleChange={onFontScaleChange}
      onThemeChange={onThemeChange}
      surface={surface}
      themeId={themeId}
    />
  );

  return (
    <>
      <div className="fixed left-4 top-[var(--header-floating-top)] z-50 min-[1024px]:hidden">
        <Button
          type="button"
          variant="secondary"
          className="h-[var(--mobile-nav-button-size)] w-[var(--mobile-nav-button-size)] rounded-[1.45rem] border border-border/70 bg-card/88 shadow-[var(--shadow-floating)] backdrop-blur-xl"
          aria-label="打开站点导航"
          data-perf-id="site-mobile-nav-trigger"
          onClick={onOpenMobileNav}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <header
        className="pointer-events-none fixed inset-x-0 top-[var(--header-floating-top)] z-40 hidden px-4 min-[1024px]:block min-[1024px]:px-6"
        data-surface={surface}
      >
        <div
          className={cn(
            'pointer-events-auto mx-auto flex w-full max-w-[var(--content-max)] items-center gap-3 border px-4 backdrop-blur-2xl transition-[height,padding,background-color,border-color,box-shadow,border-radius] duration-200 ease-out md:px-6',
            compact
              ? 'h-[var(--header-compact-height)] rounded-[1.55rem] bg-card/95 shadow-[var(--shadow-floating)] md:px-5'
              : 'h-[var(--header-expanded-height)] rounded-[2rem] bg-card/82 shadow-[var(--shadow-panel)]',
            isReaderSurface
              ? compact
                ? 'border-sidebar-border/75 bg-card/94'
                : 'border-sidebar-border/70 bg-card/88 shadow-[var(--shadow-soft)]'
              : 'border-border/70'
          )}
        >
          <Link className="min-w-0 flex-1 md:flex-none" to="/">
            <div className="flex min-w-0 flex-col">
              <span
                className={cn(
                  'overflow-hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80 transition-[max-height,opacity,transform] duration-300',
                  compact ? 'max-h-0 -translate-y-1 opacity-0' : 'max-h-6 translate-y-0 opacity-100'
                )}
              >
                AI 主导学习生命周期
              </span>
              <span
                className={cn(
                  'truncate font-serif text-lg text-foreground transition-[transform,font-size] duration-300 md:text-[1.7rem]',
                  compact ? '-translate-y-0.5 md:text-[1.2rem]' : '',
                  isReaderSurface && !compact ? 'md:text-[1.62rem]' : ''
                )}
              >
                自进化自学智能体平台
              </span>
            </div>
          </Link>

          {navigation}
          {appearanceMenu}
        </div>
      </header>
    </>
  );
}
