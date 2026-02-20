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

export enum Conference {
  Eastern = 'Eastern',
  Western = 'Western'
}

export enum Division {
  Atlantic = 'Atlantic',
  Central = 'Central',
  Metropolitan = 'Metropolitan',
  Pacific = 'Pacific'
}

export type Mutation = {
  __typename?: 'Mutation';
  /** Sync standings from NHL API to database */
  syncStandings: Scalars['Int']['output'];
  /** Sync teams from NHL API to database */
  syncTeams: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  standings: Array<Standing>;
  team?: Maybe<Team>;
  teams: Array<Team>;
};


export type QueryStandingsArgs = {
  season?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['Int']['input'];
};

export type Standing = {
  __typename?: 'Standing';
  conferenceName?: Maybe<Conference>;
  conferenceRank?: Maybe<Scalars['Int']['output']>;
  divisionName?: Maybe<Division>;
  divisionRank?: Maybe<Scalars['Int']['output']>;
  gamesPlayed: Scalars['Int']['output'];
  goalsAgainst: Scalars['Int']['output'];
  goalsFor: Scalars['Int']['output'];
  losses: Scalars['Int']['output'];
  otLosses: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  season: Scalars['String']['output'];
  streakCode?: Maybe<StreakCode>;
  streakCount?: Maybe<Scalars['Int']['output']>;
  teamId: Scalars['Int']['output'];
  teamLogo?: Maybe<Scalars['String']['output']>;
  teamName: Scalars['String']['output'];
  wins: Scalars['Int']['output'];
};

export enum StreakCode {
  L = 'L',
  Ot = 'OT',
  W = 'W'
}

export type Team = {
  __typename?: 'Team';
  franchiseId?: Maybe<Scalars['Int']['output']>;
  fullName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  triCode: Scalars['String']['output'];
};

export type GetStandingsQueryVariables = Exact<{
  season?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetStandingsQuery = { __typename?: 'Query', standings: Array<{ __typename?: 'Standing', teamId: number, teamName: string, teamLogo?: string | null, season: string, gamesPlayed: number, wins: number, losses: number, otLosses: number, points: number, goalsFor: number, goalsAgainst: number, divisionName?: Division | null, divisionRank?: number | null, conferenceName?: Conference | null, conferenceRank?: number | null, streakCode?: StreakCode | null, streakCount?: number | null }> };

export type GetTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTeamsQuery = { __typename?: 'Query', teams: Array<{ __typename?: 'Team', id: number, fullName: string, triCode: string, logo?: string | null }> };


export const GetStandingsDocument = gql`
    query GetStandings($season: String) {
  standings(season: $season) {
    teamId
    teamName
    teamLogo
    season
    gamesPlayed
    wins
    losses
    otLosses
    points
    goalsFor
    goalsAgainst
    divisionName
    divisionRank
    conferenceName
    conferenceRank
    streakCode
    streakCount
  }
}
    `;

/**
 * __useGetStandingsQuery__
 *
 * To run a query within a Vue component, call `useGetStandingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStandingsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetStandingsQuery({
 *   season: // value for 'season'
 * });
 */
export function useGetStandingsQuery(variables: GetStandingsQueryVariables | VueCompositionApi.Ref<GetStandingsQueryVariables> | ReactiveFunction<GetStandingsQueryVariables> = {}, options: VueApolloComposable.UseQueryOptions<GetStandingsQuery, GetStandingsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetStandingsQuery, GetStandingsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetStandingsQuery, GetStandingsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetStandingsQuery, GetStandingsQueryVariables>(GetStandingsDocument, variables, options);
}
export function useGetStandingsLazyQuery(variables: GetStandingsQueryVariables | VueCompositionApi.Ref<GetStandingsQueryVariables> | ReactiveFunction<GetStandingsQueryVariables> = {}, options: VueApolloComposable.UseQueryOptions<GetStandingsQuery, GetStandingsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetStandingsQuery, GetStandingsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetStandingsQuery, GetStandingsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetStandingsQuery, GetStandingsQueryVariables>(GetStandingsDocument, variables, options);
}
export type GetStandingsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetStandingsQuery, GetStandingsQueryVariables>;
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