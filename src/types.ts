export type ResourceType = 'markdown' | 'pdf' | 'image';
export type ResourceCollection = 'active-docs' | 'debug-kb' | 'archive';
export type Layer = '作品文档' | '调试知识库' | '归档';

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
