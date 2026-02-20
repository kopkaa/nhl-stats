import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Conference, Division, StreakCode } from '@nhl-app/enums';

registerEnumType(Conference, { name: 'Conference' });
registerEnumType(Division, { name: 'Division' });
registerEnumType(StreakCode, { name: 'StreakCode' });

export { Conference, Division, StreakCode };

@ObjectType()
export class Standing {
  @Field(() => Int)
  teamId!: number;

  @Field()
  teamName!: string;

  @Field({ nullable: true })
  teamLogo?: string;

  @Field()
  season!: string;

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

  @Field(() => Division, { nullable: true })
  divisionName?: Division;

  @Field(() => Int, { nullable: true })
  divisionRank?: number;

  @Field(() => Conference, { nullable: true })
  conferenceName?: Conference;

  @Field(() => Int, { nullable: true })
  conferenceRank?: number;

  @Field(() => StreakCode, { nullable: true })
  streakCode?: StreakCode;

  @Field(() => Int, { nullable: true })
  streakCount?: number;
}
