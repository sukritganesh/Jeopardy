import { useEffect, useMemo, useRef, useState } from 'react';
import { BoardScreen } from './components/BoardScreen';
import { ClueScreen } from './components/ClueScreen';
import { DailyDoubleWagerScreen } from './components/DailyDoubleWagerScreen';
import { RoundTransitionScreen } from './components/RoundTransitionScreen';
import { SetupScreen } from './components/SetupScreen';
import { loadBoard } from './game/boardLoader';
import { getLowestScoringPlayer, isRoundComplete } from './game/rounds';
import { loadSettings } from './game/settingsLoader';
import { speakClue, stopSpeech } from './game/speech';
import type {
  AppScreen,
  Board,
  BuzzMode,
  CluePhase,
  GameSettings,
  Player,
  SelectedClue,
  SetupConfig,
} from './game/types';
import { DEFAULT_SETTINGS, DEFAULT_SETUP, clueKey, setupFromSettings } from './game/types';
import { getDailyDoubleMaxWager } from './game/wagers';

type AppDataState =
  | { status: 'loading'; board?: undefined; settings?: undefined; error?: undefined }
  | { status: 'ready'; board: Board; settings: GameSettings; error?: undefined }
  | { status: 'error'; board?: undefined; settings?: undefined; error: string };

function cloneDefaultSetup(): SetupConfig {
  return {
    buzzMode: DEFAULT_SETUP.buzzMode,
    players: DEFAULT_SETUP.players.map((player) => ({ ...player })),
  };
}

function App() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [appData, setAppData] = useState<AppDataState>({ status: 'loading' });
  const [setup, setSetup] = useState<SetupConfig>(() => cloneDefaultSetup());
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [completedRoundIndex, setCompletedRoundIndex] = useState<number | null>(null);
  const [controllingPlayerId, setControllingPlayerId] = useState(DEFAULT_SETUP.players[0].id);
  const [selectedClue, setSelectedClue] = useState<SelectedClue | null>(null);
  const [selectedClueKeys, setSelectedClueKeys] = useState<Set<string>>(() => new Set());
  const [attemptedPlayerIds, setAttemptedPlayerIds] = useState<Set<string>>(() => new Set());
  const [cluePhase, setCluePhase] = useState<CluePhase>('reading');
  const [buzzedPlayerId, setBuzzedPlayerId] = useState<string | null>(null);
  const [dailyDoubleWager, setDailyDoubleWager] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(DEFAULT_SETTINGS.answerTimeSeconds);
  const [clueIsBeingRead, setClueIsBeingRead] = useState(false);
  const [ttsUnavailable, setTtsUnavailable] = useState(false);
  const speechRunRef = useRef(0);

  useEffect(() => {
    let isCurrent = true;

    loadSettings()
      .then(async (settings) => {
        const board = await loadBoard(settings.boardPath);

        if (isCurrent) {
          setSetup(setupFromSettings(settings));
          setTimerRemaining(settings.answerTimeSeconds);
          setAppData({ status: 'ready', board, settings });
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setAppData({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown app loading error.',
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

  const currentClue = useMemo(() => {
    if (appData.status !== 'ready' || selectedClue === null) {
      return null;
    }

    return appData.board.rounds[selectedClue.roundIndex].categories[selectedClue.categoryIndex].clues[
      selectedClue.clueIndex
    ];
  }, [appData, selectedClue]);

  const answerTimeSeconds =
    appData.status === 'ready' ? appData.settings.answerTimeSeconds : DEFAULT_SETTINGS.answerTimeSeconds;

  const scoringValue =
    currentClue?.dailyDouble && dailyDoubleWager !== null ? dailyDoubleWager : (currentClue?.value ?? 0);

  useEffect(() => {
    if (screen !== 'clue' || appData.status !== 'ready' || currentClue === null) {
      return;
    }

    const runId = speechRunRef.current + 1;
    speechRunRef.current = runId;
    setTtsUnavailable(false);
    setClueIsBeingRead(true);
    setBuzzedPlayerId(null);
    setTimerRemaining(appData.settings.answerTimeSeconds);
    setCluePhase(setup.buzzMode === 'early' && !currentClue.dailyDouble ? 'buzzing' : 'reading');

    speakClue(currentClue.clue, {
      settings: appData.settings.tts,
      onUnavailable: () => setTtsUnavailable(true),
      onEnd: () => {
        if (speechRunRef.current !== runId) {
          return;
        }

        if (currentClue.dailyDouble) {
          setClueIsBeingRead(false);
          setBuzzedPlayerId(controllingPlayerId);
          setTimerRemaining(answerTimeSeconds);
          setCluePhase('answering');
          return;
        }

        setClueIsBeingRead(false);
        setTimerRemaining(answerTimeSeconds);
        setCluePhase('buzzing');
      },
    });

    return () => {
      speechRunRef.current += 1;
      stopSpeech();
    };
  }, [answerTimeSeconds, appData, controllingPlayerId, currentClue, screen, setup.buzzMode]);

  useEffect(() => {
    if (screen !== 'clue' || cluePhase !== 'buzzing' || currentClue?.dailyDouble) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      const key = event.key.toUpperCase();
      const buzzingPlayer = players.find(
        (player) =>
          player.isActive &&
          player.buzzerKey.toUpperCase() === key &&
          !attemptedPlayerIds.has(player.id),
      );

      if (!buzzingPlayer) {
        return;
      }

      event.preventDefault();
      speechRunRef.current += 1;
      stopSpeech();
      setClueIsBeingRead(false);
      setBuzzedPlayerId(buzzingPlayer.id);
      setTimerRemaining(answerTimeSeconds);
      setCluePhase('answering');
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answerTimeSeconds, attemptedPlayerIds, cluePhase, currentClue, players, screen]);

  useEffect(() => {
    const timerIsActive =
      screen === 'clue' &&
      ((cluePhase === 'answering' && buzzedPlayerId !== null) ||
        (cluePhase === 'buzzing' && !clueIsBeingRead));

    if (!timerIsActive) {
      return;
    }

    if (timerRemaining <= 0) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setTimerRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [buzzedPlayerId, clueIsBeingRead, cluePhase, screen, timerRemaining]);

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
    setAttemptedPlayerIds(new Set());
    setBuzzedPlayerId(null);
    setDailyDoubleWager(null);
    setClueIsBeingRead(false);
    setScreen('board');
  }

  function handleSelectClue(selection: SelectedClue) {
    if (appData.status !== 'ready') {
      return;
    }

    const clue = appData.board.rounds[selection.roundIndex].categories[selection.categoryIndex].clues[
      selection.clueIndex
    ];

    setSelectedClue(selection);
    setAttemptedPlayerIds(new Set());
    setBuzzedPlayerId(null);
    setDailyDoubleWager(null);
    setClueIsBeingRead(false);
    setCluePhase('reading');
    setTimerRemaining(answerTimeSeconds);
    setScreen(clue.dailyDouble ? 'dailyDoubleWager' : 'clue');
  }

  function markSelectedClueDone(selection: SelectedClue) {
    const next = new Set(selectedClueKeys);
    next.add(clueKey(selection));
    setSelectedClueKeys(next);
    return next;
  }

  function getPlayersAfterScore(playerId: string, delta: number) {
    return players.map((player) =>
      player.id === playerId ? { ...player, score: player.score + delta } : player,
    );
  }

  function finishSelectedClue() {
    if (appData.status !== 'ready' || selectedClue === null) {
      setScreen('board');
      return;
    }

    const nextSelectedClueKeys = markSelectedClueDone(selectedClue);
    setBuzzedPlayerId(null);
    setDailyDoubleWager(null);
    setClueIsBeingRead(false);

    if (
      isRoundComplete(appData.board, currentRoundIndex, nextSelectedClueKeys) &&
      currentRoundIndex < appData.board.rounds.length - 1
    ) {
      setCompletedRoundIndex(currentRoundIndex);
      setScreen('roundTransition');
      return;
    }

    setScreen('board');
  }

  function handleCorrect(playerId: string) {
    if (currentClue === null || selectedClue === null) {
      return;
    }

    speechRunRef.current += 1;
    stopSpeech();
    const nextPlayers = getPlayersAfterScore(playerId, scoringValue);
    setPlayers(nextPlayers);
    setControllingPlayerId(playerId);
    finishSelectedClue();
  }

  function handleIncorrect(playerId: string) {
    if (currentClue === null || selectedClue === null) {
      return;
    }

    const nextPlayers = getPlayersAfterScore(playerId, -scoringValue);
    setPlayers(nextPlayers);

    const nextAttempted = new Set(attemptedPlayerIds);
    nextAttempted.add(playerId);
    setAttemptedPlayerIds(nextAttempted);
    setBuzzedPlayerId(null);
    setTimerRemaining(answerTimeSeconds);
    setClueIsBeingRead(false);

    const eligiblePlayers = currentClue.dailyDouble
      ? players.filter((player) => player.id === controllingPlayerId)
      : players.filter((player) => player.isActive);

    if (eligiblePlayers.every((player) => nextAttempted.has(player.id))) {
      finishSelectedClue();
      return;
    }

    setCluePhase('buzzing');
  }

  function handleEndClue() {
    speechRunRef.current += 1;
    stopSpeech();
    setClueIsBeingRead(false);

    if (selectedClue !== null) {
      finishSelectedClue();
      return;
    }

    setBuzzedPlayerId(null);
    setDailyDoubleWager(null);
    setScreen('board');
  }

  function handleStartNextRound() {
    if (appData.status !== 'ready') {
      return;
    }

    const nextRoundIndex = currentRoundIndex + 1;
    const nextControlPlayer = getLowestScoringPlayer(players);

    setCurrentRoundIndex(nextRoundIndex);
    setCompletedRoundIndex(null);
    setSelectedClue(null);
    setAttemptedPlayerIds(new Set());
    setBuzzedPlayerId(null);
    setDailyDoubleWager(null);
    setClueIsBeingRead(false);
    setControllingPlayerId(nextControlPlayer?.id ?? players[0]?.id ?? DEFAULT_SETUP.players[0].id);
    setScreen('board');
  }

  function handleSubmitDailyDoubleWager(wager: number) {
    setDailyDoubleWager(wager);
    setAttemptedPlayerIds(new Set());
    setBuzzedPlayerId(null);
    setClueIsBeingRead(false);
    setTimerRemaining(answerTimeSeconds);
    setCluePhase('reading');
    setScreen('clue');
  }

  function handleCancelDailyDouble() {
    setSelectedClue(null);
    setDailyDoubleWager(null);
    setClueIsBeingRead(false);
    setScreen('board');
  }

  function handleReplayClue() {
    if (appData.status !== 'ready' || currentClue === null) {
      return;
    }

    const runId = speechRunRef.current + 1;
    const replayDuringAnswer = cluePhase === 'answering';
    speechRunRef.current = runId;
    setTtsUnavailable(false);
    setClueIsBeingRead(!replayDuringAnswer);

    if (!replayDuringAnswer) {
      setCluePhase(setup.buzzMode === 'early' && !currentClue.dailyDouble ? 'buzzing' : 'reading');
    }

    speakClue(currentClue.clue, {
      settings: appData.settings.tts,
      onUnavailable: () => setTtsUnavailable(true),
      onEnd: () => {
        if (speechRunRef.current !== runId) {
          return;
        }

        if (replayDuringAnswer) {
          setClueIsBeingRead(false);
          return;
        }

        if (currentClue.dailyDouble) {
          setClueIsBeingRead(false);
          setBuzzedPlayerId(controllingPlayerId);
          setTimerRemaining(answerTimeSeconds);
          setCluePhase('answering');
          return;
        }

        setClueIsBeingRead(false);
        setTimerRemaining(answerTimeSeconds);
        setCluePhase('buzzing');
      },
    });
  }

  if (screen === 'setup' || appData.status !== 'ready') {
    return (
      <SetupScreen
        setup={setup}
        boardTitle={appData.board?.title}
        boardStatus={appData.status}
        boardError={appData.error}
        settings={appData.settings}
        onPlayerCountChange={handlePlayerCountChange}
        onPlayerChange={handlePlayerChange}
        onBuzzModeChange={handleBuzzModeChange}
        onStartGame={handleStartGame}
      />
    );
  }

  if (screen === 'dailyDoubleWager' && selectedClue !== null) {
    const selectingPlayer = players.find((player) => player.id === controllingPlayerId);
    const round = appData.board.rounds[selectedClue.roundIndex];

    if (selectingPlayer !== undefined) {
      return (
        <DailyDoubleWagerScreen
          board={appData.board}
          selection={selectedClue}
          player={selectingPlayer}
          controllingPlayerId={controllingPlayerId}
          maxWager={getDailyDoubleMaxWager(selectingPlayer.score, round)}
          onSubmitWager={handleSubmitDailyDoubleWager}
          onCancel={handleCancelDailyDouble}
        />
      );
    }
  }

  if (screen === 'roundTransition' && completedRoundIndex !== null) {
    const nextRoundIndex = completedRoundIndex + 1;
    const nextControlPlayer = getLowestScoringPlayer(players);

    if (nextControlPlayer !== undefined && nextRoundIndex < appData.board.rounds.length) {
      return (
        <RoundTransitionScreen
          board={appData.board}
          completedRoundIndex={completedRoundIndex}
          nextRoundIndex={nextRoundIndex}
          players={players}
          controllingPlayerId={controllingPlayerId}
          nextControlPlayer={nextControlPlayer}
          onStartNextRound={handleStartNextRound}
        />
      );
    }
  }

  if (screen === 'clue' && selectedClue !== null) {
    return (
      <ClueScreen
        board={appData.board}
        selection={selectedClue}
        players={players}
        controllingPlayerId={controllingPlayerId}
        attemptedPlayerIds={attemptedPlayerIds}
        cluePhase={cluePhase}
        buzzedPlayerId={buzzedPlayerId}
        timerRemaining={timerRemaining}
        answerTimeSeconds={appData.settings.answerTimeSeconds}
        clueIsBeingRead={clueIsBeingRead}
        scoringValue={scoringValue}
        buzzMode={setup.buzzMode}
        ttsUnavailable={ttsUnavailable}
        onCorrect={handleCorrect}
        onIncorrect={handleIncorrect}
        onEndClue={handleEndClue}
        onReplayClue={handleReplayClue}
      />
    );
  }

  return (
    <BoardScreen
      board={appData.board}
      currentRoundIndex={currentRoundIndex}
      players={players}
      controllingPlayerId={controllingPlayerId}
      selectedClueKeys={selectedClueKeys}
      onSelectClue={handleSelectClue}
    />
  );
}

export default App;
