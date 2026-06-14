export type BuzzMode = 'early' | 'afterRead';

export type AppScreen =
  | 'setup'
  | 'board'
  | 'dailyDoubleWager'
  | 'clue'
  | 'roundTransition'
  | 'finalWager'
  | 'finalClue'
  | 'finalStandings';

export type CluePhase = 'reading' | 'buzzing' | 'answering';

/** Player state used by setup, scoring, and upcoming buzzer logic. */
export type Player = {
  id: string;
  name: string;
  buzzerKey: string;
  score: number;
  isActive: boolean;
};

/** A board clue uses app-friendly naming instead of Jeopardy's answer/question wording. */
export type Clue = {
  value: number;
  clue: string;
  correctResponse: string;
  acceptedResponses: string[];
  dailyDouble: boolean;
};

/** One board category with clues ordered from lowest to highest value. */
export type Category = {
  title: string;
  clues: Clue[];
};

/** A normal Jeopardy round, either first round or Double Jeopardy. */
export type Round = {
  id: 'jeopardy' | 'doubleJeopardy';
  name: string;
  values: number[];
  categories: Category[];
};

/** Single-clue Final Jeopardy data; wagers and responses live in game state later. */
export type FinalJeopardy = {
  category: string;
  clue: string;
  correctResponse: string;
  acceptedResponses: string[];
};

/** Complete board file loaded from public/boards. */
export type Board = {
  title: string;
  rounds: Round[];
  final: FinalJeopardy;
};

/** Coordinates identify a clue without mutating the loaded board JSON. */
export type SelectedClue = {
  roundIndex: number;
  categoryIndex: number;
  clueIndex: number;
};

/** Setup choices become live game state when the host starts a game. */
export type SetupConfig = {
  players: Player[];
  buzzMode: BuzzMode;
};

export type SettingsPlayer = Omit<Player, 'score'>;

/** Local-first app settings loaded before the board. */
export type GameSettings = {
  boardPath: string;
  answerTimeSeconds: number;
  finalJeopardyTimeSeconds: number;
  defaultBuzzMode: BuzzMode;
  defaultPlayerCount: number;
  tts: {
    enabled: boolean;
    rate: number;
    pitch: number;
  };
  players: SettingsPlayer[];
};

export const DEFAULT_PLAYERS: Player[] = [
  { id: 'player-1', name: 'Player 1', buzzerKey: 'A', score: 0, isActive: true },
  { id: 'player-2', name: 'Player 2', buzzerKey: 'K', score: 0, isActive: true },
  { id: 'player-3', name: 'Player 3', buzzerKey: 'L', score: 0, isActive: false },
];

export const DEFAULT_SETUP: SetupConfig = {
  players: DEFAULT_PLAYERS,
  buzzMode: 'afterRead',
};

export const DEFAULT_SETTINGS: GameSettings = {
  boardPath: '/boards/sample-board.json',
  answerTimeSeconds: 5,
  finalJeopardyTimeSeconds: 30,
  defaultBuzzMode: 'afterRead',
  defaultPlayerCount: 2,
  tts: {
    enabled: true,
    rate: 1,
    pitch: 1,
  },
  players: DEFAULT_PLAYERS.map((player) => ({
    id: player.id,
    name: player.name,
    buzzerKey: player.buzzerKey,
    isActive: player.isActive,
  })),
};

export function setupFromSettings(settings: GameSettings): SetupConfig {
  return {
    buzzMode: settings.defaultBuzzMode,
    players: settings.players.map((player, index) => ({
      ...player,
      score: 0,
      isActive: index < settings.defaultPlayerCount,
      buzzerKey: player.buzzerKey.toUpperCase(),
    })),
  };
}

/** Stable key for storing per-clue UI state such as selected/finished. */
export function clueKey(selection: SelectedClue): string {
  return `${selection.roundIndex}:${selection.categoryIndex}:${selection.clueIndex}`;
}
