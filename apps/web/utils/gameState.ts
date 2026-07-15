import { GameState } from '~/graphql/generated';

const LIVE_STATES = [GameState.Live, GameState.Crit];
const FINAL_STATES = [GameState.Final, GameState.Off];
const UPCOMING_STATES = [GameState.Fut, GameState.Pre];

export const isLiveState = (state: GameState): boolean => LIVE_STATES.includes(state);
export const isFinalState = (state: GameState): boolean => FINAL_STATES.includes(state);
export const isUpcomingState = (state: GameState): boolean => UPCOMING_STATES.includes(state);
