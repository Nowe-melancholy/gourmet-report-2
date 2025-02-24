import { sql } from "drizzle-orm";
import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  itemName: text('item_name').notNull(),
  rating: real('rating').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}); 