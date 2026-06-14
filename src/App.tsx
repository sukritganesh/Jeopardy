import { useEffect, useMemo, useState } from 'react';
import { BoardScreen } from './components/BoardScreen';
import { ClueScreen } from './components/ClueScreen';
import { SetupScreen } from './components/SetupScreen';
import { loadBoard } from './game/boardLoader';
import type { AppScreen, Board, BuzzMode, Player, SelectedClue, SetupConfig } from './game/types';
import { DEFAULT_SETUP, clueKey } from './game/types';

type BoardState =
  | { status: 'loading'; board?: undefined; error?: undefined }
  | { status: 'ready'; board: Board; error?: undefined }
  | { status: 'error'; board?: undefined; error: string };

function cloneDefaultSetup(): SetupConfig {
  return {
    buzzMode: DEFAULT_SETUP.buzzMode,
    players: DEFAULT_SETUP.players.map((player) => ({ ...player })),
  };
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [boardState, setBoardState] = useState<BoardState>({ status: 'loading' });
  const [setup, setSetup] = useState<SetupConfig>(() => cloneDefaultSetup());
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoundIndex] = useState(0);
  const [controllingPlayerId, setControllingPlayerId] = useState(DEFAULT_SETUP.players[0].id);
  const [selectedClue, setSelectedClue] = useState<SelectedClue | null>(null);
  const [selectedClueKeys, setSelectedClueKeys] = useState<Set<string>>(() => new Set());
  const [attemptedPlayerIds, setAttemptedPlayerIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let isCurrent = true;

    loadBoard()
      .then((board) => {
        if (isCurrent) {
          setBoardState({ status: 'ready', board });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setBoardState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown board loading error.',
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const activePlayers = useMemo(
    () => setup.players.filter((player) => player.isActive),
    [setup.players],
  );

  function handlePlayerCountChange(count: number) {
    setSetup((current) => ({
      ...current,
      players: current.players.map((player, index) => ({ ...player, isActive: index < count })),
    }));
  }

  function handlePlayerChange(playerId: string, patch: Partial<Pick<Player, 'name' | 'buzzerKey'>>) {
    setSetup((current) => ({
      ...current,
      players: current.players.map((player) =>
        player.id === playerId ? { ...player, ...patch } : player,
      ),
    }));
  }

  function handleBuzzModeChange(buzzMode: BuzzMode) {
    setSetup((current) => ({ ...current, buzzMode }));
  }

  function handleStartGame() {
    const startingPlayers = activePlayers.map((player) => ({
      ...player,
      name: player.name.trim() || player.id,
      buzzerKey: player.buzzerKey.trim().toUpperCase() || '?',
      score: 0,
    }));

    setPlayers(startingPlayers);
    setControllingPlayerId(startingPlayers[0]?.id ?? DEFAULT_SETUP.players[0].id);
    setSelectedClueKeys(new Set());
    setScreen('board');
  }

  function handleSelectClue(selection: SelectedClue) {
    setSelectedClue(selection);
    setAttemptedPlayerIds(new Set());
    setScreen('clue');
  }

  function markSelectedClueDone(selection: SelectedClue) {
    setSelectedClueKeys((current) => {
      const next = new Set(current);
      next.add(clueKey(selection));
      return next;
    });
  }

  function scorePlayer(playerId: string, delta: number) {
    setPlayers((current) =>
      current.map((player) =>
        player.id === playerId ? { ...player, score: player.score + delta } : player,
      ),
    );
  }

  function handleCorrect(playerId: string) {
    if (boardState.status !== 'ready' || selectedClue === null) {
      return;
    }

    const clue = boardState.board.rounds[selectedClue.roundIndex].categories[selectedClue.categoryIndex]
      .clues[selectedClue.clueIndex];

    scorePlayer(playerId, clue.value);
    setControllingPlayerId(playerId);
    markSelectedClueDone(selectedClue);
    setScreen('board');
  }

  function handleIncorrect(playerId: string) {
    if (boardState.status !== 'ready' || selectedClue === null) {
      return;
    }

    const clue = boardState.board.rounds[selectedClue.roundIndex].categories[selectedClue.categoryIndex]
      .clues[selectedClue.clueIndex];

    scorePlayer(playerId, -clue.value);

    // This mirrors the eventual buzzer lockout rule before keyboard buzzers exist.
    const nextAttempted = new Set(attemptedPlayerIds);
    nextAttempted.add(playerId);
    setAttemptedPlayerIds(nextAttempted);

    const eligiblePlayers = clue.dailyDouble
      ? players.filter((player) => player.id === controllingPlayerId)
      : players.filter((player) => player.isActive);

    if (eligiblePlayers.every((player) => nextAttempted.has(player.id))) {
      markSelectedClueDone(selectedClue);
      setScreen('board');
    }
  }

  function handleEndClue() {
    if (selectedClue !== null) {
      markSelectedClueDone(selectedClue);
    }

    setScreen('board');
  }

  if (screen === 'setup' || boardState.status !== 'ready') {
    return (
      <SetupScreen
        setup={setup}
        boardTitle={boardState.board?.title}
        boardStatus={boardState.status}
        boardError={boardState.error}
        onPlayerCountChange={handlePlayerCountChange}
        onPlayerChange={handlePlayerChange}
        onBuzzModeChange={handleBuzzModeChange}
        onStartGame={handleStartGame}
      />
    );
  }

  if (screen === 'clue' && selectedClue !== null) {
    return (
      <ClueScreen
        board={boardState.board}
        selection={selectedClue}
        players={players}
        controllingPlayerId={controllingPlayerId}
        attemptedPlayerIds={attemptedPlayerIds}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        onEndClue={handleEndClue}
      />
    );
  }

  return (
    <BoardScreen
      board={boardState.board}
      currentRoundIndex={currentRoundIndex}
      players={players}
      controllingPlayerId={controllingPlayerId}
      selectedClueKeys={selectedClueKeys}
      onSelectClue={handleSelectClue}
    />
  );
}

export default App;
