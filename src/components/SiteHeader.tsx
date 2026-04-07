import { motion } from 'framer-motion';
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  return (
    <>
      <div className="fixed left-4 top-[var(--header-floating-top)] z-50 md:hidden">
        <Button
          type="button"
          variant="secondary"
          className="h-[var(--mobile-nav-button-size)] w-[var(--mobile-nav-button-size)] rounded-[1.2rem] border border-border/70 bg-card/84 shadow-[var(--shadow-floating)] backdrop-blur-xl"
          aria-label="打开站点导航"
          onClick={onOpenMobileNav}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <motion.header
        className="pointer-events-none fixed inset-x-0 top-[var(--header-floating-top)] z-40 hidden px-4 md:block md:px-6"
        layout
        data-surface={surface}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          className={cn(
            'pointer-events-auto mx-auto flex w-full max-w-[var(--content-max)] items-center gap-3 rounded-[2rem] border border-border/70 px-4 shadow-[var(--shadow-panel)] backdrop-blur-2xl transition-[height,padding,background-color,border-color,box-shadow] duration-300 md:px-6',
            compact ? 'h-[var(--header-compact-height)] bg-card/92 shadow-[var(--shadow-floating)]' : 'h-[var(--header-expanded-height)] bg-card/80'
          )}
        >
          <Link className="min-w-0 flex-1 md:flex-none" to="/">
            <div className="flex min-w-0 flex-col">
              <span
                className={cn(
                  'overflow-hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80 transition-all duration-300',
                  compact ? 'max-h-0 opacity-0' : 'max-h-6 opacity-100'
                )}
              >
                开发文档工作台
              </span>
              <span
                className={cn(
                  'truncate font-serif text-lg text-foreground transition-all duration-300 md:text-[1.7rem]',
                  compact ? 'md:text-xl' : ''
                )}
              >
                AI 自主引导学习平台
              </span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="主导航">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  'rounded-full px-4 py-2 text-[length:var(--type-nav)] font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
                  item.isActive ? 'bg-accent text-accent-foreground shadow-[var(--shadow-soft)]' : ''
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <TooltipProvider delayDuration={140}>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size={compact ? 'icon' : 'default'}
                      className="shrink-0"
                      aria-label="打开阅读外观"
                    >
                      <ActiveThemeIcon className="h-4 w-4" />
                      <span className={cn(compact ? 'hidden' : 'hidden md:inline-flex')}>阅读外观</span>
                      {compact ? null : <Palette className="hidden h-4 w-4 md:inline-flex" />}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    主题配色
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 h-px bg-border/60" />
                  {THEME_OPTIONS.map((theme) => {
                    const ThemeIcon = themeIconMap[theme.id];

                    return (
                      <DropdownMenuCheckboxItem
                        key={theme.id}
                        checked={theme.id === themeId}
                        onCheckedChange={() => onThemeChange(theme.id)}
                      >
                        <ThemeIcon className="h-4 w-4 text-primary" />
                        <div className="grid gap-0.5">
                          <span className="font-medium text-foreground">{theme.label}</span>
                          <span className="text-xs text-muted-foreground">{theme.description}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    );
                  })}

                  <DropdownMenuLabel className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    字号密度
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-1 h-px bg-border/60" />
                  {FONT_SCALE_OPTIONS.map((scale) => (
                    <DropdownMenuCheckboxItem
                      key={scale.id}
                      checked={scale.id === fontScaleId}
                      onCheckedChange={() => onFontScaleChange(scale.id)}
                    >
                      <Type className="h-4 w-4 text-primary" />
                      <div className="grid gap-0.5">
                        <span className="font-medium text-foreground">{scale.label}</span>
                        <span className="text-xs text-muted-foreground">{scale.description}</span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipContent>阅读外观：{activeScaleLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </motion.header>
    </>
  );
}
