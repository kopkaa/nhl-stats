import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GamesSyncService } from './games-sync.service';

@Injectable()
export class GamesCronService {
  private readonly logger = new Logger(GamesCronService.name);

  constructor(private readonly gamesSyncService: GamesSyncService) {}

  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  async handleCron() {
    this.logger.log('Cron: syncing games...');
    try {
      const count = await this.gamesSyncService.syncGames();
      this.logger.log(`Cron: synced ${count} games.`);
    } catch (error) {
      this.logger.error('Cron: games sync failed', error);
    }
  }
}
