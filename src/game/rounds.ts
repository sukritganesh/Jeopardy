import type { Board, Player } from './types';
import { clueKey } from './types';

/** Debug shortcut keeps full-game testing fast without changing board data. */
const DEBUG_ROUND_COMPLETION_TARGET = 1;

/** A round is complete when all clues are played, unless the debug shortcut is enabled. */
export function isRoundComplete(
  board: Board,
  roundIndex: number,
  selectedClueKeys: Set<string>,
  debugAdvanceAfterOneClue = false,
): boolean {
  const round = board.rounds[roundIndex];

  if (debugAdvanceAfterOneClue) {
    let playedClues = 0;

    for (const [categoryIndex, category] of round.categories.entries()) {
      for (const [clueIndex] of category.clues.entries()) {
        if (selectedClueKeys.has(clueKey({ roundIndex, categoryIndex, clueIndex }))) {
          playedClues += 1;
        }
      }
    }

    return playedClues >= DEBUG_ROUND_COMPLETION_TARGET;
  }

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
