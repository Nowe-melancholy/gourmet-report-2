/// <reference types="@cloudflare/workers-types" />
import { drizzle } from 'drizzle-orm/d1';
import { reports } from './schema';

export type DrizzleD1Database = ReturnType<typeof createDrizzleD1>;

export function createDrizzleD1(d1: D1Database) {
  return drizzle(d1, { schema: { reports } });
}
