"use strict";

// Classic browser script: load before any UI or validator that uses KomiGame.
const KomiGame = (() => {
  const WINNING_LINES = Object.freeze([
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ].map(Object.freeze));

  const OUTCOME = Object.freeze({
    ACTIVE: "ACTIVE",
    X_WIN: "X_WIN",
    O_WIN: "O_WIN",
    O_KOMI: "O_KOMI",
  });

  // Board indices are row-major, 0..8; null represents an empty square.
  // Accepts reachable boards. Normal wins must be checked before fullness.
  function evaluateBoard(board) {
    for (const [a, b, c] of WINNING_LINES) {
      if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
        return board[a] === "X" ? OUTCOME.X_WIN : OUTCOME.O_WIN;
      }
    }
    return board.every(cell => cell !== null) ? OUTCOME.O_KOMI : OUTCOME.ACTIVE;
  }

  function makeState(board, nextPlayer, outcome) {
    return Object.freeze({ board: Object.freeze(board), nextPlayer, outcome });
  }

  function createGame() {
    return makeState(Array(9).fill(null), "X", OUTCOME.ACTIVE);
  }

  // State arguments come from createGame() or successful playMove() calls.
  function getLegalMoves(state) {
    if (state.outcome !== OUTCOME.ACTIVE) return [];
    return state.board.flatMap((cell, index) => cell === null ? [index] : []);
  }

  // Rejections retain the exact state object. Terminal states have no next player.
  function playMove(state, index) {
    if (state.outcome !== OUTCOME.ACTIVE) {
      return { accepted: false, state, reason: "TERMINAL" };
    }
    if (!Number.isInteger(index) || index < 0 || index > 8) {
      return { accepted: false, state, reason: "INVALID_SQUARE" };
    }
    if (state.board[index] !== null) {
      return { accepted: false, state, reason: "OCCUPIED" };
    }

    const board = state.board.slice();
    board[index] = state.nextPlayer;
    const outcome = evaluateBoard(board);
    const nextPlayer = outcome === OUTCOME.ACTIVE
      ? (state.nextPlayer === "X" ? "O" : "X")
      : null;
    return { accepted: true, state: makeState(board, nextPlayer, outcome), reason: null };
  }

  return Object.freeze({ WINNING_LINES, OUTCOME, createGame, evaluateBoard, getLegalMoves, playMove });
})();
