import { Injectable, Logger } from '@nestjs/common';
import { desc, eq, type SQL } from 'drizzle-orm';
import { CacheService } from '../cache';
import { DatabaseService } from '../database';
import { standings, teams } from '../database/schema';
import { Standing } from './standing.model';

const CACHE_TTL = 300; // 5 minutes

const selectFields = {
  teamId: standings.teamId,
  teamName: teams.fullName,
  teamLogo: teams.logo,
  season: standings.season,
  gamesPlayed: standings.gamesPlayed,
  wins: standings.wins,
  losses: standings.losses,
  otLosses: standings.otLosses,
  points: standings.points,
  goalsFor: standings.goalsFor,
  goalsAgainst: standings.goalsAgainst,
  divisionName: standings.divisionName,
  divisionRank: standings.divisionRank,
  conferenceName: standings.conferenceName,
  conferenceRank: standings.conferenceRank,
  streakCode: standings.streakCode,
  streakCount: standings.streakCount,
} as const;

@Injectable()
export class StandingsService {
  private readonly logger = new Logger(StandingsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(season?: number): Promise<Standing[]> {
    const cacheKey = season ? `standings:${season}` : 'standings:current';
    return this.cacheService.getOrSet(
      cacheKey,
      () => this.fetchFromDb(season),
      CACHE_TTL,
    );
  }

  private async fetchFromDb(season?: number): Promise<Standing[]> {
    const where: SQL | undefined = season
      ? eq(standings.season, season)
      : undefined;

    const rows = await this.databaseService.db
      .select(selectFields)
      .from(standings)
      .innerJoin(teams, eq(standings.teamId, teams.id))
      .where(where)
      .orderBy(desc(standings.points));

    if (rows.length === 0) {
      this.logger.warn(
        'No standings in database. Run syncStandings mutation first.',
      );
    }

    return rows.map((row) => ({
      ...row,
      teamLogo: row.teamLogo ?? undefined,
      divisionName: row.divisionName ?? undefined,
      divisionRank: row.divisionRank ?? undefined,
      conferenceName: row.conferenceName ?? undefined,
      conferenceRank: row.conferenceRank ?? undefined,
      streakCode: row.streakCode ?? undefined,
      streakCount: row.streakCount ?? undefined,
    }));
  }
}
