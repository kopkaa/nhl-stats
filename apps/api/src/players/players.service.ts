import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CACHE_TTL } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, players, skaterSeasonStats, goalieSeasonStats } from '../database';
import { Player, SkaterSeasonStats, GoalieSeasonStats } from './player.model';
import { PositionCode } from '@nhl-app/shared';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async teamRoster(teamId: number): Promise<Player[]> {
    return this.cacheService.getOrSet(
      `players:roster:${teamId}`,
      () => this.fetchRoster(teamId),
      CACHE_TTL.PLAYERS,
    );
  }

  async teamSkaterStats(teamId: number): Promise<SkaterSeasonStats[]> {
    return this.cacheService.getOrSet(
      `players:skaters:${teamId}`,
      () => this.fetchSkaterStats(teamId),
      CACHE_TTL.PLAYERS,
    );
  }

  async teamGoalieStats(teamId: number): Promise<GoalieSeasonStats[]> {
    return this.cacheService.getOrSet(
      `players:goalies:${teamId}`,
      () => this.fetchGoalieStats(teamId),
      CACHE_TTL.PLAYERS,
    );
  }

  private async fetchRoster(teamId: number): Promise<Player[]> {
    const rows = await this.databaseService.db
      .select()
      .from(players)
      .where(eq(players.teamId, teamId))
      .orderBy(players.lastName);

    return rows.map((r) => ({
      id: r.id,
      teamId: r.teamId,
      firstName: r.firstName,
      lastName: r.lastName,
      positionCode: r.positionCode as PositionCode,
      sweaterNumber: r.sweaterNumber ?? undefined,
      headshot: r.headshot ?? undefined,
      shootsCatches: r.shootsCatches ?? undefined,
      heightCm: r.heightCm ?? undefined,
      weightKg: r.weightKg ?? undefined,
      birthDate: r.birthDate ?? undefined,
      birthCountry: r.birthCountry ?? undefined,
    }));
  }

  private async fetchSkaterStats(teamId: number): Promise<SkaterSeasonStats[]> {
    const rows = await this.databaseService.db
      .select({
        playerId: skaterSeasonStats.playerId,
        season: skaterSeasonStats.season,
        firstName: players.firstName,
        lastName: players.lastName,
        headshot: players.headshot,
        positionCode: players.positionCode,
        gamesPlayed: skaterSeasonStats.gamesPlayed,
        goals: skaterSeasonStats.goals,
        assists: skaterSeasonStats.assists,
        points: skaterSeasonStats.points,
        plusMinus: skaterSeasonStats.plusMinus,
        penaltyMinutes: skaterSeasonStats.penaltyMinutes,
        powerPlayGoals: skaterSeasonStats.powerPlayGoals,
        shorthandedGoals: skaterSeasonStats.shorthandedGoals,
        gameWinningGoals: skaterSeasonStats.gameWinningGoals,
        shots: skaterSeasonStats.shots,
        shootingPctg: skaterSeasonStats.shootingPctg,
        avgTimeOnIce: skaterSeasonStats.avgTimeOnIce,
        faceoffWinPctg: skaterSeasonStats.faceoffWinPctg,
      })
      .from(skaterSeasonStats)
      .innerJoin(players, eq(skaterSeasonStats.playerId, players.id))
      .where(eq(players.teamId, teamId))
      .orderBy(skaterSeasonStats.points);

    return rows.map((r) => ({
      ...r,
      headshot: r.headshot ?? undefined,
      positionCode: r.positionCode as PositionCode,
      shootingPctg: r.shootingPctg ?? undefined,
      avgTimeOnIce: r.avgTimeOnIce ?? undefined,
      faceoffWinPctg: r.faceoffWinPctg ?? undefined,
    }));
  }

  private async fetchGoalieStats(teamId: number): Promise<GoalieSeasonStats[]> {
    const rows = await this.databaseService.db
      .select({
        playerId: goalieSeasonStats.playerId,
        season: goalieSeasonStats.season,
        firstName: players.firstName,
        lastName: players.lastName,
        headshot: players.headshot,
        gamesPlayed: goalieSeasonStats.gamesPlayed,
        gamesStarted: goalieSeasonStats.gamesStarted,
        wins: goalieSeasonStats.wins,
        losses: goalieSeasonStats.losses,
        otLosses: goalieSeasonStats.otLosses,
        goalsAgainstAvg: goalieSeasonStats.goalsAgainstAvg,
        savePctg: goalieSeasonStats.savePctg,
        shutouts: goalieSeasonStats.shutouts,
        shotsAgainst: goalieSeasonStats.shotsAgainst,
        saves: goalieSeasonStats.saves,
        goalsAgainst: goalieSeasonStats.goalsAgainst,
      })
      .from(goalieSeasonStats)
      .innerJoin(players, eq(goalieSeasonStats.playerId, players.id))
      .where(eq(players.teamId, teamId))
      .orderBy(goalieSeasonStats.wins);

    return rows.map((r) => ({
      ...r,
      headshot: r.headshot ?? undefined,
      goalsAgainstAvg: r.goalsAgainstAvg ?? undefined,
      savePctg: r.savePctg ?? undefined,
    }));
  }
}
