"use strict";

(() => {
  const cells = document.querySelectorAll("#board button[data-index]");
  const status = document.getElementById("status");
  const playAgain = document.getElementById("play-again");
  const assignment = document.getElementById("assignment");
  const guesses = document.getElementById("nigiri-guesses");
  const guessButtons = document.querySelectorAll("[data-guess]");
  const choices = document.getElementById("mark-choices");
  const choiceButtons = document.querySelectorAll("[data-mark]");
  const nigiriResult = document.getElementById("nigiri-result");
  let player1Mark = null;
  let chooser = null;
  let state = KomiGame.createGame();

  function playerName(mark) {
    return mark === player1Mark ? "Player 1" : "Player 2";
  }

  function render() {
    const legalMoves = player1Mark === null ? [] : KomiGame.getLegalMoves(state);
    cells.forEach(cell => {
      const index = Number(cell.dataset.index);
      const mark = state.board[index];
      cell.textContent = mark ?? "";
      cell.disabled = !legalMoves.includes(index);
      cell.setAttribute("aria-label",
        `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}, ${mark ?? "empty"}`);
    });
    guesses.hidden = chooser !== null;
    choices.hidden = chooser === null || player1Mark !== null;
    assignment.hidden = player1Mark === null;
    assignment.textContent = player1Mark === null ? ""
      : `Player 1 = ${player1Mark} / Player 2 = ${player1Mark === "X" ? "O" : "X"}`;
    const resultMessages = {
      [KomiGame.OUTCOME.X_WIN]: `${playerName("X")} won`,
      [KomiGame.OUTCOME.O_WIN]: `${playerName("O")} won`,
      [KomiGame.OUTCOME.O_KOMI]: `${playerName("O")} won with Komi`,
    };
    const active = state.outcome === KomiGame.OUTCOME.ACTIVE;
    status.textContent = chooser === null
      ? "Nigiri: Player 1, guess Odd or Even."
      : player1Mark === null
      ? `Player ${chooser}, choose X or O. X moves first.`
      : active
      ? `${playerName(state.nextPlayer)} (${state.nextPlayer})'s turn`
      : resultMessages[state.outcome];
    playAgain.hidden = active;
  }

  cells.forEach(cell => {
    cell.addEventListener("click", () => {
      if (player1Mark === null) return;
      state = KomiGame.playMove(state, Number(cell.dataset.index)).state;
      render();
    });
  });

  guessButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (chooser !== null) return;
      const number = Math.floor(Math.random() * 10) + 1;
      const parity = number % 2 === 0 ? "Even" : "Odd";
      chooser = button.dataset.guess === parity ? 1 : 2;
      nigiriResult.textContent = `Player 1 guessed ${button.dataset.guess}. Draw: ${number} (${parity}). Player ${chooser} chooses their mark.`;
      nigiriResult.hidden = false;
      render();
      choiceButtons[0].focus();
    });
  });

  choiceButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (chooser === null || player1Mark !== null) return;
      player1Mark = chooser === 1 ? button.dataset.mark
        : button.dataset.mark === "X" ? "O" : "X";
      render();
      cells[0].focus();
    });
  });

  playAgain.addEventListener("click", () => {
    if (state.outcome === KomiGame.OUTCOME.ACTIVE) return;
    state = KomiGame.createGame();
    player1Mark = null;
    chooser = null;
    nigiriResult.textContent = "";
    nigiriResult.hidden = true;
    render();
    guessButtons[0].focus();
  });

  render();
})();
