# Komi Tic-Tac-Toe Rules

## Objective, board, and players

Two human players share a 3-by-3 board of nine squares. One player uses X and
the other uses O. Start with every square empty. X always moves first.

Win by making a straight line of three of your own marks. If the board fills
without either player making a line, O wins the Komi tiebreak described below.
There are no draws.

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

- `Player X won` for a normal X victory.
- `Player O won` for a normal O victory.
- `Player O won with Komi` for the full-board tiebreak.

After any result, no further moves are allowed. The final board and result
remain visible. Select **Play Again**, which appears after the game ends,
to clear all nine squares and the previous result and start a new game with
X to move.

Each game ends within nine legal moves if the players continue playing.
Invalid attempts and time spent waiting do not count as moves.
