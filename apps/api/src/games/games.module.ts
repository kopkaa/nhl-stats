import { Module } from '@nestjs/common';
import { GamesResolver } from './games.resolver';
import { GamesService } from './games.service';
import { GamesLiveService } from './games-live.service';
import { GamesSyncService } from './games-sync.service';
import { GamesCronService } from './games-cron.service';

@Module({
  providers: [
    GamesResolver,
    GamesService,
    GamesLiveService,
    GamesSyncService,
    GamesCronService,
  ],
  exports: [GamesService, GamesLiveService],
})
export class GamesModule {}
