import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/e2e/**/*.test.ts'],
    // Files share playground/.nuxt: a dev server regenerating it breaks a parallel production build
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 300_000,
  },
})
