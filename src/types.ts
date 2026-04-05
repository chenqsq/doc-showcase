export type ResourceType = 'markdown' | 'pdf' | 'image';
export type ResourceCollection = 'math-kb' | 'platform-docs';
export type ResourceRole = 'student' | 'teacher' | 'unknown';
export type DocumentPriority = 'main' | 'support' | 'appendix' | 'archive';
export type NavigationScopeKey =
  | 'project-start'
  | 'platform-design'
  | 'engine-implementation'
  | 'subject-demo'
  | 'competition-delivery'
  | 'archive';

export type Layer =
  | '高等数学_测试知识库'
  | '平台层'
  | '子引擎层'
  | '学科层'
  | '交付层'
  | '技术参考'
  | '归档'
  | '比赛资料'
  | '腾讯平台资料'
  | '图像资源';

export interface CatalogItem {
  id: string;
  type: ResourceType;
  collection: ResourceCollection;
  layer: Layer;
  title: string;
  relativePath: string;
  group: string;
  moduleKey: string | null;
  moduleLabel: string | null;
  resourceKind: string;
  role: ResourceRole;
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
