import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import pkg from './package.json';

export default defineConfig({
  plugins: [react()],
  define: {
    __UXIGL_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('sheetgl')) return 'vendor-sheetgl';
            if (id.includes('filemangl')) return 'vendor-filemangl';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('react')) return 'vendor-react';
          }
          if (id.includes('/src/features/playground/')) {
            return 'uxigl-playground';
          }
          if (id.includes('/src/features/showcase/')) {
            return 'uxigl-showcase';
          }
          if (id.includes('/src/features/catalog/')) {
            return 'uxigl-catalog';
          }
          return undefined;
        },
      },
    },
  },
});
