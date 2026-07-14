import { ObjectType, Field, Int } from '@nestjs/graphql';
import { GameState } from '@nhl-app/shared';

@ObjectType()
export class GameTeamSide {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  abbrev!: string;

  @Field({ nullable: true })
  logo?: string;

  @Field(() => Int, { nullable: true })
  score?: number;

  @Field(() => Int, { nullable: true })
  sog?: number;
}

@ObjectType()
export class PeriodScore {
  @Field(() => Int)
  periodNumber!: number;

  @Field({ description: 'REG | OT | SO' })
  periodType!: string;

  @Field(() => Int)
  homeGoals!: number;

  @Field(() => Int)
  awayGoals!: number;

  @Field(() => Int, { nullable: true })
  homeShots?: number;

  @Field(() => Int, { nullable: true })
  awayShots?: number;
}

@ObjectType()
export class GoalAssist {
  @Field(() => Int)
  playerId!: number;

  @Field()
  name!: string;

  @Field(() => Int, { nullable: true })
  assistsToDate?: number;
}

@ObjectType()
export class ScoringPlay {
  @Field(() => Int)
  periodNumber!: number;

  @Field()
  timeInPeriod!: string;

  @Field(() => Int)
  playerId!: number;

  @Field()
  scorerName!: string;

  @Field({ nullable: true })
  headshot?: string;

  @Field()
  teamAbbrev!: string;

  @Field()
  isHome!: boolean;

  @Field({ nullable: true, description: 'ev | pp | sh' })
  strength?: string;

  @Field({ nullable: true })
  shotType?: string;

  @Field(() => [GoalAssist])
  assists!: GoalAssist[];

  @Field(() => Int)
  homeScore!: number;

  @Field(() => Int)
  awayScore!: number;
}

@ObjectType()
export class PenaltyCall {
  @Field(() => Int)
  periodNumber!: number;

  @Field()
  timeInPeriod!: string;

  @Field({ description: 'MIN | MAJ | MISC | BEN' })
  type!: string;

  @Field(() => Int, { nullable: true })
  duration?: number;

  @Field({ description: 'tripping, hooking, ...' })
  descKey!: string;

  @Field()
  teamAbbrev!: string;

  @Field({ nullable: true })
  committedBy?: string;

  @Field({ nullable: true })
  drawnBy?: string;
}

@ObjectType()
export class TeamGameStat {
  @Field({ description: 'sog, faceoffWinningPctg, powerPlay, hits, ...' })
  category!: string;

  @Field()
  homeValue!: string;

  @Field()
  awayValue!: string;
}

@ObjectType()
export class GameDetail {
  @Field(() => Int)
  id!: number;

  @Field()
  season!: string;

  @Field(() => Int)
  gameType!: number;

  @Field()
  gameDate!: string;

  @Field({ nullable: true })
  startTimeUTC?: string;

  @Field(() => GameState)
  gameState!: GameState;

  @Field({ nullable: true })
  venue?: string;

  @Field(() => Int, { nullable: true })
  currentPeriod?: number;

  @Field({ nullable: true })
  clockTimeRemaining?: string;

  @Field({ nullable: true })
  inIntermission?: boolean;

  @Field(() => GameTeamSide)
  homeTeam!: GameTeamSide;

  @Field(() => GameTeamSide)
  awayTeam!: GameTeamSide;

  @Field(() => [PeriodScore])
  periods!: PeriodScore[];

  @Field(() => [ScoringPlay])
  scoring!: ScoringPlay[];

  @Field(() => [PenaltyCall])
  penalties!: PenaltyCall[];

  @Field(() => [TeamGameStat])
  teamStats!: TeamGameStat[];
}
