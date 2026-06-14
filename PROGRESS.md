# PROGRESS.md

Lightweight project progress tracker. Keep this current as the app takes shape.

## Current Focus

Prepare the setup screen and board-loading path for the first playable slice.

## Completed

- Created `AGENTS.md` with agent-facing project guidance.
- Added `.gitignore` and explicitly ignored `githubToken.txt`.
- Created `GAME_SPEC.md` for v1 rules, flow, and board structure.
- Chose the frontend stack: React, TypeScript, Vite, and plain CSS.
- Scaffolded the Vite app.
- Added `public/boards/sample-board.json`.
- Validated the sample board structure: 2 rounds, 12 categories, 60 normal clues, 3 Daily Doubles, and Final Jeopardy.

## In Progress

- Planning the initial setup screen and sample-board loading flow.

## Next Up

- Build the initial setup screen.
- Load and validate the sample board JSON.
- Add shared game types for players, rounds, categories, and clues.
- Add basic board display after setup.

## Notes

- Keep v1 frontend-only and local-first.
- Use host-controlled correctness before adding any automatic grading.
- Generated boards should follow the schema in `GAME_SPEC.md`.
