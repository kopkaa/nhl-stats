import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache';
import { DatabaseService, teams, games } from '../database';
import { GameState, formatSeason } from '@nhl-app/shared';
import { NhlClubScheduleResponse } from './games.types';

@Injectable()
export class GamesSyncService {
  private readonly logger = new Logger(GamesSyncService.name);
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

  async syncGames(): Promise<number> {
    this.logger.log('Starting games sync from NHL API...');

    const dbTeams = await this.databaseService.db
      .select({ id: teams.id, triCode: teams.triCode })
      .from(teams);

    const teamIdSet = new Set(dbTeams.map((t) => t.id));

    const results = await Promise.allSettled(
      dbTeams.map((t) => this.fetchTeamSchedule(t.triCode)),
    );

    const seen = new Set<number>();
    const allRows: any[] = [];

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.warn(
          `Failed to sync games for ${dbTeams[i].triCode}: ${r.reason}`,
        );
        return;
      }
      for (const game of r.value) {
        if (seen.has(game.id)) continue;
        if (
          !teamIdSet.has(game.homeTeam.id) ||
          !teamIdSet.has(game.awayTeam.id)
        )
          continue;

        seen.add(game.id);
        allRows.push({
          id: game.id,
          season: formatSeason(game.season),
          gameType: game.gameType,
          gameDate: game.gameDate,
          startTimeUTC: game.startTimeUTC,
          gameState: game.gameState as GameState,
          venue: game.venue?.default,
          homeTeamId: game.homeTeam.id,
          awayTeamId: game.awayTeam.id,
          homeScore: game.homeTeam.score ?? null,
          awayScore: game.awayTeam.score ?? null,
          updatedAt: new Date(),
        });
      }
    });

    if (allRows.length === 0) {
      this.logger.warn('No games data to sync.');
      return 0;
    }

    const BATCH_SIZE = 500;
    for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
      const batch = allRows.slice(i, i + BATCH_SIZE);
      await this.databaseService.db
        .insert(games)
        .values(batch)
        .onConflictDoUpdate({
          target: games.id,
          set: {
            gameState: sql`excluded.game_state`,
            homeScore: sql`excluded.home_score`,
            awayScore: sql`excluded.away_score`,
            startTimeUTC: sql`excluded.start_time_utc`,
            venue: sql`excluded.venue`,
            updatedAt: sql`excluded.updated_at`,
          },
        });
    }

    await this.cacheService.delByPrefix('games:');
    this.logger.log(`Synced ${allRows.length} games.`);
    return allRows.length;
  }

  private async fetchTeamSchedule(triCode: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<NhlClubScheduleResponse>(
        `${this.webApiBaseUrl}/club-schedule-season/${triCode}/now`,
      ),
    );
    return data.games;
  }
}
