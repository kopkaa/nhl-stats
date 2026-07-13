export interface NhlLocalizedString {
  default: string;
}

export interface NhlPeriodDescriptor {
  number: number;
  periodType: string;
  maxRegulationPeriods?: number;
}

export interface NhlGameClock {
  timeRemaining: string;
  secondsRemaining: number;
  running: boolean;
  inIntermission: boolean;
}

export interface NhlGameTeam {
  id: number;
  name?: NhlLocalizedString;
  commonName?: NhlLocalizedString;
  placeName?: NhlLocalizedString;
  abbrev: string;
  score?: number;
  sog?: number;
  logo?: string;
}

export interface NhlGoalAssist {
  playerId: number;
  name: NhlLocalizedString;
  assistsToDate?: number;
}

export interface NhlGoal {
  playerId: number;
  name: NhlLocalizedString;
  headshot?: string;
  teamAbbrev: NhlLocalizedString;
  isHome: boolean;
  strength?: string;
  shotType?: string;
  goalModifier?: string;
  timeInPeriod: string;
  homeScore: number;
  awayScore: number;
  assists: NhlGoalAssist[];
}

export interface NhlScoringPeriod {
  periodDescriptor: NhlPeriodDescriptor;
  goals: NhlGoal[];
}

export interface NhlPenaltyPlayer {
  firstName: NhlLocalizedString;
  lastName: NhlLocalizedString;
  sweaterNumber?: number;
}

export interface NhlPenalty {
  timeInPeriod: string;
  type: string;
  duration?: number;
  descKey: string;
  teamAbbrev: NhlLocalizedString;
  committedByPlayer?: NhlPenaltyPlayer;
  drawnBy?: NhlPenaltyPlayer;
}

export interface NhlPenaltyPeriod {
  periodDescriptor: NhlPeriodDescriptor;
  penalties: NhlPenalty[];
}

export interface NhlGameLanding {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  startTimeUTC?: string;
  venue?: NhlLocalizedString;
  gameState: string;
  periodDescriptor?: NhlPeriodDescriptor;
  clock?: NhlGameClock;
  homeTeam: NhlGameTeam;
  awayTeam: NhlGameTeam;
  summary?: {
    scoring?: NhlScoringPeriod[];
    penalties?: NhlPenaltyPeriod[];
  };
}

export interface NhlPeriodSplit {
  periodDescriptor: NhlPeriodDescriptor;
  home: number;
  away: number;
}

export interface NhlTeamGameStat {
  category: string;
  homeValue: string | number;
  awayValue: string | number;
}

export interface NhlGameRightRail {
  linescore?: {
    byPeriod: NhlPeriodSplit[];
    totals: { home: number; away: number };
  };
  shotsByPeriod?: NhlPeriodSplit[];
  teamGameStats?: NhlTeamGameStat[];
}

export interface NhlScoreNowGame {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  startTimeUTC?: string;
  venue?: NhlLocalizedString;
  gameState: string;
  homeTeam: NhlGameTeam;
  awayTeam: NhlGameTeam;
}

export interface NhlScoreNow {
  currentDate: string;
  games: NhlScoreNowGame[];
}
