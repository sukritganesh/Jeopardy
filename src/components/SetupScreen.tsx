import { useState } from 'react';
import type { BuzzMode, Player, SetupConfig } from '../game/types';

type SetupScreenProps = {
  setup: SetupConfig;
  boardTitle?: string;
  boardStatus: 'loading' | 'ready' | 'error';
  boardError?: string;
  onPlayerCountChange: (count: number) => void;
  onPlayerChange: (playerId: string, patch: Partial<Pick<Player, 'name' | 'buzzerKey'>>) => void;
  onBuzzModeChange: (buzzMode: BuzzMode) => void;
  onBuzzWindowChange: (seconds: number) => void;
  onResponseTimeChange: (seconds: number) => void;
  onFinalJeopardyTimeChange: (seconds: number) => void;
  onDebugAdvanceChange: (enabled: boolean) => void;
  onStartGame: () => void;
};

export function SetupScreen({
  setup,
  boardTitle,
  boardStatus,
  boardError,
  onPlayerCountChange,
  onPlayerChange,
  onBuzzModeChange,
  onBuzzWindowChange,
  onResponseTimeChange,
  onFinalJeopardyTimeChange,
  onDebugAdvanceChange,
  onStartGame,
}: SetupScreenProps) {
  const [setupPage, setSetupPage] = useState<'players' | 'settings'>('players');
  const activePlayers = setup.players.filter((player) => player.isActive);
  const canStart = boardStatus === 'ready' && activePlayers.length > 0;
  const pageTitle = setupPage === 'players' ? 'Jeopardy Clone' : 'Game Settings';

  return (
    <main className="app-shell app-shell--setup">
      <section
        className={setupPage === 'players' ? 'setup-panel setup-panel--compact' : 'setup-panel'}
        aria-labelledby="app-title"
      >
        <div className="setup-heading">
          <div>
            <p className="eyebrow">Local party game</p>
            <h1 id="app-title">{pageTitle}</h1>
          </div>
          <div className="board-loadout" aria-live="polite">
            <span>Board</span>
            <strong>{boardStatus === 'ready' ? boardTitle : boardStatus}</strong>
          </div>
        </div>

        {boardStatus === 'error' && <p className="notice notice--error">{boardError}</p>}

        {setupPage === 'players' ? (
          <>
            <fieldset className="form-section setup-front-section">
              <legend>Players</legend>
              <label className="field-label" htmlFor="player-count">
                Player count: {activePlayers.length}
              </label>
              <input
                id="player-count"
                type="range"
                min={1}
                max={4}
                step={1}
                value={activePlayers.length}
                onChange={(event) => onPlayerCountChange(Number(event.target.value))}
              />

              <div className="player-config-list">
                {setup.players.map((player, index) =>
                  player.isActive ? (
                    <div className="player-name-config" key={player.id}>
                      <label>
                        <span>Player {index + 1}</span>
                        <input
                          value={player.name}
                          onChange={(event) => onPlayerChange(player.id, { name: event.target.value })}
                        />
                      </label>
                    </div>
                  ) : null,
                )}
              </div>
            </fieldset>

            <div className="setup-actions">
              <button className="ghost-action" type="button" onClick={() => setSetupPage('settings')}>
                Settings
              </button>
              <button className="primary-action" type="button" disabled={!canStart} onClick={onStartGame}>
                Start Game
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="setup-grid">
              <fieldset className="form-section">
                <legend>Buzzer Keys</legend>
                <div className="player-config-list">
                  {setup.players.map((player, index) =>
                    player.isActive ? (
                      <div className="player-config player-config--keys" key={player.id}>
                        <span>{player.name.trim() || `Player ${index + 1}`}</span>
                        <label>
                          <span>Buzzer</span>
                          <input
                            maxLength={1}
                            value={player.buzzerKey}
                            aria-label={`${player.name} buzzer key`}
                            onChange={(event) =>
                              onPlayerChange(player.id, {
                                buzzerKey: event.target.value.toUpperCase(),
                              })
                            }
                          />
                        </label>
                      </div>
                    ) : null,
                  )}
                </div>
              </fieldset>

              <fieldset className="form-section">
                <legend>Buzzer Mode</legend>
                <label className="radio-card">
                  <input
                    type="radio"
                    name="buzz-mode"
                    checked={setup.buzzMode === 'afterRead'}
                    onChange={() => onBuzzModeChange('afterRead')}
                  />
                  <span>
                    <strong>Buzz after clue</strong>
                    <small>Players buzz once reading finishes.</small>
                  </span>
                </label>
                <label className="radio-card">
                  <input
                    type="radio"
                    name="buzz-mode"
                    checked={setup.buzzMode === 'early'}
                    onChange={() => onBuzzModeChange('early')}
                  />
                  <span>
                    <strong>Allow early buzz</strong>
                    <small>Buzzing can interrupt clue reading.</small>
                  </span>
                </label>
              </fieldset>
            </div>

            <fieldset className="form-section debug-section">
              <legend>Host Lab</legend>
              <label className="field-label" htmlFor="buzz-window-timer">
                Buzz window: {setup.buzzWindowSeconds}s
              </label>
              <input
                id="buzz-window-timer"
                type="range"
                min={3}
                max={8}
                step={1}
                value={setup.buzzWindowSeconds}
                onChange={(event) => onBuzzWindowChange(Number(event.target.value))}
              />
              <label className="field-label timer-field-label" htmlFor="response-timer">
                Response window: {setup.responseTimeSeconds}s
              </label>
              <input
                id="response-timer"
                type="range"
                min={3}
                max={8}
                step={1}
                value={setup.responseTimeSeconds}
                onChange={(event) => onResponseTimeChange(Number(event.target.value))}
              />
              <label className="field-label timer-field-label" htmlFor="final-jeopardy-timer">
                Final Jeopardy: {setup.finalJeopardyTimeSeconds}s
              </label>
              <input
                id="final-jeopardy-timer"
                type="range"
                min={15}
                max={60}
                step={5}
                value={setup.finalJeopardyTimeSeconds}
                onChange={(event) => onFinalJeopardyTimeChange(Number(event.target.value))}
              />
              <label className="radio-card">
                <input
                  type="checkbox"
                  checked={setup.debugAdvanceAfterOneClue}
                  onChange={(event) => onDebugAdvanceChange(event.target.checked)}
                />
                <span>
                  <strong>One-clue rounds</strong>
                  <small>Debug shortcut: advance after one clue so Final Jeopardy is easy to test.</small>
                </span>
              </label>
            </fieldset>

            <button className="ghost-action" type="button" onClick={() => setSetupPage('players')}>
              Back to Players
            </button>
          </>
        )}
      </section>
    </main>
  );
}
