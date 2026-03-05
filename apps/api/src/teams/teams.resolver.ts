import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { TeamsSyncService } from './teams-sync.service';
import { Team } from './team.model';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamsSyncService: TeamsSyncService,
  ) {}

  @Query(() => [Team], { description: 'All active NHL teams' })
  teams() {
    return this.teamsService.findAll();
  }

  @Query(() => Team, {
    nullable: true,
    description: 'Single team by ID',
  })
  team(@Args('id', { type: () => Int }) id: number) {
    return this.teamsService.findOne(id);
  }

  @Mutation(() => Int, { description: 'Sync teams from NHL API to database' })
  syncTeams(): Promise<number> {
    return this.teamsSyncService.syncTeams();
  }
}
