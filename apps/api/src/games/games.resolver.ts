import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GamesService } from './games.service';
import { GamesSyncService } from './games-sync.service';
import { GamesLiveService } from './games-live.service';
import { Game } from './game.model';
import { GameDetail } from './game-detail.model';

@Resolver()
export class GamesResolver {
  constructor(
    private readonly gamesService: GamesService,
    private readonly gamesSyncService: GamesSyncService,
    private readonly gamesLiveService: GamesLiveService,
  ) {}

  @Query(() => [Game], { description: 'Games for a specific team' })
  teamGames(
    @Args('teamId', { type: () => Int }) teamId: number,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit: number,
  ) {
    return this.gamesService.teamGames(teamId, limit);
  }

  @Query(() => [Game], { description: 'All games on a given date' })
  gamesByDate(@Args('date', { description: 'YYYY-MM-DD' }) date: string) {
    return this.gamesService.gamesByDate(date);
  }

  @Query(() => [Game], {
    description: "Today's games with live scores, straight from NHL API",
  })
  gamesToday(): Promise<Game[]> {
    return this.gamesLiveService.gamesToday();
  }

  @Query(() => GameDetail, {
    description: 'Live game detail — linescore, goals, penalties, team stats',
  })
  gameDetail(@Args('id', { type: () => Int }) id: number): Promise<GameDetail> {
    return this.gamesLiveService.gameDetail(id);
  }

  @Mutation(() => Int, {
    description: 'Sync all team schedules from NHL API',
  })
  syncGames(): Promise<number> {
    return this.gamesSyncService.syncGames();
  }
}
