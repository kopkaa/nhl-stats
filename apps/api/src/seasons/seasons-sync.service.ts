import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { formatSeason } from '@nhl-app/shared';
import { NhlApiClient } from '../common';
import { DatabaseService, seasons } from '../database';
import { NhlStandingsSeasonResponse } from './seasons.types';

@Injectable()
export class SeasonsSyncService {
  private readonly logger = new Logger(SeasonsSyncService.name);

  constructor(
    private readonly nhlApi: NhlApiClient,
    private readonly databaseService: DatabaseService,
  ) {}

  async syncSeasons(): Promise<number> {
    this.logger.log('Starting season catalog sync from NHL API...');

    const data = await this.nhlApi.getWeb<NhlStandingsSeasonResponse>(
      '/standings-season',
    );

    // /standings-season only exposes regular-season dates; endDate (playoff end) is
    // not available from this endpoint and stays null until populated from another source.
    const rows = data.seasons.map((entry) => ({
      id: formatSeason(entry.id),
      nhlSeasonId: entry.id,
      startDate: entry.standingsStart,
      regularEndDate: entry.standingsEnd,
      updatedAt: new Date(),
    }));

    if (rows.length === 0) {
      this.logger.warn('No seasons returned from NHL API.');
      return 0;
    }

    await this.databaseService.db
      .insert(seasons)
      .values(rows)
      .onConflictDoUpdate({
        target: seasons.id,
        set: {
          nhlSeasonId: sql`excluded.nhl_season_id`,
          startDate: sql`excluded.start_date`,
          regularEndDate: sql`excluded.regular_end_date`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    this.logger.log(`Synced ${rows.length} seasons.`);
    return rows.length;
  }
}
