export type ResourceType = 'markdown' | 'pdf' | 'image';
export type ResourceCollection = 'active-docs' | 'debug-kb' | 'archive';
export type Layer = '开发文档' | '调试知识库' | '归档';

export interface CatalogItem {
  id: string;
  type: ResourceType;
  collection: ResourceCollection;
  layer: Layer;
  title: string;
  relativePath: string;
  group: string;
  resourceKind: string;
  order: number;
  rawText?: string;
  assetUrl?: string;
  summary?: string;
}

export interface OutlineItem {
  id: string;
  level: number;
  text: string;
}

export interface LightboxState {
  src: string;
  title: string;
}

export interface ReaderMobileNavigationState {
  activeHeadingId?: string;
  collectionLabel: string;
  collectionMeta: string;
  collectionRoute: string;
  currentIndex: number;
  item: CatalogItem;
  nextItem?: CatalogItem;
  onSelectHeading: (id: string) => void;
  outline: OutlineItem[];
  previousItem?: CatalogItem;
  sequenceItems: CatalogItem[];
}
