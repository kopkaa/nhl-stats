import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { LeadersService } from './leaders.service';
import { SkaterLeaders, GoalieLeaders } from './leader.model';

@Resolver()
export class LeadersResolver {
  constructor(private readonly leadersService: LeadersService) {}

  @Query(() => SkaterLeaders, {
    description: 'Top skaters by goals, assists, and points',
  })
  skaterLeaders(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.leadersService.skaterLeaders(limit);
  }

  @Query(() => GoalieLeaders, {
    description: 'Top goalies by wins, save percentage, and shutouts',
  })
  goalieLeaders(
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.leadersService.goalieLeaders(limit);
  }
}
