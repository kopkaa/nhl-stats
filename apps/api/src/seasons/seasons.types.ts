export interface NhlStandingsSeasonResponse {
  currentDate: string;
  seasons: NhlSeasonEntry[];
}

export interface NhlSeasonEntry {
  id: number;
  standingsStart: string;
  standingsEnd: string;
}
