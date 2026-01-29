import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { TeamsService } from './teams.service';
import { Team } from './team.model';

@Resolver(() => Team)
export class TeamsResolver {
  constructor(private teamsService: TeamsService) {}

  @Query(() => [Team])
  teams() {
    return this.teamsService.findAll();
  }

  @Query(() => Team, { nullable: true })
  team(@Args('id', { type: () => Int }) id: number) {
    return this.teamsService.findOne(id);
  }
}
