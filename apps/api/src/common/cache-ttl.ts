import { GameState } from '@nhl-app/shared';

export const CACHE_TTL = {
  TEAMS: 86400, // 24h
  STANDINGS: 43200, // 12h
  PLAYERS: 43200, // 12h
  GAMES: 3600, // 1h
  LEADERS: 43200, // 12h
} as const;

const LIVE_GAME_TTL = {
  IN_PROGRESS: 20,
  FINISHED: 86400,
  SCHEDULED: 300,
} as const;

export function gameStateTtl(gameState: GameState): number {
  switch (gameState) {
    case GameState.LIVE:
    case GameState.CRIT:
      return LIVE_GAME_TTL.IN_PROGRESS;
    case GameState.FINAL:
    case GameState.OFF:
      return LIVE_GAME_TTL.FINISHED;
    default:
      return LIVE_GAME_TTL.SCHEDULED;
  }
}
