// Jest setup file for ESM support and necessary polyfills

// Polyfill for fetch API if needed
if (!globalThis.fetch) {
  globalThis.fetch = async () => {
    throw new Error("fetch is not implemented in tests. Please mock it using jest.spyOn(global, 'fetch')");
  };
}

// Add other global polyfills as needed
