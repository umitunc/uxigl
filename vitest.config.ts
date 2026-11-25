import { defineConfig } from 'vitest/config';
import pkg from './package.json';

export default defineConfig({
  define: {
    __UXIGL_VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/core/**/*.ts'],
    },
  },
});
