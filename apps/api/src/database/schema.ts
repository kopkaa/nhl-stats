import {
  pgTable,
  integer,
  varchar,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

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

export const standings = pgTable(
  'standings',
  {
    teamId: integer('team_id')
      .references(() => teams.id)
      .notNull(),
    season: integer('season').notNull(),
    gamesPlayed: integer('games_played').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    losses: integer('losses').notNull().default(0),
    otLosses: integer('ot_losses').notNull().default(0),
    points: integer('points').notNull().default(0),
    goalsFor: integer('goals_for').notNull().default(0),
    goalsAgainst: integer('goals_against').notNull().default(0),
    divisionName: varchar('division_name', { length: 50 }),
    divisionRank: integer('division_rank'),
    conferenceName: varchar('conference_name', { length: 50 }),
    conferenceRank: integer('conference_rank'),
    streakCode: varchar('streak_code', { length: 10 }),
    streakCount: integer('streak_count'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.season] }),
  }),
);
