import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { SeasonPhase } from '@nhl-app/shared';

registerEnumType(SeasonPhase, { name: 'SeasonPhase' });

export { SeasonPhase };

@ObjectType()
export class Season {
  @Field()
  id!: string;

  @Field(() => Int)
  nhlSeasonId!: number;

  @Field()
  startDate!: string;

  @Field({ nullable: true })
  regularEndDate?: string;

  @Field({ nullable: true })
  endDate?: string;

  @Field(() => SeasonPhase)
  phase!: SeasonPhase;

  @Field(() => Int, { nullable: true })
  numTeams?: number;

  @Field(() => Int, { nullable: true })
  championTeamId?: number;

  @Field(() => Boolean)
  isCurrent!: boolean;
}
