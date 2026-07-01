import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/frontend',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
  },
});
