import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Compass, ListTree, PanelTopOpen } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { StealthScrollArea } from './StealthScrollArea';
import type { CatalogItem, OutlineItem } from '../types';

export type ReaderSidebarPanel = 'outline' | 'sequence' | 'nav';

interface ReaderSidebarProps {
  activeHeadingId?: string;
  activePanel: ReaderSidebarPanel;
  collectionLabel: string;
  collectionMeta: string;
  collectionRoute: string;
  currentIndex: number;
  item: CatalogItem;
  nextItem?: CatalogItem;
  onPanelChange: (panel: ReaderSidebarPanel) => void;
  onSelectHeading: (id: string) => void;
  onSelectLink?: () => void;
  outline: OutlineItem[];
  previousItem?: CatalogItem;
  sequenceItems: CatalogItem[];
}

export function ReaderSidebar({
  activeHeadingId,
  activePanel,
  collectionLabel,
  collectionMeta,
  collectionRoute,
  currentIndex,
  item,
  nextItem,
  onPanelChange,
  onSelectHeading,
  onSelectLink,
  outline,
  previousItem,
  sequenceItems
}: ReaderSidebarProps) {
  const metaParts = [item.group, item.resourceKind].filter(
    (part, index, parts) => Boolean(part) && parts.indexOf(part) === index
  );

  const outlineProgress = useMemo(() => {
    if (!outline.length || !activeHeadingId) {
      return 0;
    }

    const activeIndex = Math.max(0, outline.findIndex((entry) => entry.id === activeHeadingId));
    return ((activeIndex + 1) / outline.length) * 100;
  }, [activeHeadingId, outline]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto,auto,auto,minmax(0,1fr)] gap-[var(--layout-panel-gap)]">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
          <Link to={collectionRoute} onClick={onSelectLink}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
        </Button>

        <section className="layout-panel-padding rounded-[1.6rem] border border-sidebar-border/80 bg-sidebar-accent/40 shadow-[var(--shadow-soft)]">
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
                {item.summary ?? '进入正文查看完整设计内容。'}
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
      </div>

      <div className="layout-panel-padding rounded-[1.4rem] border border-sidebar-border/80 bg-sidebar-accent/55">
        <div className="mb-2 flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.2em] text-sidebar-accent-foreground/70">
          <span>阅读进度</span>
          <span>
            {String(currentIndex + 1).padStart(2, '0')} / {String(sequenceItems.length).padStart(2, '0')}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-background/70">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${Math.max(outlineProgress, 8)}%` }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <Tabs
        value={activePanel}
        onValueChange={(value) => onPanelChange(value as ReaderSidebarPanel)}
        className="min-h-0"
      >
        <TabsList className="grid h-auto grid-cols-3 rounded-[1.4rem] border-sidebar-border/80 bg-secondary/70 p-1">
          <TabsTrigger value="outline" className="gap-1.5 text-[length:var(--type-caption)]">
            <ListTree className="h-4 w-4" />
            目录
          </TabsTrigger>
          <TabsTrigger value="sequence" className="gap-1.5 text-[length:var(--type-caption)]">
            <PanelTopOpen className="h-4 w-4" />
            顺序
          </TabsTrigger>
          <TabsTrigger value="nav" className="gap-1.5 text-[length:var(--type-caption)]">
            <Compass className="h-4 w-4" />
            导航
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="min-h-0 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {activePanel === 'outline' ? (
            <motion.div
              key="outline"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex h-full min-h-0 flex-col gap-3"
            >
              <div className="flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>本文目录</span>
                <span>{outline.length} 节</span>
              </div>
              {outline.length ? (
                <StealthScrollArea axis="y" className="reader-scroll-shell min-h-0 flex-1 overflow-y-auto pb-5">
                  <div className="grid gap-1">
                    {outline.map((entry) => {
                      const isActive = entry.id === activeHeadingId;
                      return (
                        <button
                          key={entry.id}
                          type="button"
                          className={cn(
                            'relative flex w-full items-start gap-3 rounded-[1.25rem] px-3 py-3 text-left transition-all duration-200',
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
                    })}
                  </div>
                </StealthScrollArea>
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-border bg-background/60 p-4 text-[length:var(--type-sidebar-body)] leading-6 text-muted-foreground">
                  这篇文档没有可提取的标题目录。
                </div>
              )}
            </motion.div>
          ) : null}

          {activePanel === 'sequence' ? (
            <motion.div
              key="sequence"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex h-full min-h-0 flex-col gap-3"
            >
              <div className="flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span>文档顺序</span>
                <span>{sequenceItems.length} 篇</span>
              </div>
              <StealthScrollArea axis="y" className="reader-scroll-shell min-h-0 flex-1 overflow-y-auto pb-6">
                <div className="grid gap-2">
                  {sequenceItems.map((entry, index) => (
                    <Link
                      key={entry.id}
                      className={cn(
                        'grid grid-cols-[auto,1fr] items-start gap-3 rounded-[1.35rem] border px-3 py-3 transition-all duration-200',
                        entry.id === item.id
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
                  ))}
                </div>
              </StealthScrollArea>
            </motion.div>
          ) : null}

          {activePanel === 'nav' ? (
            <motion.div
              key="nav"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex h-full min-h-0 flex-col gap-3"
            >
              <div className="text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                阅读导航
              </div>
              <StealthScrollArea axis="y" className="reader-scroll-shell grid min-h-0 gap-3 overflow-y-auto pb-5">
                <Button asChild variant="secondary" className="justify-between rounded-[1.35rem]">
                  <Link to={collectionRoute} onClick={onSelectLink}>
                    <span>回到列表</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>

                {previousItem ? (
                  <Button asChild variant="secondary" className="h-auto justify-between rounded-[1.35rem] px-4 py-4">
                    <Link to={`/read/${previousItem.id}`} onClick={onSelectLink}>
                      <span className="grid text-left">
                        <small className="text-[length:var(--type-caption)] uppercase tracking-[0.16em] text-muted-foreground">
                          上一篇
                        </small>
                        <strong className="mt-1 text-[length:var(--type-sidebar-body)] leading-6">
                          {previousItem.title}
                        </strong>
                      </span>
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}

                {nextItem ? (
                  <Button asChild variant="secondary" className="h-auto justify-between rounded-[1.35rem] px-4 py-4">
                    <Link to={`/read/${nextItem.id}`} onClick={onSelectLink}>
                      <span className="grid text-left">
                        <small className="text-[length:var(--type-caption)] uppercase tracking-[0.16em] text-muted-foreground">
                          下一篇
                        </small>
                        <strong className="mt-1 text-[length:var(--type-sidebar-body)] leading-6">
                          {nextItem.title}
                        </strong>
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </StealthScrollArea>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
