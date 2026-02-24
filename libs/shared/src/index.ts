export enum Conference {
  Eastern = 'Eastern',
  Western = 'Western',
}

export enum Division {
  Atlantic = 'Atlantic',
  Metropolitan = 'Metropolitan',
  Central = 'Central',
  Pacific = 'Pacific',
}

export enum StreakCode {
  W = 'W',
  L = 'L',
  OT = 'OT',
}

export enum PositionCode {
  C = 'C',
  L = 'L',
  R = 'R',
  D = 'D',
  G = 'G',
}

export enum GameState {
  FUT = 'FUT',
  PRE = 'PRE',
  LIVE = 'LIVE',
  FINAL = 'FINAL',
  OFF = 'OFF',
  CRIT = 'CRIT',
}

export const PLAYOFF_SPOTS_PER_CONFERENCE = 8;
export const PLAYOFF_SPOTS_TOTAL = 16;

export function formatSeason(seasonId: number): string {
  const s = seasonId.toString();
  return `${s.slice(0, 4)}-${s.slice(6)}`;
}
