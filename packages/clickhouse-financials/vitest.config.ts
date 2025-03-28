import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    exclude: [],
    bail: 1,
    // Run tests in serial to prevent Docker network conflicts
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    globals: true,
    testTimeout: 120000,
    // Add setup files
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/test/**', '**/*.test.ts'],
    },
  },
})
