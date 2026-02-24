import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GamesResolver } from './games.resolver';
import { GamesService } from './games.service';
import { GamesSyncService } from './games-sync.service';
import { GamesCronService } from './games-cron.service';

@Module({
  imports: [HttpModule],
  providers: [GamesResolver, GamesService, GamesSyncService, GamesCronService],
  exports: [GamesService],
})
export class GamesModule {}
