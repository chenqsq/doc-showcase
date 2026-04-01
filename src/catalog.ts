import type { CatalogItem, Layer, OutlineItem, ResourceType } from './types';

const markdownFiles = import.meta.glob('../doc/**/*.md', {
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

const FEATURED_PATHS = [
  'doc/智能体文档/平台层/AI主导学习平台-产品总纲.md',
  'doc/智能体文档/平台层/AI主导学习平台-平台需求与验收.md',
  'doc/智能体文档/学科层/高等数学-平台接入示范.md',
  'doc/比赛资料/比赛.txt'
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

function getLayer(relativePath: string, type: ResourceType): Layer {
  if (type === 'image') {
    return '图像资源';
  }
  if (relativePath === 'doc/智能体文档/00-文档总索引.md') {
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

function getGroup(relativePath: string, layer: Layer): string {
  const segments = relativePath.split('/');
  const last = filenameWithoutExt(relativePath);

  if (layer === '图像资源') {
    const index = segments.findIndex((part) => part === '高等数学');
    return index >= 0 ? segments[index] : '图像资源';
  }
  if (layer === '比赛资料' || layer === '腾讯平台资料') {
    return layer;
  }
  if (layer === '归档') {
    return segments[3] || '归档';
  }
  if (segments.includes('实施附录')) {
    return '实施附录';
  }
  if (layer === '学科层') {
    return last.split('-')[0] || '学科层';
  }
  return layer;
}

function compareCatalog(a: CatalogItem, b: CatalogItem): number {
  const order: Layer[] = [
    '平台层',
    '子引擎层',
    '学科层',
    '交付层',
    '归档',
    '比赛资料',
    '腾讯平台资料',
    '图像资源'
  ];
  const layerDiff = order.indexOf(a.layer) - order.indexOf(b.layer);
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
    const layer = getLayer(relativePath, 'markdown');

    items.push({
      id: hashString(relativePath),
      type: 'markdown',
      layer,
      title: getMarkdownTitle(rawText, fallback),
      relativePath,
      group: getGroup(relativePath, layer),
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
      layer,
      title: fallback,
      relativePath,
      group: getGroup(relativePath, layer),
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
      layer: '图像资源',
      title: svgRawText ? getSvgTitle(svgRawText, fallback) : fallback,
      relativePath,
      group: getGroup(relativePath, '图像资源'),
      assetUrl
    });
  });

  return items.sort(compareCatalog);
}

export const catalog = buildCatalog();
export const catalogById = new Map(catalog.map((item) => [item.id, item]));
export const catalogByPath = new Map(catalog.map((item) => [item.relativePath, item]));
export const navigableCatalog = catalog.filter((item) => item.type !== 'image');

export const featuredResources = FEATURED_PATHS.map((path) => catalogByPath.get(path)).filter(
  (item): item is CatalogItem => Boolean(item)
);

export const topLevelLayers: Layer[] = [
  '平台层',
  '子引擎层',
  '学科层',
  '交付层',
  '归档',
  '比赛资料',
  '腾讯平台资料'
];

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

export function searchCatalog(items: CatalogItem[], query: string, layer: Layer | '全部'): CatalogItem[] {
  const keyword = query.trim().toLowerCase();
  return items.filter((item) => {
    if (layer !== '全部' && item.layer !== layer) {
      return false;
    }
    if (!keyword) {
      return true;
    }
    const haystack = `${item.title} ${item.relativePath} ${item.rawText ?? ''}`.toLowerCase();
    return haystack.includes(keyword);
  });
}

export function getRelatedResources(item: CatalogItem): CatalogItem[] {
  return catalog
    .filter((candidate) => candidate.id !== item.id)
    .filter((candidate) => candidate.group === item.group || candidate.layer === item.layer)
    .slice(0, 8);
}

export function getImageResourcesForItem(item: CatalogItem): CatalogItem[] {
  if (
    item.group === '高等数学' ||
    item.relativePath.includes('高等数学') ||
    item.rawText?.includes('高等数学')
  ) {
    return catalog.filter((candidate) => candidate.layer === '图像资源' && candidate.group === '高等数学');
  }
  return [];
}
