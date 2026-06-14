import type { Board, Category, Clue, FinalJeopardy, Round } from './types';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }

  return value;
}

function assertNumber(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a number.`);
  }

  return value;
}

function assertStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be an array of strings.`);
  }

  return value;
}

function parseClue(value: unknown, round: Round, label: string): Clue {
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object.`);
  }

  const clueValue = assertNumber(value.value, `${label}.value`);

  if (!round.values.includes(clueValue)) {
    throw new Error(`${label}.value must match a value in ${round.name}.`);
  }

  return {
    value: clueValue,
    clue: assertString(value.clue, `${label}.clue`),
    correctResponse: assertString(value.correctResponse, `${label}.correctResponse`),
    acceptedResponses: assertStringArray(value.acceptedResponses, `${label}.acceptedResponses`),
    dailyDouble: value.dailyDouble === true,
  };
}

function parseCategory(value: unknown, round: Round, categoryIndex: number): Category {
  if (!isRecord(value)) {
    throw new Error(`${round.name} category ${categoryIndex + 1} must be an object.`);
  }

  if (!Array.isArray(value.clues) || value.clues.length !== 5) {
    throw new Error(`${round.name} category ${categoryIndex + 1} must have exactly 5 clues.`);
  }

  return {
    title: assertString(value.title, `${round.name} category ${categoryIndex + 1}.title`),
    clues: value.clues.map((clue, clueIndex) =>
      parseClue(clue, round, `${round.name} category ${categoryIndex + 1} clue ${clueIndex + 1}`),
    ),
  };
}

function parseRound(value: unknown, roundIndex: number): Round {
  if (!isRecord(value)) {
    throw new Error(`Round ${roundIndex + 1} must be an object.`);
  }

  const id = assertString(value.id, `round ${roundIndex + 1}.id`);

  if (id !== 'jeopardy' && id !== 'doubleJeopardy') {
    throw new Error(`Round ${roundIndex + 1} must use a known round id.`);
  }

  if (!Array.isArray(value.values) || value.values.length !== 5) {
    throw new Error(`${id} must have exactly 5 clue values.`);
  }

  const round: Round = {
    id,
    name: assertString(value.name, `${id}.name`),
    values: value.values.map((roundValue, valueIndex) =>
      assertNumber(roundValue, `${id}.values[${valueIndex}]`),
    ),
    categories: [],
  };

  if (!Array.isArray(value.categories) || value.categories.length !== 6) {
    throw new Error(`${round.name} must have exactly 6 categories.`);
  }

  round.categories = value.categories.map((category, categoryIndex) =>
    parseCategory(category, round, categoryIndex),
  );

  return round;
}

function parseFinal(value: unknown): FinalJeopardy {
  if (!isRecord(value)) {
    throw new Error('Final Jeopardy must be an object.');
  }

  return {
    category: assertString(value.category, 'final.category'),
    clue: assertString(value.clue, 'final.clue'),
    correctResponse: assertString(value.correctResponse, 'final.correctResponse'),
    acceptedResponses: assertStringArray(value.acceptedResponses, 'final.acceptedResponses'),
  };
}

// Keep board validation close to data loading so bad generated boards fail early.
export function validateBoard(value: unknown): Board {
  if (!isRecord(value)) {
    throw new Error('Board must be an object.');
  }

  if (!Array.isArray(value.rounds) || value.rounds.length !== 2) {
    throw new Error('Board must have exactly 2 rounds.');
  }

  return {
    title: assertString(value.title, 'title'),
    rounds: value.rounds.map(parseRound),
    final: parseFinal(value.final),
  };
}
