import type { Board, Player, SelectedClue } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type BoardScreenProps = {
  board: Board;
  currentRoundIndex: number;
  players: Player[];
  controllingPlayerId: string;
  selectedClueKeys: Set<string>;
  onSelectClue: (selection: SelectedClue) => void;
};

export function BoardScreen({
  board,
  currentRoundIndex,
  players,
  controllingPlayerId,
  selectedClueKeys,
  onSelectClue,
}: BoardScreenProps) {
  const round = board.rounds[currentRoundIndex];
  const controllingPlayer = players.find((player) => player.id === controllingPlayerId);

  return (
    <main className="game-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">{board.title}</p>
          <h1>{round.name}</h1>
        </div>
        <div className="control-pill">
          <span>Control</span>
          <strong>{controllingPlayer?.name ?? 'Unknown'}</strong>
        </div>
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={controllingPlayerId} />

      <section className="board-grid" aria-label={`${round.name} board`}>
        {round.categories.map((category) => (
          <div className="category-header" key={category.title}>
            {category.title}
          </div>
        ))}

        {round.values.map((value, rowIndex) =>
          round.categories.map((category, categoryIndex) => {
            const clue = category.clues[rowIndex];
            const selection = { roundIndex: currentRoundIndex, categoryIndex, clueIndex: rowIndex };
            const key = `${selection.roundIndex}:${selection.categoryIndex}:${selection.clueIndex}`;
            const isSelected = selectedClueKeys.has(key);

            return (
              <button
                className="clue-tile"
                type="button"
                key={`${category.title}-${value}`}
                disabled={isSelected}
                onClick={() => onSelectClue(selection)}
              >
                {isSelected ? <span>Done</span> : <span>${clue.value}</span>}
              </button>
            );
          }),
        )}
      </section>
    </main>
  );
}
