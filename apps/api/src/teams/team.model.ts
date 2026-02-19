import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Team {
  @Field(() => Int)
  id!: number;

  @Field(() => Int, { nullable: true })
  franchiseId!: number | null;

  @Field()
  fullName!: string;

  @Field()
  triCode!: string;

  @Field({ nullable: true })
  logo?: string;
}
