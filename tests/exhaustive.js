"use strict";

const KomiValidation = (() => {
  const { createGame, evaluateBoard, getLegalMoves, playMove, OUTCOME } = KomiGame;

  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  // Independent geometry check: do not reuse the engine's winning-line table.
  function hasLine(board, player) {
    for (let n = 0; n < 3; n += 1) {
      if ([0, 1, 2].every(column => board[3 * n + column] === player)) return true;
      if ([0, 1, 2].every(row => board[3 * row + n] === player)) return true;
    }
    return [0, 4, 8].every(index => board[index] === player)
      || [2, 4, 6].every(index => board[index] === player);
  }

  function playSequence(moves) {
    let state = createGame();
    for (const index of moves) {
      const result = playMove(state, index);
      assert(result.accepted, `Focused sequence rejected square ${index}`);
      state = result.state;
    }
    return state;
  }

  function focusedChecks() {
    const passed = [];
    function check(name, callback) {
      callback();
      passed.push(name);
    }

    check("X row win", () => {
      assert(playSequence([0, 3, 1, 4, 2]).outcome === OUTCOME.X_WIN, "X row win");
    });
    check("O normal win", () => {
      assert(playSequence([0, 3, 1, 4, 8, 5]).outcome === OUTCOME.O_WIN, "O row win");
    });
    check("Diagonal win", () => {
      assert(playSequence([0, 1, 4, 2, 8]).outcome === OUTCOME.X_WIN, "X diagonal win");
    });
    check("Occupied square preserves state and turn", () => {
      const state = playSequence([0]);
      const before = JSON.stringify(state);
      const result = playMove(state, 0);
      assert(!result.accepted && result.reason === "OCCUPIED", "Occupied square accepted");
      assert(result.state === state && JSON.stringify(state) === before, "Rejected move changed state");
      assert(state.nextPlayer === "O", "Rejected move consumed turn");
      assert(playMove(result.state, 1).state.board[1] === "O", "O cannot move after rejection");
    });
    check("Post-terminal moves rejected for all outcomes", () => {
      for (const moves of [
        [0, 3, 1, 4, 2],
        [0, 3, 1, 4, 8, 5],
        [0, 1, 2, 4, 3, 5, 7, 6, 8],
      ]) {
        const state = playSequence(moves);
        const before = JSON.stringify(state);
        assert(getLegalMoves(state).length === 0, "Terminal state offers moves");
        for (let index = 0; index < 9; index += 1) {
          const result = playMove(state, index);
          assert(!result.accepted && result.reason === "TERMINAL" && result.state === state,
            "Terminal move was not rejected");
        }
        assert(JSON.stringify(state) === before, "Terminal state changed");
      }
    });
    check("Move-9 X normal win precedes Komi", () => {
      const before = playSequence([0, 1, 4, 2, 5, 3, 6, 7]);
      assert(before.outcome === OUTCOME.ACTIVE, "Game ended before move 9");
      const result = playMove(before, 8);
      assert(result.accepted && result.state.board.every(cell => cell !== null), "Move 9 did not fill board");
      assert(result.state.outcome === OUTCOME.X_WIN, "Komi overrode move-9 X win");
    });
    check("Full line-free board produces O_KOMI", () => {
      const state = playSequence([0, 1, 2, 4, 3, 5, 7, 6, 8]);
      assert(state.board.every(cell => cell !== null), "Komi board is not full");
      assert(!hasLine(state.board, "X") && !hasLine(state.board, "O"), "Komi board has a line");
      assert(state.outcome === OUTCOME.O_KOMI, "Missing O Komi win");
    });
    check("Invalid square indices preserve state", () => {
      const state = createGame();
      for (const index of [-1, 9, 1.5, "0", null, undefined, NaN, Infinity]) {
        const result = playMove(state, index);
        assert(!result.accepted && result.reason === "INVALID_SQUARE" && result.state === state,
          "Invalid square was not rejected");
      }
    });
    return passed;
  }

  function run() {
    const focused = focusedChecks();
    const counts = { X_WIN: 0, O_WIN: 0, O_KOMI: 0, draws: 0, total: 0 };
    let visitedNodes = 0;
    let maxDepth = 0;
    const path = [];

    function verify(condition, message) {
      if (!condition) throw new Error(`${message}; move sequence: [${path.join(", ")}]`);
    }

    // No memoization: distinct move orders must count as distinct legal games.
    function visit(state, depth) {
      visitedNodes += 1;
      maxDepth = Math.max(maxDepth, depth);
      verify(depth <= 9, "Legal game exceeded 9 moves");
      const boardBefore = state.board.slice();
      const nextBefore = state.nextPlayer;
      const outcomeBefore = state.outcome;
      const xCount = state.board.filter(cell => cell === "X").length;
      const oCount = state.board.filter(cell => cell === "O").length;
      verify(state.board.length === 9 && state.board.every(cell => [null, "X", "O"].includes(cell)),
        "Invalid board representation");
      verify(xCount === Math.ceil(depth / 2) && oCount === Math.floor(depth / 2), "Invalid X/O parity");
      const xLine = hasLine(state.board, "X");
      const oLine = hasLine(state.board, "O");
      verify(!(xLine && oLine), "Both players have winning lines");
      const expected = xLine ? OUTCOME.X_WIN : oLine ? OUTCOME.O_WIN
        : depth === 9 ? OUTCOME.O_KOMI : OUTCOME.ACTIVE;
      verify(state.outcome === expected, "Wrong outcome or normal-win precedence");
      verify(evaluateBoard(state.board) === expected && evaluateBoard(state.board) === expected,
        "Board evaluation is incorrect or nondeterministic");
      const terminal = expected !== OUTCOME.ACTIVE;
      verify(state.nextPlayer === (terminal ? null : depth % 2 === 0 ? "X" : "O"), "Wrong next player");
      if (xLine) verify(xCount === oCount + 1, "X won out of turn");
      if (oLine) verify(xCount === oCount, "O won out of turn");

      const legalMoves = getLegalMoves(state);
      const expectedMoves = terminal ? [] : state.board.flatMap((cell, index) => cell === null ? [index] : []);
      verify(JSON.stringify(legalMoves) === JSON.stringify(expectedMoves), "Incorrect legal successors");

      // Check every square, including occupied squares and all terminal attempts.
      for (let index = 0; index < 9; index += 1) {
        const result = playMove(state, index);
        const shouldAccept = !terminal && state.board[index] === null;
        verify(result.accepted === shouldAccept, "Incorrect move acceptance");
        if (!shouldAccept) {
          verify(result.state === state, "Rejected move replaced state");
          verify(result.reason === (terminal ? "TERMINAL" : "OCCUPIED"), "Wrong rejection reason");
          continue;
        }
        verify(result.reason === null && result.state !== state && result.state.board !== state.board,
          "Accepted move did not create an independent state");
        const changed = state.board.flatMap((cell, square) => cell !== result.state.board[square] ? [square] : []);
        verify(changed.length === 1 && changed[0] === index && state.board[index] === null,
          "Successor must fill exactly one empty square");
        verify(result.state.board[index] === state.nextPlayer, "Wrong player placed mark");
        path.push(index);
        visit(result.state, depth + 1);
        path.pop();
      }

      verify(state.board.every((cell, index) => cell === boardBefore[index])
        && state.nextPlayer === nextBefore && state.outcome === outcomeBefore, "Input state was mutated");
      if (legalMoves.length === 0) {
        counts.total += 1;
        if (state.outcome === OUTCOME.ACTIVE || state.outcome === "DRAW") counts.draws += 1;
        verify(terminal && state.outcome !== OUTCOME.ACTIVE, "Nonterminal leaf");
        verify([OUTCOME.X_WIN, OUTCOME.O_WIN, OUTCOME.O_KOMI].includes(state.outcome), "Draw or unknown leaf");
        counts[state.outcome] += 1;
      }
    }

    visit(createGame(), 0);

    // Regression oracles are compared only after the actual traversal finishes.
    const expectedCounts = { X_WIN: 131184, O_WIN: 77904, O_KOMI: 46080, draws: 0, total: 255168 };
    for (const key of Object.keys(expectedCounts)) {
      assert(counts[key] === expectedCounts[key], `Count mismatch for ${key}: actual ${counts[key]}, expected ${expectedCounts[key]}`);
    }
    assert(maxDepth === 9, `Expected maximum depth 9, got ${maxDepth}`);
    return { focusedChecks: focused, counts, maxDepth, visitedNodes };
  }

  return Object.freeze({ run });
})();
