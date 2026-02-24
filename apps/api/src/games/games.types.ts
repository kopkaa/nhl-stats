interface NhlLocalizedString {
  default: string;
}

interface NhlScheduleTeam {
  id: number;
  abbrev: string;
  logo: string;
  score?: number;
}

export interface NhlScheduleGame {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  startTimeUTC: string;
  gameState: string;
  venue: NhlLocalizedString;
  homeTeam: NhlScheduleTeam;
  awayTeam: NhlScheduleTeam;
}

export interface NhlClubScheduleResponse {
  games: NhlScheduleGame[];
}
