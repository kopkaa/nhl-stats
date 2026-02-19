import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { StandingsService } from './standings.service';
import { StandingsSyncService } from './standings-sync.service';
import { Standing } from './standing.model';

@Resolver(() => Standing)
export class StandingsResolver {
  constructor(
    private readonly standingsService: StandingsService,
    private readonly standingsSyncService: StandingsSyncService,
  ) {}

  @Query(() => [Standing])
  standings(
    @Args('season', { type: () => Int, nullable: true }) season?: number,
  ) {
    return this.standingsService.findAll(season);
  }

  @Mutation(() => Int, {
    description: 'Sync standings from NHL API to database',
  })
  syncStandings(): Promise<number> {
    return this.standingsSyncService.syncStandings();
  }
}
