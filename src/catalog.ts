import type { CatalogItem, Layer, OutlineItem, ResourceCollection, ResourceRole, ResourceType } from './types';

const MATH_ROOT = 'kb/高等数学_测试/';
const MATH_LAYER: Layer = '高等数学_测试知识库';
const MATH_RESOURCE_KINDS = [
  '课程总览',
  '章节导学',
  '知识点卡',
  '例题讲解卡',
  '练习与标准答案',
  '错题与误区卡',
  '课堂重构笔记',
  '教师运营摘要'
] as const;

const markdownFiles = import.meta.glob(['../doc/**/*.md', '../kb/高等数学_测试/**/*.md', '../CLAW_CODE_ANALYSIS_REPORT.md'], {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

const pdfFiles = import.meta.glob('../doc/**/*.pdf', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>;

const imageFiles = import.meta.glob('../doc/**/*.{svg,png,jpg,jpeg,gif,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>;

const svgRawFiles = import.meta.glob('../doc/**/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

const MATH_FEATURED_PATHS = [
  'kb/高等数学_测试/00-课程总览/高等数学知识库总览.md',
  'kb/高等数学_测试/M02-导数与微分/高等数学_测试-M02导数与微分-CH02导数与微分-知识点卡-瞬时变化率.md',
  'kb/高等数学_测试/R-课堂重构/高等数学_测试-R课堂重构-CHR整门课程-课堂重构笔记-总览.md',
  'kb/高等数学_测试/R-课堂重构/高等数学_测试-M02导数与微分-CH02导数与微分-课堂重构笔记-导数定义与求导法则入门课.md',
  'kb/高等数学_测试/T-教师运营/高等数学_测试-T教师运营-CHT整门课程-教师运营摘要-总览.md'
];

const PLATFORM_FEATURED_PATHS = [
  'doc/智能体文档/00-项目阅读地图.md',
  'doc/智能体文档/平台层/平台总纲与架构.md',
  'doc/智能体文档/平台层/平台对象、生命周期与验收.md',
  'doc/智能体文档/子引擎层/AI教师子引擎总览与设计.md',
  'doc/智能体文档/学科层/高等数学接入与知识库总览.md'
];

export const COLLECTION_LABELS: Record<ResourceCollection, string> = {
  'math-kb': '高等数学知识库',
  'platform-docs': '项目文档体系'
};

export const platformLayers: Layer[] = [
  '平台层',
  '子引擎层',
  '学科层',
  '交付层',
  '技术参考',
  '比赛资料',
  '腾讯平台资料',
  '归档',
  '图像资源'
];

function normalizeImportPath(path: string): string {
  return path.replace(/^\.\.\//, '').replace(/\\/g, '/');
}

function basename(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function filenameWithoutExt(path: string): string {
  return basename(path).replace(/\.[^.]+$/, '');
}

function humanizeFilename(name: string): string {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hashString(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `r${(hash >>> 0).toString(36)}`;
}

function getMarkdownTitle(rawText: string, fallback: string): string {
  const match = rawText.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function getSvgTitle(rawText: string, fallback: string): string {
  const match = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.trim() || fallback;
}

function getCollection(relativePath: string): ResourceCollection {
  return relativePath.startsWith(MATH_ROOT) ? 'math-kb' : 'platform-docs';
}

function getLayer(relativePath: string, type: ResourceType): Layer {
  if (type === 'image') {
    return '图像资源';
  }
  if (relativePath.startsWith(MATH_ROOT)) {
    return MATH_LAYER;
  }
  if (relativePath === 'CLAW_CODE_ANALYSIS_REPORT.md') {
    return '技术参考';
  }
  if (relativePath === 'doc/智能体文档/00-项目阅读地图.md') {
    return '平台层';
  }
  if (relativePath.startsWith('doc/智能体文档/平台层/')) {
    return '平台层';
  }
  if (relativePath.startsWith('doc/智能体文档/子引擎层/')) {
    return '子引擎层';
  }
  if (relativePath.startsWith('doc/智能体文档/学科层/')) {
    return '学科层';
  }
  if (relativePath.startsWith('doc/智能体文档/交付层/')) {
    return '交付层';
  }
  if (relativePath.startsWith('doc/智能体文档/归档/')) {
    return '归档';
  }
  if (relativePath.startsWith('doc/比赛资料/')) {
    return '比赛资料';
  }
  return '腾讯平台资料';
}

function getPlatformGroup(relativePath: string, layer: Layer): string {
  const segments = relativePath.split('/');

  if (layer === '图像资源') {
    const index = segments.findIndex((part) => part === '高等数学');
    return index >= 0 ? segments[index] : '图像资源';
  }

  if (layer === '技术参考') {
    return '技术参考';
  }

  if (layer === '比赛资料' || layer === '腾讯平台资料') {
    return layer;
  }

  if (layer === '归档') {
    return segments[3] || '归档';
  }

  if (relativePath === 'doc/智能体文档/00-项目阅读地图.md') {
    return '项目入口';
  }

  return layer;
}

function getMathModule(relativePath: string): { moduleKey: string | null; moduleLabel: string | null } {
  if (!relativePath.startsWith(MATH_ROOT)) {
    return { moduleKey: null, moduleLabel: null };
  }

  const segments = relativePath.split('/');
  const moduleSegment = segments[2];
  if (!moduleSegment) {
    return { moduleKey: null, moduleLabel: null };
  }

  const dashIndex = moduleSegment.indexOf('-');
  if (dashIndex < 0) {
    return { moduleKey: moduleSegment, moduleLabel: moduleSegment };
  }

  return {
    moduleKey: moduleSegment.slice(0, dashIndex),
    moduleLabel: moduleSegment.slice(dashIndex + 1)
  };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getMetaValue(rawText: string | undefined, label: string): string | null {
  if (!rawText) {
    return null;
  }

  const match = rawText.match(new RegExp(`^>\\s*${escapeRegExp(label)}[:：\\s]*(.+?)\\s*$`, 'm'));
  return match?.[1]?.trim() ?? null;
}

function getMathResourceKind(relativePath: string, rawText: string): string {
  const filename = filenameWithoutExt(relativePath);
  const segments = filename.split('-');
  const resourceKind =
    MATH_RESOURCE_KINDS.find((kind) => segments.includes(kind)) ?? MATH_RESOURCE_KINDS.find((kind) => filename.includes(kind));
  return resourceKind ?? getMetaValue(rawText, '资源类型(resource_type)') ?? '知识资产';
}

function getMathDisplayTitle(relativePath: string, rawText: string): string {
  const filename = filenameWithoutExt(relativePath);
  const resourceKind = getMathResourceKind(relativePath, rawText);
  const marker = `${resourceKind}-`;
  const markerIndex = filename.indexOf(marker);

  if (markerIndex >= 0) {
    const title = filename.slice(markerIndex + marker.length).trim();
    if (title) {
      return title;
    }
  }

  return getMarkdownTitle(rawText, humanizeFilename(filename));
}

function getMathRole(rawText: string, moduleKey: string | null): ResourceRole {
  if (moduleKey === 'T') {
    return 'teacher';
  }

  const roleValue = getMetaValue(rawText, '角色(role)');
  if (roleValue === 'teacher' || roleValue === 'student') {
    return roleValue;
  }

  if (moduleKey === 'R') {
    return 'student';
  }

  return 'unknown';
}

function getPlatformResourceKind(type: ResourceType, layer: Layer): string {
  if (type === 'pdf') {
    return layer === '比赛资料' ? '比赛 PDF' : '平台 PDF';
  }
  if (type === 'image') {
    return '图像资源';
  }
  if (layer === '技术参考') {
    return '技术文档';
  }
  return '平台文档';
}

function getMathModuleSort(moduleKey: string | null): number {
  if (!moduleKey) {
    return 999;
  }
  if (moduleKey === '00') {
    return 0;
  }
  if (/^M\d+$/.test(moduleKey)) {
    return Number(moduleKey.slice(1)) + 1;
  }
  if (moduleKey === 'R') {
    return 90;
  }
  if (moduleKey === 'T') {
    return 91;
  }
  return 999;
}

function getResourceKindSort(resourceKind: string): number {
  const index = MATH_RESOURCE_KINDS.indexOf(resourceKind as (typeof MATH_RESOURCE_KINDS)[number]);
  return index >= 0 ? index : MATH_RESOURCE_KINDS.length + 1;
}

function compareCatalog(a: CatalogItem, b: CatalogItem): number {
  const collectionOrder: ResourceCollection[] = ['math-kb', 'platform-docs'];
  const collectionDiff = collectionOrder.indexOf(a.collection) - collectionOrder.indexOf(b.collection);
  if (collectionDiff !== 0) {
    return collectionDiff;
  }

  if (a.collection === 'math-kb' && b.collection === 'math-kb') {
    const moduleDiff = getMathModuleSort(a.moduleKey) - getMathModuleSort(b.moduleKey);
    if (moduleDiff !== 0) {
      return moduleDiff;
    }

    const kindDiff = getResourceKindSort(a.resourceKind) - getResourceKindSort(b.resourceKind);
    if (kindDiff !== 0) {
      return kindDiff;
    }

    return a.title.localeCompare(b.title, 'zh-CN');
  }

  const layerDiff = platformLayers.indexOf(a.layer) - platformLayers.indexOf(b.layer);
  if (layerDiff !== 0) {
    return layerDiff;
  }

  const groupDiff = a.group.localeCompare(b.group, 'zh-CN');
  if (groupDiff !== 0) {
    return groupDiff;
  }

  return a.title.localeCompare(b.title, 'zh-CN');
}

function buildCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];

  Object.entries(markdownFiles).forEach(([path, rawText]) => {
    const relativePath = normalizeImportPath(path);
    const fallback = humanizeFilename(filenameWithoutExt(relativePath));
    const collection = getCollection(relativePath);
    const layer = getLayer(relativePath, 'markdown');
    const { moduleKey, moduleLabel } = getMathModule(relativePath);

    items.push({
      id: hashString(relativePath),
      type: 'markdown',
      collection,
      layer,
      title: collection === 'math-kb' ? getMathDisplayTitle(relativePath, rawText) : getMarkdownTitle(rawText, fallback),
      relativePath,
      group: collection === 'math-kb' ? (moduleLabel ?? COLLECTION_LABELS[collection]) : getPlatformGroup(relativePath, layer),
      moduleKey,
      moduleLabel,
      resourceKind: collection === 'math-kb' ? getMathResourceKind(relativePath, rawText) : getPlatformResourceKind('markdown', layer),
      role: collection === 'math-kb' ? getMathRole(rawText, moduleKey) : 'unknown',
      rawText
    });
  });

  Object.entries(pdfFiles).forEach(([path, assetUrl]) => {
    const relativePath = normalizeImportPath(path);
    const fallback = humanizeFilename(filenameWithoutExt(relativePath));
    const layer = getLayer(relativePath, 'pdf');

    items.push({
      id: hashString(relativePath),
      type: 'pdf',
      collection: 'platform-docs',
      layer,
      title: fallback,
      relativePath,
      group: getPlatformGroup(relativePath, layer),
      moduleKey: null,
      moduleLabel: null,
      resourceKind: getPlatformResourceKind('pdf', layer),
      role: 'unknown',
      assetUrl
    });
  });

  Object.entries(imageFiles).forEach(([path, assetUrl]) => {
    const relativePath = normalizeImportPath(path);
    const fallback = humanizeFilename(filenameWithoutExt(relativePath));
    const svgRawText = svgRawFiles[path];

    items.push({
      id: hashString(relativePath),
      type: 'image',
      collection: 'platform-docs',
      layer: '图像资源',
      title: svgRawText ? getSvgTitle(svgRawText, fallback) : fallback,
      relativePath,
      group: getPlatformGroup(relativePath, '图像资源'),
      moduleKey: null,
      moduleLabel: null,
      resourceKind: '图像资源',
      role: 'unknown',
      assetUrl
    });
  });

  return items.sort(compareCatalog);
}

export const catalog = buildCatalog();
export const catalogById = new Map(catalog.map((item) => [item.id, item]));
export const catalogByPath = new Map(catalog.map((item) => [item.relativePath, item]));
export const navigableCatalog = catalog.filter((item) => item.type !== 'image');
export const mathCatalog = navigableCatalog.filter((item) => item.collection === 'math-kb');
export const platformCatalog = navigableCatalog.filter((item) => item.collection === 'platform-docs');

export const mathFeaturedResources = MATH_FEATURED_PATHS.map((path) => catalogByPath.get(path)).filter(
  (item): item is CatalogItem => Boolean(item)
);

export const platformFeaturedResources = PLATFORM_FEATURED_PATHS.map((path) => catalogByPath.get(path)).filter(
  (item): item is CatalogItem => Boolean(item)
);

export const featuredResources = [...mathFeaturedResources, ...platformFeaturedResources];

export function makeHeadingId(text: string, occurrence: number): string {
  const base = text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{Letter}\p{Number}\u4e00-\u9fa5-]+/gu, '')
    .toLowerCase();
  return `${base || 'section'}-${occurrence}`;
}

export function extractOutline(rawText: string | undefined): OutlineItem[] {
  if (!rawText) {
    return [];
  }

  const counts = new Map<string, number>();

  return rawText
    .split('\n')
    .map((line) => line.match(/^(#{1,4})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => {
      const text = match[2].trim();
      const occurrence = counts.get(text) ?? 0;
      counts.set(text, occurrence + 1);
      return { id: makeHeadingId(text, occurrence), level: match[1].length, text };
    });
}

export function resolveRelativePath(currentRelativePath: string, href: string): string | null {
  if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
    return null;
  }
  const currentDir = currentRelativePath.split('/').slice(0, -1).join('/');
  const resolved = new URL(href, `https://catalog.local/${currentDir}/`).pathname.replace(/^\//, '');
  return decodeURIComponent(resolved);
}

export function findCatalogTarget(currentRelativePath: string, href: string): CatalogItem | undefined {
  const resolved = resolveRelativePath(currentRelativePath, href);
  return resolved ? catalogByPath.get(resolved) : undefined;
}

export function searchCatalog(items: CatalogItem[], query: string): CatalogItem[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.relativePath,
      item.group,
      item.layer,
      item.moduleKey ?? '',
      item.moduleLabel ?? '',
      item.resourceKind,
      item.role,
      item.rawText ?? ''
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(keyword);
  });
}

export function getRelatedResources(item: CatalogItem): CatalogItem[] {
  return catalog
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => candidate.type !== 'image' && candidate.collection === item.collection)
    .map((candidate) => {
      let score = 0;

      if (item.collection === 'math-kb') {
        if (candidate.moduleKey === item.moduleKey) {
          score += 30;
        }
        if (candidate.resourceKind === item.resourceKind) {
          score += 18;
        }
        if (candidate.role === item.role) {
          score += 8;
        }
      } else {
        if (candidate.layer === item.layer) {
          score += 22;
        }
        if (candidate.group === item.group) {
          score += 14;
        }
      }

      if (candidate.type === item.type) {
        score += 4;
      }

      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || compareCatalog(a.candidate, b.candidate))
    .slice(0, 8)
    .map((entry) => entry.candidate);
}
