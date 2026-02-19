import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StandingsResolver } from './standings.resolver';
import { StandingsService } from './standings.service';
import { StandingsSyncService } from './standings-sync.service';
import { StandingsCronService } from './standings-cron.service';

@Module({
  imports: [HttpModule],
  providers: [
    StandingsResolver,
    StandingsService,
    StandingsSyncService,
    StandingsCronService,
  ],
})
export class StandingsModule {}
