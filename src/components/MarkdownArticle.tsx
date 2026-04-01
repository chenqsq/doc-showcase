import { type ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import type { ThemeId } from '../appearance';
import { catalogByPath, findCatalogTarget, makeHeadingId, resolveRelativePath } from '../catalog';
import type { CatalogItem, LightboxState } from '../types';
import { MermaidBlock } from './MermaidBlock';

interface MarkdownArticleProps {
  item: CatalogItem;
  onOpenLightbox: (lightbox: LightboxState) => void;
  themeId: ThemeId;
}

function flattenChildren(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(flattenChildren).join('');
  }

  if (children && typeof children === 'object' && 'props' in children) {
    return flattenChildren((children as { props?: { children?: ReactNode } }).props?.children);
  }

  return '';
}

export function MarkdownArticle({ item, onOpenLightbox, themeId }: MarkdownArticleProps) {
  const components = useMemo(() => {
    const headingCounts = new Map<string, number>();

    const createHeading =
      (Tag: 'h1' | 'h2' | 'h3' | 'h4') =>
      ({ children }: { children?: ReactNode }) => {
        const text = flattenChildren(children);
        const occurrence = headingCounts.get(text) ?? 0;
        headingCounts.set(text, occurrence + 1);
        const id = makeHeadingId(text, occurrence);

        return <Tag id={id}>{children}</Tag>;
      };

    return {
      h1: createHeading('h1'),
      h2: createHeading('h2'),
      h3: createHeading('h3'),
      h4: createHeading('h4'),
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
            <button
              type="button"
              className="inline-figure-zoom"
              onClick={() => onOpenLightbox({ src: assetSrc, title })}
            >
              放大查看
            </button>
            <img
              src={assetSrc}
              alt={title}
              onClick={() => onOpenLightbox({ src: assetSrc, title })}
            />
            {title ? <figcaption>{title}</figcaption> : null}
          </figure>
        );
      },
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="article-callout">{children}</blockquote>
      ),
      table: ({ children }: { children?: ReactNode }) => (
        <div className="article-table-shell">
          <table>{children}</table>
        </div>
      ),
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
            <MermaidBlock
              chart={code}
              themeId={themeId}
              title={`${item.title} - Mermaid 图表`}
              onOpenLightbox={onOpenLightbox}
            />
          );
        }

        return <code className={className}>{children}</code>;
      }
    };
  }, [item.relativePath, item.title, onOpenLightbox, themeId]);

  return (
    <article className="markdown-article">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {item.rawText ?? ''}
      </ReactMarkdown>
    </article>
  );
}
