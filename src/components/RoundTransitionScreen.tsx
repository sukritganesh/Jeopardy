import type { Board, Player } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type RoundTransitionScreenProps = {
  board: Board;
  completedRoundIndex: number;
  nextRoundIndex: number;
  players: Player[];
  controllingPlayerId: string;
  nextControlPlayer: Player;
  onStartNextRound: () => void;
};

export function RoundTransitionScreen({
  board,
  completedRoundIndex,
  nextRoundIndex,
  players,
  controllingPlayerId,
  nextControlPlayer,
  onStartNextRound,
}: RoundTransitionScreenProps) {
  const completedRound = board.rounds[completedRoundIndex];
  const nextRound = board.rounds[nextRoundIndex];

  return (
    <main className="game-shell transition-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Round complete</p>
          <h1>{completedRound.name}</h1>
        </div>
        <div className="control-pill">
          <span>Next control</span>
          <strong>{nextControlPlayer.name}</strong>
        </div>
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={controllingPlayerId} />

      <section className="transition-panel" aria-labelledby="transition-heading">
        <p className="eyebrow">Next round</p>
        <h2 id="transition-heading">{nextRound.name}</h2>
        <p>
          {nextControlPlayer.name} starts the board because they have the lowest score among active
          players.
        </p>
        <button className="primary-action" type="button" onClick={onStartNextRound}>
          Start {nextRound.name}
        </button>
      </section>
    </main>
  );
}
