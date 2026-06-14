import type { Round } from './types';

export const MIN_DAILY_DOUBLE_WAGER = 5;

/** Daily Double max is the larger of player score or the round's highest clue value. */
export function getDailyDoubleMaxWager(playerScore: number, round: Round): number {
  return Math.max(playerScore, Math.max(...round.values));
}
