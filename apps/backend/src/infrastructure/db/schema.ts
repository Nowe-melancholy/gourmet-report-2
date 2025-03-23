import { sql } from 'drizzle-orm'
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  itemName: text('item_name').notNull(),
  shopName: text('shop_name').notNull(),
  location: text('location').notNull(),
  rating: real('rating').notNull(),
  spaciousness: real('spaciousness'),
  cleanliness: real('cleanliness'),
  relaxation: real('relaxation'),
  imageUrl: text('image_url'),
  comment: text('comment'),
  date: text('date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
})
