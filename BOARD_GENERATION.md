# BOARD_GENERATION.md

Guide for using Codex to generate Jeopardy-style board JSON files for this app.

This is not app runtime documentation. It is a working prompt guide for future board-generation sessions.

## How To Use This File

When asked to generate a board, Codex should first read:

- `BOARD_GENERATION.md`
- `GAME_SPEC.md`
- One existing board, usually `public/boards/sample-board.json` or `public/boards/trivia-night-board.json`

Then Codex should ask the host a few setup questions and wait for the next user reply before generating the board.

Do not generate the board in the same response as the first questions unless the user explicitly says to skip questions.

## First Response Protocol

Ask 4 to 6 concise questions. Prefer these:

1. Difficulty: casual, medium, hard, mixed, or custom?
2. Theme: any overall theme, event, group, inside jokes, or occasion?
3. Categories: any required categories or banned categories?
4. Audience: age range, school/work/family context, and any topics to avoid?
5. Tone: straightforward trivia, silly, academic, pop-culture-heavy, or balanced?
6. Output preference: create a file in `public/boards`, or print JSON for review?

After asking, stop and wait.

If the user gives enough information up front, summarize the inferred choices and ask only for missing essentials.

## Board File Requirements

Generated boards must match the app schema:

- Top-level `title`.
- Exactly 2 rounds in `rounds`.
- Round 1:
  - `id`: `jeopardy`
  - `name`: `Jeopardy`
  - `values`: `[200, 400, 600, 800, 1000]`
  - Exactly 6 categories.
  - Exactly 5 clues per category.
- Round 2:
  - `id`: `doubleJeopardy`
  - `name`: `Double Jeopardy`
  - `values`: `[400, 800, 1200, 1600, 2000]`
  - Exactly 6 categories.
  - Exactly 5 clues per category.
- Top-level `final` object with:
  - `category`
  - `clue`
  - `correctResponse`
  - `acceptedResponses`

Each normal clue must include:

- `value`
- `clue`
- `correctResponse`
- `acceptedResponses`
- `dailyDouble`

Use `acceptedResponses: []` when there are no obvious aliases.

## Jeopardy-Style Content Rules

Write clues in the style of a prompt read by a host.

Good clue style:

- Clear and specific.
- Short enough to read aloud smoothly.
- One intended correct response.
- No trick wording unless the category clearly signals it.
- No dependency on images, audio, video, gestures, or external materials.

Avoid:

- Ambiguous clues with multiple equally plausible answers.
- Very long clues.
- Current-news clues unless the user specifically requests a current-events board.
- Highly obscure facts in low-value clues.
- Repeating the same correct response across the board.
- Category titles that are too long for the game board.

Correct responses:

- Store the direct answer in `correctResponse`, not Jeopardy's spoken "What is..." phrasing.
- Prefer concise names, terms, places, or titles.
- Include obvious aliases in `acceptedResponses`.
- Include articles such as "The" in `acceptedResponses` when useful.

## Difficulty Ladder

Within each category, difficulty should generally rise with value.

For Jeopardy:

- `$200`: broadly known, quick recall.
- `$400`: common knowledge with a little specificity.
- `$600`: moderate knowledge.
- `$800`: more specific or less commonly known.
- `$1000`: hardest clue in that category.

For Double Jeopardy:

- `$400`: medium.
- `$800`: medium-plus.
- `$1200`: hard.
- `$1600`: harder.
- `$2000`: hardest, but still answerable for the intended audience.

Do not make difficulty rise only by making clues vague. Higher-value clues should still be fair.

## Daily Doubles

Default placement:

- Exactly 1 Daily Double in the Jeopardy round.
- Exactly 2 Daily Doubles in Double Jeopardy.

Placement guidance:

- Do not put Daily Doubles in the lowest-value row unless the user requests an easier game.
- Prefer middle-to-high values.
- Spread Daily Doubles across different categories.
- Mark Daily Doubles with `"dailyDouble": true`.
- All other clues must use `"dailyDouble": false`.

The app can technically handle any number of Daily Doubles, but generated boards should follow the standard 1-and-2 pattern unless intentionally customized.

## Category Design

Use 12 normal-round categories total:

- 6 for Jeopardy.
- 6 for Double Jeopardy.

Aim for variety unless the user requests a tightly themed board.

Useful category types:

- General knowledge.
- Wordplay.
- Science.
- History.
- Geography.
- Books.
- Movies and TV.
- Music.
- Sports.
- Food.
- Technology.
- Theme-specific categories.

Make categories distinct. Avoid two categories that test almost the same knowledge.

Category titles should be:

- Short.
- Display-friendly.
- Understandable without explanation.
- Ideally 1 to 3 words.

## Final Jeopardy

Final Jeopardy should have:

- A category that signals the domain.
- One clue.
- One clear correct response.
- A difficulty level appropriate for a final clue: challenging but fair.

Avoid final clues that rely on tiny details unless the requested board is hard.

## Output Rules

When generating a board file:

- Prefer creating a new file in `public/boards`.
- Use a lowercase kebab-case filename, such as `movie-night-board.json`.
- Do not overwrite existing boards unless the user explicitly asks.
- Keep JSON valid and pretty-printed with 2-space indentation.
- Do not include comments in JSON.

When printing JSON instead of writing a file:

- Put the complete JSON in one fenced `json` block.
- Do not omit middle categories or say "and so on".

## Self-Check Before Final Answer

Before handing the board to the user, verify:

- JSON parses.
- Exactly 2 rounds.
- Exactly 6 categories per round.
- Exactly 5 clues per category.
- Exactly 60 normal clues total.
- Round values match the app values.
- Exactly 1 Daily Double in Jeopardy unless customized.
- Exactly 2 Daily Doubles in Double Jeopardy unless customized.
- Final Jeopardy exists and has category, clue, correct response, and accepted responses.
- No duplicate category titles.
- No duplicate correct responses unless intentionally justified.
- Clues are readable aloud.

If working in the repo, run a quick JSON parse check after writing the file.

## Final Response After Generation

Keep the final response short:

- Name the generated board file.
- Mention the title.
- Mention the structural counts.
- Mention Daily Double count and Final Jeopardy category.
- Mention validation performed.

Example:

Generated `public/boards/movie-night-board.json` titled `Movie Night`.
It has 2 rounds, 12 categories, 60 normal clues, 3 Daily Doubles, and Final Jeopardy category `Award Winners`.
I validated that the JSON parses and matches the app board structure.
