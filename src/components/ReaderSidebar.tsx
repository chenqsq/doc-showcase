import { ListTree, PanelTopOpen } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { StealthScrollArea } from './StealthScrollArea';
import type { CatalogItem, OutlineItem } from '../types';

export type ReaderSidebarPanel = 'outline' | 'sequence';

interface ReaderSidebarProps {
  activeHeadingId?: string;
  activePanel: ReaderSidebarPanel;
  collectionLabel: string;
  collectionMeta: string;
  item: CatalogItem;
  onPanelChange: (panel: ReaderSidebarPanel) => void;
  onSelectHeading: (id: string) => void;
  onSelectLink?: () => void;
  outline: OutlineItem[];
  scrollProgress?: number;
  sequenceItems: CatalogItem[];
}

interface ReaderOutlineEntryProps {
  entry: OutlineItem;
  isActive: boolean;
  onSelectHeading: (id: string) => void;
  onSelectLink?: () => void;
}

interface ReaderSequenceEntryProps {
  entry: CatalogItem;
  index: number;
  isActive: boolean;
  onSelectLink?: () => void;
}

const ReaderOutlineEntry = memo(function ReaderOutlineEntry({
  entry,
  isActive,
  onSelectHeading,
  onSelectLink
}: ReaderOutlineEntryProps) {
  return (
    <button
      type="button"
      data-perf-id="reader-outline-link"
      data-heading-id={entry.id}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-[1.25rem] px-3 py-3 text-left transition-colors duration-150',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-soft)]'
          : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
      )}
      onClick={() => {
        onSelectHeading(entry.id);
        onSelectLink?.();
      }}
    >
      <span
        className={cn(
          'mt-1 h-2.5 w-2.5 shrink-0 rounded-full transition-colors',
          isActive ? 'bg-primary' : 'bg-border'
        )}
      />
      <span
        className={cn(
          'text-[length:var(--type-sidebar-body)] leading-6',
          entry.level >= 3 ? 'pl-3' : '',
          entry.level >= 4 ? 'pl-6' : ''
        )}
      >
        {entry.text}
      </span>
    </button>
  );
});

const ReaderSequenceEntry = memo(function ReaderSequenceEntry({
  entry,
  index,
  isActive,
  onSelectLink
}: ReaderSequenceEntryProps) {
  return (
    <Link
      data-perf-id="reader-sequence-link"
      data-doc-id={entry.id}
      className={cn(
        'grid grid-cols-[auto,1fr] items-start gap-3 rounded-[1.35rem] border px-3 py-3 transition-colors duration-150',
        isActive
          ? 'border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-soft)]'
          : 'border-transparent bg-background/45 text-foreground/84 hover:border-border hover:bg-card/80'
      )}
      to={`/read/${entry.id}`}
      onClick={onSelectLink}
    >
      <span className="font-serif text-[1.9rem] leading-none text-primary">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="grid gap-1">
        <strong className="text-[length:var(--type-sidebar-body)] leading-6">{entry.title}</strong>
        <small className="text-[length:var(--type-sidebar-meta)] leading-6 text-muted-foreground">
          {entry.summary ?? entry.resourceKind}
        </small>
      </span>
    </Link>
  );
});

const ReaderOutlinePanel = memo(function ReaderOutlinePanel({
  activeHeadingId,
  activePanel,
  onSelectHeading,
  onSelectLink,
  outline
}: Pick<ReaderSidebarProps, 'activeHeadingId' | 'activePanel' | 'onSelectHeading' | 'onSelectLink' | 'outline'>) {
  return (
    <section
      className={cn(
        'absolute inset-0 flex min-h-0 flex-col gap-3 transition-[opacity,transform] duration-180 ease-out motion-reduce:transition-none',
        activePanel === 'outline'
          ? 'pointer-events-auto translate-x-0 opacity-100'
          : 'pointer-events-none -translate-x-3 opacity-0'
      )}
      aria-hidden={activePanel !== 'outline'}
    >
      <div className="flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>目录</span>
        <span>{outline.length} 项</span>
      </div>
      {outline.length ? (
        <StealthScrollArea axis="y" className="reader-scroll-shell min-h-0 flex-1 overflow-y-auto pb-5">
          <div className="grid gap-1">
            {outline.map((entry) => (
              <ReaderOutlineEntry
                key={entry.id}
                entry={entry}
                isActive={entry.id === activeHeadingId}
                onSelectHeading={onSelectHeading}
                onSelectLink={onSelectLink}
              />
            ))}
          </div>
        </StealthScrollArea>
      ) : (
        <div className="shrink-0 rounded-[1.4rem] border border-dashed border-border bg-background/60 p-4 text-[length:var(--type-sidebar-body)] leading-6 text-muted-foreground">
          当前文档暂无可用目录。
        </div>
      )}
    </section>
  );
});

const ReaderSequencePanel = memo(function ReaderSequencePanel({
  activePanel,
  item,
  onSelectLink,
  sequenceItems
}: Pick<ReaderSidebarProps, 'activePanel' | 'item' | 'onSelectLink' | 'sequenceItems'>) {
  return (
    <section
      className={cn(
        'absolute inset-0 flex min-h-0 flex-col gap-3 transition-[opacity,transform] duration-180 ease-out motion-reduce:transition-none',
        activePanel === 'sequence'
          ? 'pointer-events-auto translate-x-0 opacity-100'
          : 'pointer-events-none translate-x-3 opacity-0'
      )}
      aria-hidden={activePanel !== 'sequence'}
    >
      <div className="flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <span>顺序</span>
        <span>{sequenceItems.length} 篇</span>
      </div>
      <StealthScrollArea axis="y" className="reader-scroll-shell min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="grid gap-2">
          {sequenceItems.map((entry, index) => (
            <ReaderSequenceEntry
              key={entry.id}
              entry={entry}
              index={index}
              isActive={entry.id === item.id}
              onSelectLink={onSelectLink}
            />
          ))}
        </div>
      </StealthScrollArea>
    </section>
  );
});

export const ReaderSidebar = memo(function ReaderSidebar({
  activeHeadingId,
  activePanel,
  collectionLabel,
  collectionMeta,
  item,
  onPanelChange,
  onSelectHeading,
  onSelectLink,
  outline,
  scrollProgress,
  sequenceItems
}: ReaderSidebarProps) {
  const metaParts = useMemo(
    () =>
      [item.group, item.resourceKind].filter(
        (part, index, parts) => Boolean(part) && parts.indexOf(part) === index
      ),
    [item.group, item.resourceKind]
  );

  const progressValue = useMemo(() => {
    if (typeof scrollProgress !== 'number' || Number.isNaN(scrollProgress)) {
      return undefined;
    }

    return Math.min(Math.max(scrollProgress, 0), 100);
  }, [scrollProgress]);

  const progressLabel = progressValue == null ? undefined : `${Math.round(progressValue)}%`;

  return (
    <div className="flex h-full min-h-0 flex-col gap-[var(--layout-panel-gap)]" data-perf-id="reader-sidebar">
      <section className="shrink-0 layout-panel-padding rounded-[1.6rem] border border-sidebar-border/80 bg-sidebar-accent/40 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-sidebar-border/80 bg-sidebar text-sidebar-accent-foreground"
          >
            {collectionLabel}
          </Badge>
          <Badge
            variant="outline"
            className="border-sidebar-border/80 bg-sidebar/70 text-muted-foreground"
          >
            {collectionMeta}
          </Badge>
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-2">
            <h2 className="font-serif text-[length:var(--type-sidebar-title)] leading-[1.06] text-sidebar-foreground">
              {item.title}
            </h2>
            <p className="text-[length:var(--type-sidebar-body)] leading-7 text-muted-foreground">
              {item.summary ?? '打开文档后查看完整设计说明。'}
            </p>
          </div>

          {metaParts.length ? (
            <div className="flex flex-wrap gap-2 text-[length:var(--type-sidebar-meta)] leading-6 text-muted-foreground">
              {metaParts.map((part) => (
                <span
                  key={part}
                  className="rounded-full border border-sidebar-border/70 bg-sidebar/65 px-2.5 py-1"
                >
                  {part}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {progressValue != null ? (
        <div
          className="layout-panel-padding shrink-0 rounded-[1.4rem] border border-sidebar-border/80 bg-sidebar-accent/55"
          data-perf-id="reader-progress"
        >
          <div className="mb-2 flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.2em] text-sidebar-accent-foreground/70">
            <span>阅读进度</span>
            <span>{progressLabel}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background/70">
            <div
              className="h-full origin-left rounded-full bg-primary transition-transform duration-180 ease-out motion-reduce:transition-none"
              style={{ transform: `scaleX(${progressValue / 100})` }}
            />
          </div>
        </div>
      ) : null}

      <Tabs
        value={activePanel}
        onValueChange={(value) => onPanelChange(value as ReaderSidebarPanel)}
        className="shrink-0"
      >
        <TabsList className="grid h-auto grid-cols-2 rounded-[1.4rem] border-sidebar-border/80 bg-secondary/70 p-1">
          <TabsTrigger
            value="outline"
            className="gap-1.5 text-[length:var(--type-caption)]"
            data-perf-id="reader-tab-outline"
          >
            <ListTree className="h-4 w-4" />
            目录
          </TabsTrigger>
          <TabsTrigger
            value="sequence"
            className="gap-1.5 text-[length:var(--type-caption)]"
            data-perf-id="reader-tab-sequence"
          >
            <PanelTopOpen className="h-4 w-4" />
            顺序
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <ReaderOutlinePanel
          activeHeadingId={activeHeadingId}
          activePanel={activePanel}
          onSelectHeading={onSelectHeading}
          onSelectLink={onSelectLink}
          outline={outline}
        />
        <ReaderSequencePanel
          activePanel={activePanel}
          item={item}
          onSelectLink={onSelectLink}
          sequenceItems={sequenceItems}
        />
      </div>
    </div>
  );
});
