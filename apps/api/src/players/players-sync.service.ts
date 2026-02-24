import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache';
import {
  DatabaseService,
  teams,
  players,
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
  private readonly webApiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {
    this.webApiBaseUrl =
      this.configService.getOrThrow<string>('NHL_WEB_API_URL');
  }

  async syncRosters(): Promise<number> {
    this.logger.log('Starting roster sync from NHL API...');

    const dbTeams = await this.databaseService.db
      .select({ id: teams.id, triCode: teams.triCode })
      .from(teams);

    const rosterResults = await Promise.allSettled(
      dbTeams.map((t) => this.syncTeamRoster(t.id, t.triCode)),
    );

    const totalPlayers = rosterResults.reduce((sum, r) => {
      if (r.status === 'fulfilled') return sum + r.value;
      this.logger.warn(`Roster sync failed: ${r.reason}`);
      return sum;
    }, 0);

    const statsResults = await Promise.allSettled(
      dbTeams.map((t) => this.syncTeamStats(t.triCode)),
    );

    statsResults.forEach((r, i) => {
      if (r.status === 'rejected')
        this.logger.warn(
          `Stats sync failed for ${dbTeams[i].triCode}: ${r.reason}`,
        );
    });

    await this.cacheService.delByPrefix('players:');
    this.logger.log(
      `Synced ${totalPlayers} players across ${dbTeams.length} teams.`,
    );
    return totalPlayers;
  }

  private async syncTeamRoster(
    teamId: number,
    triCode: string,
  ): Promise<number> {
    const { data } = await firstValueFrom(
      this.httpService.get<NhlRosterResponse>(
        `${this.webApiBaseUrl}/roster/${triCode}/current`,
      ),
    );

    const allPlayers: NhlRosterPlayer[] = [
      ...data.forwards,
      ...data.defensemen,
      ...data.goalies,
    ];

    if (allPlayers.length === 0) return 0;

    const rows = allPlayers.map((p) => ({
      id: p.id,
      teamId,
      firstName: p.firstName.default,
      lastName: p.lastName.default,
      positionCode: p.positionCode as PositionCode,
      sweaterNumber: p.sweaterNumber,
      headshot: p.headshot,
      shootsCatches: p.shootsCatches,
      heightCm: p.heightInCentimeters,
      weightKg: p.weightInKilograms,
      birthDate: p.birthDate,
      birthCountry: p.birthCountry,
      updatedAt: new Date(),
    }));

    await this.databaseService.db
      .insert(players)
      .values(rows)
      .onConflictDoUpdate({
        target: players.id,
        set: {
          teamId: sql`excluded.team_id`,
          firstName: sql`excluded.first_name`,
          lastName: sql`excluded.last_name`,
          positionCode: sql`excluded.position_code`,
          sweaterNumber: sql`excluded.sweater_number`,
          headshot: sql`excluded.headshot`,
          shootsCatches: sql`excluded.shoots_catches`,
          heightCm: sql`excluded.height_cm`,
          weightKg: sql`excluded.weight_kg`,
          birthDate: sql`excluded.birth_date`,
          birthCountry: sql`excluded.birth_country`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    return allPlayers.length;
  }

  private async syncTeamStats(triCode: string): Promise<void> {
    const { data } = await firstValueFrom(
      this.httpService.get<NhlClubStatsResponse>(
        `${this.webApiBaseUrl}/club-stats/${triCode}/now`,
      ),
    );

    const season = formatSeason(data.season);

    if (data.skaters.length > 0) {
      const skaterRows = data.skaters.map((s) => ({
        playerId: s.playerId,
        season,
        gamesPlayed: s.gamesPlayed,
        goals: s.goals,
        assists: s.assists,
        points: s.points,
        plusMinus: s.plusMinus,
        penaltyMinutes: s.penaltyMinutes,
        powerPlayGoals: s.powerPlayGoals,
        shorthandedGoals: s.shorthandedGoals,
        gameWinningGoals: s.gameWinningGoals,
        shots: s.shots,
        shootingPctg: s.shootingPctg,
        avgTimeOnIce: s.avgTimeOnIcePerGame,
        faceoffWinPctg: s.faceoffWinPctg,
        updatedAt: new Date(),
      }));

      await this.databaseService.db
        .insert(skaterSeasonStats)
        .values(skaterRows)
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

    if (data.goalies.length > 0) {
      const goalieRows = data.goalies.map((g) => ({
        playerId: g.playerId,
        season,
        gamesPlayed: g.gamesPlayed,
        gamesStarted: g.gamesStarted,
        wins: g.wins,
        losses: g.losses,
        otLosses: g.overtimeLosses,
        goalsAgainstAvg: g.goalsAgainstAverage,
        savePctg: g.savePercentage,
        shutouts: g.shutouts,
        shotsAgainst: g.shotsAgainst,
        saves: g.saves,
        goalsAgainst: g.goalsAgainst,
        updatedAt: new Date(),
      }));

      await this.databaseService.db
        .insert(goalieSeasonStats)
        .values(goalieRows)
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
}
