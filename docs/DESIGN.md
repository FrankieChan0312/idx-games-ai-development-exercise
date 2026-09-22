# Komi Tic-Tac-Toe Design

## Reading of the brief

The core challenge was defining a deterministic tic-tac-toe variant that
cannot draw and always terminates, rather than implementing ordinary
tic-tac-toe. The exercise required a 3-by-3 board, two human players,
alternating turns, and a browser implementation in plain HTML, CSS, and
JavaScript. Current Chrome was the target. The three-hour active-work budget
favored a small implementation with an explicit correctness argument.

The application is served as static files, for example with `python -m http.server`, and requires no build step.
It has no framework, dependencies, backend, database, or network calls. Scripts and
styles are local. Commit history and raw AI-development transcripts form
part of the assessment evidence.

## Ambiguities and resolutions

| Underspecified point | Decision |
| --- | --- |
| What does "always terminates" mean? | Every game reaches a result within nine valid moves, assuming players keep making legal moves. This is a bound on game progress, not wall-clock time. |
| Do invalid clicks or inactivity count as progress? | No. An occupied-square attempt preserves the state and turn. Waiting makes no move. Neither can force a result or invalidate the legal-move bound. |
| Who starts, and what constitutes a line? | X always starts; turns alternate. The three rows, three columns, and two diagonals are the eight winning lines. |
| What if move nine both fills the board and creates a line? | Normal victory takes precedence. A ninth-move X line is `X_WIN`, never Komi. |
| Who receives the fewer-marks tiebreak? | Always O: a full reachable board contains five X marks and four O marks. The engine can award O directly. |
| What happens after a result? | The engine rejects every further move; the UI disables the board and preserves the result. |
| What does reset do, and when is it available? | Play Again appears only after a result. It creates a fresh empty game, clears the old result and assignment, requires a new Nigiri round, and focuses the Odd guess button. X moves first after the new assignment. Reloading also starts fresh. |
| Are scores, persistence, or computer play required? | No. Score tracking and persistence add state beyond a single game; a computer opponent adds behavior beyond the two-human-player brief. All were omitted to keep the exercise focused. |

The player-facing rules are in [RULES.md](RULES.md).

## Alternatives considered in Phase 1

The requirements-analysis record considered these three alternatives:

- **Replay after a conventional draw.** This preserves familiar rules within
  a round, but players can repeat line-free rounds indefinitely. It fails the
  termination requirement.
- **Randomly select a winner on a full line-free board.** This produces a
  winner within nine moves and treats the players symmetrically at the
  tiebreak. It was rejected because the result is nondeterministic, harder to
  reproduce and test, and depends on chance at the decisive moment.
- **Continue by moving or replacing existing marks.** Further player choices
  could determine the winner, but positions can cycle. Guaranteeing
  termination would require additional rules such as repetition detection
  or a move limit, with more state and UI behavior to explain and validate.

## Selected design

Normal three-in-a-row wins immediately. Only if there is no winning line
and the board is full does O receive the Komi tiebreak. The possible outcomes
are `ACTIVE`, `X_WIN`, `O_WIN`, and `O_KOMI`.

Komi is deterministic, adds a tiny implementation surface, preserves a
strict nine-valid-move upper bound, and is easy to test and defend. It needs
no randomness, replay loop, repetition history, or mark-count comparison.
Its balance tradeoff is explicit: every line-free full board awards O.
Competitive balance was not established by the validation, and the sequence
counts below are not player win probabilities.

### Nigiri assignment layer

Nigiri is a thin pre-game human-player assignment layer. Before each game,
Player 1 guesses Odd or Even, then the UI randomly draws and reveals an
integer from 1 through 10. A correct guess lets Player 1 explicitly choose
X or O; an incorrect guess gives Player 2 that choice. The other player
receives the remaining mark. The board stays locked until assignment is
complete, and the assignment cannot then be changed manually. X still moves
first. Play Again clears the assignment and requires a new Nigiri round.

The draw range was deliberately changed from 1–9 to 1–10: the former has
five odd and four even values, while the latter has five of each. This makes
the parity draw symmetric; it does not establish competitive balance for
the underlying game.

`game.js` was not changed and still operates only in X/O terms. `app.js`
generates the Nigiri draw with browser-side `Math.random()` and maps Player 1
and Player 2 to X/O after the chooser selects a mark. Nigiri randomness never
enters the game engine or changes legal X/O game states.

## Termination and no-draw arguments

Each valid move fills exactly one previously empty square. Marks are never
removed during a game. Since there are only nine squares, at most nine valid
moves can occur. A normal win may terminate the game earlier; otherwise the
ninth move fills the board and Komi terminates it. Invalid attempts do not
advance the game, and a reset begins a separate game.

Waiting for a Nigiri guess or an X/O choice is user inactivity, not a
game-state transition. The legal-move bound assumes players complete the
pre-game choices and continue playing.

Every normal winning line terminates with X or O as the winner. If no line
exists after nine moves, `O_KOMI` is terminal. Before then, a line-free board
has an empty square and permits another move. Thus every completed legal
game has a winner; `DRAW` is not an outcome. A move can only create new lines
for the player placing the mark, and any earlier line would already have
ended play.

## Architecture

| File or directory | Responsibility |
| --- | --- |
| `game.js` | DOM-independent single source of truth, exposed as `KomiGame`. Defines winning lines, outcomes, initial state, board evaluation, legal moves, and move application. |
| `index.html` | Page structure and minimal embedded CSS: Nigiri guess and mark-choice buttons, revealed draw and assignment, nine native button cells, a live status region, and Play Again. Loads the engine before the UI adapter. |
| `app.js` | UI adapter and pre-game assignment layer. Runs Nigiri, maps human players to marks, blocks moves until assignment, sends board selections to the engine, and renders marks, disabled cells, accessible labels, human-player turn/result text, and reset visibility. |
| `tests/exhaustive.js` | Eight focused checks and recursive exhaustive validation of the production engine, exposed as `KomiValidation.run()`. |
| `tests/exhaustive.html` | Browser test entry point. Loads the engine and validator and displays PASS with the report, or FAIL with the error. No server is required. |
| `transcript/` | Raw Codex rollout files and a README recording phase context and validation evidence. |

Game states contain a nine-cell board, `nextPlayer`, and `outcome`. Both the
state and board are frozen. An accepted move copies the board and returns a
new state; a rejected move returns the exact original state with a reason.
Terminal states have no next player and no legal moves. Board evaluation
checks winning lines before checking fullness.

The UI does not implement its own winner detection. It maps terminal engine
outcomes to `Player 1 won` or `Player 2 won`, adding `with Komi` for the human
assigned O when the outcome is `O_KOMI`. Turn text includes the human and mark,
such as `Player 2 (X)'s turn`. Play Again calls `createGame()`, clears the
Nigiri result and assignment, and renders the locked board for a new guess.

## Exhaustive verification

`KomiValidation.run()` first performs eight focused deterministic checks,
then traverses from the empty board at depth zero. Every legal successor is
recursively visited. Recursion stops immediately at terminal states: the
validator still attempts all nine squares there to verify rejection, but
does not recurse into any further game state.

There is no memoization. Distinct move orders count as distinct game
sequences, even if they reach the same board. Visited nodes therefore count
game-tree visits, not unique positions.

The validator derives winning-line geometry independently: it scans rows
and columns and explicitly checks the two diagonals without using the
engine's winning-line table. At each node it checks:

- Board size and cell values; X/O counts against move depth; correct turn
  parity; and absence of simultaneous X and O lines.
- Expected outcome from independent line detection and fullness, including
  normal-win precedence; repeated engine evaluation against that result.
- The complete legal-successor list, including no successors at terminals.
- Move acceptance for all nine squares, rejection reasons, and preservation
  of the original state on rejection.
- Each accepted successor has a separate state and board and changes exactly
  one empty square to the current player's mark. Parent state remains
  unchanged after successor traversal.
- Depth never exceeds nine, and every leaf has a recognized winning outcome.

Regression oracles are compared only after traversal: outcome counts,
draw count, total terminal sequences, and maximum depth. The visited-node
count is returned in the report; it is not a hard-coded assertion.

Verified results recorded for Node and Chrome:

| Measurement | Result |
| --- | ---: |
| `X_WIN` | 131184 |
| `O_WIN` | 77904 |
| `O_KOMI` | 46080 |
| Draws | 0 |
| Total terminal legal sequences | 255168 |
| Maximum legal-move depth | 9 |
| Visited game-tree nodes | 549946 |
| Focused deterministic checks | 8/8 PASS |

The post-Nigiri exhaustive regression reproduced these same results:
`X_WIN 131184`, `O_WIN 77904`, `O_KOMI 46080`, `draws 0`, `total 255168`,
`maxDepth 9`, and `visitedNodes 549946`. The exhaustive game-tree proof and
counts remain unchanged because Nigiri does not alter legal X/O game states.

The eight focused checks cover an X row win, an O normal win, a diagonal
win, occupied-square state/turn preservation, post-terminal rejection for
all outcomes, move-nine normal-win precedence, full-board Komi, and invalid
square indices.

Node exhaustive execution and Chrome exhaustive execution passed. Manual
Chrome UI checks passed for X victory, O victory, Komi, occupied-square
rejection, Play Again/reset, and post-game locking. Exhaustive regression
also passed after UI integration. These are recorded validation results,
not a claim of new browser testing during documentation work.

Manual Chrome Nigiri/UI validation also passed, as reported after review:
pre-game board locking; Odd/Even guesses and revealed draws; correct guesses
giving Player 1 the choice and incorrect guesses giving Player 2 the choice;
chooser selection of either X or O; correct human-player mapping for X wins,
O wins, and `O_KOMI`; and Play Again requiring a new Nigiri round. Exhaustive
regression remained unchanged. These are reported completed checks, not new
browser testing performed during this documentation update.

The [transcript README](../transcript/README.md) records the earlier manual Chrome
checks, which occurred after the implementation sessions and are not
themselves in the raw Codex conversations. To rerun the browser validator,
open `tests/exhaustive.html` directly in Chrome; reload to repeat it.

## AI-assisted development approach

The work proceeded in reviewed phases: requirements analysis before coding,
rule decisions before implementation, a pure engine and exhaustive
validation before the UI, then manual browser validation. Codex assisted
with analysis, implementation, and checks under the candidate's direction;
the workflow did not treat generated work as automatically accepted.

Natural git checkpoints preserved requirements analysis, engine/validator
work, UI work, and their transcript evidence. Raw Codex rollout files are
preserved under `transcript/raw/`, with capture context in its README. The
record retains failed or abandoned attempts rather than presenting a
curated claim of autonomous success. The documentation was reviewed before
being committed at the Phase 4 checkpoint.

## Known limitations and unfinished work

- No score history, persistence, or computer opponent. These are deliberate
  scope decisions; each game is an independent two-human-player session.
- Visual design is minimal, with no elaborate presentation.
- The validator is synchronous and may briefly block the browser test tab.
  The HTML runner schedules it after a zero-delay timer; traversal itself
  still runs synchronously.
- The game API assumes states produced by `createGame()` / `playMove()`.
  It checks move inputs but does not validate arbitrary malicious state
  objects; board evaluation likewise assumes reachable boards.
- Exhaustive validation covers engine move sequences, not DOM interaction.
  The documented manual browser checks provide the UI evidence.

No known implementation defect was identified during this documentation
review. The omitted features above are scope choices, not unfinished parts
of the required game.
