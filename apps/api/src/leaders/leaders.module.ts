import { Module } from '@nestjs/common';
import { LeadersResolver } from './leaders.resolver';
import { LeadersService } from './leaders.service';

@Module({
  providers: [LeadersResolver, LeadersService],
})
export class LeadersModule {}
