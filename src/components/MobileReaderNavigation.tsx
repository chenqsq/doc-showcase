import * as Collapsible from '@radix-ui/react-collapsible';
import { ArrowLeft, ArrowRight, ChevronDown, Compass, ListTree, PanelTopOpen } from 'lucide-react';
import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { useMediaQuery } from '@/app-shell';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { StealthScrollArea } from './StealthScrollArea';
import type { ReaderMobileNavigationState } from '@/types';

type MobileReaderSectionId = 'outline' | 'sequence' | 'nav';

interface MobileReaderNavigationProps {
  navigation: ReaderMobileNavigationState;
  onNavigate: () => void;
}

interface MobileReaderSectionProps {
  badge?: string;
  children: ReactNode;
  icon: typeof ListTree;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

function useDeferredBodyMount(open: boolean) {
  const [renderBody, setRenderBody] = useState(open);

  useEffect(() => {
    if (!open) {
      setRenderBody(false);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      startTransition(() => {
        setRenderBody(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  return renderBody;
}

function MobileReaderScrollArea({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  const coarsePointer = useMediaQuery('(pointer: coarse)');

  if (coarsePointer) {
    return (
      <div
        className={cn(
          'max-h-[min(36vh,18rem)] overflow-y-auto pr-0.5 [contain:layout_paint_style] [content-visibility:auto]',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <StealthScrollArea
      axis="y"
      className={cn('max-h-[min(36vh,18rem)] overflow-y-auto pr-0.5', className)}
    >
      {children}
    </StealthScrollArea>
  );
}

function MobileReaderSection({
  badge,
  children,
  icon: Icon,
  onOpenChange,
  open,
  title
}: MobileReaderSectionProps) {
  const renderBody = useDeferredBodyMount(open);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={onOpenChange}
      className="overflow-hidden rounded-[0.72rem] border border-border/60 bg-background/72"
    >
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left transition-[background-color,color,transform,box-shadow] duration-[180ms] ease-out hover:bg-accent/18 active:scale-[0.994] active:bg-accent/28"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[0.62rem] bg-secondary text-secondary-foreground">
              <Icon className="h-[0.88rem] w-[0.88rem]" />
            </span>
            <span className="min-w-0 truncate text-[0.86rem] font-medium text-foreground">{title}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            {badge ? <span className="text-[0.72rem] text-muted-foreground">{badge}</span> : null}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-[180ms] ease-out',
                open ? 'rotate-180' : ''
              )}
            />
          </span>
        </button>
      </Collapsible.Trigger>
      {open ? (
        <div className="border-t border-border/60 px-2.5 py-2">
          {renderBody ? (
            <div className="animate-in fade-in-0 slide-in-from-top-1 duration-[150ms] ease-out">{children}</div>
          ) : null}
        </div>
      ) : null}
    </Collapsible.Root>
  );
}

export function MobileReaderNavigation({ navigation, onNavigate }: MobileReaderNavigationProps) {
  const {
    activeHeadingId,
    collectionLabel,
    collectionMeta,
    collectionRoute,
    currentIndex,
    item,
    nextItem,
    onSelectHeading,
    outline,
    previousItem,
    sequenceItems
  } = navigation;
  const [openSection, setOpenSection] = useState<MobileReaderSectionId | null>(null);

  useEffect(() => {
    setOpenSection(null);
  }, [item.id]);

  const handleSectionChange = (section: MobileReaderSectionId, open: boolean) => {
    setOpenSection(open ? section : null);
  };

  const outlineItems = useMemo(
    () =>
      outline.map((entry) => {
        const isActive = entry.id === activeHeadingId;

        return (
          <button
            key={entry.id}
            type="button"
            className={cn(
              'flex w-full items-start gap-2 rounded-[0.64rem] px-2.5 py-[0.42rem] text-left transition-[background-color,color] duration-[160ms] ease-out active:bg-accent/24',
              isActive
                ? 'bg-accent/88 text-accent-foreground'
                : 'text-muted-foreground hover:bg-secondary/58 hover:text-foreground'
            )}
            onClick={() => {
              onSelectHeading(entry.id);
              onNavigate();
            }}
          >
            <span
              className={cn('mt-[0.42rem] h-2 w-2 shrink-0 rounded-full', isActive ? 'bg-primary' : 'bg-border')}
            />
            <span
              className={cn(
                'text-[0.78rem] leading-5',
                entry.level >= 3 ? 'pl-2' : '',
                entry.level >= 4 ? 'pl-4' : ''
              )}
            >
              {entry.text}
            </span>
          </button>
        );
      }),
    [activeHeadingId, onNavigate, onSelectHeading, outline]
  );

  const sequenceRows = useMemo(
    () =>
      sequenceItems.map((entry, index) => {
        const isCurrent = entry.id === item.id;

        return (
          <Link
            key={entry.id}
            className={cn(
              'grid grid-cols-[1.6rem,1fr] items-center gap-2 rounded-[0.64rem] border px-2.5 py-[0.58rem] transition-[background-color,border-color,color] duration-[160ms] ease-out active:bg-accent/24',
              isCurrent
                ? 'border-primary/24 bg-accent/86 text-accent-foreground'
                : 'border-border/50 bg-background/46 text-foreground/88 hover:border-primary/16 hover:bg-card/76'
            )}
            style={{ contain: 'layout paint style', contentVisibility: 'auto', containIntrinsicSize: '42px' }}
            to={`/read/${entry.id}`}
            onClick={onNavigate}
          >
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/86">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="line-clamp-1 text-[0.8rem] leading-5">{entry.title}</span>
          </Link>
        );
      }),
    [item.id, onNavigate, sequenceItems]
  );

  return (
    <div className="grid gap-2">
      <section className="flex min-w-0 flex-wrap items-center gap-1.5 px-0.5">
        <Badge variant="outline" className="px-2 py-0.5 text-[0.72rem]">
          {collectionLabel}
        </Badge>
        <Badge variant="outline" className="px-2 py-0.5 text-[0.72rem] text-muted-foreground">
          {collectionMeta}
        </Badge>
        <span className="min-w-0 truncate text-[0.76rem] text-muted-foreground">{item.title}</span>
      </section>

      <MobileReaderSection
        badge={outline.length ? `${outline.length} 节` : '无目录'}
        icon={ListTree}
        onOpenChange={(open) => handleSectionChange('outline', open)}
        open={openSection === 'outline'}
        title="本文目录"
      >
        {outline.length ? (
          <MobileReaderScrollArea>
            <div className="grid gap-1">{outlineItems}</div>
          </MobileReaderScrollArea>
        ) : (
          <p className="rounded-[0.68rem] border border-dashed border-border bg-background/60 px-2.5 py-2 text-[0.78rem] leading-5 text-muted-foreground">
            这篇内容没有可展开的目录。
          </p>
        )}
      </MobileReaderSection>

      <MobileReaderSection
        badge={`${currentIndex + 1} / ${sequenceItems.length}`}
        icon={PanelTopOpen}
        onOpenChange={(open) => handleSectionChange('sequence', open)}
        open={openSection === 'sequence'}
        title="文档顺序"
      >
        <MobileReaderScrollArea>
          <div className="grid gap-1">{sequenceRows}</div>
        </MobileReaderScrollArea>
      </MobileReaderSection>

      <MobileReaderSection
        badge="返回列表与上下篇"
        icon={Compass}
        onOpenChange={(open) => handleSectionChange('nav', open)}
        open={openSection === 'nav'}
        title="阅读导航"
      >
        <div className="grid gap-1.5">
          <Link
            className="flex h-8 items-center justify-between rounded-[0.64rem] border border-border/60 bg-background/52 px-[0.68rem] text-[0.82rem] transition-[background-color,border-color,color] duration-[160ms] ease-out hover:bg-accent/18 active:bg-accent/24"
            to={collectionRoute}
            onClick={onNavigate}
          >
            <span>回到列表</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {previousItem ? (
            <Link
              className="flex items-center justify-between rounded-[0.64rem] border border-border/60 bg-background/52 px-[0.68rem] py-[0.56rem] transition-[background-color,border-color,color] duration-[160ms] ease-out hover:bg-accent/18 active:bg-accent/24"
              to={`/read/${previousItem.id}`}
              onClick={onNavigate}
            >
              <span className="grid min-w-0 text-left">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">上一篇</span>
                <span className="mt-0.5 line-clamp-2 text-[0.78rem] leading-5">{previousItem.title}</span>
              </span>
              <ArrowLeft className="h-4 w-4 shrink-0" />
            </Link>
          ) : null}

          {nextItem ? (
            <Link
              className="flex items-center justify-between rounded-[0.64rem] border border-border/60 bg-background/52 px-[0.68rem] py-[0.56rem] transition-[background-color,border-color,color] duration-[160ms] ease-out hover:bg-accent/18 active:bg-accent/24"
              to={`/read/${nextItem.id}`}
              onClick={onNavigate}
            >
              <span className="grid min-w-0 text-left">
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">下一篇</span>
                <span className="mt-0.5 line-clamp-2 text-[0.78rem] leading-5">{nextItem.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          ) : null}
        </div>
      </MobileReaderSection>
    </div>
  );
}
