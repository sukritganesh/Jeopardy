export type BuzzMode = 'early' | 'afterRead';

export type AppScreen = 'setup' | 'board' | 'clue';

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

export const DEFAULT_PLAYERS: Player[] = [
  { id: 'player-1', name: 'Player 1', buzzerKey: 'A', score: 0, isActive: true },
  { id: 'player-2', name: 'Player 2', buzzerKey: 'K', score: 0, isActive: true },
  { id: 'player-3', name: 'Player 3', buzzerKey: 'L', score: 0, isActive: false },
];

export const DEFAULT_SETUP: SetupConfig = {
  players: DEFAULT_PLAYERS,
  buzzMode: 'afterRead',
};

/** Stable key for storing per-clue UI state such as selected/finished. */
export function clueKey(selection: SelectedClue): string {
  return `${selection.roundIndex}:${selection.categoryIndex}:${selection.clueIndex}`;
}
