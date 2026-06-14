import type { Board, Player } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type FinalStandingsScreenProps = {
  board: Board;
  players: Player[];
};

export function FinalStandingsScreen({ board, players }: FinalStandingsScreenProps) {
  const sortedPlayers = [...players].filter((player) => player.isActive).sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  return (
    <main className="game-shell final-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">Game over</p>
          <h1>{winner ? `${winner.name} wins` : board.title}</h1>
        </div>
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={winner?.id ?? players[0]?.id} />

      <section className="final-panel" aria-labelledby="standings-heading">
        <p className="eyebrow">Final standings</p>
        <h2 id="standings-heading">{board.title}</h2>
        <ol className="standings-list">
          {sortedPlayers.map((player) => (
            <li key={player.id}>
              <span>{player.name}</span>
              <strong>${player.score}</strong>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
