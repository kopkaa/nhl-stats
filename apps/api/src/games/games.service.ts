import { Injectable, Logger } from '@nestjs/common';
import { desc, eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { CACHE_TTL } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, games, teams } from '../database';
import { Game } from './game.model';
import { GameState } from '@nhl-app/shared';

const awayTeamRef = alias(teams, 'away_team');

const gameSelect = {
  id: games.id,
  season: games.season,
  gameType: games.gameType,
  gameDate: games.gameDate,
  startTimeUTC: games.startTimeUTC,
  gameState: games.gameState,
  venue: games.venue,
  homeTeamId: games.homeTeamId,
  awayTeamId: games.awayTeamId,
  homeTeamName: teams.fullName,
  homeTeamLogo: teams.logo,
  awayTeamName: awayTeamRef.fullName,
  awayTeamLogo: awayTeamRef.logo,
  homeScore: games.homeScore,
  awayScore: games.awayScore,
} as const;

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async teamGames(teamId: number, limit = 50): Promise<Game[]> {
    return this.cacheService.getOrSet(
      `games:team:${teamId}:${limit}`,
      () => this.fetchTeamGames(teamId, limit),
      CACHE_TTL.GAMES,
    );
  }

  async gamesByDate(date: string): Promise<Game[]> {
    return this.cacheService.getOrSet(
      `games:date:${date}`,
      () => this.fetchGamesByDate(date),
      CACHE_TTL.GAMES,
    );
  }

  private baseQuery() {
    return this.databaseService.db
      .select(gameSelect)
      .from(games)
      .innerJoin(teams, eq(games.homeTeamId, teams.id))
      .innerJoin(awayTeamRef, eq(games.awayTeamId, awayTeamRef.id));
  }

  private mapRows(rows: Awaited<ReturnType<typeof this.baseQuery>>): Game[] {
    return rows.map((r) => ({
      ...r,
      startTimeUTC: r.startTimeUTC ?? undefined,
      venue: r.venue ?? undefined,
      homeTeamName: r.homeTeamName ?? undefined,
      homeTeamLogo: r.homeTeamLogo ?? undefined,
      awayTeamName: r.awayTeamName ?? undefined,
      awayTeamLogo: r.awayTeamLogo ?? undefined,
      gameState: r.gameState as GameState,
      homeScore: r.homeScore ?? undefined,
      awayScore: r.awayScore ?? undefined,
    }));
  }

  private async fetchTeamGames(
    teamId: number,
    limit: number,
  ): Promise<Game[]> {
    const rows = await this.baseQuery()
      .where(or(eq(games.homeTeamId, teamId), eq(games.awayTeamId, teamId)))
      .orderBy(desc(games.gameDate))
      .limit(limit);

    return this.mapRows(rows);
  }

  private async fetchGamesByDate(date: string): Promise<Game[]> {
    const rows = await this.baseQuery()
      .where(eq(games.gameDate, date))
      .orderBy(games.startTimeUTC);

    return this.mapRows(rows);
  }
}
