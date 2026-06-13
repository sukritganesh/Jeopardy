# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project Direction

This project is a local web-based Jeopardy-style party game for one laptop.

Build toward a playable, reliable game-night experience before adding advanced automation. Prefer clear game flow, fast keyboard interaction, readable UI, and host control over clever but fragile behavior.

## V1 Product Shape

The first version should support:

- 1 to 3 players.
- Player names and keyboard buzzer keys.
- A setup screen for basic game settings.
- A sample board loaded from JSON.
- A Jeopardy round and a Double Jeopardy round.
- Daily Doubles.
- Final Jeopardy with wagers and typed responses.
- Browser text-to-speech for reading clues.
- Host-controlled correctness with explicit Correct and Incorrect actions.

Automatic answer grading, microphone input, and local LLM judging are future features, not v1 requirements.

## Gameplay Preferences

- Support two buzzer modes:
  - Early buzz allowed: players may buzz while the clue is being read, interrupting text-to-speech and starting the answer timer.
  - Buzz after clue: players may buzz only after the clue has finished being read.
- After an incorrect response, reopen buzzing for the remaining eligible players.
- A player who answers incorrectly is locked out for the rest of that clue.
- Daily Doubles are answered only by the player who selected the clue.
- The player who last answered correctly controls the board.
- If nobody answers a clue correctly, control remains with the player who selected it.
- Final Jeopardy should collect wagers before showing the clue.

## Technical Direction

Prefer a frontend-only web app for v1 unless a backend becomes clearly necessary.

Recommended defaults:

- React with Vite.
- Browser Web Speech API for text-to-speech.
- Local JSON files for boards.
- Keyboard event listeners for buzzers.
- Plain, maintainable state management unless the app grows enough to justify a library.

Keep the implementation local-first. The app should be usable without API keys or external services.

## Board Data Direction

Boards should be JSON files with practical field names. Prefer terms that avoid Jeopardy-specific ambiguity:

- `clue`: the prompt shown/read to players.
- `correctResponse`: the expected response.
- `acceptedResponses`: optional aliases or alternate acceptable responses.
- `dailyDouble`: whether the clue is a Daily Double.

A normal board should include:

- A title.
- Two rounds.
- Six categories per round.
- Five clues per category.
- One Daily Double in the Jeopardy round.
- Two Daily Doubles in the Double Jeopardy round.
- One Final Jeopardy clue.

Detailed schema and generation instructions belong in `GAME_SPEC.md`, not here.

## UI Direction

The play screen should feel like a game board, not an admin dashboard.

Prioritize:

- Large, readable board cells.
- Persistent player scores.
- Clear current-control indicator.
- Visible buzzer key labels.
- Focused host controls only when needed.
- Responsive layout that works on laptop screens first.

Avoid overbuilding the landing page. The first screen should quickly lead into a playable game.

## Development Approach

- Keep changes scoped and easy to reason about.
- Preserve a playable vertical slice as the app evolves.
- Prefer explicit game states over scattered boolean flags.
- Add tests where game rules or scoring logic become nontrivial.
- Do not introduce online dependencies for board generation or answer checking in v1.
- Use future docs such as `GAME_SPEC.md` for detailed rules, flows, and board templates.
