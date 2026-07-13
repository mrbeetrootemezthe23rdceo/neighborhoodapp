import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Both unit tests (src/) and the RLS integration test (tests/) are
    // recognized here — which script actually runs which is controlled
    // by the filter passed on the command line in package.json.
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
})
