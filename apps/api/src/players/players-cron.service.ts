import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PlayersSyncService } from './players-sync.service';

@Injectable()
export class PlayersCronService {
  private readonly logger = new Logger(PlayersCronService.name);

  constructor(private readonly playersSyncService: PlayersSyncService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async handleCron() {
    this.logger.log('Cron: syncing rosters...');
    try {
      const count = await this.playersSyncService.syncRosters();
      this.logger.log(`Cron: synced ${count} players.`);
    } catch (error) {
      this.logger.error('Cron: roster sync failed', error);
    }
  }
}
