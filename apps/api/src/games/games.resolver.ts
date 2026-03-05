import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GamesService } from './games.service';
import { GamesSyncService } from './games-sync.service';
import { Game } from './game.model';

@Resolver()
export class GamesResolver {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gamesSyncService: GamesSyncService,
  ) {}

  @Query(() => [Game])
  teamGames(
    @Args('teamId', { type: () => Int }) teamId: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
  ) {
    return this.gamesService.teamGames(teamId, limit);
  }

  @Query(() => [Game])
  gamesByDate(
    @Args('date', { description: 'YYYY-MM-DD' }) date: string,
  ) {
    return this.gamesService.gamesByDate(date);
  }

  @Mutation(() => Int, {
    description: 'Sync all team schedules from NHL API',
  })
  syncGames(): Promise<number> {
    return this.gamesSyncService.syncGames();
  }
}
