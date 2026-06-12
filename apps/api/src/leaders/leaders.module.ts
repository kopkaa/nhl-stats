import { Module } from '@nestjs/common';
import { LeadersResolver } from './leaders.resolver';
import { LeadersService } from './leaders.service';
import { SeasonsModule } from '../seasons/seasons.module';

@Module({
  imports: [SeasonsModule],
  providers: [LeadersResolver, LeadersService],
})
export class LeadersModule {}
