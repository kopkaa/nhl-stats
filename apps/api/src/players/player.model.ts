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
