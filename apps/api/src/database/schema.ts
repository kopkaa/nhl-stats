import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const teams = pgTable('teams', {
  id: integer('id').primaryKey(),
  franchiseId: integer('franchise_id'),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  triCode: varchar('tri_code', { length: 10 }).notNull(),
  logo: varchar('logo', { length: 512 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
