import type { Player } from './types';

export type FinalWagers = Record<string, number>;

export type FinalJudgments = Record<string, boolean>;

/** Standard eligibility is positive score; fallback keeps party games playable. */
export function getFinalJeopardyPlayers(players: Player[]): Player[] {
  const activePlayers = players.filter((player) => player.isActive);
  const positiveScorePlayers = activePlayers.filter((player) => player.score > 0);

  return positiveScorePlayers.length > 0 ? positiveScorePlayers : activePlayers;
}

export function applyFinalJeopardyScores(
  players: Player[],
  wagers: FinalWagers,
  judgments: FinalJudgments,
): Player[] {
  return players.map((player) => {
    const wager = wagers[player.id] ?? 0;

    if (!(player.id in judgments)) {
      return player;
    }

    return {
      ...player,
      score: player.score + (judgments[player.id] ? wager : -wager),
    };
  });
}
