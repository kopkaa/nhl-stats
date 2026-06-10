import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SeasonsService } from './seasons.service';
import { SeasonsSyncService } from './seasons-sync.service';
import { Season } from './season.model';

@Resolver(() => Season)
export class SeasonsResolver {
  constructor(
    private readonly seasonsService: SeasonsService,
    private readonly seasonsSyncService: SeasonsSyncService,
  ) {}

  @Query(() => [Season], {
    description: 'All seasons (newest first) with computed phase',
  })
  seasons() {
    return this.seasonsService.findAll();
  }

  @Query(() => Season, {
    nullable: true,
    description: "The current season resolved from today's date",
  })
  currentSeason() {
    return this.seasonsService.findCurrent();
  }

  @Query(() => Season, {
    nullable: true,
    description: 'A single season by id (format YYYY-YY)',
  })
  season(@Args('id', { type: () => String }) id: string) {
    return this.seasonsService.findOne(id);
  }

  @Mutation(() => Int, {
    description: 'Sync the season catalog (ids + date windows) from NHL API',
  })
  syncSeasons(): Promise<number> {
    return this.seasonsSyncService.syncSeasons();
  }
}
