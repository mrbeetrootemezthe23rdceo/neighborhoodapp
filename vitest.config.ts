import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Only auto-run fast, no-network unit tests (like src/lib/filterItems.test.ts).
    // RLS tests live in /tests and need real Supabase credentials, so they're
    // run separately and deliberately excluded from CI's placeholder-credential build.
    include: ['src/**/*.test.ts'],
  },
})
