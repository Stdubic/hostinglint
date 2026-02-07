import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['packages/*/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: [
        'packages/core/src/**/*.ts',
        'packages/cli/src/**/*.ts',
      ],
      all: false,
    },
  },
  resolve: {
    alias: {
      '@hostinglint/core': path.resolve(__dirname, './packages/core/src'),
    },
  },
});
