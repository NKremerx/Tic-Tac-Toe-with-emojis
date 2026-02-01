/**
 * Game Module - Core game logic and board management
 */
const Game = (function() {
    // DOM Elements
    let boardElement = null;
    let cells = [];

    /**
     * Initialize game module
     */
    function init() {
        boardElement = document.getElementById('game-board');
        cells = document.querySelectorAll('.cell');

        // Add click handlers to cells
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => handleCellClick(index));
        });

        // Subscribe to state changes
        State.subscribe('moveMade', handleMoveMade);
        State.subscribe('gameReset', renderBoard);
        State.subscribe('gameOver', handleGameOver);
    }

    /**
     * Handle cell click
     */
    function handleCellClick(index) {
        const state = State.getState();

        // Ignore clicks if:
        // - Game is over
        // - Cell is already filled
        // - AI is thinking (in 1-player mode)
        // - It's not the human player's turn (in 1-player mode)
        if (state.isGameOver) return;
        if (state.board[index] !== null) return;
        if (state.isAiThinking) return;
        if (state.gameMode === '1player' && state.currentPlayer === 2) return;

        // Make the move
        const success = State.makeMove(index, state.currentPlayer);

        if (success) {
            Audio.playPlace();
        }
    }

    /**
     * Handle move made event
     */
    function handleMoveMade({ index, player, board }) {
        // Update cell display
        const cell = cells[index];
        const emoji = player === 1 ? State.get('player1Emoji') : State.get('player2Emoji');

        cell.textContent = emoji;
        cell.classList.add('filled', 'pop-in');

        // Check for winner
        const winner = AI.checkWinner(board);
        if (winner) {
            const winningCells = getWinningCells(board);
            State.setGameOver(winner, winningCells);
            return;
        }

        // Check for draw
        if (AI.isBoardFull(board)) {
            State.setGameOver('draw');
            return;
        }

        // Update turn indicator
        updateTurnIndicator();

        // If 1-player mode and AI's turn, make AI move
        const state = State.getState();
        if (state.gameMode === '1player' && state.currentPlayer === 2 && !state.isGameOver) {
            AI.makeMove(600).then(success => {
                if (success) {
                    Audio.playPlace();
                }
            });
        }
    }

    /**
     * Get winning cells
     */
    function getWinningCells(board) {
        for (const combo of AI.WIN_COMBINATIONS) {
            const [a, b, c] = combo;
            if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
                return combo;
            }
        }
        return [];
    }

    /**
     * Handle game over
     */
    function handleGameOver({ winner, winningCells }) {
        const state = State.getState();

        // Highlight winning cells
        if (winningCells.length > 0) {
            winningCells.forEach(index => {
                cells[index].classList.add('winner');
            });
        }

        // Update scores
        if (winner === 'draw') {
            State.updateScores({ draws: state.scores.draws + 1 });
        } else if (state.gameMode === '1player') {
            if (winner === 1) {
                State.updateScores({ player1Wins: state.scores.player1Wins + 1 });
            } else {
                State.updateScores({ aiWins: state.scores.aiWins + 1 });
            }
        } else {
            if (winner === 1) {
                State.updateScores({ player1Wins: state.scores.player1Wins + 1 });
            } else {
                State.updateScores({ player2Wins: state.scores.player2Wins + 1 });
            }
        }

        // Determine result type for display
        let resultType;
        if (winner === 'draw') {
            resultType = 'draw';
            Audio.playDraw();
        } else if (state.gameMode === '1player') {
            if (winner === 1) {
                resultType = 'win';
                Audio.playWin();
            } else {
                resultType = 'lose';
                Audio.playLose();
                // Shake board on loss
                boardElement.classList.add('shake');
                setTimeout(() => boardElement.classList.remove('shake'), 500);
            }
        } else {
            resultType = 'win';
            Audio.playWin();
        }

        // Show summary screen after delay
        setTimeout(() => {
            showSummary(winner, resultType, state);
        }, 1500);
    }

    /**
     * Show game summary
     */
    function showSummary(winner, resultType, state) {
        const resultTitle = document.getElementById('result-title');
        const resultEmoji = document.getElementById('result-emoji');
        const resultMessage = document.getElementById('result-message');
        const resultDisplay = document.querySelector('.result-display');

        // Clear previous classes
        resultDisplay.classList.remove('win', 'lose', 'draw');
        resultDisplay.classList.add(resultType);

        if (winner === 'draw') {
            resultTitle.textContent = "It's a Draw!";
            resultEmoji.textContent = '🤝';
            resultMessage.textContent = 'Nobody wins this round';
        } else if (resultType === 'win') {
            resultTitle.textContent = 'Victory!';
            resultEmoji.textContent = winner === 1 ? state.player1Emoji : state.player2Emoji;

            if (state.gameMode === '2player') {
                resultMessage.textContent = `Player ${winner} wins!`;
            } else {
                resultMessage.textContent = 'You win!';
            }

            // Start confetti for wins
            Particles.startConfetti();
        } else {
            resultTitle.textContent = 'Defeat!';
            resultEmoji.textContent = state.player2Emoji;
            resultMessage.textContent = 'The AI wins this round';
        }

        State.navigateTo('summary');
    }

    /**
     * Render the game board
     */
    function renderBoard() {
        const board = State.get('board');

        cells.forEach((cell, index) => {
            cell.textContent = '';
            cell.classList.remove('filled', 'winner', 'pop-in');

            const value = board[index];
            if (value !== null) {
                const emoji = value === 1 ? State.get('player1Emoji') : State.get('player2Emoji');
                cell.textContent = emoji;
                cell.classList.add('filled');
            }
        });

        updateTurnIndicator();
        updateScoreboard();
    }

    /**
     * Update turn indicator
     */
    function updateTurnIndicator() {
        const currentPlayer = State.get('currentPlayer');
        const emoji = currentPlayer === 1 ? State.get('player1Emoji') : State.get('player2Emoji');
        const indicator = document.getElementById('current-player-emoji');

        if (indicator && emoji) {
            indicator.textContent = emoji;
        }
    }

    /**
     * Update scoreboard display
     */
    function updateScoreboard() {
        const state = State.getState();

        // Update emojis
        document.getElementById('p1-score-emoji').textContent = state.player1Emoji || '🐱';
        document.getElementById('p2-score-emoji').textContent = state.player2Emoji || '🐶';

        // Update scores
        document.getElementById('p1-score').textContent = state.scores.player1Wins;
        document.getElementById('draws-score').textContent = state.scores.draws;

        if (state.gameMode === '1player') {
            document.getElementById('p2-score').textContent = state.scores.aiWins;
        } else {
            document.getElementById('p2-score').textContent = state.scores.player2Wins;
        }
    }

    /**
     * Start a new game
     */
    function startGame() {
        State.resetGame();
        renderBoard();
        State.navigateTo('game');
    }

    /**
     * Reset the current game (new round)
     */
    function resetCurrentGame() {
        State.resetGame();
        renderBoard();
    }

    return {
        init,
        startGame,
        resetCurrentGame,
        renderBoard,
        updateScoreboard
    };
})();
