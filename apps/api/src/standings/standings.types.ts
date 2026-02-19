export interface NhlStandingsApiResponse {
  standings: NhlStandingEntry[];
}

export interface NhlStandingEntry {
  teamName: { default: string };
  teamAbbrev: { default: string };
  teamLogo: string;
  seasonId: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalFor: number;
  goalAgainst: number;
  divisionName: string;
  divisionSequence: number;
  conferenceName: string;
  conferenceSequence: number;
  streakCode: string;
  streakCount: number;
}
