import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';
import { TeamsSyncService } from './teams-sync.service';

@Module({
  imports: [HttpModule],
  providers: [TeamsResolver, TeamsService, TeamsSyncService],
  exports: [TeamsService],
})
export class TeamsModule {}
