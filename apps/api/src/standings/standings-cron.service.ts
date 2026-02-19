import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StandingsSyncService } from './standings-sync.service';

@Injectable()
export class StandingsCronService {
  private readonly logger = new Logger(StandingsCronService.name);

  constructor(private readonly standingsSyncService: StandingsSyncService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async handleCron() {
    this.logger.log('Cron: syncing standings...');
    try {
      const count = await this.standingsSyncService.syncStandings();
      this.logger.log(`Cron: synced ${count} standings.`);
    } catch (error) {
      this.logger.error('Cron: standings sync failed', error);
    }
  }
}
