import { useEffect } from 'react';
import { isEditableKeyboardTarget, normalizeKeyboardKey } from '../game/keyboard';
import type { Board, Player } from '../game/types';
import { PlayerScoreboard } from './PlayerScoreboard';

type FinalJeopardyClueScreenProps = {
  board: Board;
  players: Player[];
  eligiblePlayers: Player[];
  timerRemaining: number;
  finalClueIsBeingRead: boolean;
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
  finalClueIsBeingRead,
  responseIsRevealed,
  ttsUnavailable,
  onRevealResponse,
  onMarkPlayer,
  finalJudgments,
}: FinalJeopardyClueScreenProps) {
  const allJudged = eligiblePlayers.every((player) => player.id in finalJudgments);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (isEditableKeyboardTarget(event.target)) {
        return;
      }

      if (!responseIsRevealed && normalizeKeyboardKey(event.key) === 'R') {
        event.preventDefault();
        onRevealResponse();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRevealResponse, responseIsRevealed]);

  return (
    <main className="game-shell final-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">{board.final.category}</p>
          <h1>Final Jeopardy</h1>
        </div>
        <div className="control-pill">
          <span>Timer</span>
          <strong>
            {responseIsRevealed ? 'Stopped' : finalClueIsBeingRead ? 'Reading' : `${timerRemaining}s`}
          </strong>
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
          {responseIsRevealed ? (
            <>
              <span>Correct response</span>
              <strong>{board.final.correctResponse}</strong>
            </>
          ) : (
            <button className="response-reveal-button" type="button" onClick={onRevealResponse}>
              Reveal Response (R)
            </button>
          )}
        </div>
      </section>

      <section className="host-panel" aria-label="Final Jeopardy controls">
        <div className="host-panel-heading">
          <h2>{responseIsRevealed ? 'Score Final Jeopardy' : 'Waiting for responses'}</h2>
          <p>
            {responseIsRevealed
              ? 'Mark each eligible player correct or incorrect.'
              : finalClueIsBeingRead
                ? 'The countdown starts after the clue is read.'
                : timerRemaining === 0
                ? 'Time expired. Reveal when ready.'
                : 'Reveal early once everyone has written their response.'}
          </p>
        </div>
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
