# Jeopardy Clone

A local browser-based Jeopardy-style party game for one laptop.

## Project Docs

- Game rules and app behavior: [`docs/GAME_SPEC.md`](docs/GAME_SPEC.md)
- Progress tracker: [`docs/PROGRESS.md`](docs/PROGRESS.md)
- Board generation guide: [`docs/BOARD_GENERATION.md`](docs/BOARD_GENERATION.md)

## Generating Boards

To generate a new board with Codex, ask Codex to follow [`docs/BOARD_GENERATION.md`](docs/BOARD_GENERATION.md) and inspect an existing board in `public/boards`.

Codex should ask a few questions first, wait for your answers, then create a validated board JSON file in `public/boards`.

## Stack

- React
- TypeScript
- Vite
- Plain CSS

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The development server runs at `http://127.0.0.1:5173` by default.
