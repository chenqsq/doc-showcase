import { ACTIVE_DOC_BY_SECTION, ACTIVE_DOCS, ACTIVE_DOC_SECTIONS } from './siteMeta';
import { makeCatalogItemId } from './catalog-id';
import type { CatalogItem } from './types';

export const activeDocItems: CatalogItem[] = ACTIVE_DOCS.map((item) => ({
  id: makeCatalogItemId(item.path),
  type: 'markdown',
  collection: 'active-docs',
  layer: '作品文档',
  title: item.shortTitle,
  relativePath: item.path,
  group: '作品文档',
  resourceKind: '作品文档',
  order: item.order,
  summary: item.summary
}));

const activeDocItemsByPath = new Map(activeDocItems.map((item) => [item.relativePath, item]));

export function buildActiveDocSections(items: CatalogItem[]) {
  return ACTIVE_DOC_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    kicker: '作品文档',
    description: section.summary,
    items: (ACTIVE_DOC_BY_SECTION.get(section.id) ?? [])
      .map((meta) => activeDocItemsByPath.get(meta.path))
      .filter((item): item is CatalogItem => Boolean(item))
      .filter((item) => items.some((candidate) => candidate.id === item.id))
  })).filter((section) => section.items.length > 0);
}

export function searchActiveDocItems(query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return activeDocItems;
  }

  return activeDocItems.filter((item) =>
    [item.title, item.relativePath, item.summary ?? ''].join(' ').toLowerCase().includes(keyword)
  );
}

export function getActiveDocRowMeta(order: number) {
  return `第 ${String(order + 1).padStart(2, '0')} 篇`;
}
