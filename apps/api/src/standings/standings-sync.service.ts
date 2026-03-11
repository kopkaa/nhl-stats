import { Injectable, Logger } from '@nestjs/common';
import { sql, eq } from 'drizzle-orm';
import { NhlApiClient } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, standings, teams } from '../database';
import { NhlStandingsApiResponse } from './standings.types';
import { StreakCode, formatSeason } from '@nhl-app/shared';

@Injectable()
export class StandingsSyncService {
  private readonly logger = new Logger(StandingsSyncService.name);

  constructor(
    private readonly nhlApi: NhlApiClient,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async syncStandings(): Promise<number> {
    this.logger.log('Starting standings sync from NHL API...');

    const data =
      await this.nhlApi.getWeb<NhlStandingsApiResponse>('/standings/now');

    const dbTeams = await this.databaseService.db
      .select({ id: teams.id, triCode: teams.triCode })
      .from(teams);

    const triCodeToId = new Map(dbTeams.map((t) => [t.triCode, t.id]));

    const rows = data.standings
      .map((entry) => {
        const teamId = triCodeToId.get(entry.teamAbbrev.default);
        if (!teamId) {
          this.logger.warn(
            `Unknown team: ${entry.teamAbbrev.default}, skipping`,
          );
          return null;
        }
        return {
          teamId,
          season: formatSeason(entry.seasonId),
          gamesPlayed: entry.gamesPlayed,
          wins: entry.wins,
          losses: entry.losses,
          otLosses: entry.otLosses,
          points: entry.points,
          goalsFor: entry.goalFor,
          goalsAgainst: entry.goalAgainst,
          divisionName: entry.divisionName,
          divisionRank: entry.divisionSequence,
          conferenceName: entry.conferenceName,
          conferenceRank: entry.conferenceSequence,
          streakCode: entry.streakCode as StreakCode,
          streakCount: entry.streakCount,
          updatedAt: new Date(),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (rows.length === 0) {
      this.logger.warn('No standings data to sync.');
      return 0;
    }

    await this.databaseService.db
      .insert(standings)
      .values(rows)
      .onConflictDoUpdate({
        target: [standings.teamId, standings.season],
        set: {
          gamesPlayed: sql`excluded.games_played`,
          wins: sql`excluded.wins`,
          losses: sql`excluded.losses`,
          otLosses: sql`excluded.ot_losses`,
          points: sql`excluded.points`,
          goalsFor: sql`excluded.goals_for`,
          goalsAgainst: sql`excluded.goals_against`,
          divisionName: sql`excluded.division_name`,
          divisionRank: sql`excluded.division_rank`,
          conferenceName: sql`excluded.conference_name`,
          conferenceRank: sql`excluded.conference_rank`,
          streakCode: sql`excluded.streak_code`,
          streakCount: sql`excluded.streak_count`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    for (const row of rows) {
      await this.databaseService.db
        .update(teams)
        .set({
          conferenceName: row.conferenceName,
          divisionName: row.divisionName,
          updatedAt: new Date(),
        })
        .where(eq(teams.id, row.teamId));
    }

    await this.cacheService.delByPrefix('standings:');
    await this.cacheService.delByPrefix('teams:');
    this.logger.log(`Synced standings for ${rows.length} teams.`);
    return rows.length;
  }
}
