import { Injectable, NotFoundException } from '@nestjs/common';
import { formatSeason, GameState } from '@nhl-app/shared';
import { CacheService } from '../cache';
import {
  gameStateTtl,
  NhlApiClient,
  type NhlGameLanding,
  type NhlGameRightRail,
  type NhlGameTeam,
  type NhlPenaltyPlayer,
  type NhlPeriodSplit,
  type NhlScoreNow,
} from '../common';
import { Game } from './game.model';
import {
  GameDetail,
  GameTeamSide,
  PenaltyCall,
  PeriodScore,
  ScoringPlay,
  TeamGameStat,
} from './game-detail.model';

@Injectable()
export class GamesLiveService {
  constructor(
    private readonly nhlApiClient: NhlApiClient,
    private readonly cacheService: CacheService,
  ) {}

  async gameDetail(gameId: number): Promise<GameDetail> {
    return this.cacheService.getOrSet(
      `game:detail:${gameId}`,
      () => this.fetchGameDetail(gameId),
      (detail) => gameStateTtl(detail.gameState),
    );
  }

  async gamesToday(): Promise<Game[]> {
    const date = this.easternToday();

    return this.cacheService.getOrSet(
      `games:today:${date}`,
      () => this.fetchGamesByDate(date),
      (todayGames) =>
        todayGames.length
          ? Math.min(...todayGames.map((game) => gameStateTtl(game.gameState)))
          : 300,
    );
  }

  private easternToday(): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private async fetchGamesByDate(date: string): Promise<Game[]> {
    const score = await this.nhlApiClient.getWeb<NhlScoreNow>(`/score/${date}`);

    return (score.games ?? []).map((game) => ({
      id: game.id,
      season: formatSeason(game.season),
      gameType: game.gameType,
      gameDate: game.gameDate,
      startTimeUTC: game.startTimeUTC,
      gameState: game.gameState as GameState,
      venue: game.venue?.default,
      homeTeamId: game.homeTeam.id,
      awayTeamId: game.awayTeam.id,
      homeTeamName: game.homeTeam.name?.default,
      homeTeamLogo: game.homeTeam.logo,
      awayTeamName: game.awayTeam.name?.default,
      awayTeamLogo: game.awayTeam.logo,
      homeScore: game.homeTeam.score,
      awayScore: game.awayTeam.score,
    }));
  }

  private async fetchGameDetail(gameId: number): Promise<GameDetail> {
    const [landing, rightRail] = await Promise.all([
      this.nhlApiClient
        .getWeb<NhlGameLanding>(`/gamecenter/${gameId}/landing`)
        .catch(() => null),
      this.nhlApiClient
        .getWeb<NhlGameRightRail>(`/gamecenter/${gameId}/right-rail`)
        .catch(() => null),
    ]);

    if (!landing) {
      throw new NotFoundException(`Game ${gameId} not found`);
    }

    return {
      id: landing.id,
      season: formatSeason(landing.season),
      gameType: landing.gameType,
      gameDate: landing.gameDate,
      startTimeUTC: landing.startTimeUTC,
      gameState: landing.gameState as GameState,
      venue: landing.venue?.default,
      currentPeriod: landing.periodDescriptor?.number,
      clockTimeRemaining: landing.clock?.timeRemaining,
      inIntermission: landing.clock?.inIntermission,
      homeTeam: this.mapTeam(landing.homeTeam),
      awayTeam: this.mapTeam(landing.awayTeam),
      periods: this.mapPeriods(rightRail),
      scoring: this.mapScoring(landing),
      penalties: this.mapPenalties(landing),
      teamStats: this.mapTeamStats(rightRail),
    };
  }

  private mapTeam(team: NhlGameTeam): GameTeamSide {
    return {
      id: team.id,
      name: team.name?.default ?? team.commonName?.default ?? team.abbrev,
      abbrev: team.abbrev,
      logo: team.logo,
      score: team.score,
      sog: team.sog,
    };
  }

  private mapPeriods(rightRail: NhlGameRightRail | null): PeriodScore[] {
    const byPeriod = rightRail?.linescore?.byPeriod ?? [];
    const shots = rightRail?.shotsByPeriod ?? [];

    const shotsFor = (period: NhlPeriodSplit) =>
      shots.find(
        (entry) =>
          entry.periodDescriptor.number === period.periodDescriptor.number,
      );

    return byPeriod.map((period) => {
      const periodShots = shotsFor(period);
      return {
        periodNumber: period.periodDescriptor.number,
        periodType: period.periodDescriptor.periodType,
        homeGoals: period.home,
        awayGoals: period.away,
        homeShots: periodShots?.home,
        awayShots: periodShots?.away,
      };
    });
  }

  private mapScoring(landing: NhlGameLanding): ScoringPlay[] {
    return (landing.summary?.scoring ?? []).flatMap((period) =>
      period.goals.map((goal) => ({
        periodNumber: period.periodDescriptor.number,
        timeInPeriod: goal.timeInPeriod,
        playerId: goal.playerId,
        scorerName: goal.name.default,
        headshot: goal.headshot,
        teamAbbrev: goal.teamAbbrev.default,
        isHome: goal.isHome,
        strength: goal.strength,
        shotType: goal.shotType,
        assists: goal.assists.map((assist) => ({
          playerId: assist.playerId,
          name: assist.name.default,
          assistsToDate: assist.assistsToDate,
        })),
        homeScore: goal.homeScore,
        awayScore: goal.awayScore,
      })),
    );
  }

  private mapPenalties(landing: NhlGameLanding): PenaltyCall[] {
    return (landing.summary?.penalties ?? []).flatMap((period) =>
      period.penalties.map((penalty) => ({
        periodNumber: period.periodDescriptor.number,
        timeInPeriod: penalty.timeInPeriod,
        type: penalty.type,
        duration: penalty.duration,
        descKey: penalty.descKey,
        teamAbbrev: penalty.teamAbbrev.default,
        committedBy: this.playerName(penalty.committedByPlayer),
        drawnBy: this.playerName(penalty.drawnBy),
      })),
    );
  }

  private playerName(player?: NhlPenaltyPlayer): string | undefined {
    if (!player) return undefined;
    return `${player.firstName.default} ${player.lastName.default}`;
  }

  private mapTeamStats(rightRail: NhlGameRightRail | null): TeamGameStat[] {
    return (rightRail?.teamGameStats ?? []).map((stat) => ({
      category: stat.category,
      homeValue: String(stat.homeValue),
      awayValue: String(stat.awayValue),
    }));
  }
}
