import type { Player } from '../game/types';

type PlayerScoreboardProps = {
  players: Player[];
  controllingPlayerId: string;
};

export function PlayerScoreboard({ players, controllingPlayerId }: PlayerScoreboardProps) {
  return (
    <section className="scoreboard" aria-label="Player scores">
      {players
        .filter((player) => player.isActive)
        .map((player) => (
          <article
            className={player.id === controllingPlayerId ? 'score-card score-card--control' : 'score-card'}
            key={player.id}
          >
            <div>
              <h2>{player.name}</h2>
              <p>Key {player.buzzerKey || '-'}</p>
            </div>
            <strong>${player.score}</strong>
          </article>
        ))}
    </section>
  );
}
