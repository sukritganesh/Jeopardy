# PROGRESS.md

Lightweight project progress tracker. Keep this current as the app takes shape.

## Current Focus

Turn the setup -> board -> clue vertical slice into full Jeopardy gameplay.

## Completed

- Created `AGENTS.md` with agent-facing project guidance.
- Added `.gitignore` and explicitly ignored `githubToken.txt`.
- Created `GAME_SPEC.md` for v1 rules, flow, and board structure.
- Chose the frontend stack: React, TypeScript, Vite, and plain CSS.
- Scaffolded the Vite app.
- Added `public/boards/sample-board.json`.
- Validated the sample board structure: 2 rounds, 12 categories, 60 normal clues, 3 Daily Doubles, and Final Jeopardy.
- Added shared game types, board loading, and board validation helpers.
- Built the initial setup screen.
- Built the first board screen with player scores, control indicator, and clue tiles.
- Built the first clue screen with temporary host-scoring controls.
- Added basic score updates, selected-clue tracking, and incorrect-answer lockouts for the vertical slice.

## In Progress

- Expanding the first playable slice toward real buzzer, text-to-speech, and round flow behavior.

## Next Up

- Add keyboard buzzer handling.
- Add text-to-speech clue reading.
- Add the 5-second answer timer.
- Add Daily Double wager flow.
- Add round completion and Double Jeopardy transition.
- Add Final Jeopardy screens.

## Notes

- Keep v1 frontend-only and local-first.
- Use host-controlled correctness before adding any automatic grading.
- Generated boards should follow the schema in `GAME_SPEC.md`.
