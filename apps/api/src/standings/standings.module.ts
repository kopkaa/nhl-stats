import { Module } from '@nestjs/common';
import { StandingsResolver } from './standings.resolver';
import { StandingsService } from './standings.service';
import { StandingsSyncService } from './standings-sync.service';
import { StandingsCronService } from './standings-cron.service';

@Module({
  providers: [
    StandingsResolver,
    StandingsService,
    StandingsSyncService,
    StandingsCronService,
  ],
})
export class StandingsModule {}
