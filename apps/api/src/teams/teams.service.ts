import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Team } from './team.model';
import { NhlTeamResponse, NhlTeamsApiResponse } from './teams.types';

const HISTORIC_TEAM_IDS = new Set([
  11, 27, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
  48, 49, 50, 51, 56, 57, 58, 70, 99,
]);

@Injectable()
export class TeamsService {
  private readonly statsApiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.statsApiBaseUrl =
      this.configService.getOrThrow<string>('NHL_API_BASE_URL');
  }

  async findAll(): Promise<Team[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<NhlTeamsApiResponse>(`${this.statsApiBaseUrl}/team`),
    );

    return data.data
      .filter((team) => team.franchiseId !== null)
      .filter((team) => !HISTORIC_TEAM_IDS.has(team.id))
      .map((team) => this.mapToTeam(team))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  async findOne(id: number): Promise<Team | undefined> {
    const teams = await this.findAll();
    return teams.find((t) => t.id === id);
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
