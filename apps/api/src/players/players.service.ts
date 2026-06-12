import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { CACHE_TTL, NhlApiClient } from '../common';
import { CacheService } from '../cache';
import {
  DatabaseService,
  players,
  rosters,
  skaterSeasonStats,
  goalieSeasonStats,
  teams,
} from '../database';
import { SeasonsService } from '../seasons/seasons.service';
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
    private readonly seasonsService: SeasonsService,
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
    const currentSeason = (await this.seasonsService.getCurrentSeasonId()) ?? '';

    const [row] = await this.databaseService.db
      .select({
        id: players.id,
        firstName: players.firstName,
        lastName: players.lastName,
        positionCode: players.positionCode,
        headshot: players.headshot,
        shootsCatches: players.shootsCatches,
        heightCm: players.heightCm,
        weightKg: players.weightKg,
        birthDate: players.birthDate,
        birthCountry: players.birthCountry,
        teamId: rosters.teamId,
        sweaterNumber: rosters.sweaterNumber,
        teamName: teams.fullName,
        teamLogo: teams.logo,
      })
      .from(players)
      .leftJoin(
        rosters,
        and(eq(rosters.playerId, players.id), eq(rosters.season, currentSeason)),
      )
      .leftJoin(teams, eq(rosters.teamId, teams.id))
      .where(eq(players.id, id))
      .limit(1);

    if (!row) return null;
    return {
      id: row.id,
      teamId: row.teamId ?? undefined,
      teamName: row.teamName ?? undefined,
      teamLogo: row.teamLogo ?? undefined,
      firstName: row.firstName,
      lastName: row.lastName,
      positionCode: row.positionCode as PositionCode,
      sweaterNumber: row.sweaterNumber ?? undefined,
      headshot: row.headshot ?? undefined,
      shootsCatches: row.shootsCatches ?? undefined,
      heightCm: row.heightCm ?? undefined,
      weightKg: row.weightKg ?? undefined,
      birthDate: row.birthDate ?? undefined,
      birthCountry: row.birthCountry ?? undefined,
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

    return rows.map((row) => ({
      ...row,
      headshot: row.headshot ?? undefined,
      positionCode: row.positionCode as PositionCode,
      shootingPctg: row.shootingPctg ?? undefined,
      avgTimeOnIce: row.avgTimeOnIce ?? undefined,
      faceoffWinPctg: row.faceoffWinPctg ?? undefined,
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

    return rows.map((row) => ({
      ...row,
      headshot: row.headshot ?? undefined,
      goalsAgainstAvg: row.goalsAgainstAvg ?? undefined,
      savePctg: row.savePctg ?? undefined,
    }));
  }

  private async fetchRoster(teamId: number): Promise<Player[]> {
    const currentSeason = (await this.seasonsService.getCurrentSeasonId()) ?? '';

    const rows = await this.databaseService.db
      .select({
        id: players.id,
        firstName: players.firstName,
        lastName: players.lastName,
        positionCode: players.positionCode,
        sweaterNumber: rosters.sweaterNumber,
        headshot: players.headshot,
        shootsCatches: players.shootsCatches,
        heightCm: players.heightCm,
        weightKg: players.weightKg,
        birthDate: players.birthDate,
        birthCountry: players.birthCountry,
      })
      .from(rosters)
      .innerJoin(players, eq(rosters.playerId, players.id))
      .where(and(eq(rosters.teamId, teamId), eq(rosters.season, currentSeason)))
      .orderBy(players.lastName);

    return rows.map((row) => ({
      id: row.id,
      teamId,
      firstName: row.firstName,
      lastName: row.lastName,
      positionCode: row.positionCode as PositionCode,
      sweaterNumber: row.sweaterNumber ?? undefined,
      headshot: row.headshot ?? undefined,
      shootsCatches: row.shootsCatches ?? undefined,
      heightCm: row.heightCm ?? undefined,
      weightKg: row.weightKg ?? undefined,
      birthDate: row.birthDate ?? undefined,
      birthCountry: row.birthCountry ?? undefined,
    }));
  }

  private async fetchSkaterStats(teamId: number): Promise<SkaterSeasonStats[]> {
    const currentSeason = (await this.seasonsService.getCurrentSeasonId()) ?? '';

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
      .innerJoin(
        rosters,
        and(eq(rosters.playerId, players.id), eq(rosters.season, currentSeason)),
      )
      .where(
        and(eq(rosters.teamId, teamId), eq(skaterSeasonStats.season, currentSeason)),
      )
      .orderBy(skaterSeasonStats.points);

    return rows.map((row) => ({
      ...row,
      headshot: row.headshot ?? undefined,
      positionCode: row.positionCode as PositionCode,
      shootingPctg: row.shootingPctg ?? undefined,
      avgTimeOnIce: row.avgTimeOnIce ?? undefined,
      faceoffWinPctg: row.faceoffWinPctg ?? undefined,
    }));
  }

  private async fetchGoalieStats(teamId: number): Promise<GoalieSeasonStats[]> {
    const currentSeason = (await this.seasonsService.getCurrentSeasonId()) ?? '';

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
      .innerJoin(
        rosters,
        and(eq(rosters.playerId, players.id), eq(rosters.season, currentSeason)),
      )
      .where(
        and(eq(rosters.teamId, teamId), eq(goalieSeasonStats.season, currentSeason)),
      )
      .orderBy(goalieSeasonStats.wins);

    return rows.map((row) => ({
      ...row,
      headshot: row.headshot ?? undefined,
      goalsAgainstAvg: row.goalsAgainstAvg ?? undefined,
      savePctg: row.savePctg ?? undefined,
    }));
  }
}
