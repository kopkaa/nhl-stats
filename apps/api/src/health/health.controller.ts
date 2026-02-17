import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database';
import { CacheService } from '../cache';

interface HealthStatus {
  status: 'ok' | 'error';
  uptime: number;
  services: {
    postgres: 'up' | 'down';
    redis: 'up' | 'down';
  };
}

@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const [postgres, redis] = await Promise.allSettled([
      this.databaseService.ping(),
      this.cacheService.ping(),
    ]);

    const allUp = postgres.status === 'fulfilled' && redis.status === 'fulfilled';

    return {
      status: allUp ? 'ok' : 'error',
      uptime: process.uptime(),
      services: {
        postgres: postgres.status === 'fulfilled' ? 'up' : 'down',
        redis: redis.status === 'fulfilled' ? 'up' : 'down',
      },
    };
  }
}
