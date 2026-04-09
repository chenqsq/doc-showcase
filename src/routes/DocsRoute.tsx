import { BookOpenText } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { activeDocItems, buildActiveDocSections, getActiveDocRowMeta, searchActiveDocItems } from '@/active-docs';
import { COLLECTION_LABELS, COLLECTION_NOTES, COLLECTION_SUMMARIES, getCollectionKicker } from '@/shell-core';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function DocsRoute() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const items = useMemo(() => searchActiveDocItems(deferredQuery), [deferredQuery]);
  const sections = useMemo(() => buildActiveDocSections(items), [items]);

  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-24 md:px-6">
      <section className="grid gap-4">
        <Badge variant="outline" className="w-fit bg-background/70">
          {getCollectionKicker('active-docs')}
        </Badge>
        <h1 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] leading-none tracking-[-0.03em] text-foreground">
          {COLLECTION_LABELS['active-docs']}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground">
          {COLLECTION_SUMMARIES['active-docs']}
        </p>
      </section>

      <section className="layout-panel-gap layout-panel-padding grid rounded-[1.8rem] border border-border/70 bg-card/75 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <label
          className="flex min-h-14 items-center gap-3 rounded-full border border-border/70 bg-background/72 px-4 text-muted-foreground"
          htmlFor="search-active-docs"
        >
          <BookOpenText className="h-4 w-4 shrink-0" />
          <input
            id="search-active-docs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索作品文档中的标题、路径或摘要"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <p className="text-sm leading-7 text-muted-foreground">{COLLECTION_NOTES['active-docs']}</p>
      </section>

      {sections.length ? (
        <div className="grid gap-5">
          {sections.map((section) => (
            <section
              key={section.id}
              className="layout-panel-gap layout-panel-padding grid rounded-[1.9rem] border border-border/70 bg-card/74 shadow-[var(--shadow-soft)] backdrop-blur-xl"
            >
              <div className="grid gap-3">
                <Badge variant="outline" className="w-fit bg-background/70">
                  {section.kicker}
                </Badge>
                <h2 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-none text-foreground">
                  {section.label}
                </h2>
                {section.description ? (
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{section.description}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                {section.items.map((item, index) => (
                  <div key={item.id} className="grid gap-2">
                    {index > 0 ? <Separator /> : null}
                    <Link
                      className="grid gap-3 py-3 transition-colors hover:text-primary md:grid-cols-[auto,minmax(0,1fr),auto] md:items-center"
                      data-perf-id="collection-doc-link"
                      data-doc-id={item.id}
                      data-doc-index={index}
                      data-collection="active-docs"
                      to={`/read/${item.id}`}
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                        <BookOpenText className="h-4 w-4" />
                      </span>
                      <span className="grid gap-1">
                        <small className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {getActiveDocRowMeta(item.order)}
                        </small>
                        <strong className="text-base leading-7 text-foreground">{item.title}</strong>
                        <span className="text-sm leading-7 text-muted-foreground">{item.summary}</span>
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-border bg-card/72 p-6 text-center text-sm leading-7 text-muted-foreground">
          当前搜索条件下没有结果，可以尝试减少关键词或回到推荐阅读顺序继续浏览。
        </div>
      )}
    </main>
  );
}
