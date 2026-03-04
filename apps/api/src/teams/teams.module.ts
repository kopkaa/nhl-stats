import { Module } from '@nestjs/common';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { TeamsSyncService } from './teams-sync.service';

@Module({
  providers: [TeamsResolver, TeamsService, TeamsSyncService],
  exports: [TeamsService],
})
export class TeamsModule {}
