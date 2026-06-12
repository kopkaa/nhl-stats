import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NhlApiClient } from '../common';
import { CacheService } from '../cache';
import {
  DatabaseService,
  teams,
  players,
  rosters,
  skaterSeasonStats,
  goalieSeasonStats,
} from '../database';
import { PositionCode, formatSeason } from '@nhl-app/shared';
import {
  NhlRosterResponse,
  NhlRosterPlayer,
  NhlClubStatsResponse,
} from './players.types';

@Injectable()
export class PlayersSyncService {
  private readonly logger = new Logger(PlayersSyncService.name);

  constructor(
    private readonly nhlApi: NhlApiClient,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async syncRosters(): Promise<number> {
    this.logger.log('Starting roster sync from NHL API...');

    const dbTeams = await this.databaseService.db
      .select({ id: teams.id, triCode: teams.triCode })
      .from(teams);

    const results = await Promise.allSettled(
      dbTeams.map((team) => this.syncTeam(team.id, team.triCode)),
    );

    const totalPlayers = results.reduce((sum, result, index) => {
      if (result.status === 'fulfilled') return sum + result.value;
      this.logger.warn(
        `Team sync failed for ${dbTeams[index].triCode}: ${result.reason}`,
      );
      return sum;
    }, 0);

    await this.cacheService.delByPrefix('players:');
    await this.cacheService.delByPrefix('leaders:');
    this.logger.log(
      `Synced ${totalPlayers} players across ${dbTeams.length} teams.`,
    );
    return totalPlayers;
  }

  private async syncTeam(teamId: number, triCode: string): Promise<number> {
    const [roster, clubStats] = await Promise.all([
      this.nhlApi.getWeb<NhlRosterResponse>(`/roster/${triCode}/current`),
      this.nhlApi.getWeb<NhlClubStatsResponse>(`/club-stats/${triCode}/now`),
    ]);

    const rosterPlayers = [
      ...roster.forwards,
      ...roster.defensemen,
      ...roster.goalies,
    ];
    if (rosterPlayers.length === 0) return 0;

    const season = formatSeason(clubStats.season);
    const rosterPlayerIds = new Set(rosterPlayers.map((player) => player.id));

    await this.upsertPlayers(rosterPlayers);
    await this.upsertRoster(rosterPlayers, teamId, season);
    await this.upsertSkaterStats(clubStats, season, rosterPlayerIds);
    await this.upsertGoalieStats(clubStats, season, rosterPlayerIds);

    return rosterPlayers.length;
  }

  private async upsertPlayers(rosterPlayers: NhlRosterPlayer[]): Promise<void> {
    const rows = rosterPlayers.map((player) => ({
      id: player.id,
      firstName: player.firstName.default,
      lastName: player.lastName.default,
      positionCode: player.positionCode as PositionCode,
      headshot: player.headshot,
      shootsCatches: player.shootsCatches,
      heightCm: player.heightInCentimeters,
      weightKg: player.weightInKilograms,
      birthDate: player.birthDate,
      birthCountry: player.birthCountry,
      updatedAt: new Date(),
    }));

    await this.databaseService.db
      .insert(players)
      .values(rows)
      .onConflictDoUpdate({
        target: players.id,
        set: {
          firstName: sql`excluded.first_name`,
          lastName: sql`excluded.last_name`,
          positionCode: sql`excluded.position_code`,
          headshot: sql`excluded.headshot`,
          shootsCatches: sql`excluded.shoots_catches`,
          heightCm: sql`excluded.height_cm`,
          weightKg: sql`excluded.weight_kg`,
          birthDate: sql`excluded.birth_date`,
          birthCountry: sql`excluded.birth_country`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }

  private async upsertRoster(
    rosterPlayers: NhlRosterPlayer[],
    teamId: number,
    season: string,
  ): Promise<void> {
    const rows = rosterPlayers.map((player) => ({
      playerId: player.id,
      teamId,
      season,
      sweaterNumber: player.sweaterNumber,
      updatedAt: new Date(),
    }));

    await this.databaseService.db
      .insert(rosters)
      .values(rows)
      .onConflictDoUpdate({
        target: [rosters.playerId, rosters.teamId, rosters.season],
        set: {
          sweaterNumber: sql`excluded.sweater_number`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }

  private async upsertSkaterStats(
    clubStats: NhlClubStatsResponse,
    season: string,
    rosterPlayerIds: Set<number>,
  ): Promise<void> {
    const rows = clubStats.skaters
      .filter((skater) => rosterPlayerIds.has(skater.playerId))
      .map((skater) => ({
        playerId: skater.playerId,
        season,
        gamesPlayed: skater.gamesPlayed,
        goals: skater.goals,
        assists: skater.assists,
        points: skater.points,
        plusMinus: skater.plusMinus,
        penaltyMinutes: skater.penaltyMinutes,
        powerPlayGoals: skater.powerPlayGoals,
        shorthandedGoals: skater.shorthandedGoals,
        gameWinningGoals: skater.gameWinningGoals,
        shots: skater.shots,
        shootingPctg: skater.shootingPctg,
        avgTimeOnIce: skater.avgTimeOnIcePerGame,
        faceoffWinPctg: skater.faceoffWinPctg,
        updatedAt: new Date(),
      }));

    if (rows.length === 0) return;

    await this.databaseService.db
      .insert(skaterSeasonStats)
      .values(rows)
      .onConflictDoUpdate({
        target: [skaterSeasonStats.playerId, skaterSeasonStats.season],
        set: {
          gamesPlayed: sql`excluded.games_played`,
          goals: sql`excluded.goals`,
          assists: sql`excluded.assists`,
          points: sql`excluded.points`,
          plusMinus: sql`excluded.plus_minus`,
          penaltyMinutes: sql`excluded.penalty_minutes`,
          powerPlayGoals: sql`excluded.power_play_goals`,
          shorthandedGoals: sql`excluded.shorthanded_goals`,
          gameWinningGoals: sql`excluded.game_winning_goals`,
          shots: sql`excluded.shots`,
          shootingPctg: sql`excluded.shooting_pctg`,
          avgTimeOnIce: sql`excluded.avg_time_on_ice`,
          faceoffWinPctg: sql`excluded.faceoff_win_pctg`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }

  private async upsertGoalieStats(
    clubStats: NhlClubStatsResponse,
    season: string,
    rosterPlayerIds: Set<number>,
  ): Promise<void> {
    const rows = clubStats.goalies
      .filter((goalie) => rosterPlayerIds.has(goalie.playerId))
      .map((goalie) => ({
        playerId: goalie.playerId,
        season,
        gamesPlayed: goalie.gamesPlayed,
        gamesStarted: goalie.gamesStarted,
        wins: goalie.wins,
        losses: goalie.losses,
        otLosses: goalie.overtimeLosses,
        goalsAgainstAvg: goalie.goalsAgainstAverage,
        savePctg: goalie.savePercentage,
        shutouts: goalie.shutouts,
        shotsAgainst: goalie.shotsAgainst,
        saves: goalie.saves,
        goalsAgainst: goalie.goalsAgainst,
        updatedAt: new Date(),
      }));

    if (rows.length === 0) return;

    await this.databaseService.db
      .insert(goalieSeasonStats)
      .values(rows)
      .onConflictDoUpdate({
        target: [goalieSeasonStats.playerId, goalieSeasonStats.season],
        set: {
          gamesPlayed: sql`excluded.games_played`,
          gamesStarted: sql`excluded.games_started`,
          wins: sql`excluded.wins`,
          losses: sql`excluded.losses`,
          otLosses: sql`excluded.ot_losses`,
          goalsAgainstAvg: sql`excluded.goals_against_avg`,
          savePctg: sql`excluded.save_pctg`,
          shutouts: sql`excluded.shutouts`,
          shotsAgainst: sql`excluded.shots_against`,
          saves: sql`excluded.saves`,
          goalsAgainst: sql`excluded.goals_against`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }
}
