import {
  pgTable,
  pgEnum,
  integer,
  varchar,
  timestamp,
  primaryKey,
  real,
} from 'drizzle-orm/pg-core';

export const streakCodeEnum = pgEnum('streak_code', ['W', 'L', 'OT']);
export const positionCodeEnum = pgEnum('position_code', ['C', 'L', 'R', 'D', 'G']);
export const gameStateEnum = pgEnum('game_state', ['FUT', 'PRE', 'LIVE', 'FINAL', 'OFF', 'CRIT']);

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
    season: varchar('season', { length: 7 }).notNull(),
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
    streakCode: streakCodeEnum('streak_code'),
    streakCount: integer('streak_count'),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.season] }),
  }),
);

export const players = pgTable('players', {
  id: integer('id').primaryKey(),
  teamId: integer('team_id').references(() => teams.id).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  positionCode: positionCodeEnum('position_code').notNull(),
  sweaterNumber: integer('sweater_number'),
  headshot: varchar('headshot', { length: 512 }),
  shootsCatches: varchar('shoots_catches', { length: 2 }),
  heightCm: integer('height_cm'),
  weightKg: integer('weight_kg'),
  birthDate: varchar('birth_date', { length: 10 }),
  birthCountry: varchar('birth_country', { length: 5 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const skaterSeasonStats = pgTable(
  'skater_season_stats',
  {
    playerId: integer('player_id').references(() => players.id).notNull(),
    season: varchar('season', { length: 7 }).notNull(),
    gamesPlayed: integer('games_played').notNull().default(0),
    goals: integer('goals').notNull().default(0),
    assists: integer('assists').notNull().default(0),
    points: integer('points').notNull().default(0),
    plusMinus: integer('plus_minus').notNull().default(0),
    penaltyMinutes: integer('penalty_minutes').notNull().default(0),
    powerPlayGoals: integer('power_play_goals').notNull().default(0),
    shorthandedGoals: integer('shorthanded_goals').notNull().default(0),
    gameWinningGoals: integer('game_winning_goals').notNull().default(0),
    shots: integer('shots').notNull().default(0),
    shootingPctg: real('shooting_pctg').default(0),
    avgTimeOnIce: real('avg_time_on_ice').default(0),
    faceoffWinPctg: real('faceoff_win_pctg').default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playerId, table.season] }),
  }),
);

export const goalieSeasonStats = pgTable(
  'goalie_season_stats',
  {
    playerId: integer('player_id').references(() => players.id).notNull(),
    season: varchar('season', { length: 7 }).notNull(),
    gamesPlayed: integer('games_played').notNull().default(0),
    gamesStarted: integer('games_started').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    losses: integer('losses').notNull().default(0),
    otLosses: integer('ot_losses').notNull().default(0),
    goalsAgainstAvg: real('goals_against_avg').default(0),
    savePctg: real('save_pctg').default(0),
    shutouts: integer('shutouts').notNull().default(0),
    shotsAgainst: integer('shots_against').notNull().default(0),
    saves: integer('saves').notNull().default(0),
    goalsAgainst: integer('goals_against').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.playerId, table.season] }),
  }),
);

export const games = pgTable('games', {
  id: integer('id').primaryKey(),
  season: varchar('season', { length: 7 }).notNull(),
  gameType: integer('game_type').notNull(),
  gameDate: varchar('game_date', { length: 10 }).notNull(),
  startTimeUTC: varchar('start_time_utc', { length: 30 }),
  gameState: gameStateEnum('game_state').notNull(),
  venue: varchar('venue', { length: 255 }),
  homeTeamId: integer('home_team_id').references(() => teams.id).notNull(),
  awayTeamId: integer('away_team_id').references(() => teams.id).notNull(),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
