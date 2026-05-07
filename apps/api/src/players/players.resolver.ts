import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PlayersService } from './players.service';
import { PlayersSyncService } from './players-sync.service';
import { Player, SkaterSeasonStats, GoalieSeasonStats, PlayerGameLogEntry } from './player.model';

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

  @Query(() => Player, { nullable: true, description: 'Single player by id' })
  player(@Args('id', { type: () => Int }) id: number) {
    return this.playersService.findOne(id);
  }

  @Query(() => [SkaterSeasonStats], { description: 'Season stats for a skater' })
  playerSkaterStats(@Args('playerId', { type: () => Int }) playerId: number) {
    return this.playersService.playerSkaterStats(playerId);
  }

  @Query(() => [GoalieSeasonStats], { description: 'Season stats for a goalie' })
  playerGoalieStats(@Args('playerId', { type: () => Int }) playerId: number) {
    return this.playersService.playerGoalieStats(playerId);
  }

  @Query(() => [PlayerGameLogEntry], { description: 'Current-season game log for a player' })
  playerGameLog(
    @Args('playerId', { type: () => Int }) playerId: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.playersService.playerGameLog(playerId, limit);
  }

  @Mutation(() => Int, {
    description: 'Sync all team rosters and player stats from NHL API',
  })
  syncRosters(): Promise<number> {
    return this.playersSyncService.syncRosters();
  }
}
