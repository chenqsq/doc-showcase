import { useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  COLLECTION_CARD_ICONS,
  COLLECTION_LABELS,
  COLLECTION_NOTES,
  COLLECTION_SEARCH_ICON,
  COLLECTION_SUMMARIES,
  buildSections,
  getCollectionItems,
  getCollectionKicker,
  getRowMeta
} from '@/app-shell';
import { searchCatalog } from '@/catalog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ResourceCollection } from '@/types';

interface CollectionRouteProps {
  collection: ResourceCollection;
}

export default function CollectionRoute({ collection }: CollectionRouteProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const items = useMemo(
    () => searchCatalog(getCollectionItems(collection), deferredQuery),
    [collection, deferredQuery]
  );
  const sections = useMemo(() => buildSections(items, collection), [collection, items]);
  const SearchIcon = COLLECTION_SEARCH_ICON;
  const SectionIcon = COLLECTION_CARD_ICONS[collection];

  return (
    <main className="page-safe-top layout-section-gap mx-auto grid w-full max-w-[var(--content-max)] px-4 pb-20 md:px-6 md:pb-24">
      <section className="grid gap-4">
        <Badge variant="outline" className="w-fit bg-background/70">
          {getCollectionKicker(collection)}
        </Badge>
        <h1 className="font-serif text-[clamp(2.2rem,4vw,3.6rem)] leading-none tracking-[-0.03em] text-foreground">
          {COLLECTION_LABELS[collection]}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground">{COLLECTION_SUMMARIES[collection]}</p>
      </section>

      <section className="layout-panel-gap layout-panel-padding grid rounded-[var(--surface-panel-radius)] border border-border/60 bg-background/88 md:border-border/70 md:bg-card/75 md:shadow-[var(--shadow-soft)] md:backdrop-blur-xl">
        <label
          className="flex min-h-14 items-center gap-3 rounded-full border border-border/70 bg-background/82 px-4 text-muted-foreground"
          htmlFor={`search-${collection}`}
        >
          <SearchIcon className="h-4 w-4 shrink-0" />
          <input
            id={`search-${collection}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`搜索 ${COLLECTION_LABELS[collection]} 中的标题、路径或正文`}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <p className="text-sm leading-7 text-muted-foreground">{COLLECTION_NOTES[collection]}</p>
      </section>

      {sections.length ? (
        <div className="grid gap-5">
          {sections.map((section) => (
            <section
              key={section.id}
              className="layout-panel-gap layout-panel-padding grid rounded-[var(--surface-panel-radius)] border border-border/60 bg-background/88 md:border-border/70 md:bg-card/74 md:shadow-[var(--shadow-soft)] md:backdrop-blur-xl"
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
                      className="grid gap-3 rounded-[var(--surface-card-radius)] px-3 py-3 transition-colors hover:bg-accent/50 hover:text-primary active:bg-accent/70 md:grid-cols-[auto,minmax(0,1fr),auto] md:items-center"
                      to={`/read/${item.id}`}
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--surface-control-radius)] bg-accent text-primary">
                        <SectionIcon className="h-4 w-4" />
                      </span>
                      <span className="grid gap-1">
                        <small className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {getRowMeta(item)}
                        </small>
                        <strong className="text-base leading-7 text-foreground">{item.title}</strong>
                        <span className="text-sm leading-7 text-muted-foreground">
                          {item.summary ?? '进入正文查看完整内容。'}
                        </span>
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[var(--surface-panel-radius)] border border-dashed border-border bg-background/84 p-6 text-center text-sm leading-7 text-muted-foreground md:bg-card/72">
          当前搜索条件下没有结果，可以尝试减少关键词或切换到其他范围继续浏览。
        </div>
      )}
    </main>
  );
}
