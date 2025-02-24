import type { Config } from 'drizzle-kit';

export default {
  schema: './src/infrastructure/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  verbose: true,
  strict: true,
} satisfies Config; 