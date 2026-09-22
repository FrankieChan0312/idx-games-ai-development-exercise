"use strict";

(() => {
  const cells = document.querySelectorAll("#board button[data-index]");
  const status = document.getElementById("status");
  const playAgain = document.getElementById("play-again");
  const resultMessages = {
    [KomiGame.OUTCOME.X_WIN]: "Player X won",
    [KomiGame.OUTCOME.O_WIN]: "Player O won",
    [KomiGame.OUTCOME.O_KOMI]: "Player O won with Komi",
  };
  let state = KomiGame.createGame();

  function render() {
    const legalMoves = KomiGame.getLegalMoves(state);
    cells.forEach(cell => {
      const index = Number(cell.dataset.index);
      const mark = state.board[index];
      cell.textContent = mark ?? "";
      cell.disabled = !legalMoves.includes(index);
      cell.setAttribute("aria-label",
        `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, ${mark ?? "empty"}`);
    });
    const active = state.outcome === KomiGame.OUTCOME.ACTIVE;
    status.textContent = active
      ? `Player ${state.nextPlayer}'s turn`
      : resultMessages[state.outcome];
    playAgain.hidden = active;
  }

  cells.forEach(cell => {
    cell.addEventListener("click", () => {
      state = KomiGame.playMove(state, Number(cell.dataset.index)).state;
      render();
    });
  });

  playAgain.addEventListener("click", () => {
    state = KomiGame.createGame();
    render();
    cells[0].focus();
  });

  render();
})();
