import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['**/node_modules/**', '**/build/**'],
    // Use ESM to match the Jest configuration
    alias: {
      // Required for Node.js ESM compatibility
      '^(\\.{1,2}/.*)\\.js$': '$1'
    }
  }
});
