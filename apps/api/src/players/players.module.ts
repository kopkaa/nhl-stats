import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlayersResolver } from './players.resolver';
import { PlayersService } from './players.service';
import { PlayersSyncService } from './players-sync.service';
import { PlayersCronService } from './players-cron.service';

@Module({
  imports: [HttpModule],
  providers: [PlayersResolver, PlayersService, PlayersSyncService, PlayersCronService],
  exports: [PlayersService],
})
export class PlayersModule {}
