/**
 * AI Module - AI opponent with Easy/Medium/Hard difficulty
 */
const AI = (function() {
    // Winning combinations
    const WIN_COMBINATIONS = [
        [0, 1, 2], // Top row
        [3, 4, 5], // Middle row
        [6, 7, 8], // Bottom row
        [0, 3, 6], // Left column
        [1, 4, 7], // Middle column
        [2, 5, 8], // Right column
        [0, 4, 8], // Diagonal
        [2, 4, 6]  // Anti-diagonal
    ];

    /**
     * Get empty cells on the board
     */
    function getEmptyCells(board) {
        return board.reduce((cells, cell, index) => {
            if (cell === null) cells.push(index);
            return cells;
        }, []);
    }

    /**
     * Check if a player has won
     */
    function checkWinner(board) {
        for (const combo of WIN_COMBINATIONS) {
            const [a, b, c] = combo;
            if (board[a] !== null && board[a] === board[b] && board[b] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

    /**
     * Check if board is full (draw)
     */
    function isBoardFull(board) {
        return board.every(cell => cell !== null);
    }

    /**
     * Easy AI - Random move
     */
    function getEasyMove(board) {
        const emptyCells = getEmptyCells(board);
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    /**
     * Get optimal move using minimax
     */
    function getOptimalMove(board, aiPlayer = 2) {
        const humanPlayer = aiPlayer === 2 ? 1 : 2;

        // Minimax algorithm with alpha-beta pruning
        function minimax(boardState, depth, isMaximizing, alpha, beta) {
            const winner = checkWinner(boardState);

            // Terminal states
            if (winner === aiPlayer) return 10 - depth;
            if (winner === humanPlayer) return depth - 10;
            if (isBoardFull(boardState)) return 0;

            const emptyCells = getEmptyCells(boardState);

            if (isMaximizing) {
                let maxEval = -Infinity;
                for (const cell of emptyCells) {
                    const newBoard = [...boardState];
                    newBoard[cell] = aiPlayer;
                    const evalScore = minimax(newBoard, depth + 1, false, alpha, beta);
                    maxEval = Math.max(maxEval, evalScore);
                    alpha = Math.max(alpha, evalScore);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
                return maxEval;
            } else {
                let minEval = Infinity;
                for (const cell of emptyCells) {
                    const newBoard = [...boardState];
                    newBoard[cell] = humanPlayer;
                    const evalScore = minimax(newBoard, depth + 1, true, alpha, beta);
                    minEval = Math.min(minEval, evalScore);
                    beta = Math.min(beta, evalScore);
                    if (beta <= alpha) break; // Alpha-beta pruning
                }
                return minEval;
            }
        }

        const emptyCells = getEmptyCells(board);
        if (emptyCells.length === 0) return null;

        // First move optimization - prefer center or corners
        if (emptyCells.length === 9) {
            return 4; // Center
        }
        if (emptyCells.length === 8 && board[4] === null) {
            return 4; // Center if available
        }

        let bestMove = emptyCells[0];
        let bestScore = -Infinity;

        for (const cell of emptyCells) {
            const newBoard = [...board];
            newBoard[cell] = aiPlayer;
            const score = minimax(newBoard, 0, false, -Infinity, Infinity);
            if (score > bestScore) {
                bestScore = score;
                bestMove = cell;
            }
        }

        return bestMove;
    }

    /**
     * Medium AI - 70% optimal, 30% random
     */
    function getMediumMove(board) {
        if (Math.random() < 0.7) {
            return getOptimalMove(board);
        }
        return getEasyMove(board);
    }

    /**
     * Hard AI - Minimax (unbeatable)
     */
    function getHardMove(board) {
        return getOptimalMove(board);
    }

    /**
     * Get AI move based on difficulty
     */
    function getMove(board, difficulty) {
        switch (difficulty) {
            case 'easy':
                return getEasyMove(board);
            case 'medium':
                return getMediumMove(board);
            case 'hard':
                return getHardMove(board);
            default:
                return getEasyMove(board);
        }
    }

    /**
     * Make AI move with delay for natural feel
     */
    function makeMove(delay = 500) {
        return new Promise((resolve) => {
            const state = State.getState();

            if (state.isGameOver || state.currentPlayer !== 2 || state.gameMode !== '1player') {
                resolve(false);
                return;
            }

            State.setState({ isAiThinking: true });

            setTimeout(() => {
                const currentState = State.getState();

                // Check again in case game state changed during delay
                if (currentState.isGameOver || currentState.currentPlayer !== 2) {
                    State.setState({ isAiThinking: false });
                    resolve(false);
                    return;
                }

                const move = getMove(currentState.board, currentState.difficulty);

                if (move !== null) {
                    State.makeMove(move, 2);
                    State.setState({ isAiThinking: false });
                    resolve(true);
                } else {
                    State.setState({ isAiThinking: false });
                    resolve(false);
                }
            }, delay);
        });
    }

    return {
        getMove,
        getEasyMove,
        getMediumMove,
        getHardMove,
        makeMove,
        checkWinner,
        isBoardFull,
        WIN_COMBINATIONS
    };
})();
