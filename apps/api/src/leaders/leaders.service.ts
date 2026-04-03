import { Injectable, Logger } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { CACHE_TTL } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, players, skaterSeasonStats, goalieSeasonStats, teams } from '../database';
import {
  SkaterLeaderEntry,
  GoalieLeaderEntry,
  SkaterLeaders,
  GoalieLeaders,
} from './leader.model';
import { PositionCode } from '@nhl-app/shared';

const DEFAULT_LIMIT = 10;

const skaterBase = {
  playerId: skaterSeasonStats.playerId,
  firstName: players.firstName,
  lastName: players.lastName,
  headshot: players.headshot,
  positionCode: players.positionCode,
  teamName: teams.fullName,
  teamLogo: teams.logo,
} as const;

const goalieBase = {
  playerId: goalieSeasonStats.playerId,
  firstName: players.firstName,
  lastName: players.lastName,
  headshot: players.headshot,
  teamName: teams.fullName,
  teamLogo: teams.logo,
} as const;

@Injectable()
export class LeadersService {
  private readonly logger = new Logger(LeadersService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async skaterLeaders(limit: number = DEFAULT_LIMIT): Promise<SkaterLeaders> {
    return this.cacheService.getOrSet(
      `leaders:skaters:${limit}`,
      () => this.fetchSkaterLeaders(limit),
      CACHE_TTL.LEADERS,
    );
  }

  async goalieLeaders(limit: number = DEFAULT_LIMIT): Promise<GoalieLeaders> {
    return this.cacheService.getOrSet(
      `leaders:goalies:${limit}`,
      () => this.fetchGoalieLeaders(limit),
      CACHE_TTL.LEADERS,
    );
  }

  private async fetchSkaterLeaders(limit: number): Promise<SkaterLeaders> {
    const [goalsRows, assistsRows, pointsRows] = await Promise.all([
      this.databaseService.db
        .select({ ...skaterBase, value: skaterSeasonStats.goals })
        .from(skaterSeasonStats)
        .innerJoin(players, eq(skaterSeasonStats.playerId, players.id))
        .innerJoin(teams, eq(players.teamId, teams.id))
        .orderBy(desc(skaterSeasonStats.goals))
        .limit(limit),
      this.databaseService.db
        .select({ ...skaterBase, value: skaterSeasonStats.assists })
        .from(skaterSeasonStats)
        .innerJoin(players, eq(skaterSeasonStats.playerId, players.id))
        .innerJoin(teams, eq(players.teamId, teams.id))
        .orderBy(desc(skaterSeasonStats.assists))
        .limit(limit),
      this.databaseService.db
        .select({ ...skaterBase, value: skaterSeasonStats.points })
        .from(skaterSeasonStats)
        .innerJoin(players, eq(skaterSeasonStats.playerId, players.id))
        .innerJoin(teams, eq(players.teamId, teams.id))
        .orderBy(desc(skaterSeasonStats.points))
        .limit(limit),
    ]);

    return {
      goals: goalsRows.map(mapSkaterRow),
      assists: assistsRows.map(mapSkaterRow),
      points: pointsRows.map(mapSkaterRow),
    };
  }

  private async fetchGoalieLeaders(limit: number): Promise<GoalieLeaders> {
    const [winsRows, savePctgRows, shutoutsRows] = await Promise.all([
      this.databaseService.db
        .select({ ...goalieBase, value: goalieSeasonStats.wins })
        .from(goalieSeasonStats)
        .innerJoin(players, eq(goalieSeasonStats.playerId, players.id))
        .innerJoin(teams, eq(players.teamId, teams.id))
        .orderBy(desc(goalieSeasonStats.wins))
        .limit(limit),
      this.databaseService.db
        .select({ ...goalieBase, value: goalieSeasonStats.savePctg })
        .from(goalieSeasonStats)
        .innerJoin(players, eq(goalieSeasonStats.playerId, players.id))
        .innerJoin(teams, eq(players.teamId, teams.id))
        .orderBy(desc(goalieSeasonStats.savePctg))
        .limit(limit),
      this.databaseService.db
        .select({ ...goalieBase, value: goalieSeasonStats.shutouts })
        .from(goalieSeasonStats)
        .innerJoin(players, eq(goalieSeasonStats.playerId, players.id))
        .innerJoin(teams, eq(players.teamId, teams.id))
        .orderBy(desc(goalieSeasonStats.shutouts))
        .limit(limit),
    ]);

    return {
      wins: winsRows.map(mapGoalieRow),
      savePctg: savePctgRows.map(mapGoalieRow),
      shutouts: shutoutsRows.map(mapGoalieRow),
    };
  }
}

function mapSkaterRow(row: {
  playerId: number;
  firstName: string;
  lastName: string;
  headshot: string | null;
  positionCode: string;
  teamName: string;
  teamLogo: string | null;
  value: number | null;
}): SkaterLeaderEntry {
  return {
    playerId: row.playerId,
    firstName: row.firstName,
    lastName: row.lastName,
    headshot: row.headshot ?? undefined,
    positionCode: row.positionCode as PositionCode,
    teamName: row.teamName,
    teamLogo: row.teamLogo ?? undefined,
    value: row.value ?? 0,
  };
}

function mapGoalieRow(row: {
  playerId: number;
  firstName: string;
  lastName: string;
  headshot: string | null;
  teamName: string;
  teamLogo: string | null;
  value: number | null;
}): GoalieLeaderEntry {
  return {
    playerId: row.playerId,
    firstName: row.firstName,
    lastName: row.lastName,
    headshot: row.headshot ?? undefined,
    teamName: row.teamName,
    teamLogo: row.teamLogo ?? undefined,
    value: row.value ?? 0,
  };
}
