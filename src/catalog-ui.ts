import { BookOpenText, LibraryBig, Search, Wrench } from 'lucide-react';
import { activeDocsInOrder, archiveDocs, debugKnowledgeDocs } from './catalog';
import { ACTIVE_DOC_BY_SECTION, ACTIVE_DOC_SECTIONS } from './siteMeta';
import type { CatalogItem, ResourceCollection } from './types';

export interface GroupSection {
  id: string;
  label: string;
  kicker: string;
  description?: string;
  items: CatalogItem[];
}

export function getCollectionItems(collection: ResourceCollection) {
  if (collection === 'active-docs') {
    return activeDocsInOrder;
  }

  if (collection === 'debug-kb') {
    return debugKnowledgeDocs;
  }

  return archiveDocs;
}

export function buildSections(items: CatalogItem[], collection: ResourceCollection): GroupSection[] {
  if (collection === 'active-docs') {
    return ACTIVE_DOC_SECTIONS.map((section) => ({
      id: section.id,
      label: section.label,
      kicker: '作品文档',
      description: section.summary,
      items: (ACTIVE_DOC_BY_SECTION.get(section.id) ?? [])
        .map((meta) => activeDocsInOrder.find((item) => item.relativePath === meta.path))
        .filter((item): item is CatalogItem => Boolean(item))
        .filter((item) => items.some((candidate) => candidate.id === item.id))
    })).filter((section) => section.items.length > 0);
  }

  const groups = new Map<string, CatalogItem[]>();

  items.forEach((item) => {
    const current = groups.get(item.group) ?? [];
    current.push(item);
    groups.set(item.group, current);
  });

  return Array.from(groups.entries()).map(([group, groupItems]) => ({
    id: group,
    label: group,
    kicker: collection === 'debug-kb' ? '调试模块' : '归档分组',
    items: groupItems
  }));
}

export function getSequenceItems(item: CatalogItem) {
  if (item.collection === 'active-docs') {
    return activeDocsInOrder;
  }

  const collectionItems = getCollectionItems(item.collection);
  const groupItems = collectionItems.filter((candidate) => candidate.group === item.group);

  return groupItems.length ? groupItems : collectionItems;
}

export function getRowMeta(item: CatalogItem) {
  if (item.collection === 'active-docs') {
    return `第${String(item.order + 1).padStart(2, '0')} 篇`;
  }

  if (item.group === item.resourceKind) {
    return item.group;
  }

  return `${item.group} / ${item.resourceKind}`;
}

export const COLLECTION_CARD_ICONS = {
  'active-docs': BookOpenText,
  'debug-kb': Wrench,
  archive: LibraryBig
} as const;

export const COLLECTION_SEARCH_ICON = Search;
