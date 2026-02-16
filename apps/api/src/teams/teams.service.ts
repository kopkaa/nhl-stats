import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../cache';
import { DatabaseService, teams } from '../database';
import { Team } from './team.model';
import { HISTORIC_TEAM_IDS } from './teams.constants';
import { NhlTeamResponse, NhlTeamsApiResponse } from './teams.types';

const CACHE_TTL = 3600; // 1 hour

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  private readonly statsApiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {
    this.statsApiBaseUrl =
      this.configService.getOrThrow<string>('NHL_API_BASE_URL');
  }

  async findAll(): Promise<Team[]> {
    return this.cacheService.getOrSet(
      'teams:all',
      () => this.fetchAllFromDb(),
      CACHE_TTL,
    );
  }

  async findOne(id: number): Promise<Team | undefined> {
    const result = await this.cacheService.getOrSet(
      `teams:${id}`,
      () => this.fetchOneFromDb(id),
      CACHE_TTL,
    );
    return result ?? undefined;
  }

  private async fetchAllFromDb(): Promise<Team[]> {
    const dbTeams = await this.databaseService.db
      .select()
      .from(teams)
      .orderBy(teams.fullName);

    if (dbTeams.length > 0) {
      return dbTeams.map((row) => ({
        id: row.id,
        franchiseId: row.franchiseId,
        fullName: row.fullName,
        triCode: row.triCode,
        logo: row.logo ?? undefined,
      }));
    }

    this.logger.warn(
      'No teams found in database, falling back to NHL API. Run syncTeams mutation to populate.',
    );
    return this.fetchFromApi();
  }

  private async fetchOneFromDb(id: number): Promise<Team | null> {
    const rows = await this.databaseService.db
      .select()
      .from(teams)
      .where(eq(teams.id, id))
      .limit(1);

    if (rows.length > 0) {
      const row = rows[0];
      return {
        id: row.id,
        franchiseId: row.franchiseId,
        fullName: row.fullName,
        triCode: row.triCode,
        logo: row.logo ?? undefined,
      };
    }

    this.logger.warn(
      `Team ${id} not found in database, falling back to NHL API.`,
    );
    const allTeams = await this.fetchFromApi();
    return allTeams.find((team) => team.id === id) ?? null;
  }

  private async fetchFromApi(): Promise<Team[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<NhlTeamsApiResponse>(`${this.statsApiBaseUrl}/team`),
    );

    return data.data
      .filter((team) => team.franchiseId !== null)
      .filter((team) => !HISTORIC_TEAM_IDS.has(team.id))
      .map((team) => this.mapToTeam(team))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  private mapToTeam(team: NhlTeamResponse): Team {
    return {
      id: team.id,
      franchiseId: team.franchiseId,
      fullName: team.fullName,
      triCode: team.triCode,
      logo: `https://assets.nhle.com/logos/nhl/svg/${team.triCode}_light.svg`,
    };
  }
}
