/**
 * State Module - Centralized reactive state management with Pub/Sub
 */
const State = (function() {
    // Event subscribers
    const subscribers = {};

    // Initial state
    const initialState = {
        // Screen navigation
        currentScreen: 'welcome',
        previousScreen: null,

        // Game mode
        gameMode: null, // '1player' or '2player'
        difficulty: null, // 'easy', 'medium', 'hard'
        emojiCategory: 'animals', // 'animals', 'fruits', 'humans', 'adult', 'free'

        // Player emojis
        player1Emoji: null,
        player2Emoji: null,
        selectingPlayer: 1, // Which player is selecting emoji (1 or 2)

        // Game state
        board: Array(9).fill(null),
        currentPlayer: 1, // 1 or 2
        winner: null, // null, 1, 2, or 'draw'
        winningCells: [],
        isGameOver: false,
        isAiThinking: false,

        // Scores (persisted)
        scores: Storage.getScores(),

        // Settings (persisted)
        settings: Storage.getSettings(),

        // Audio state
        audioInitialized: false
    };

    // Current state (reactive proxy)
    let state = { ...initialState };

    /**
     * Subscribe to state changes
     */
    function subscribe(event, callback) {
        if (!subscribers[event]) {
            subscribers[event] = [];
        }
        subscribers[event].push(callback);

        // Return unsubscribe function
        return () => {
            const index = subscribers[event].indexOf(callback);
            if (index > -1) {
                subscribers[event].splice(index, 1);
            }
        };
    }

    /**
     * Emit an event to all subscribers
     */
    function emit(event, data) {
        if (subscribers[event]) {
            subscribers[event].forEach(callback => callback(data));
        }
        // Also emit to wildcard subscribers
        if (subscribers['*']) {
            subscribers['*'].forEach(callback => callback({ event, data }));
        }
    }

    /**
     * Update state and notify subscribers
     */
    function setState(updates) {
        const oldState = { ...state };
        state = { ...state, ...updates };

        // Emit specific change events
        Object.keys(updates).forEach(key => {
            if (oldState[key] !== state[key]) {
                emit(`${key}Changed`, {
                    oldValue: oldState[key],
                    newValue: state[key]
                });
            }
        });

        // Emit general state change event
        emit('stateChanged', { oldState, newState: state });
    }

    /**
     * Get current state (read-only copy)
     */
    function getState() {
        return { ...state };
    }

    /**
     * Get a specific state value
     */
    function get(key) {
        return state[key];
    }

    /**
     * Navigate to a screen
     */
    function navigateTo(screen) {
        setState({
            previousScreen: state.currentScreen,
            currentScreen: screen
        });
        emit('screenChanged', { screen });
    }

    /**
     * Go back to previous screen
     */
    function goBack() {
        if (state.previousScreen) {
            navigateTo(state.previousScreen);
        }
    }

    /**
     * Reset game state for a new game
     */
    function resetGame() {
        setState({
            board: Array(9).fill(null),
            currentPlayer: 1,
            winner: null,
            winningCells: [],
            isGameOver: false,
            isAiThinking: false
        });
        emit('gameReset', {});
    }

    /**
     * Reset entire state to initial (except persisted data)
     */
    function resetAll() {
        const scores = Storage.getScores();
        const settings = Storage.getSettings();
        state = {
            ...initialState,
            scores,
            settings
        };
        emit('stateReset', {});
    }

    /**
     * Update scores and persist
     */
    function updateScores(scoreUpdates) {
        const newScores = { ...state.scores, ...scoreUpdates };
        Storage.saveScores(newScores);
        setState({ scores: newScores });
    }

    /**
     * Reset scores
     */
    function resetScores() {
        const defaultScores = Storage.resetScores();
        setState({ scores: defaultScores });
        emit('scoresReset', {});
    }

    /**
     * Update a setting and persist
     */
    function updateSetting(key, value) {
        const newSettings = { ...state.settings, [key]: value };
        Storage.saveSettings(newSettings);
        setState({ settings: newSettings });
        emit('settingChanged', { key, value });
    }

    /**
     * Make a move on the board
     */
    function makeMove(index, player) {
        if (state.board[index] !== null || state.isGameOver) {
            return false;
        }

        const newBoard = [...state.board];
        newBoard[index] = player;

        setState({
            board: newBoard,
            currentPlayer: player === 1 ? 2 : 1
        });

        emit('moveMade', { index, player, board: newBoard });
        return true;
    }

    /**
     * Set game over state
     */
    function setGameOver(winner, winningCells = []) {
        setState({
            winner,
            winningCells,
            isGameOver: true
        });
        emit('gameOver', { winner, winningCells });
    }

    return {
        subscribe,
        emit,
        setState,
        getState,
        get,
        navigateTo,
        goBack,
        resetGame,
        resetAll,
        updateScores,
        resetScores,
        updateSetting,
        makeMove,
        setGameOver
    };
})();
