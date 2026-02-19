import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Standing {
  @Field(() => Int)
  teamId!: number;

  @Field()
  teamName!: string;

  @Field({ nullable: true })
  teamLogo?: string;

  @Field(() => Int)
  season!: number;

  @Field(() => Int)
  gamesPlayed!: number;

  @Field(() => Int)
  wins!: number;

  @Field(() => Int)
  losses!: number;

  @Field(() => Int)
  otLosses!: number;

  @Field(() => Int)
  points!: number;

  @Field(() => Int)
  goalsFor!: number;

  @Field(() => Int)
  goalsAgainst!: number;

  @Field({ nullable: true })
  divisionName?: string;

  @Field(() => Int, { nullable: true })
  divisionRank?: number;

  @Field({ nullable: true })
  conferenceName?: string;

  @Field(() => Int, { nullable: true })
  conferenceRank?: number;

  @Field({ nullable: true })
  streakCode?: string;

  @Field(() => Int, { nullable: true })
  streakCount?: number;
}
