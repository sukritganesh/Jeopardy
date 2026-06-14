# PROGRESS.md

Lightweight project progress tracker. Keep this current as the app takes shape.

## Current Focus

Turn the normal clue loop into complete round flow, then add Daily Double and Final Jeopardy screens.

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
- Added `public/config/game-settings.json` for board path, timer, TTS, buzz mode, player count, and fixed buzzer keys.
- Added keyboard buzzer handling for fixed player keys.
- Added browser text-to-speech clue reading with replay and unavailable-browser fallback.
- Added the 5-second answer timer from settings.
- Added Daily Double detection from `dailyDouble: true` board JSON markers.
- Added Daily Double wager screen and wager-based scoring.
- Relaxed board validation so any number of marked Daily Doubles is allowed.
- Confirmed `sample-board.json` contains both Jeopardy and Double Jeopardy rounds.
- Added round completion detection.
- Added transition from Jeopardy to Double Jeopardy.
- Added lowest-score player control for starting Double Jeopardy.
- Added the post-reading buzz grace timer and reset behavior after incorrect responses.
- Added Final Jeopardy category/wager screen.
- Added Final Jeopardy clue reading with a 30-second timer.
- Added early reveal for the Final Jeopardy correct response.
- Added Final Jeopardy host scoring and final standings.

## In Progress

- Testing the full game loop from setup through Final Jeopardy.

## Next Up

- Add stricter validation for duplicate buzzer keys in settings/setup.
- Remove the temporary 2-clue round-completion testing shortcut.

## Notes

- Keep v1 frontend-only and local-first.
- Use host-controlled correctness before adding any automatic grading.
- Generated boards should follow the schema in `GAME_SPEC.md`.
