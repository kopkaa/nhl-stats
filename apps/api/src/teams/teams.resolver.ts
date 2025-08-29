import { Resolver, Query, Args } from '@nestjs/graphql';
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
  team(@Args('id') id: string) {
    return this.teamsService.findOne(id);
  }
}
