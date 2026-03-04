import { Injectable, Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { NhlApiClient } from '../common';
import { DatabaseService, teams } from '../database';
import { HISTORIC_TEAM_IDS } from './teams.constants';
import type { NhlTeamsApiResponse } from './teams.types';

@Injectable()
export class TeamsSyncService {
  private readonly logger = new Logger(TeamsSyncService.name);

  constructor(
    private readonly nhlApi: NhlApiClient,
    private readonly databaseService: DatabaseService,
  ) {}

  async syncTeams(): Promise<number> {
    this.logger.log('Starting teams sync from NHL API...');

    const data = await this.nhlApi.getStats<NhlTeamsApiResponse>('/team');

    const activeTeams = data.data
      .filter((team) => team.franchiseId !== null)
      .filter((team) => !HISTORIC_TEAM_IDS.has(team.id));

    await this.databaseService.db
      .insert(teams)
      .values(
        activeTeams.map((team) => ({
          id: team.id,
          franchiseId: team.franchiseId,
          fullName: team.fullName,
          triCode: team.triCode,
          logo: `https://assets.nhle.com/logos/nhl/svg/${team.triCode}_light.svg`,
          updatedAt: new Date(),
        })),
      )
      .onConflictDoUpdate({
        target: teams.id,
        set: {
          franchiseId: sql`excluded.franchise_id`,
          fullName: sql`excluded.full_name`,
          triCode: sql`excluded.tri_code`,
          logo: sql`excluded.logo`,
          updatedAt: sql`excluded.updated_at`,
        },
      });

    this.logger.log(`Synced ${activeTeams.length} teams successfully.`);
    return activeTeams.length;
  }
}
