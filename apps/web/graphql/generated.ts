import gql from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from '@vue/apollo-composable';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type ReactiveFunction<TParam> = () => TParam;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Sync teams from NHL API to database */
  syncTeams: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  team?: Maybe<Team>;
  teams: Array<Team>;
};


export type QueryTeamArgs = {
  id: Scalars['Int']['input'];
};

export type Team = {
  __typename?: 'Team';
  franchiseId?: Maybe<Scalars['Int']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  triCode: Scalars['String']['output'];
};

export type GetTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsQuery = { __typename?: 'Query', teams: Array<{ __typename?: 'Team', id: number, fullName: string, triCode: string, logo?: string | null }> };


export const GetTeamsDocument = gql`
    query GetTeams {
  teams {
    id
    fullName
    triCode
    logo
  }
}
    `;

/**
 * __useGetTeamsQuery__
 *
 * To run a query within a Vue component, call `useGetTeamsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTeamsQuery();
 */
export function useGetTeamsQuery(options: VueApolloComposable.UseQueryOptions<GetTeamsQuery, GetTeamsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamsQuery, GetTeamsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamsQuery, GetTeamsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTeamsQuery, GetTeamsQueryVariables>(GetTeamsDocument, {}, options);
}
export function useGetTeamsLazyQuery(options: VueApolloComposable.UseQueryOptions<GetTeamsQuery, GetTeamsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamsQuery, GetTeamsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamsQuery, GetTeamsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTeamsQuery, GetTeamsQueryVariables>(GetTeamsDocument, {}, options);
}
export type GetTeamsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTeamsQuery, GetTeamsQueryVariables>;