import { Module } from '@nestjs/common';
import { SeasonsResolver } from './seasons.resolver';
import { SeasonsService } from './seasons.service';
import { SeasonsSyncService } from './seasons-sync.service';

@Module({
  providers: [SeasonsResolver, SeasonsService, SeasonsSyncService],
})
export class SeasonsModule {}
