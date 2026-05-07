import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { PositionCode } from '@nhl-app/shared';

registerEnumType(PositionCode, { name: 'PositionCode' });

@ObjectType()
export class Player {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  teamId!: number;

  @Field({ nullable: true })
  teamName?: string;

  @Field({ nullable: true })
  teamLogo?: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field(() => PositionCode)
  positionCode!: PositionCode;

  @Field(() => Int, { nullable: true })
  sweaterNumber?: number;

  @Field({ nullable: true })
  headshot?: string;

  @Field({ nullable: true })
  shootsCatches?: string;

  @Field(() => Int, { nullable: true })
  heightCm?: number;

  @Field(() => Int, { nullable: true })
  weightKg?: number;

  @Field({ nullable: true })
  birthDate?: string;

  @Field({ nullable: true })
  birthCountry?: string;
}

@ObjectType()
export class PlayerGameLogEntry {
  @Field(() => Int)
  gameId!: number;

  @Field()
  gameDate!: string;

  @Field({ nullable: true })
  teamAbbrev?: string;

  @Field({ nullable: true })
  opponentAbbrev?: string;

  @Field({ nullable: true })
  homeRoadFlag?: string;

  @Field({ nullable: true })
  toi?: string;

  // Skater fields
  @Field(() => Int, { nullable: true })
  goals?: number;

  @Field(() => Int, { nullable: true })
  assists?: number;

  @Field(() => Int, { nullable: true })
  points?: number;

  @Field(() => Int, { nullable: true })
  plusMinus?: number;

  @Field(() => Int, { nullable: true })
  shots?: number;

  @Field(() => Int, { nullable: true })
  pim?: number;

  @Field(() => Int, { nullable: true })
  powerPlayGoals?: number;

  @Field(() => Int, { nullable: true })
  gameWinningGoals?: number;

  // Goalie fields
  @Field({ nullable: true })
  decision?: string;

  @Field(() => Int, { nullable: true })
  saves?: number;

  @Field(() => Int, { nullable: true })
  shotsAgainst?: number;

  @Field(() => Int, { nullable: true })
  goalsAgainst?: number;

  @Field(() => Float, { nullable: true })
  savePctg?: number;
}

@ObjectType()
export class SkaterSeasonStats {
  @Field(() => Int)
  playerId!: number;

  @Field()
  season!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  headshot?: string;

  @Field(() => PositionCode)
  positionCode!: PositionCode;

  @Field(() => Int)
  gamesPlayed!: number;

  @Field(() => Int)
  goals!: number;

  @Field(() => Int)
  assists!: number;

  @Field(() => Int)
  points!: number;

  @Field(() => Int)
  plusMinus!: number;

  @Field(() => Int)
  penaltyMinutes!: number;

  @Field(() => Int)
  powerPlayGoals!: number;

  @Field(() => Int)
  shorthandedGoals!: number;

  @Field(() => Int)
  gameWinningGoals!: number;

  @Field(() => Int)
  shots!: number;

  @Field(() => Float, { nullable: true })
  shootingPctg?: number;

  @Field(() => Float, { nullable: true })
  avgTimeOnIce?: number;

  @Field(() => Float, { nullable: true })
  faceoffWinPctg?: number;
}

@ObjectType()
export class GoalieSeasonStats {
  @Field(() => Int)
  playerId!: number;

  @Field()
  season!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  headshot?: string;

  @Field(() => Int)
  gamesPlayed!: number;

  @Field(() => Int)
  gamesStarted!: number;

  @Field(() => Int)
  wins!: number;

  @Field(() => Int)
  losses!: number;

  @Field(() => Int)
  otLosses!: number;

  @Field(() => Float, { nullable: true })
  goalsAgainstAvg?: number;

  @Field(() => Float, { nullable: true })
  savePctg?: number;

  @Field(() => Int)
  shutouts!: number;

  @Field(() => Int)
  shotsAgainst!: number;

  @Field(() => Int)
  saves!: number;

  @Field(() => Int)
  goalsAgainst!: number;
}
