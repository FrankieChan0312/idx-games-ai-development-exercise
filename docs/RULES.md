# Komi Tic-Tac-Toe Rules

## Objective, board, and players

Two human players share a 3-by-3 board of nine squares. One player uses X and
the other uses O. Start with every square empty. X always moves first.

Win by making a straight line of three of your own marks. If the board fills
without either player making a line, O wins the Komi tiebreak described below.
There are no draws.

## Before each game: Nigiri

1. Player 1 guesses **Odd** or **Even**.
2. The application randomly draws and reveals an integer from **1 through
   10**. This range contains five odd and five even numbers, so the parity
   draw is symmetric.
3. If Player 1 guessed correctly, Player 1 chooses whether to be **X** or
   **O**. If Player 1 guessed incorrectly, Player 2 makes that choice instead.
4. The chooser must explicitly select a mark. The other player automatically
   receives the other mark. The assignment is displayed as `Player 1 = X /
   Player 2 = O` or `Player 1 = O / Player 2 = X` and cannot be changed manually.
5. **X always takes the first tic-tac-toe move**, whichever human received X.

The board does not accept moves until Nigiri and mark assignment are complete.
Turn messages identify both the human player and mark, for example
`Player 2 (X)'s turn`. Nigiri does not change the normal-win or Komi rules below.

## Taking turns

On your turn, place your mark in exactly one empty square. This is a legal
move only while the game is still in progress. After each legal move, the
other player takes the next turn unless the move ended the game.

Marks stay where they were placed: you cannot move, replace, or remove them.
Trying to play an occupied square is not a legal move. It changes nothing
and does not consume your turn; choose an empty square instead.

## Normal victory

Three of your marks in any one of these eight lines wins:

1. The top row.
2. The middle row.
3. The bottom row.
4. The left column.
5. The middle column.
6. The right column.
7. The diagonal from top left through the center to bottom right.
8. The diagonal from top right through the center to bottom left.

A normal victory ends the game immediately. The other player does not get
another turn, even if empty squares remain.

## Full-board Komi tiebreak

If the ninth legal move fills the board and neither player has a winning
line, the player with fewer marks wins. Because X starts and turns alternate,
a full board has five X marks and four O marks. Therefore this tiebreak
always awards O the win. This is what **Komi** means in this game.

Always check for a normal victory first. If X completes a winning line on
move nine, X wins normally; Komi does not override that victory. Komi applies
only to a full board with no winning line.

## Ending and playing again

The result announcement is exactly one of:

- `Player 1 won` or `Player 2 won` for a normal victory, according to which
  human holds the winning mark.
- `Player 1 won with Komi` or `Player 2 won with Komi` for the full-board
  tiebreak, according to which human holds O.

After any result, no further moves are allowed. The final board and result
remain visible. Select **Play Again**, which appears after the game ends,
to clear all nine squares, the previous result, and the previous assignment.
Each new game requires a new Nigiri round and a new X/O choice before X moves.

Each game ends within nine legal moves if the players continue playing.
Invalid attempts and time spent waiting do not count as moves.
