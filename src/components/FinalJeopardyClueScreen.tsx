import type { Board, Player } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type FinalJeopardyClueScreenProps = {
  board: Board;
  players: Player[];
  eligiblePlayers: Player[];
  timerRemaining: number;
  finalTimeSeconds: number;
  responseIsRevealed: boolean;
  ttsUnavailable: boolean;
  onRevealResponse: () => void;
  onMarkPlayer: (playerId: string, isCorrect: boolean) => void;
  finalJudgments: Record<string, boolean>;
};

export function FinalJeopardyClueScreen({
  board,
  players,
  eligiblePlayers,
  timerRemaining,
  finalTimeSeconds,
  responseIsRevealed,
  ttsUnavailable,
  onRevealResponse,
  onMarkPlayer,
  finalJudgments,
}: FinalJeopardyClueScreenProps) {
  const allJudged = eligiblePlayers.every((player) => player.id in finalJudgments);

  return (
    <main className="game-shell final-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">{board.final.category}</p>
          <h1>Final Jeopardy</h1>
        </div>
        <div className="control-pill">
          <span>Timer</span>
          <strong>{responseIsRevealed ? 'Stopped' : `${timerRemaining}s`}</strong>
        </div>
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={eligiblePlayers[0]?.id ?? players[0]?.id} />

      {ttsUnavailable && <p className="notice">Speech is unavailable in this browser. Read the clue aloud.</p>}

      <section className="clue-card" aria-labelledby="final-clue-heading">
        <p className="eyebrow" id="final-clue-heading">
          Final clue
        </p>
        <p className="clue-text">{board.final.clue}</p>
        <div className={responseIsRevealed ? 'response-strip' : 'response-strip response-strip--hidden'}>
          <span>{responseIsRevealed ? 'Correct response' : 'Response hidden'}</span>
          <strong>{responseIsRevealed ? board.final.correctResponse : `${finalTimeSeconds}s to answer`}</strong>
        </div>
      </section>

      <section className="host-panel" aria-label="Final Jeopardy controls">
        <div className="host-panel-heading">
          <h2>{responseIsRevealed ? 'Score Final Jeopardy' : 'Waiting for responses'}</h2>
          <p>
            {responseIsRevealed
              ? 'Mark each eligible player correct or incorrect.'
              : timerRemaining === 0
                ? 'Time expired. Reveal when ready.'
                : 'Reveal early once everyone has written their response.'}
          </p>
        </div>

        {!responseIsRevealed && (
          <button className="primary-action" type="button" onClick={onRevealResponse}>
            Reveal Response
          </button>
        )}

        {responseIsRevealed && (
          <div className="host-action-grid">
            {eligiblePlayers.map((player) => (
              <article className="host-player-row" key={player.id}>
                <strong>
                  {player.name}
                  {player.id in finalJudgments && <span>{finalJudgments[player.id] ? 'Correct' : 'Incorrect'}</span>}
                </strong>
                <div>
                  <button type="button" onClick={() => onMarkPlayer(player.id, true)}>
                    Correct
                  </button>
                  <button type="button" className="secondary-action" onClick={() => onMarkPlayer(player.id, false)}>
                    Incorrect
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {responseIsRevealed && allJudged && <p className="notice">All responses scored. Game over.</p>}
      </section>
    </main>
  );
}
