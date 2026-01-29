import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TeamsResolver } from './teams.resolver';
import { TeamsService } from './teams.service';

@Module({
  imports: [HttpModule],
  providers: [TeamsResolver, TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
