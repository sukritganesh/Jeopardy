import { useEffect, useState } from 'react';
import type { Board, BuzzMode, CluePhase, Player, SelectedClue } from '../game/types';
import { isEditableKeyboardTarget, normalizeKeyboardKey } from '../game/keyboard';
import { PlayerScoreboard } from './PlayerScoreboard';

type ClueScreenProps = {
  board: Board;
  selection: SelectedClue;
  players: Player[];
  controllingPlayerId: string;
  attemptedPlayerIds: Set<string>;
  cluePhase: CluePhase;
  buzzedPlayerId: string | null;
  timerRemaining: number;
  buzzWindowSeconds: number;
  responseTimeSeconds: number;
  clueIsBeingRead: boolean;
  scoringValue: number;
  buzzMode: BuzzMode;
  ttsUnavailable: boolean;
  onCorrect: (playerId: string) => void;
  onIncorrect: (playerId: string) => void;
  onEndClue: () => void;
  onReplayClue: () => void;
};

export function ClueScreen({
  board,
  selection,
  players,
  controllingPlayerId,
  attemptedPlayerIds,
  cluePhase,
  buzzedPlayerId,
  timerRemaining,
  buzzWindowSeconds,
  responseTimeSeconds,
  clueIsBeingRead,
  scoringValue,
  buzzMode,
  ttsUnavailable,
  onCorrect,
  onIncorrect,
  onEndClue,
  onReplayClue,
}: ClueScreenProps) {
  const [responseIsRevealed, setResponseIsRevealed] = useState(false);
  const round = board.rounds[selection.roundIndex];
  const category = round.categories[selection.categoryIndex];
  const clue = category.clues[selection.clueIndex];
  const buzzedPlayer = players.find((player) => player.id === buzzedPlayerId);
  const activePlayers = clue.dailyDouble
    ? players.filter((player) => player.id === controllingPlayerId)
    : players.filter((player) => player.isActive);
  const clueStatus =
    cluePhase === 'reading'
      ? 'Reading clue'
      : cluePhase === 'buzzing'
        ? timerRemaining === 0 && !clueIsBeingRead
          ? 'Time expired'
          : 'Buzzers open'
        : `${buzzedPlayer?.name ?? 'Player'} answering`;
  const shouldShowCountdown =
    cluePhase === 'answering' || (cluePhase === 'buzzing' && !clueIsBeingRead);
  const waitingTimerSeconds = clue.dailyDouble ? responseTimeSeconds : buzzWindowSeconds;

  useEffect(() => {
    setResponseIsRevealed(false);
  }, [selection]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (isEditableKeyboardTarget(event.target)) {
        return;
      }

      const key = normalizeKeyboardKey(event.key);

      if (key === 'R') {
        event.preventDefault();
        setResponseIsRevealed(true);
        return;
      }

      if (cluePhase !== 'answering' || buzzedPlayerId === null) {
        return;
      }

      if (key === 'C') {
        event.preventDefault();
        onCorrect(buzzedPlayerId);
        return;
      }

      if (key === 'I') {
        event.preventDefault();
        onIncorrect(buzzedPlayerId);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buzzedPlayerId, cluePhase, onCorrect, onIncorrect]);

  return (
    <main className="game-shell clue-shell">
      <header className="game-header">
        <div>
          <p className="eyebrow">{category.title}</p>
          <h1>{clue.dailyDouble ? `$${scoringValue} wager` : `$${clue.value}`}</h1>
        </div>
        {clue.dailyDouble && <div className="daily-double-badge">Daily Double</div>}
      </header>

      <PlayerScoreboard players={players} controllingPlayerId={controllingPlayerId} />

      <section className="clue-status-panel" aria-live="polite">
        <div>
          <span>Status</span>
          <strong>{clueStatus}</strong>
        </div>
        <div>
          <span>Timer</span>
          <strong>{shouldShowCountdown ? `${timerRemaining}s` : `${waitingTimerSeconds}s`}</strong>
        </div>
        <div>
          <span>{clue.dailyDouble ? 'Scoring' : 'Buzz mode'}</span>
          <strong>
            {clue.dailyDouble ? `Worth $${scoringValue}` : buzzMode === 'early' ? 'Early buzz' : 'After read'}
          </strong>
        </div>
      </section>

      {ttsUnavailable && <p className="notice">Speech is unavailable in this browser. Read the clue aloud.</p>}

      <section className="clue-card" aria-labelledby="clue-heading">
        <p className="eyebrow" id="clue-heading">
          Clue
        </p>
        <p className="clue-text">{clue.clue}</p>
        <div className={responseIsRevealed ? 'response-strip' : 'response-strip response-strip--hidden'}>
          {responseIsRevealed ? (
            <>
              <span>Correct response</span>
              <strong>{clue.correctResponse}</strong>
            </>
          ) : (
            <button className="response-reveal-button" type="button" onClick={() => setResponseIsRevealed(true)}>
              Reveal Response (R)
            </button>
          )}
        </div>
      </section>

      <section className="host-panel" aria-label="Host scoring controls">
        <div className="host-panel-heading">
          <h2>Host Scoring</h2>
          <p>
            {cluePhase === 'answering'
              ? 'Mark the active player response.'
              : timerRemaining === 0 && cluePhase === 'buzzing' && !clueIsBeingRead
                ? 'Time expired. End the clue or allow a late buzz.'
                : 'Waiting for reading or buzz.'}
          </p>
        </div>

        <div className="host-action-grid">
          {activePlayers.map((player) => {
            const isLockedOut = attemptedPlayerIds.has(player.id);
            const isActiveAnswer = cluePhase === 'answering' && buzzedPlayerId === player.id;

            return (
              <article
                className={isActiveAnswer ? 'host-player-row host-player-row--active' : 'host-player-row'}
                key={player.id}
              >
                <strong>
                  {player.name}
                  {isLockedOut && <span>Locked out</span>}
                  {isActiveAnswer && timerRemaining === 0 && <span>Time expired</span>}
                </strong>
                <div>
                  <button type="button" disabled={!isActiveAnswer} onClick={() => onCorrect(player.id)}>
                    Correct (C)
                  </button>
                  <button
                    type="button"
                    className="secondary-action"
                    disabled={!isActiveAnswer}
                    onClick={() => onIncorrect(player.id)}
                  >
                    Incorrect (I)
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="host-footer-actions">
          <button className="ghost-action" type="button" onClick={onReplayClue}>
            Replay Clue
          </button>
          <button className="ghost-action" type="button" onClick={onEndClue}>
            End Clue
          </button>
        </div>
      </section>
    </main>
  );
}
