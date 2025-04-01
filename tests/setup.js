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
