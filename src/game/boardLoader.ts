import { validateBoard } from './boardValidation';
import type { Board } from './types';

// Fetching from public/boards keeps future Codex-generated boards easy to swap in.
export async function loadBoard(path = '/boards/sample-board.json'): Promise<Board> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load board from ${path}.`);
  }

  return validateBoard(await response.json());
}
