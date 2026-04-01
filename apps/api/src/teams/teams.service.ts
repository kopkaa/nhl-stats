import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NhlApiClient, CACHE_TTL } from '../common';
import { CacheService } from '../cache';
import { DatabaseService, teams } from '../database';
import { Team } from './team.model';
import { HISTORIC_TEAM_IDS, teamLogoUrl } from './teams.constants';
import type { NhlTeamResponse, NhlTeamsApiResponse } from './teams.types';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    private readonly nhlApi: NhlApiClient,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<Team[]> {
    return this.cacheService.getOrSet(
      'teams:all',
      () => this.fetchAllFromDb(),
      CACHE_TTL.TEAMS,
    );
  }

  async findOne(id: number): Promise<Team | undefined> {
    const result = await this.cacheService.getOrSet(
      `teams:${id}`,
      () => this.fetchOneFromDb(id),
      CACHE_TTL.TEAMS,
    );
    return result ?? undefined;
  }

  private async fetchAllFromDb(): Promise<Team[]> {
    const dbTeams = await this.databaseService.db
      .select()
      .from(teams)
      .orderBy(teams.fullName);

    if (dbTeams.length > 0) {
      return dbTeams.map((row) => this.mapDbRow(row));
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
      return this.mapDbRow(rows[0]);
    }

    this.logger.warn(
      `Team ${id} not found in database, falling back to NHL API.`,
    );
    const allTeams = await this.fetchFromApi();
    return allTeams.find((team) => team.id === id) ?? null;
  }

  private mapDbRow(row: typeof teams.$inferSelect): Team {
    return {
      id: row.id,
      franchiseId: row.franchiseId,
      fullName: row.fullName,
      triCode: row.triCode,
      logo: row.logo ?? undefined,
      conferenceName: row.conferenceName ?? undefined,
      divisionName: row.divisionName ?? undefined,
    };
  }

  private async fetchFromApi(): Promise<Team[]> {
    const data = await this.nhlApi.getStats<NhlTeamsApiResponse>('/team');

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
      logo: teamLogoUrl(team.triCode),
    };
  }
}
