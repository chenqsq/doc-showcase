export type ResourceType = 'markdown' | 'pdf' | 'image';

export type Layer =
  | '平台层'
  | '子引擎层'
  | '学科层'
  | '交付层'
  | '归档'
  | '比赛资料'
  | '腾讯平台资料'
  | '图像资源';

export interface CatalogItem {
  id: string;
  type: ResourceType;
  layer: Layer;
  title: string;
  relativePath: string;
  group: string;
  rawText?: string;
  assetUrl?: string;
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
