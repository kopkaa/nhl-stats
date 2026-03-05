import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { PlayersSyncService } from './players-sync.service';
import { Player, SkaterSeasonStats, GoalieSeasonStats } from './player.model';

@Resolver()
export class PlayersResolver {
  constructor(
    private readonly playersService: PlayersService,
    private readonly playersSyncService: PlayersSyncService,
  ) {}

  @Query(() => [Player], { description: 'Team roster (all players)' })
  teamRoster(@Args('teamId', { type: () => Int }) teamId: number) {
    return this.playersService.teamRoster(teamId);
  }

  @Query(() => [SkaterSeasonStats], {
    description: 'Current season stats for skaters on a team',
  })
  teamSkaterStats(@Args('teamId', { type: () => Int }) teamId: number) {
    return this.playersService.teamSkaterStats(teamId);
  }

  @Query(() => [GoalieSeasonStats], {
    description: 'Current season stats for goalies on a team',
  })
  teamGoalieStats(@Args('teamId', { type: () => Int }) teamId: number) {
    return this.playersService.teamGoalieStats(teamId);
  }

  @Mutation(() => Int, {
    description: 'Sync all team rosters and player stats from NHL API',
  })
  syncRosters(): Promise<number> {
    return this.playersSyncService.syncRosters();
  }
}
