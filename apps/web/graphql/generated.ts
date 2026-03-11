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

export type Game = {
  __typename?: 'Game';
  awayScore?: Maybe<Scalars['Int']['output']>;
  awayTeamId: Scalars['Int']['output'];
  awayTeamLogo?: Maybe<Scalars['String']['output']>;
  awayTeamName?: Maybe<Scalars['String']['output']>;
  gameDate: Scalars['String']['output'];
  gameState: GameState;
  gameType: Scalars['Int']['output'];
  homeScore?: Maybe<Scalars['Int']['output']>;
  homeTeamId: Scalars['Int']['output'];
  homeTeamLogo?: Maybe<Scalars['String']['output']>;
  homeTeamName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  season: Scalars['String']['output'];
  startTimeUTC?: Maybe<Scalars['String']['output']>;
  venue?: Maybe<Scalars['String']['output']>;
};

export enum GameState {
  Crit = 'CRIT',
  Final = 'FINAL',
  Fut = 'FUT',
  Live = 'LIVE',
  Off = 'OFF',
  Pre = 'PRE'
}

export type GoalieSeasonStats = {
  __typename?: 'GoalieSeasonStats';
  firstName: Scalars['String']['output'];
  gamesPlayed: Scalars['Int']['output'];
  gamesStarted: Scalars['Int']['output'];
  goalsAgainst: Scalars['Int']['output'];
  goalsAgainstAvg?: Maybe<Scalars['Float']['output']>;
  headshot?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  losses: Scalars['Int']['output'];
  otLosses: Scalars['Int']['output'];
  playerId: Scalars['Int']['output'];
  savePctg?: Maybe<Scalars['Float']['output']>;
  saves: Scalars['Int']['output'];
  season: Scalars['String']['output'];
  shotsAgainst: Scalars['Int']['output'];
  shutouts: Scalars['Int']['output'];
  wins: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Sync all team schedules from NHL API */
  syncGames: Scalars['Int']['output'];
  /** Sync all team rosters and player stats from NHL API */
  syncRosters: Scalars['Int']['output'];
  /** Sync standings from NHL API to database */
  syncStandings: Scalars['Int']['output'];
  /** Sync teams from NHL API to database */
  syncTeams: Scalars['Int']['output'];
};

export type Player = {
  __typename?: 'Player';
  birthCountry?: Maybe<Scalars['String']['output']>;
  birthDate?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  headshot?: Maybe<Scalars['String']['output']>;
  heightCm?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  lastName: Scalars['String']['output'];
  positionCode: PositionCode;
  shootsCatches?: Maybe<Scalars['String']['output']>;
  sweaterNumber?: Maybe<Scalars['Int']['output']>;
  teamId: Scalars['Int']['output'];
  weightKg?: Maybe<Scalars['Int']['output']>;
};

export enum PositionCode {
  C = 'C',
  D = 'D',
  G = 'G',
  L = 'L',
  R = 'R'
}

export type Query = {
  __typename?: 'Query';
  /** All games on a given date */
  gamesByDate: Array<Game>;
  /** League standings, optionally filtered by season */
  standings: Array<Standing>;
  /** Single team by ID */
  team?: Maybe<Team>;
  /** Games for a specific team */
  teamGames: Array<Game>;
  /** Current season stats for goalies on a team */
  teamGoalieStats: Array<GoalieSeasonStats>;
  /** Team roster (all players) */
  teamRoster: Array<Player>;
  /** Current season stats for skaters on a team */
  teamSkaterStats: Array<SkaterSeasonStats>;
  /** All active NHL teams */
  teams: Array<Team>;
};


export type QueryGamesByDateArgs = {
  date: Scalars['String']['input'];
};


export type QueryStandingsArgs = {
  season?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTeamGamesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  teamId: Scalars['Int']['input'];
};


export type QueryTeamGoalieStatsArgs = {
  teamId: Scalars['Int']['input'];
};


export type QueryTeamRosterArgs = {
  teamId: Scalars['Int']['input'];
};


export type QueryTeamSkaterStatsArgs = {
  teamId: Scalars['Int']['input'];
};

export type SkaterSeasonStats = {
  __typename?: 'SkaterSeasonStats';
  assists: Scalars['Int']['output'];
  avgTimeOnIce?: Maybe<Scalars['Float']['output']>;
  faceoffWinPctg?: Maybe<Scalars['Float']['output']>;
  firstName: Scalars['String']['output'];
  gameWinningGoals: Scalars['Int']['output'];
  gamesPlayed: Scalars['Int']['output'];
  goals: Scalars['Int']['output'];
  headshot?: Maybe<Scalars['String']['output']>;
  lastName: Scalars['String']['output'];
  penaltyMinutes: Scalars['Int']['output'];
  playerId: Scalars['Int']['output'];
  plusMinus: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  positionCode: PositionCode;
  powerPlayGoals: Scalars['Int']['output'];
  season: Scalars['String']['output'];
  shootingPctg?: Maybe<Scalars['Float']['output']>;
  shorthandedGoals: Scalars['Int']['output'];
  shots: Scalars['Int']['output'];
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

export type GetTeamQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetTeamQuery = { __typename?: 'Query', team?: { __typename?: 'Team', id: number, fullName: string, triCode: string, logo?: string | null } | null };

export type GetTeamGamesQueryVariables = Exact<{
  teamId: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetTeamGamesQuery = { __typename?: 'Query', teamGames: Array<{ __typename?: 'Game', id: number, gameDate: string, startTimeUTC?: string | null, gameState: GameState, venue?: string | null, homeTeamId: number, awayTeamId: number, homeTeamName?: string | null, homeTeamLogo?: string | null, awayTeamName?: string | null, awayTeamLogo?: string | null, homeScore?: number | null, awayScore?: number | null }> };

export type GetTeamGoalieStatsQueryVariables = Exact<{
  teamId: Scalars['Int']['input'];
}>;


export type GetTeamGoalieStatsQuery = { __typename?: 'Query', teamGoalieStats: Array<{ __typename?: 'GoalieSeasonStats', playerId: number, firstName: string, lastName: string, headshot?: string | null, gamesPlayed: number, gamesStarted: number, wins: number, losses: number, otLosses: number, goalsAgainstAvg?: number | null, savePctg?: number | null, shutouts: number, shotsAgainst: number, saves: number, goalsAgainst: number }> };

export type GetTeamRosterQueryVariables = Exact<{
  teamId: Scalars['Int']['input'];
}>;


export type GetTeamRosterQuery = { __typename?: 'Query', teamRoster: Array<{ __typename?: 'Player', id: number, firstName: string, lastName: string, positionCode: PositionCode, sweaterNumber?: number | null, headshot?: string | null, shootsCatches?: string | null, heightCm?: number | null, weightKg?: number | null, birthDate?: string | null, birthCountry?: string | null }> };

export type GetTeamSkaterStatsQueryVariables = Exact<{
  teamId: Scalars['Int']['input'];
}>;


export type GetTeamSkaterStatsQuery = { __typename?: 'Query', teamSkaterStats: Array<{ __typename?: 'SkaterSeasonStats', playerId: number, firstName: string, lastName: string, headshot?: string | null, positionCode: PositionCode, gamesPlayed: number, goals: number, assists: number, points: number, plusMinus: number, penaltyMinutes: number, powerPlayGoals: number, shorthandedGoals: number, gameWinningGoals: number, shots: number, shootingPctg?: number | null, avgTimeOnIce?: number | null, faceoffWinPctg?: number | null }> };

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
export const GetTeamDocument = gql`
    query GetTeam($id: Int!) {
  team(id: $id) {
    id
    fullName
    triCode
    logo
  }
}
    `;

/**
 * __useGetTeamQuery__
 *
 * To run a query within a Vue component, call `useGetTeamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTeamQuery({
 *   id: // value for 'id'
 * });
 */
export function useGetTeamQuery(variables: GetTeamQueryVariables | VueCompositionApi.Ref<GetTeamQueryVariables> | ReactiveFunction<GetTeamQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamQuery, GetTeamQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamQuery, GetTeamQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamQuery, GetTeamQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTeamQuery, GetTeamQueryVariables>(GetTeamDocument, variables, options);
}
export function useGetTeamLazyQuery(variables?: GetTeamQueryVariables | VueCompositionApi.Ref<GetTeamQueryVariables> | ReactiveFunction<GetTeamQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamQuery, GetTeamQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamQuery, GetTeamQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamQuery, GetTeamQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTeamQuery, GetTeamQueryVariables>(GetTeamDocument, variables, options);
}
export type GetTeamQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTeamQuery, GetTeamQueryVariables>;
export const GetTeamGamesDocument = gql`
    query GetTeamGames($teamId: Int!, $limit: Int) {
  teamGames(teamId: $teamId, limit: $limit) {
    id
    gameDate
    startTimeUTC
    gameState
    venue
    homeTeamId
    awayTeamId
    homeTeamName
    homeTeamLogo
    awayTeamName
    awayTeamLogo
    homeScore
    awayScore
  }
}
    `;

/**
 * __useGetTeamGamesQuery__
 *
 * To run a query within a Vue component, call `useGetTeamGamesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamGamesQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTeamGamesQuery({
 *   teamId: // value for 'teamId'
 *   limit: // value for 'limit'
 * });
 */
export function useGetTeamGamesQuery(variables: GetTeamGamesQueryVariables | VueCompositionApi.Ref<GetTeamGamesQueryVariables> | ReactiveFunction<GetTeamGamesQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamGamesQuery, GetTeamGamesQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamGamesQuery, GetTeamGamesQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamGamesQuery, GetTeamGamesQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTeamGamesQuery, GetTeamGamesQueryVariables>(GetTeamGamesDocument, variables, options);
}
export function useGetTeamGamesLazyQuery(variables?: GetTeamGamesQueryVariables | VueCompositionApi.Ref<GetTeamGamesQueryVariables> | ReactiveFunction<GetTeamGamesQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamGamesQuery, GetTeamGamesQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamGamesQuery, GetTeamGamesQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamGamesQuery, GetTeamGamesQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTeamGamesQuery, GetTeamGamesQueryVariables>(GetTeamGamesDocument, variables, options);
}
export type GetTeamGamesQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTeamGamesQuery, GetTeamGamesQueryVariables>;
export const GetTeamGoalieStatsDocument = gql`
    query GetTeamGoalieStats($teamId: Int!) {
  teamGoalieStats(teamId: $teamId) {
    playerId
    firstName
    lastName
    headshot
    gamesPlayed
    gamesStarted
    wins
    losses
    otLosses
    goalsAgainstAvg
    savePctg
    shutouts
    shotsAgainst
    saves
    goalsAgainst
  }
}
    `;

/**
 * __useGetTeamGoalieStatsQuery__
 *
 * To run a query within a Vue component, call `useGetTeamGoalieStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamGoalieStatsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTeamGoalieStatsQuery({
 *   teamId: // value for 'teamId'
 * });
 */
export function useGetTeamGoalieStatsQuery(variables: GetTeamGoalieStatsQueryVariables | VueCompositionApi.Ref<GetTeamGoalieStatsQueryVariables> | ReactiveFunction<GetTeamGoalieStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>(GetTeamGoalieStatsDocument, variables, options);
}
export function useGetTeamGoalieStatsLazyQuery(variables?: GetTeamGoalieStatsQueryVariables | VueCompositionApi.Ref<GetTeamGoalieStatsQueryVariables> | ReactiveFunction<GetTeamGoalieStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>(GetTeamGoalieStatsDocument, variables, options);
}
export type GetTeamGoalieStatsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTeamGoalieStatsQuery, GetTeamGoalieStatsQueryVariables>;
export const GetTeamRosterDocument = gql`
    query GetTeamRoster($teamId: Int!) {
  teamRoster(teamId: $teamId) {
    id
    firstName
    lastName
    positionCode
    sweaterNumber
    headshot
    shootsCatches
    heightCm
    weightKg
    birthDate
    birthCountry
  }
}
    `;

/**
 * __useGetTeamRosterQuery__
 *
 * To run a query within a Vue component, call `useGetTeamRosterQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamRosterQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTeamRosterQuery({
 *   teamId: // value for 'teamId'
 * });
 */
export function useGetTeamRosterQuery(variables: GetTeamRosterQueryVariables | VueCompositionApi.Ref<GetTeamRosterQueryVariables> | ReactiveFunction<GetTeamRosterQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamRosterQuery, GetTeamRosterQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamRosterQuery, GetTeamRosterQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamRosterQuery, GetTeamRosterQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTeamRosterQuery, GetTeamRosterQueryVariables>(GetTeamRosterDocument, variables, options);
}
export function useGetTeamRosterLazyQuery(variables?: GetTeamRosterQueryVariables | VueCompositionApi.Ref<GetTeamRosterQueryVariables> | ReactiveFunction<GetTeamRosterQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamRosterQuery, GetTeamRosterQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamRosterQuery, GetTeamRosterQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamRosterQuery, GetTeamRosterQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTeamRosterQuery, GetTeamRosterQueryVariables>(GetTeamRosterDocument, variables, options);
}
export type GetTeamRosterQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTeamRosterQuery, GetTeamRosterQueryVariables>;
export const GetTeamSkaterStatsDocument = gql`
    query GetTeamSkaterStats($teamId: Int!) {
  teamSkaterStats(teamId: $teamId) {
    playerId
    firstName
    lastName
    headshot
    positionCode
    gamesPlayed
    goals
    assists
    points
    plusMinus
    penaltyMinutes
    powerPlayGoals
    shorthandedGoals
    gameWinningGoals
    shots
    shootingPctg
    avgTimeOnIce
    faceoffWinPctg
  }
}
    `;

/**
 * __useGetTeamSkaterStatsQuery__
 *
 * To run a query within a Vue component, call `useGetTeamSkaterStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTeamSkaterStatsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetTeamSkaterStatsQuery({
 *   teamId: // value for 'teamId'
 * });
 */
export function useGetTeamSkaterStatsQuery(variables: GetTeamSkaterStatsQueryVariables | VueCompositionApi.Ref<GetTeamSkaterStatsQueryVariables> | ReactiveFunction<GetTeamSkaterStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>(GetTeamSkaterStatsDocument, variables, options);
}
export function useGetTeamSkaterStatsLazyQuery(variables?: GetTeamSkaterStatsQueryVariables | VueCompositionApi.Ref<GetTeamSkaterStatsQueryVariables> | ReactiveFunction<GetTeamSkaterStatsQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>(GetTeamSkaterStatsDocument, variables, options);
}
export type GetTeamSkaterStatsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetTeamSkaterStatsQuery, GetTeamSkaterStatsQueryVariables>;
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