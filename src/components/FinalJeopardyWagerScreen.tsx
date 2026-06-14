import { useState } from 'react';
import type { Board, Player } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type FinalJeopardyWagerScreenProps = {
  board: Board;
  players: Player[];
  eligiblePlayers: Player[];
  onSubmitWagers: (wagers: Record<string, number>) => void;
};

export function FinalJeopardyWagerScreen({
  board,
  players,
  eligiblePlayers,
  onSubmitWagers,
}: FinalJeopardyWagerScreenProps) {
  const [wagers, setWagers] = useState<Record<string, number>>(() =>
    Object.fromEntries(eligiblePlayers.map((player) => [player.id, 0])),
  );

  const wagersAreValid = eligiblePlayers.every((player) => {
    const wager = wagers[player.id] ?? 0;
    const maxWager = Math.max(0, player.score);
    return Number.isInteger(wager) && wager >= 0 && wager <= maxWager;
  });

  return (
    <main className="game-shell final-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Final Jeopardy</p>
          <h1>{board.final.category}</h1>
        </div>
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={eligiblePlayers[0]?.id ?? players[0]?.id} />

      <section className="final-panel" aria-labelledby="final-wager-heading">
        <p className="eyebrow">Wagers</p>
        <h2 id="final-wager-heading">Place final wagers</h2>
        <p>Only the category is shown before wagers are locked.</p>

        <div className="final-wager-list">
          {eligiblePlayers.map((player) => {
            const maxWager = Math.max(0, player.score);

            return (
              <label className="wager-field" key={player.id}>
                <span>
                  {player.name} · max ${maxWager}
                </span>
                <input
                  type="number"
                  min={0}
                  max={maxWager}
                  step={1}
                  value={wagers[player.id] ?? 0}
                  onChange={(event) =>
                    setWagers((current) => ({ ...current, [player.id]: Number(event.target.value) }))
                  }
                />
              </label>
            );
          })}
        </div>

        <button
          className="primary-action"
          type="button"
          disabled={!wagersAreValid}
          onClick={() => onSubmitWagers(wagers)}
        >
          Read Final Clue
        </button>
      </section>
    </main>
  );
}
