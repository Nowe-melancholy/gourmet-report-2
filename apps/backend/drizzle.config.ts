import type { Config } from 'drizzle-kit'

export default {
  schema: './src/infrastructure/db/schema.ts',
  out: './migrations',
  driver: 'better-sqlite',
  verbose: true,
  strict: true,
} satisfies Config
