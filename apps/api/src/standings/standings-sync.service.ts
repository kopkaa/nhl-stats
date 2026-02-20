import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { sql } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache';
import { DatabaseService, standings, teams } from '../database';
import { NhlStandingsApiResponse } from './standings.types';
import { StreakCode } from '@nhl-app/enums';

function formatSeason(seasonId: number): string {
  const s = seasonId.toString();
  return `${s.slice(0, 4)}-${s.slice(6)}`;
}

const STANDINGS_API_URL = 'https://api-web.nhle.com/v1/standings/now';

@Injectable()
export class StandingsSyncService {
  private readonly logger = new Logger(StandingsSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async syncStandings(): Promise<number> {
    this.logger.log('Starting standings sync from NHL API...');

    const { data } = await firstValueFrom(
      this.httpService.get<NhlStandingsApiResponse>(STANDINGS_API_URL),
    );

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

    await this.cacheService.delByPrefix('standings:');
    this.logger.log(`Synced standings for ${rows.length} teams.`);
    return rows.length;
  }
}
