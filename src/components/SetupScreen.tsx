import type { BuzzMode, GameSettings, Player, SetupConfig } from '../game/types';

type SetupScreenProps = {
  setup: SetupConfig;
  boardTitle?: string;
  boardStatus: 'loading' | 'ready' | 'error';
  boardError?: string;
  settings?: GameSettings;
  onPlayerCountChange: (count: number) => void;
  onPlayerChange: (playerId: string, patch: Partial<Pick<Player, 'name'>>) => void;
  onBuzzModeChange: (buzzMode: BuzzMode) => void;
  onStartGame: () => void;
};

export function SetupScreen({
  setup,
  boardTitle,
  boardStatus,
  boardError,
  settings,
  onPlayerCountChange,
  onPlayerChange,
  onBuzzModeChange,
  onStartGame,
}: SetupScreenProps) {
  const activePlayers = setup.players.filter((player) => player.isActive);
  const canStart = boardStatus === 'ready' && activePlayers.length > 0;

  return (
    <main className="app-shell app-shell--setup">
      <section className="setup-panel" aria-labelledby="app-title">
        <div className="setup-heading">
          <div>
            <p className="eyebrow">Local party game</p>
            <h1 id="app-title">Jeopardy Clone</h1>
          </div>
          <div className="board-loadout" aria-live="polite">
            <span>Board</span>
            <strong>{boardStatus === 'ready' ? boardTitle : boardStatus}</strong>
          </div>
        </div>

        {boardStatus === 'error' && <p className="notice notice--error">{boardError}</p>}

        <div className="setup-grid">
          <fieldset className="form-section">
            <legend>Players</legend>
            <label className="field-label" htmlFor="player-count">
              Player count
            </label>
            <select
              id="player-count"
              value={activePlayers.length}
              onChange={(event) => onPlayerCountChange(Number(event.target.value))}
            >
              <option value={1}>1 player</option>
              <option value={2}>2 players</option>
              <option value={3}>3 players</option>
            </select>

            <div className="player-config-list">
              {setup.players.map((player, index) => (
                <div className="player-config" key={player.id} hidden={!player.isActive}>
                  <label>
                    <span>Player {index + 1}</span>
                    <input
                      value={player.name}
                      onChange={(event) => onPlayerChange(player.id, { name: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Buzzer</span>
                    <input value={player.buzzerKey} readOnly aria-label={`${player.name} buzzer key`} />
                  </label>
                </div>
              ))}
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

        <dl className="settings-summary">
          <div>
            <dt>Timer</dt>
            <dd>{settings?.answerTimeSeconds ?? 5}s</dd>
          </div>
          <div>
            <dt>Speech</dt>
            <dd>{settings?.tts.enabled === false ? 'Off' : 'On'}</dd>
          </div>
          <div>
            <dt>Keys</dt>
            <dd>{setup.players.map((player) => player.buzzerKey).join(' / ')}</dd>
          </div>
        </dl>

        <button className="primary-action" type="button" disabled={!canStart} onClick={onStartGame}>
          Start Game
        </button>
      </section>
    </main>
  );
}
