import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NhlApiClient {
  private readonly webApiUrl: string;
  private readonly statsApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.webApiUrl = this.configService.getOrThrow<string>('NHL_WEB_API_URL');
    this.statsApiUrl =
      this.configService.getOrThrow<string>('NHL_STATS_API_URL');
  }

  async getWeb<T>(path: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(`${this.webApiUrl}${path}`),
    );
    return data;
  }

  async getStats<T>(path: string): Promise<T> {
    const { data } = await firstValueFrom(
      this.httpService.get<T>(`${this.statsApiUrl}${path}`),
    );
    return data;
  }
}
