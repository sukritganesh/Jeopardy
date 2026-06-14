import type { Board, Player, SelectedClue } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type ClueScreenProps = {
  board: Board;
  selection: SelectedClue;
  players: Player[];
  controllingPlayerId: string;
  attemptedPlayerIds: Set<string>;
  onCorrect: (playerId: string) => void;
  onIncorrect: (playerId: string) => void;
  onEndClue: () => void;
};

export function ClueScreen({
  board,
  selection,
  players,
  controllingPlayerId,
  attemptedPlayerIds,
  onCorrect,
  onIncorrect,
  onEndClue,
}: ClueScreenProps) {
  const round = board.rounds[selection.roundIndex];
  const category = round.categories[selection.categoryIndex];
  const clue = category.clues[selection.clueIndex];
  const activePlayers = clue.dailyDouble
    ? players.filter((player) => player.id === controllingPlayerId)
    : players.filter((player) => player.isActive);

  return (
    <main className="game-shell clue-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">{category.title}</p>
          <h1>${clue.value}</h1>
        </div>
        {clue.dailyDouble && <div className="daily-double-badge">Daily Double</div>}
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={controllingPlayerId} />

      <section className="clue-card" aria-labelledby="clue-heading">
        <p className="eyebrow" id="clue-heading">
          Clue
        </p>
        <p className="clue-text">{clue.clue}</p>
        <div className="response-strip">
          <span>Correct response</span>
          <strong>{clue.correctResponse}</strong>
        </div>
      </section>

      <section className="host-panel" aria-label="Host scoring controls">
        <div className="host-panel-heading">
          <h2>Host Scoring</h2>
          <p>Temporary controls until buzzer logic is wired.</p>
        </div>

        <div className="host-action-grid">
          {activePlayers.map((player) => (
            <article className="host-player-row" key={player.id}>
              <strong>
                {player.name}
                {attemptedPlayerIds.has(player.id) && <span>Locked out</span>}
              </strong>
              <div>
                <button
                  type="button"
                  disabled={attemptedPlayerIds.has(player.id)}
                  onClick={() => onCorrect(player.id)}
                >
                  Correct
                </button>
                <button
                  type="button"
                  className="secondary-action"
                  disabled={attemptedPlayerIds.has(player.id)}
                  onClick={() => onIncorrect(player.id)}
                >
                  Incorrect
                </button>
              </div>
            </article>
          ))}
        </div>

        <button className="ghost-action" type="button" onClick={onEndClue}>
          End Clue
        </button>
      </section>
    </main>
  );
}
