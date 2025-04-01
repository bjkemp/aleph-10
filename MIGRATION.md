# Jest to Vitest Migration

This project was originally set up with Jest but has been migrated to [Vitest](https://vitest.dev/) for testing.

## Migration Summary

The migration from Jest to Vitest was completed on April 1, 2025, and included:

1. Removing Jest configuration files (`jest.config.js`, `jest.setup.js`)
2. Creating a Vitest configuration file (`vitest.config.ts`)
3. Updating test setup files for Vitest compatibility
4. Updating test files to use Vitest syntax
5. Removing Jest dependencies from `package.json`

## Why Vitest?

Vitest offers several advantages over Jest for ESM projects:

- **Native ESM Support**: Better compatibility with ES modules without needing additional configuration
- **Faster Execution**: Built on top of Vite for significantly improved test execution speed
- **TypeScript Support**: First-class TypeScript support without requiring transpilation
- **Compatible API**: Largely compatible with Jest API, making migration straightforward
- **Watch Mode**: Efficient file watching with HMR (Hot Module Replacement)
- **UI Mode**: Optional UI for visualizing and interacting with tests

## Migration Details

### Configuration Changes

The Jest configuration:

```javascript
// Old jest.config.js
export default {
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node'
};
```

was replaced with a Vitest configuration:

```typescript
// New vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['**/node_modules/**', '**/build/**'],
    alias: {
      // Required for Node.js ESM compatibility
      '^(\\.{1,2}/.*)\\.js$': '$1'
    }
  }
});
```

### Test Setup Changes

The old Jest setup file was updated to use Vitest globals:

```javascript
// Old jest.setup.js
// Jest setup file for ESM support and necessary polyfills

// Polyfill for fetch API if needed
if (!globalThis.fetch) {
  globalThis.fetch = async () => {
    throw new Error("fetch is not implemented in tests. Please mock it using jest.spyOn(global, 'fetch')");
  };
}

// Add other global polyfills as needed
```

```javascript
// New tests/setup.js
// Vitest setup file for necessary polyfills and global configurations
import { vi, expect } from 'vitest';

// Set up globals for compatibility with Jest syntax
global.vi = vi;
global.expect = expect;

// Polyfill for fetch API if needed
if (!globalThis.fetch) {
  globalThis.fetch = async () => {
    throw new Error("fetch is not implemented in tests. Please mock it using vi.spyOn(global, 'fetch')");
  };
}

// Add other global polyfills as needed
```

### Common Syntax Changes

| Jest | Vitest |
|------|--------|
| `jest.fn()` | `vi.fn()` |
| `jest.mock()` | `vi.mock()` |
| `jest.spyOn()` | `vi.spyOn()` |
| `jest.resetAllMocks()` | `vi.resetAllMocks()` |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` |

### Package.json Script Changes

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "coverage": "vitest run --coverage"
}
```

## Running Tests

To run tests after the migration:

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI (requires @vitest/ui package)
pnpm test:ui

# Run tests with coverage
pnpm coverage
```
