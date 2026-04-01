import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/doc-showcase/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
}));
