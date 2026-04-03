import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { PositionCode } from '@nhl-app/shared';

@ObjectType()
export class SkaterLeaderEntry {
  @Field(() => Int)
  playerId!: number;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  headshot?: string;

  @Field(() => PositionCode)
  positionCode!: PositionCode;

  @Field()
  teamName!: string;

  @Field({ nullable: true })
  teamLogo?: string;

  @Field(() => Int)
  value!: number;
}

@ObjectType()
export class GoalieLeaderEntry {
  @Field(() => Int)
  playerId!: number;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  headshot?: string;

  @Field()
  teamName!: string;

  @Field({ nullable: true })
  teamLogo?: string;

  @Field(() => Float)
  value!: number;
}

@ObjectType()
export class SkaterLeaders {
  @Field(() => [SkaterLeaderEntry])
  goals!: SkaterLeaderEntry[];

  @Field(() => [SkaterLeaderEntry])
  assists!: SkaterLeaderEntry[];

  @Field(() => [SkaterLeaderEntry])
  points!: SkaterLeaderEntry[];
}

@ObjectType()
export class GoalieLeaders {
  @Field(() => [GoalieLeaderEntry])
  wins!: GoalieLeaderEntry[];

  @Field(() => [GoalieLeaderEntry])
  savePctg!: GoalieLeaderEntry[];

  @Field(() => [GoalieLeaderEntry])
  shutouts!: GoalieLeaderEntry[];
}
