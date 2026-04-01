import { copyFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const distDir = resolve(projectRoot, 'dist');

await copyFile(resolve(distDir, 'index.html'), resolve(distDir, '404.html'));
await writeFile(resolve(distDir, '.nojekyll'), '');
await Promise.all([
  rm(resolve(projectRoot, 'vite.config.js'), { force: true }),
  rm(resolve(projectRoot, 'vite.config.d.ts'), { force: true })
]);
