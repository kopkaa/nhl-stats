import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { GameState } from '@nhl-app/shared';

registerEnumType(GameState, { name: 'GameState' });

@ObjectType()
export class Game {
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

  @Field(() => Int)
  homeTeamId!: number;

  @Field(() => Int)
  awayTeamId!: number;

  @Field({ nullable: true })
  homeTeamName?: string;

  @Field({ nullable: true })
  homeTeamLogo?: string;

  @Field({ nullable: true })
  awayTeamName?: string;

  @Field({ nullable: true })
  awayTeamLogo?: string;

  @Field(() => Int, { nullable: true })
  homeScore?: number;

  @Field(() => Int, { nullable: true })
  awayScore?: number;
}
