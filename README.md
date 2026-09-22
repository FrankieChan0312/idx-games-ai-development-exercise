# IDX Games AI Development Exercise — Komi Tic-Tac-Toe

A browser-based two-player tic-tac-toe variant designed so that every legal game terminates and no game ends in a draw.

This repository was created for an AI-assisted development exercise. It includes the playable game, rules and design documentation, exhaustive validation, incremental Git history, and raw AI-development transcripts.

## Run locally

From the repository root:

```powershell
python -m http.server 8000

Then open:

http://localhost:8000/

No build step, backend, database, framework, package installation, or runtime network call is required.

How the variant works
1. Nigiri-style player assignment

Before each game:

Player 1 guesses Odd or Even.
The browser draws and reveals a random integer from 1 through 10.
If Player 1 guessed the parity correctly, Player 1 chooses whether to play as X or O.
If Player 1 guessed incorrectly, Player 2 makes that choice.
The other player receives the remaining mark.
X always makes the first tic-tac-toe move.

The 1–10 range contains five odd and five even values, so the parity draw is symmetric.

2. Normal tic-tac-toe victory

A player wins immediately by completing any row, column, or diagonal of three matching marks.

3. No-draw Komi tiebreak

If the board fills without a normal three-in-a-row winner, O wins via the Komi tiebreak.

Because X always moves first, a full board contains five X marks and four O marks.

A normal three-in-a-row win always takes precedence over Komi, including on move 9.

4. Play Again

After a result, Play Again starts a completely new game, including a fresh Nigiri round and new X/O assignment.

Correctness validation

The X/O game engine is independent from the Nigiri UI layer and was exhaustively traversed over every legal move sequence.

Outcome	Terminal sequences
X normal win	131,184
O normal win	77,904
O Komi win	46,080
Draws	0
Total	255,168

Additional validation:

Maximum legal-move depth: 9
Visited game-tree nodes: 549,946
Focused deterministic checks: 8/8 PASS
Node exhaustive run: PASS
Chrome exhaustive run: PASS
Nigiri/UI scripted scenarios: 120 PASS
Manual Chrome Nigiri/UI checks: PASS

To run the browser validator:

http://localhost:8000/tests/exhaustive.html
Repository structure
index.html — page structure and minimal styling
app.js — UI integration, Nigiri flow, and Player 1 / Player 2 mapping
game.js — DOM-independent X/O game engine and single source of truth
tests/exhaustive.js — exhaustive game-tree validator
tests/exhaustive.html — browser test runner
docs/RULES.md — complete player-facing rules
docs/DESIGN.md — design decisions, rejected alternatives, correctness argument, architecture, and limitations
transcript/README.md — AI-tooling/session guide and validation record
transcript/raw/ — raw Codex rollout files, including abandoned attempts
AI-assisted development record

The work was developed in reviewed phases:

Requirements analysis and ambiguity resolution
Pure game engine plus exhaustive validation
Playable browser UI
Rules and design documentation
Submission-readiness audit
Nigiri player-assignment enhancement and post-change validation

The repository intentionally preserves incremental commits and raw AI session evidence rather than presenting a squashed or curated development history.

See docs/DESIGN.md and transcript/README.md for the detailed engineering record.
