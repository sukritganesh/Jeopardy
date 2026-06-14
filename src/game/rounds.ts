import type { Board, Player } from './types';
import { clueKey } from './types';

/** A round is complete when every clue coordinate in that round has been marked played. */
export function isRoundComplete(board: Board, roundIndex: number, selectedClueKeys: Set<string>): boolean {
  const round = board.rounds[roundIndex];

  return round.categories.every((category, categoryIndex) =>
    category.clues.every((_, clueIndex) =>
      selectedClueKeys.has(clueKey({ roundIndex, categoryIndex, clueIndex })),
    ),
  );
}

/** Double Jeopardy starts with the active player who has the lowest score. */
export function getLowestScoringPlayer(players: Player[]): Player | undefined {
  return players
    .filter((player) => player.isActive)
    .reduce<Player | undefined>((lowestPlayer, player) => {
      if (lowestPlayer === undefined || player.score < lowestPlayer.score) {
        return player;
      }

      return lowestPlayer;
    }, undefined);
}
