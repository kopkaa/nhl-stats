import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';
import { DatabaseService, teams } from '../database';
import { NhlTeamsApiResponse } from './teams.types';

const HISTORIC_TEAM_IDS = new Set([
  11, 27, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51, 56, 57, 58, 70, 99,
]);

@Injectable()
export class TeamsSyncService {
  private readonly logger = new Logger(TeamsSyncService.name);
  private readonly statsApiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    this.statsApiBaseUrl =
      this.configService.getOrThrow<string>('NHL_API_BASE_URL');
  }

  async syncTeams(): Promise<number> {
    this.logger.log('Starting teams sync from NHL API...');

    const { data } = await firstValueFrom(
      this.httpService.get<NhlTeamsApiResponse>(`${this.statsApiBaseUrl}/team`),
    );

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
