import { useState } from 'react';
import type { Board, Player, SelectedClue } from '../game/types';
import { MIN_DAILY_DOUBLE_WAGER } from '../game/wagers';
import { PlayerScoreboard } from './PlayerScoreboard';

type DailyDoubleWagerScreenProps = {
  board: Board;
  selection: SelectedClue;
  player: Player;
  controllingPlayerId: string;
  maxWager: number;
  onSubmitWager: (wager: number) => void;
  onCancel: () => void;
};

export function DailyDoubleWagerScreen({
  board,
  selection,
  player,
  controllingPlayerId,
  maxWager,
  onSubmitWager,
  onCancel,
}: DailyDoubleWagerScreenProps) {
  const round = board.rounds[selection.roundIndex];
  const category = round.categories[selection.categoryIndex];
  const clue = category.clues[selection.clueIndex];
  const [wager, setWager] = useState(Math.min(maxWager, Math.max(MIN_DAILY_DOUBLE_WAGER, clue.value)));
  const clampedWager = Math.min(maxWager, Math.max(MIN_DAILY_DOUBLE_WAGER, wager));
  const wagerIsValid = Number.isInteger(wager) && wager >= MIN_DAILY_DOUBLE_WAGER && wager <= maxWager;

  return (
    <main className="game-shell clue-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">{category.title}</p>
          <h1>Daily Double</h1>
        </div>
        <div className="daily-double-badge">${clue.value} clue</div>
      </header>

      <PlayerScoreboard players={[player]} controllingPlayerId={controllingPlayerId} />

      <section className="wager-panel" aria-labelledby="daily-double-heading">
        <p className="eyebrow">Wager</p>
        <h2 id="daily-double-heading">{player.name}, place your wager</h2>
        <p>
          Minimum ${MIN_DAILY_DOUBLE_WAGER}. Maximum ${maxWager}.
        </p>

        <label className="wager-field">
          <span>Daily Double wager</span>
          <input
            type="number"
            min={MIN_DAILY_DOUBLE_WAGER}
            max={maxWager}
            step={5}
            value={wager}
            onChange={(event) => setWager(Number(event.target.value))}
          />
        </label>

        <div className="wager-actions">
          <button
            className="primary-action"
            type="button"
            disabled={!wagerIsValid}
            onClick={() => onSubmitWager(clampedWager)}
          >
            Play for ${clampedWager}
          </button>
          <button className="ghost-action" type="button" onClick={onCancel}>
            Back to Board
          </button>
        </div>
      </section>
    </main>
  );
}
