import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

const reactCorePackages = ['/react/', '/react-dom/', 'react-router', '@remix-run', '/scheduler/'];
const motionUiPackages = [
  'framer-motion',
  'lucide-react',
  '@radix-ui',
  'motion-dom',
  'motion-utils',
  '@floating-ui',
  'aria-hidden',
  'react-remove-scroll',
  'react-remove-scroll-bar',
  'react-style-singleton',
  'use-callback-ref',
  'use-sidecar',
  'merge-refs',
  'make-cancellable-promise',
  'make-event-props'
];
const markdownStackPackages = [
  'react-markdown',
  'remark-gfm',
  'remark-parse',
  'remark-rehype',
  'unified',
  'bail',
  'devlop',
  'hast-util',
  'html-url-attributes',
  'mdast-util',
  'micromark',
  'property-information',
  'space-separated-tokens',
  'comma-separated-tokens',
  'stringify-entities',
  'trim-lines',
  'unist-util',
  'vfile',
  'zwitch'
];
const diagramStackPackages = [
  '/mermaid/',
  '@mermaid-js',
  '@braintree/sanitize-url',
  '@iconify',
  '@upsetjs',
  '/cytoscape/',
  'cytoscape-cose-bilkent',
  'cytoscape-fcose',
  '/d3',
  'd3-',
  'dagre-d3-es',
  '/dayjs/',
  '/dompurify/',
  '/katex/',
  '/khroma/',
  '/langium/',
  '/lodash-es/',
  '/marked/',
  '/roughjs/',
  '/stylis/',
  '/ts-dedent/',
  '/uuid/',
  '/layout-base/',
  '/cose-base/',
  '/delaunator/',
  '/internmap/',
  '/hachure-fill/',
  '/path-data-parser/',
  '/path2d/',
  '/points-on-curve/',
  '/points-on-path/',
  '/robust-predicates/',
  '/chevrotain/',
  '/chevrotain-allstar/',
  '/vscode-jsonrpc/',
  '/vscode-languageserver',
  '/vscode-uri/'
];
const pdfStackPackages = ['react-pdf', 'pdfjs-dist'];
const zoomStackPackages = ['react-zoom-pan-pinch'];

function matchesAny(id: string, patterns: string[]) {
  return patterns.some((pattern) => id.includes(pattern));
}

function manualChunks(id: string) {
  if (!id.includes('node_modules')) {
    return undefined;
  }

  if (matchesAny(id, pdfStackPackages)) {
    return 'pdf-stack';
  }

  if (matchesAny(id, zoomStackPackages)) {
    return 'zoom-stack';
  }

  if (matchesAny(id, diagramStackPackages)) {
    return 'diagram-stack';
  }

  if (matchesAny(id, markdownStackPackages)) {
    return 'markdown-stack';
  }

  if (matchesAny(id, motionUiPackages)) {
    return 'motion-ui';
  }

  if (matchesAny(id, reactCorePackages)) {
    return 'react-core';
  }

  return undefined;
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/doc-showcase/' : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}));
