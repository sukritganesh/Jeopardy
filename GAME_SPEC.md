# GAME_SPEC.md

Version 1 game specification for the local Jeopardy-style web app.

This is a living document. Keep it focused on the current playable version, and expand it as the game becomes more capable.

## V1 Goal

Build a local browser-based Jeopardy-style party game that can be played on one laptop by 1 to 3 players.

The app should make the game flow smooth and reliable:

- Load a predefined JSON board.
- Let players configure names and buzzer keys.
- Read clues aloud with browser text-to-speech.
- Detect the first valid buzzer press.
- Track scores and board control.
- Let the host manually mark responses correct or incorrect.
- Run Jeopardy, Double Jeopardy, and Final Jeopardy.

V1 should feel playable before it feels clever.

## Target Platform

- Runs in a desktop browser.
- Optimized for a laptop screen.
- Uses a single shared keyboard for buzzers and host control.
- No backend required for v1.
- No API keys required for v1.

## Players

V1 supports 1 to 3 players.

Each player has:

- `id`: stable internal identifier.
- `name`: display name.
- `buzzerKey`: keyboard key used to buzz.
- `score`: current score.
- `isActive`: whether the player is participating.

Default players:

- Player 1: key `A`
- Player 2: key `K`
- Player 3: key `L`

The setup screen should allow the host to change player names, enabled players, and buzzer keys.

## Game Settings

Default game settings live in `public/config/game-settings.json`.

The settings file controls:

- Board JSON path.
- Answer timer length.
- Final Jeopardy timer length.
- Default buzzer mode.
- Default player count.
- Fixed player buzzer keys.
- Text-to-speech enabled/rate/pitch.

The setup screen should expose these v1 settings:

- Player count: 1, 2, or 3.
- Player names.
- Buzzer mode.

Buzzer keys are fixed by the settings file for v1 and shown on the setup screen.

V1 buzzer modes:

- `early`: players can buzz while the clue is being read. Buzzing stops text-to-speech and starts the answer timer.
- `afterRead`: players can buzz only after the clue has finished being read.

Default setting:

- `afterRead`

## Game Structure

The game has three phases:

1. Jeopardy round.
2. Double Jeopardy round.
3. Final Jeopardy.

The normal rounds use board categories and clue values. Final Jeopardy uses a single category and clue.
The board JSON should contain both normal rounds in one file under `rounds`.

## Round Structure

Each normal round has:

- 6 categories.
- 5 clues per category.
- 30 total clues.
- A fixed value list.

Jeopardy round values:

- 200
- 400
- 600
- 800
- 1000

Double Jeopardy round values:

- 400
- 800
- 1200
- 1600
- 2000

Daily Doubles:

- Any clue with `dailyDouble: true` is treated as a Daily Double.
- The app should not reject a board because of the number of Daily Doubles.
- Generated boards should usually follow the familiar pattern: 1 Daily Double in Jeopardy and 2 in Double Jeopardy.

## Board Control

One player controls the board at a time.

V1 control rules:

- Player 1 starts the Jeopardy round.
- The player who last answered correctly gets control.
- If no player answers a clue correctly, control remains with the player who selected the clue.
- The player with the lowest score starts Double Jeopardy.
- If there is a tie for lowest score, choose the tied player closest to Player 1 order.

The UI should clearly show who currently controls the board.

When the Jeopardy round is complete:

- Show a round transition screen.
- Display current scores.
- Show who will control Double Jeopardy.
- Start Double Jeopardy only after the host confirms.

## Normal Clue Flow

When the controlling player selects a non-Daily Double clue:

1. Mark the clue as selected and unavailable on the board.
2. Show the clue screen.
3. Read the clue aloud using text-to-speech.
4. Open buzzing based on the selected buzzer mode.
5. The first eligible player to buzz gets the attempt.
6. Start a 5-second answer timer.
7. The host enters or observes the response.
8. The host clicks Correct or Incorrect.

If Correct:

- Add the clue value to the buzzing player's score.
- Give board control to that player.
- End the clue and return to the board.

If Incorrect:

- Subtract the clue value from the buzzing player's score.
- Lock that player out for the rest of this clue.
- Reopen buzzing for remaining eligible players.

If all eligible players have attempted incorrectly:

- Show the correct response.
- End the clue.
- Keep board control with the player who selected the clue, unless someone answered correctly earlier.

The host should also have an End Clue or Reveal Response action in case nobody buzzes.

## Buzzer Rules

Only enabled players can buzz.

For each clue:

- A player may buzz only once.
- Incorrect players are locked out for the remainder of the clue.
- The app should ignore repeated keydown events while a key is held.
- Buzzer key matching should be case-insensitive.

In `early` mode:

- Buzzing is enabled as soon as clue reading starts.
- The first buzz stops text-to-speech.
- The answer timer starts immediately.

In `afterRead` mode:

- Buzzing is disabled while text-to-speech is reading.
- Buzzing opens when text-to-speech ends.

## Answer Timer

The answer timer is 5 seconds in v1.

V1 behavior:

- Timer starts when clue reading finishes and buzzers are open.
- Timer resets to the full answer time when a player successfully buzzes.
- Timer resets again if an incorrect response reopens buzzing.
- Timer reaching zero does not automatically score the response.
- Timer reaching zero does not prevent late buzzes in v1.
- Host remains responsible for marking Incorrect or ending the attempt.
- Timer length comes from `public/config/game-settings.json`.

This keeps v1 forgiving during real play.

## Daily Double Flow

When the selected clue is a Daily Double:

1. Show the Daily Double wager screen.
2. Only the selecting player participates.
3. Prompt the selecting player for a wager.
4. Validate the wager.
5. Show and read the clue.
6. Start a 5-second answer timer after reading completes.
7. Host marks Correct or Incorrect.

Daily Double scoring:

- Correct: add the wager to the selecting player's score.
- Incorrect: subtract the wager from the selecting player's score.

Daily Double wager rules:

- Minimum wager is 5.
- In the Jeopardy round, maximum wager is the greater of the player's current score and 1000.
- In Double Jeopardy, maximum wager is the greater of the player's current score and 2000.
- If a player's score is negative or zero, they may still wager up to the round maximum.

Board control after a Daily Double remains with the selecting player.

## Final Jeopardy Flow

Final Jeopardy begins after both normal rounds are complete.

V1 eligibility:

- Players with scores greater than 0 are eligible.
- If no players have scores greater than 0, allow all active players to participate as a party-game fallback.

Flow:

1. Show the Final Jeopardy category.
2. Collect wagers from eligible players.
3. Validate wagers.
4. Reveal and read the clue.
5. Start the Final Jeopardy timer.
6. Reveal the correct response when the timer expires or when the host chooses to reveal early.
7. Host marks each eligible player Correct or Incorrect.
8. Apply scoring.
9. Show final standings.

Final Jeopardy wager rules:

- Minimum wager is 0.
- Maximum wager is the player's current score.
- In party-game fallback mode, players with zero or negative scores may wager 0.

Final Jeopardy scoring:

- Correct: add the wager to the player's score.
- Incorrect: subtract the wager from the player's score.
- Blank response counts as Incorrect unless the host chooses otherwise.

Final Jeopardy timer:

- Default is 30 seconds.
- Timer length comes from `public/config/game-settings.json`.
- Revealing the correct response stops the timer early.
- Timer expiration does not auto-score responses.

## Host Controls

The host is responsible for final judgment in v1.

Required host actions:

- Start game.
- Select clue.
- Mark response Correct.
- Mark response Incorrect.
- Reveal correct response.
- End clue.
- Submit Daily Double wager.
- Submit Final Jeopardy wagers.
- Submit Final Jeopardy responses.
- Advance through Final Jeopardy reveals.

Host controls should be visible only when relevant to the current game state.

## Text-To-Speech

Use the browser Web Speech API for v1.

TTS behavior:

- Read the clue when it is opened.
- Stop reading when an early buzz occurs.
- Provide a replay clue action.
- Do not require voice selection in v1.

If TTS is unavailable:

- The app should still be playable.
- Show a clear non-blocking message that speech is unavailable.

## Screens

V1 screens:

- Setup screen.
- Board screen.
- Clue screen.
- Daily Double wager screen.
- Final Jeopardy category and wager screen.
- Final Jeopardy clue and response screen.
- Final Jeopardy reveal screen.
- Final standings screen.

The board screen should remain the visual center of the app.

## Scoring

Normal clue:

- Correct response adds the clue value.
- Incorrect response subtracts the clue value.

Daily Double:

- Correct response adds the wager.
- Incorrect response subtracts the wager.

Final Jeopardy:

- Correct response adds the wager.
- Incorrect response subtracts the wager.

Scores may be negative.

## Board JSON Schema

V1 board files should follow this shape:

```json
{
  "title": "Sample Game",
  "rounds": [
    {
      "id": "jeopardy",
      "name": "Jeopardy",
      "values": [200, 400, 600, 800, 1000],
      "categories": [
        {
          "title": "World History",
          "clues": [
            {
              "value": 200,
              "clue": "This wall dividing a European city fell in 1989.",
              "correctResponse": "Berlin Wall",
              "acceptedResponses": ["The Berlin Wall"],
              "dailyDouble": false
            }
          ]
        }
      ]
    },
    {
      "id": "doubleJeopardy",
      "name": "Double Jeopardy",
      "values": [400, 800, 1200, 1600, 2000],
      "categories": []
    }
  ],
  "final": {
    "category": "Literature",
    "clue": "This novel begins with the line, 'Call me Ishmael.'",
    "correctResponse": "Moby-Dick",
    "acceptedResponses": ["Moby Dick"]
  }
}
```

Board validation expectations:

- There must be exactly 2 rounds.
- Each round must have exactly 6 categories.
- Each category must have exactly 5 clues.
- Each clue value should match one of the round values.
- Any clue may be marked with `dailyDouble: true`.
- Final Jeopardy must include a category, clue, and correct response.

## Board Generation Guidance

Board files may be generated manually or by Codex before a game.

A generated board should:

- Use clear, unambiguous clues.
- Keep clue text readable aloud.
- Avoid clues that depend on images, audio, video, or current news.
- Include accepted alternate responses where obvious.
- Avoid repeated correct responses.
- Use category titles that fit on the board.
- Make higher-value clues harder than lower-value clues.
- Usually include 1 Daily Double in Jeopardy and 2 in Double Jeopardy, unless a custom board intentionally differs.

Board generation is outside the app in v1. The app only loads board JSON.

## Out Of Scope For V1

These are intentionally deferred:

- Automatic answer grading.
- Offline LLM response judging.
- Microphone input.
- Multiplayer across devices.
- Remote buzzers.
- Online board generation.
- User accounts.
- Persistent game history.
- Advanced board editor.
- Custom TTS voices.
- Sound effects and animation polish beyond basic feedback.

## Open Questions

These are not blockers for v1 implementation, but may be revisited:

- Should the host type normal-round responses, or should the app only show a response text box as an optional note?
- Should the app include keyboard shortcuts for host actions?
- Should Final Jeopardy responses be hidden after each player submits?
- Should v1 include a simple board picker, or always load one default board?
- Should the answer timer become strict in a later mode?
