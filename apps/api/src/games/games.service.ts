import { Injectable, Logger } from '@nestjs/common';
import { desc, eq, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { CACHE_TTL } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, games, teams } from '../database';
import { Game } from './game.model';
import { GameState } from '@nhl-app/shared';

const awayTeamRef = alias(teams, 'away_team');

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
      CACHE_TTL,
    );
  }

  private async fetchTeamGames(teamId: number, limit: number): Promise<Game[]> {
    const rows = await this.databaseService.db
      .select({
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
      })
      .from(games)
      .innerJoin(teams, eq(games.homeTeamId, teams.id))
      .innerJoin(awayTeamRef, eq(games.awayTeamId, awayTeamRef.id))
      .where(or(eq(games.homeTeamId, teamId), eq(games.awayTeamId, teamId)))
      .orderBy(desc(games.gameDate))
      .limit(limit);

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
}
