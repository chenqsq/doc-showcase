import { makeCatalogItemId } from './catalog-id';
import { ACTIVE_DOC_BY_PATH, ACTIVE_DOCS, ARCHIVE_GROUP_ORDER, type ArchiveGroup } from './siteMeta';
import type { CatalogItem, Layer, OutlineItem, ResourceCollection, ResourceType } from './types';

const ACTIVE_DOC_ROOT = 'doc/作品文档/真人类文档/';
const DEBUG_KB_ROOT = 'kb/高等数学_测试/';
const DEBUG_KB_ARCHIVE_ROOT = 'kb/高等数学_测试/T-教师运营/';

const DEBUG_RESOURCE_KINDS = [
  '课程总览',
  '章节导学',
  '知识点卡',
  '例题讲解卡',
  '练习与标准答案',
  '错题与误区卡',
  '课堂重构笔记'
] as const;

const markdownFiles = import.meta.glob(
  [
    '../doc/作品文档/真人类文档/**/*.md',
    '../doc/开发文档/**/*.md',
    '../kb/高等数学_测试/**/*.md',
    '../doc/智能体文档/**/*.md',
    '../doc/腾讯平台使用文档/**/*.md',
    '../doc/比赛资料/**/*.txt',
    '../CLAW_CODE_ANALYSIS_REPORT.md'
  ],
  {
    import: 'default',
    query: '?raw'
  }
) as Record<string, () => Promise<string>>;

const pdfFiles = import.meta.glob(
  ['../doc/智能体文档/**/*.pdf', '../doc/腾讯平台使用文档/**/*.pdf', '../doc/比赛资料/**/*.pdf'],
  {
    eager: true,
    import: 'default',
    query: '?url'
  }
) as Record<string, string>;

const imageFiles = import.meta.glob('../doc/智能体文档/**/*.{svg,png,jpg,jpeg,gif,webp,avif}', {
  eager: true,
  import: 'default',
  query: '?url'
}) as Record<string, string>;

const svgRawFiles = import.meta.glob('../doc/智能体文档/**/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw'
}) as Record<string, string>;

const collectionRank: ResourceCollection[] = ['active-docs', 'debug-kb', 'archive'];
const markdownLoaderByPath = new Map(
  Object.entries(markdownFiles).map(([path, loader]) => [normalizeImportPath(path), loader])
);
const markdownContentCache = new Map<string, Promise<string> | string>();

function normalizeImportPath(path: string) {
  return path.replace(/^\.\.\//, '').replace(/\\/g, '/');
}

function basename(path: string) {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

function filenameWithoutExt(path: string) {
  return basename(path).replace(/\.[^.]+$/, '');
}

function humanizeFilename(name: string) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getMarkdownTitle(rawText: string, fallback: string) {
  const match = rawText.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || fallback;
}

function getSvgTitle(rawText: string, fallback: string) {
  const match = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.trim() || fallback;
}

function getCollection(relativePath: string): ResourceCollection {
  if (relativePath.startsWith(ACTIVE_DOC_ROOT)) {
    return 'active-docs';
  }
  if (relativePath.startsWith(DEBUG_KB_ARCHIVE_ROOT)) {
    return 'archive';
  }
  if (relativePath.startsWith(DEBUG_KB_ROOT)) {
    return 'debug-kb';
  }
  return 'archive';
}

function getLayer(collection: ResourceCollection): Layer {
  if (collection === 'active-docs') {
    return '作品文档';
  }
  if (collection === 'debug-kb') {
    return '调试知识库';
  }
  return '归档';
}

function getArchiveGroup(relativePath: string, type: ResourceType): ArchiveGroup {
  if (type === 'image') {
    return '图像资源';
  }
  if (relativePath.startsWith(DEBUG_KB_ARCHIVE_ROOT)) {
    return '技术参考';
  }
  if (relativePath.startsWith('doc/开发文档/')) {
    return '工程参考';
  }
  if (relativePath.startsWith('doc/腾讯平台使用文档/')) {
    return '腾讯资料';
  }
  if (relativePath.startsWith('doc/比赛资料/')) {
    return '比赛资料';
  }
  if (relativePath.startsWith('doc/智能体文档/')) {
    return '技术真源';
  }
  return '技术参考';
}

function getArchiveGroupRank(group: string) {
  const index = ARCHIVE_GROUP_ORDER.indexOf(group as ArchiveGroup);
  return index >= 0 ? index : ARCHIVE_GROUP_ORDER.length;
}

function getDebugModule(relativePath: string) {
  if (!relativePath.startsWith(DEBUG_KB_ROOT)) {
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

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getMetaValue(rawText: string | undefined, label: string) {
  if (!rawText) {
    return null;
  }

  const match = rawText.match(new RegExp(`^>\\s*${escapeRegExp(label)}[:：\\s]*(.+?)\\s*$`, 'm'));
  return match?.[1]?.trim() ?? null;
}

function getDebugResourceKindFromPath(relativePath: string) {
  const filename = filenameWithoutExt(relativePath);
  const segments = filename.split('-');
  const resourceKind =
    DEBUG_RESOURCE_KINDS.find((kind) => segments.includes(kind)) ??
    DEBUG_RESOURCE_KINDS.find((kind) => filename.includes(kind));

  return resourceKind ?? '调试文档';
}

function getDebugResourceKind(relativePath: string, rawText: string) {
  return getMetaValue(rawText, '资源类型(resource_type)') ?? getDebugResourceKindFromPath(relativePath);
}

function getDebugDisplayTitleFromPath(relativePath: string) {
  const filename = filenameWithoutExt(relativePath);
  const resourceKind = getDebugResourceKindFromPath(relativePath);
  const marker = `${resourceKind}-`;
  const markerIndex = filename.indexOf(marker);

  if (markerIndex >= 0) {
    const title = filename.slice(markerIndex + marker.length).trim();
    if (title) {
      return title;
    }
  }

  return humanizeFilename(filename);
}

function getDebugDisplayTitle(relativePath: string, rawText: string) {
  const filename = filenameWithoutExt(relativePath);
  const resourceKind = getDebugResourceKind(relativePath, rawText);
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

function getDebugModuleSort(moduleKey: string | null) {
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

function getDebugResourceKindSort(resourceKind: string) {
  const index = DEBUG_RESOURCE_KINDS.indexOf(resourceKind as (typeof DEBUG_RESOURCE_KINDS)[number]);
  return index >= 0 ? index : DEBUG_RESOURCE_KINDS.length + 1;
}

function getOrder(relativePath: string, collection: ResourceCollection, group: string, resourceKind: string) {
  if (collection === 'active-docs') {
    return ACTIVE_DOC_BY_PATH.get(relativePath)?.order ?? 999;
  }

  if (collection === 'debug-kb') {
    const module = getDebugModule(relativePath);
    return getDebugModuleSort(module.moduleKey) * 100 + getDebugResourceKindSort(resourceKind);
  }

  return getArchiveGroupRank(group) * 1000;
}

function compareCatalog(a: CatalogItem, b: CatalogItem) {
  const collectionDiff = collectionRank.indexOf(a.collection) - collectionRank.indexOf(b.collection);
  if (collectionDiff !== 0) {
    return collectionDiff;
  }

  if (a.order !== b.order) {
    return a.order - b.order;
  }

  if (a.group !== b.group) {
    return a.group.localeCompare(b.group, 'zh-CN');
  }

  return a.title.localeCompare(b.title, 'zh-CN');
}

function buildMarkdownMetadata(relativePath: string): CatalogItem {
  const fallback = humanizeFilename(filenameWithoutExt(relativePath));
  const collection = getCollection(relativePath);
  const layer = getLayer(collection);

  let title = fallback;
  let group = '真人类文档';
  let resourceKind = '文档';
  let summary: string | undefined;

  if (collection === 'active-docs') {
    const meta = ACTIVE_DOC_BY_PATH.get(relativePath);
    title = meta?.shortTitle ?? fallback;
    group = '真人类文档';
    resourceKind = '真人类文档';
    summary = meta?.summary;
  } else if (collection === 'debug-kb') {
    const module = getDebugModule(relativePath);
    title = getDebugDisplayTitleFromPath(relativePath);
    group = module.moduleLabel ?? '调试知识库';
    resourceKind = getDebugResourceKindFromPath(relativePath);
  } else {
    group = getArchiveGroup(relativePath, 'markdown');
    resourceKind = group === '历史文档' ? '历史文档' : group;
  }

  return {
    id: makeCatalogItemId(relativePath),
    type: 'markdown',
    collection,
    layer,
    title,
    relativePath,
    group,
    resourceKind,
    order: getOrder(relativePath, collection, group, resourceKind),
    summary
  };
}

function applyMarkdownContent(item: CatalogItem, rawText: string) {
  const fallback = humanizeFilename(filenameWithoutExt(item.relativePath));
  item.rawText = rawText;

  if (item.collection === 'active-docs') {
    const meta = ACTIVE_DOC_BY_PATH.get(item.relativePath);
    item.title = meta?.shortTitle ?? getMarkdownTitle(rawText, fallback);
    item.group = '真人类文档';
    item.resourceKind = '真人类文档';
    item.summary = meta?.summary;
    return item;
  }

  if (item.collection === 'debug-kb') {
    const module = getDebugModule(item.relativePath);
    item.title = getDebugDisplayTitle(item.relativePath, rawText);
    item.group = module.moduleLabel ?? '调试知识库';
    item.resourceKind = getDebugResourceKind(item.relativePath, rawText);
    item.order = getOrder(item.relativePath, item.collection, item.group, item.resourceKind);
    return item;
  }

  item.title = getMarkdownTitle(rawText, fallback);
  item.group = getArchiveGroup(item.relativePath, 'markdown');
  item.resourceKind = item.group === '历史文档' ? '历史文档' : item.group;
  item.order = getOrder(item.relativePath, item.collection, item.group, item.resourceKind);
  return item;
}

function buildCatalog() {
  const items: CatalogItem[] = [];

  Object.keys(markdownFiles).forEach((path) => {
    items.push(buildMarkdownMetadata(normalizeImportPath(path)));
  });

  Object.entries(pdfFiles).forEach(([path, assetUrl]) => {
    const relativePath = normalizeImportPath(path);
    const collection = getCollection(relativePath);
    const layer = getLayer(collection);
    const group = getArchiveGroup(relativePath, 'pdf');

    items.push({
      id: makeCatalogItemId(relativePath),
      type: 'pdf',
      collection,
      layer,
      title: humanizeFilename(filenameWithoutExt(relativePath)),
      relativePath,
      group,
      resourceKind: group === '腾讯资料' ? '腾讯资料 PDF' : '归档 PDF',
      order: getOrder(relativePath, collection, group, group),
      assetUrl
    });
  });

  Object.entries(imageFiles).forEach(([path, assetUrl]) => {
    const relativePath = normalizeImportPath(path);
    const fallback = humanizeFilename(filenameWithoutExt(relativePath));
    const svgRawText = svgRawFiles[path];
    const collection = getCollection(relativePath);
    const group = getArchiveGroup(relativePath, 'image');

    items.push({
      id: makeCatalogItemId(relativePath),
      type: 'image',
      collection,
      layer: getLayer(collection),
      title: svgRawText ? getSvgTitle(svgRawText, fallback) : fallback,
      relativePath,
      group,
      resourceKind: '图像资源',
      order: getOrder(relativePath, collection, group, '图像资源'),
      assetUrl
    });
  });

  return items.sort(compareCatalog);
}

async function readMarkdownContent(relativePath: string) {
  const cached = markdownContentCache.get(relativePath);
  if (typeof cached === 'string') {
    return cached;
  }
  if (cached) {
    return cached;
  }

  const loader = markdownLoaderByPath.get(relativePath);
  if (!loader) {
    return undefined;
  }

  const promise = loader().then((rawText) => {
    markdownContentCache.set(relativePath, rawText);
    return rawText;
  });

  markdownContentCache.set(relativePath, promise);
  return promise;
}

export const catalog = buildCatalog();
export const catalogById = new Map(catalog.map((item) => [item.id, item]));
export const catalogByPath = new Map(catalog.map((item) => [item.relativePath, item]));
export const navigableCatalog = catalog.filter((item) => item.type !== 'image');
export const activeDocs = navigableCatalog.filter((item) => item.collection === 'active-docs');
export const debugKnowledgeDocs = navigableCatalog.filter((item) => item.collection === 'debug-kb');
export const archiveDocs = navigableCatalog.filter((item) => item.collection === 'archive');

export const activeDocsInOrder = ACTIVE_DOCS.map((item) => catalogByPath.get(item.path)).filter(
  (item): item is CatalogItem => Boolean(item)
);

export async function loadCatalogItemById(id: string) {
  const item = catalogById.get(id);
  if (!item) {
    return undefined;
  }

  if (item.type !== 'markdown' || item.rawText) {
    return item;
  }

  const rawText = await readMarkdownContent(item.relativePath);
  if (!rawText) {
    return item;
  }

  return applyMarkdownContent(item, rawText);
}

export function preloadCatalogItemById(id: string) {
  const item = catalogById.get(id);
  if (!item || item.type !== 'markdown' || item.rawText) {
    return;
  }

  void readMarkdownContent(item.relativePath);
}

export function makeHeadingId(text: string, occurrence: number) {
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

export function resolveRelativePath(currentRelativePath: string, href: string) {
  if (!href || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) {
    return null;
  }

  const currentDir = currentRelativePath.split('/').slice(0, -1).join('/');
  const resolved = new URL(href, `https://catalog.local/${currentDir}/`).pathname.replace(/^\//, '');
  return decodeURIComponent(resolved);
}

export function findCatalogTarget(currentRelativePath: string, href: string) {
  const resolved = resolveRelativePath(currentRelativePath, href);
  return resolved ? catalogByPath.get(resolved) : undefined;
}

export function searchCatalog(items: CatalogItem[], query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [item.title, item.relativePath, item.group, item.resourceKind, item.summary ?? '', item.rawText ?? '']
      .join(' ')
      .toLowerCase();

    return haystack.includes(keyword);
  });
}

export function getRelatedResources(item: CatalogItem) {
  return navigableCatalog
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => candidate.collection === item.collection)
    .map((candidate) => {
      let score = 0;

      if (candidate.group === item.group) {
        score += 24;
      }

      if (candidate.resourceKind === item.resourceKind) {
        score += 12;
      }

      if (item.collection === 'active-docs') {
        const orderDistance = Math.abs(candidate.order - item.order);
        score += Math.max(0, 18 - orderDistance * 6);
      }

      if (item.collection === 'debug-kb') {
        const sourceModule = getDebugModule(item.relativePath);
        const targetModule = getDebugModule(candidate.relativePath);
        if (sourceModule.moduleKey && sourceModule.moduleKey === targetModule.moduleKey) {
          score += 18;
        }
      }

      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || compareCatalog(a.candidate, b.candidate))
    .slice(0, 8)
    .map((entry) => entry.candidate);
}
