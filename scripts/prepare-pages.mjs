import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const distDir = resolve(projectRoot, 'dist');
const pagesBasePath = '/doc-showcase';
const catalogRoots = [resolve(projectRoot, 'doc'), resolve(projectRoot, 'kb')];
const catalogExtensions = new Set(['.md', '.txt', '.pdf', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']);
const staticRoutePaths = ['docs', 'debug-kb', 'archive', 'platform', 'math', 'library'];
const redirectPage = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Redirecting...</title>
    <script>
      (function () {
        const basePath = ${JSON.stringify(pagesBasePath)};
        const { hash, pathname, search } = window.location;
        const relativePath = pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname;
        const redirectPath = relativePath + search + hash;
        const target = basePath + '/?p=' + encodeURIComponent(redirectPath);
        window.location.replace(target);
      })();
    </script>
  </head>
  <body></body>
</html>
`;

function normalizePath(value) {
  return value.replace(/\\/g, '/');
}

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return `r${(hash >>> 0).toString(36)}`;
}

async function walkFiles(rootDir, collected = []) {
  let entries = [];
  try {
    entries = await readdir(rootDir, { withFileTypes: true });
  } catch {
    return collected;
  }

  for (const entry of entries) {
    const absolutePath = resolve(rootDir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(absolutePath, collected);
      continue;
    }

    collected.push(absolutePath);
  }

  return collected;
}

async function collectCatalogRoutePaths() {
  const routePaths = new Set(staticRoutePaths);

  for (const rootDir of catalogRoots) {
    const files = await walkFiles(rootDir);

    for (const absolutePath of files) {
      const extension = extname(absolutePath).toLowerCase();
      if (!catalogExtensions.has(extension)) {
        continue;
      }

      const relativePath = normalizePath(relative(projectRoot, absolutePath));
      routePaths.add(`read/${hashString(relativePath)}`);
    }
  }

  routePaths.add(`read/${hashString('CLAW_CODE_ANALYSIS_REPORT.md')}`);
  return [...routePaths];
}

async function writeRouteEntry(indexHtml, routePath) {
  const routeDir = resolve(distDir, ...routePath.split('/'));
  await mkdir(routeDir, { recursive: true });
  await writeFile(resolve(routeDir, 'index.html'), indexHtml, 'utf8');
}

const indexHtml = await readFile(resolve(distDir, 'index.html'), 'utf8');
const routePaths = await collectCatalogRoutePaths();

await Promise.all(routePaths.map((routePath) => writeRouteEntry(indexHtml, routePath)));
await writeFile(resolve(distDir, '404.html'), redirectPage, 'utf8');
await writeFile(resolve(distDir, '.nojekyll'), '');
await Promise.all([
  rm(resolve(projectRoot, 'vite.config.js'), { force: true }),
  rm(resolve(projectRoot, 'vite.config.d.ts'), { force: true })
]);
