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
  outline: OutlineItem[];
  panelMountScope: string;
  previousItem?: CatalogItem;
  sequenceItems: CatalogItem[];
}

function SidebarPanelHeading({
  countLabel,
  title
}: {
  countLabel?: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      <span>{title}</span>
      {countLabel ? <span>{countLabel}</span> : null}
    </div>
  );
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
  outline,
  panelMountScope,
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
  const panelKey = `${panelMountScope}:${activePanel}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit text-muted-foreground">
          <Link to={collectionRoute}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
        </Button>

        <section className="layout-panel-padding rounded-[1.3rem] border border-sidebar-border/80 bg-sidebar-accent/36 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-sidebar-border/80 bg-sidebar text-sidebar-accent-foreground"
            >
              {collectionLabel}
            </Badge>
            {collectionMeta ? (
              <Badge
                variant="outline"
                className="border-sidebar-border/80 bg-sidebar/70 text-muted-foreground"
              >
                {collectionMeta}
              </Badge>
            ) : null}
          </div>

          <div className="mt-3.5 grid gap-3">
            <div className="grid gap-2">
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

      <div className="grid gap-3 pt-3">
        <section className="layout-panel-padding rounded-[1.18rem] border border-sidebar-border/80 bg-sidebar-accent/48">
          <div className="mb-2 flex items-center justify-between text-[length:var(--type-caption)] font-semibold uppercase tracking-[0.18em] text-sidebar-accent-foreground/72">
            <span>阅读进度</span>
            <span>
              {String(currentIndex + 1).padStart(2, '0')} / {String(sequenceItems.length).padStart(2, '0')}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background/70">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${Math.max(outlineProgress, 8)}%` }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </section>

        <Tabs
          value={activePanel}
          onValueChange={(value) => onPanelChange(value as ReaderSidebarPanel)}
          className="min-h-0"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.05rem] border-sidebar-border/80 bg-secondary/70 p-1">
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
      </div>

      <div className={cn('pt-3', activePanel === 'nav' ? '' : 'min-h-0 flex-1')}>
        <AnimatePresence initial={false}>
          {activePanel === 'outline' ? (
            <motion.section
              key={panelKey}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-0 flex-col gap-3"
            >
              <SidebarPanelHeading title="本文目录" countLabel={`${outline.length} 节`} />
              {outline.length ? (
                <StealthScrollArea axis="y" className="reader-scroll-shell min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
                  <div className="grid gap-1">
                    {outline.map((entry) => {
                      const isActive = entry.id === activeHeadingId;

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          className={cn(
                            'relative flex w-full items-start gap-3 rounded-[0.95rem] px-3 py-2.5 text-left transition-[background-color,color,box-shadow,transform] duration-[180ms] ease-out active:translate-y-px',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-soft)]'
                              : 'text-muted-foreground hover:bg-secondary/82 hover:text-foreground'
                          )}
                          onClick={() => onSelectHeading(entry.id)}
                        >
                          <span
                            className={cn(
                              'mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors',
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
                <div className="rounded-[1rem] border border-dashed border-border bg-background/60 p-4 text-[length:var(--type-sidebar-body)] leading-6 text-muted-foreground">
                  这篇文档没有可提取的标题目录。
                </div>
              )}
            </motion.section>
          ) : null}

          {activePanel === 'sequence' ? (
            <motion.section
              key={panelKey}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-0 flex-col gap-3"
            >
              <SidebarPanelHeading title="文档顺序" countLabel={`${sequenceItems.length} 篇`} />
              <StealthScrollArea axis="y" className="reader-scroll-shell min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
                <div className="grid gap-2">
                  {sequenceItems.map((entry, index) => (
                    <Link
                      key={entry.id}
                      className={cn(
                        'grid grid-cols-[1.75rem,1fr] items-start gap-3 rounded-[1rem] border px-3 py-3 transition-[background-color,border-color,color,box-shadow,transform] duration-[180ms] ease-out active:translate-y-px',
                        entry.id === item.id
                          ? 'border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-soft)]'
                          : 'border-transparent bg-background/45 text-foreground/84 hover:border-border hover:bg-card/82'
                      )}
                      to={`/read/${entry.id}`}
                    >
                      <span className="font-serif text-[1.35rem] leading-none text-primary">
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
            </motion.section>
          ) : null}

          {activePanel === 'nav' ? (
            <motion.section
              key={panelKey}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 content-start"
            >
              <SidebarPanelHeading title="阅读导航" />

              <div className="grid gap-2.5">
                <Button asChild variant="secondary" className="justify-between rounded-[1rem] shadow-none">
                  <Link to={collectionRoute}>
                    <span>回到列表</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>

                {previousItem ? (
                  <Button
                    asChild
                    variant="secondary"
                    className="h-auto justify-between rounded-[1rem] px-4 py-3 shadow-none"
                  >
                    <Link to={`/read/${previousItem.id}`}>
                      <span className="grid text-left">
                        <small className="text-[length:var(--type-caption)] uppercase tracking-[0.16em] text-muted-foreground">
                          上一篇
                        </small>
                        <strong className="mt-1 text-[length:var(--type-sidebar-body)] leading-6">
                          {previousItem.title}
                        </strong>
                      </span>
                      <ArrowLeft className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                ) : null}

                {nextItem ? (
                  <Button
                    asChild
                    variant="secondary"
                    className="h-auto justify-between rounded-[1rem] px-4 py-3 shadow-none"
                  >
                    <Link to={`/read/${nextItem.id}`}>
                      <span className="grid text-left">
                        <small className="text-[length:var(--type-caption)] uppercase tracking-[0.16em] text-muted-foreground">
                          下一篇
                        </small>
                        <strong className="mt-1 text-[length:var(--type-sidebar-body)] leading-6">
                          {nextItem.title}
                        </strong>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
