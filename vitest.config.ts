import { defineConfig } from 'vitest/config';

// Engine tests run in Node (no DOM) — the engine is pure TS by contract.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
