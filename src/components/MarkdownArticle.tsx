import {
  Children,
  Suspense,
  isValidElement,
  lazy,
  type ReactElement,
  type ReactNode,
  useLayoutEffect,
  useMemo,
  useRef
} from 'react';
import { useMediaQuery } from '@/app-shell';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { catalogByPath, findCatalogTarget, resolveRelativePath } from '../catalog';
import type { CatalogItem, LightboxState, OutlineItem } from '../types';
import { StealthScrollArea } from './StealthScrollArea';

const MermaidBlock = lazy(() =>
  import('./MermaidBlock').then((module) => ({ default: module.MermaidBlock }))
);

interface MarkdownArticleProps {
  item: CatalogItem;
  outline: OutlineItem[];
  onOpenLightbox: (lightbox: LightboxState) => void;
}

interface MermaidBlockSlotProps {
  chart: string;
  onOpenLightbox: (lightbox: LightboxState) => void;
  title: string;
}

interface TableCellModel {
  colSpan: number;
  content: ReactNode;
  isHeader: boolean;
  rowSpan: number;
}

interface TableRowModel {
  cells: TableCellModel[];
  key: string;
}

function MermaidBlockFallback({ title }: { title: string }) {
  return (
    <div className="mermaid-figure grid gap-[var(--reader-block-gap)] rounded-[var(--surface-card-radius)] border border-border/60 bg-background/84 p-[var(--reader-figure-padding)] md:border-border/70 md:bg-card/82 md:shadow-[var(--shadow-soft)] md:backdrop-blur-sm">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <span className="inline-flex w-fit rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            Mermaid 图表
          </span>
          <strong className="text-base font-semibold text-foreground">{title}</strong>
        </div>
        <span className="inline-flex h-9 w-28 rounded-full bg-accent/70" />
      </div>
      <div className="h-[min(52vh,42rem)] rounded-[1rem] border border-border/60 bg-background/88 md:rounded-[1.05rem]" />
    </div>
  );
}

function MermaidBlockSlot({ chart, onOpenLightbox, title }: MermaidBlockSlotProps) {
  return (
    <Suspense fallback={<MermaidBlockFallback title={title} />}>
      <MermaidBlock chart={chart} title={title} onOpenLightbox={onOpenLightbox} />
    </Suspense>
  );
}

function isElementWithChildren(node: ReactNode): node is ReactElement<{ children?: ReactNode }> {
  return isValidElement(node);
}

function isTableCellElement(
  node: ReactNode
): node is ReactElement<{ children?: ReactNode; colSpan?: number; rowSpan?: number }> {
  return isValidElement(node);
}

function extractTableRows(children: ReactNode): TableRowModel[] {
  return Children.toArray(children).flatMap((sectionNode, sectionIndex) => {
    if (!isElementWithChildren(sectionNode)) {
      return [];
    }

    return Children.toArray(sectionNode.props.children).flatMap((rowNode, rowIndex) => {
      if (!isElementWithChildren(rowNode)) {
        return [];
      }

      const cells = Children.toArray(rowNode.props.children).flatMap((cellNode) => {
        if (!isTableCellElement(cellNode)) {
          return [];
        }

        return [
          {
            colSpan: Number(cellNode.props.colSpan ?? 1),
            content: cellNode.props.children,
            isHeader: typeof cellNode.type === 'string' && cellNode.type.toLowerCase() === 'th',
            rowSpan: Number(cellNode.props.rowSpan ?? 1)
          }
        ];
      });

      return cells.length
        ? [
            {
              cells,
              key: `${sectionIndex}-${rowIndex}`
            }
          ]
        : [];
    });
  });
}

function isSimpleKeyValueTable(rows: TableRowModel[]) {
  if (rows.length < 2) {
    return false;
  }

  return rows.every((row) => row.cells.length === 2 && row.cells.every((cell) => cell.colSpan === 1 && cell.rowSpan === 1));
}

export function MarkdownArticle({ item, outline, onOpenLightbox }: MarkdownArticleProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const useMobileStackedTables = useMediaQuery('(max-width: 959px)');

  useLayoutEffect(() => {
    const article = articleRef.current;
    if (!article) {
      return;
    }

    const headings = Array.from(article.querySelectorAll('h1, h2, h3, h4'));
    headings.forEach((heading, index) => {
      const entry = outline[index];
      if (entry) {
        heading.id = entry.id;
      } else {
        heading.removeAttribute('id');
      }
    });
  }, [item.id, outline]);

  const components = useMemo(
    () => ({
      pre: ({ children }: { children?: ReactNode }) => {
        const hasMermaid = Children.toArray(children).some(
          (child) => isValidElement(child) && child.type === MermaidBlockSlot
        );

        return hasMermaid ? <>{children}</> : <pre>{children}</pre>;
      },
      a: ({ href, children }: { href?: string; children?: ReactNode }) => {
        if (!href) {
          return <span>{children}</span>;
        }

        const target = findCatalogTarget(item.relativePath, href);
        if (target) {
          return <Link to={`/read/${target.id}`}>{children}</Link>;
        }

        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      },
      img: ({ src, alt }: { src?: string; alt?: string }) => {
        if (!src) {
          return null;
        }

        const resolvedPath = resolveRelativePath(item.relativePath, src);
        const target = resolvedPath ? catalogByPath.get(resolvedPath) : undefined;
        const assetSrc = target?.assetUrl ?? src;
        const title = alt || target?.title || '文档配图';

        return (
          <figure className="inline-figure">
            <div className="inline-figure__media">
              <img src={assetSrc} alt={title} onClick={() => onOpenLightbox({ src: assetSrc, title })} />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="inline-figure__action rounded-[var(--surface-control-radius)] shadow-none"
                onClick={() => onOpenLightbox({ src: assetSrc, title })}
              >
                放大查看
              </Button>
            </div>
            {title ? <figcaption>{title}</figcaption> : null}
          </figure>
        );
      },
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="article-callout">{children}</blockquote>
      ),
      table: ({ children }: { children?: ReactNode }) => {
        const rows = extractTableRows(children);
        const useStackedLayout = useMobileStackedTables && isSimpleKeyValueTable(rows);
        const firstRowIsHeader = useStackedLayout && rows[0]?.cells.every((cell) => cell.isHeader);
        const dataRows = useStackedLayout ? (firstRowIsHeader ? rows.slice(1) : rows) : [];

        if (useStackedLayout) {
          return (
            <div className="article-table-block article-table-block--stacked">
              <div className="article-table-mobile-stack">
                {dataRows.map((row) => (
                  <div key={row.key} className="article-table-mobile-card">
                    <div className="article-table-mobile-label">{row.cells[0]?.content}</div>
                    <div className="article-table-mobile-value">{row.cells[1]?.content}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div className="article-table-block">
            <div className="article-table-hint">左右滑动查看表格</div>
            <StealthScrollArea axis="x" className="article-table-shell overflow-x-auto">
              <table>{children}</table>
            </StealthScrollArea>
          </div>
        );
      },
      code: ({
        className,
        children
      }: {
        className?: string;
        children?: ReactNode;
      }) => {
        const code = String(children ?? '').replace(/\n$/, '');

        if (className?.includes('language-mermaid')) {
          return (
            <MermaidBlockSlot
              chart={code}
              title={`${item.title} - Mermaid 图表`}
              onOpenLightbox={onOpenLightbox}
            />
          );
        }

        return <code className={className}>{children}</code>;
      }
    }),
    [item.relativePath, item.title, onOpenLightbox, useMobileStackedTables]
  );

  return (
    <article ref={articleRef} className="markdown-article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {item.rawText ?? ''}
      </ReactMarkdown>
    </article>
  );
}
