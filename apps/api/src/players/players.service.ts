import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { CACHE_TTL, NhlApiClient } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, players, skaterSeasonStats, goalieSeasonStats, teams } from '../database';
import { Player, SkaterSeasonStats, GoalieSeasonStats, PlayerGameLogEntry } from './player.model';
import { PositionCode } from '@nhl-app/shared';
import { NhlGameLogResponse } from './players.types';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
    private readonly nhlApi: NhlApiClient,
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

  async findOne(id: number): Promise<Player | null> {
    return this.cacheService.getOrSet(
      `players:detail:${id}`,
      () => this.fetchPlayer(id),
      CACHE_TTL.PLAYERS,
    );
  }

  async playerSkaterStats(playerId: number): Promise<SkaterSeasonStats[]> {
    return this.cacheService.getOrSet(
      `players:skater-stats:${playerId}`,
      () => this.fetchPlayerSkaterStats(playerId),
      CACHE_TTL.PLAYERS,
    );
  }

  async playerGoalieStats(playerId: number): Promise<GoalieSeasonStats[]> {
    return this.cacheService.getOrSet(
      `players:goalie-stats:${playerId}`,
      () => this.fetchPlayerGoalieStats(playerId),
      CACHE_TTL.PLAYERS,
    );
  }

  async playerGameLog(playerId: number, limit: number): Promise<PlayerGameLogEntry[]> {
    const response = await this.nhlApi.getWeb<NhlGameLogResponse>(
      `/player/${playerId}/game-log/now`,
    );
    return response.gameLog.slice(0, limit).map((entry) => ({
      gameId: entry.gameId,
      gameDate: entry.gameDate,
      teamAbbrev: entry.teamAbbrev,
      opponentAbbrev: entry.opponentAbbrev,
      homeRoadFlag: entry.homeRoadFlag,
      toi: entry.toi,
      goals: entry.goals,
      assists: entry.assists,
      points: entry.points,
      plusMinus: entry.plusMinus,
      shots: entry.shots,
      pim: entry.pim,
      powerPlayGoals: entry.powerPlayGoals,
      gameWinningGoals: entry.gameWinningGoals,
      decision: entry.decision,
      saves: entry.saves,
      shotsAgainst: entry.shotsAgainst,
      goalsAgainst: entry.goalsAgainst,
      savePctg: entry.savePctg,
    }));
  }

  private async fetchPlayer(id: number): Promise<Player | null> {
    const rows = await this.databaseService.db
      .select({
        id: players.id,
        teamId: players.teamId,
        teamName: teams.fullName,
        teamLogo: teams.logo,
        firstName: players.firstName,
        lastName: players.lastName,
        positionCode: players.positionCode,
        sweaterNumber: players.sweaterNumber,
        headshot: players.headshot,
        shootsCatches: players.shootsCatches,
        heightCm: players.heightCm,
        weightKg: players.weightKg,
        birthDate: players.birthDate,
        birthCountry: players.birthCountry,
      })
      .from(players)
      .innerJoin(teams, eq(players.teamId, teams.id))
      .where(eq(players.id, id))
      .limit(1);

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      teamId: r.teamId,
      teamName: r.teamName ?? undefined,
      teamLogo: r.teamLogo ?? undefined,
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
    };
  }

  private async fetchPlayerSkaterStats(playerId: number): Promise<SkaterSeasonStats[]> {
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
      .where(eq(skaterSeasonStats.playerId, playerId))
      .orderBy(skaterSeasonStats.season);

    return rows.map((r) => ({
      ...r,
      headshot: r.headshot ?? undefined,
      positionCode: r.positionCode as PositionCode,
      shootingPctg: r.shootingPctg ?? undefined,
      avgTimeOnIce: r.avgTimeOnIce ?? undefined,
      faceoffWinPctg: r.faceoffWinPctg ?? undefined,
    }));
  }

  private async fetchPlayerGoalieStats(playerId: number): Promise<GoalieSeasonStats[]> {
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
      .where(eq(goalieSeasonStats.playerId, playerId))
      .orderBy(goalieSeasonStats.season);

    return rows.map((r) => ({
      ...r,
      headshot: r.headshot ?? undefined,
      goalsAgainstAvg: r.goalsAgainstAvg ?? undefined,
      savePctg: r.savePctg ?? undefined,
    }));
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
