/**
 * App Module - Main entry point and screen navigation
 */
const App = (function() {
    // Screen elements
    let screens = {};
    let initialized = false;

    // Emoji categories
    const EMOJI_CATEGORIES = {
        animals: {
            name: 'Animals',
            subtitle: 'Animal Edition',
            icon: '🐾',
            emojis: ['🐱', '🐶', '🦊', '🐰', '🐼', '🐨', '🦁', '🐯', '🐻', '🐷', '🐸', '🦄']
        },
        fruits: {
            name: 'Fruits & Veggies',
            subtitle: 'Fruits & Veggies Edition',
            icon: '🍎',
            emojis: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥑', '🥕', '🌽', '🍆', '🥦', '🍉']
        },
        humans: {
            name: 'Humans & Aliens',
            subtitle: 'Humans & Aliens Edition',
            icon: '👽',
            emojis: ['👨', '👩', '👶', '🧒', '👴', '👵', '🤖', '👽', '👻', '💀', '🧛', '🧟']
        },
        adult: {
            name: 'Adult Only',
            subtitle: 'Adult Only Edition 🔞',
            icon: '😈',
            emojis: ['🍑', '🍆', '💦', '🍒', '🌶️', '👅', '💋', '🔥', '😈', '😏', '🥵', '🤤']
        },
        free: {
            name: 'Free Choice',
            subtitle: 'Free Choice Edition',
            icon: '⭐',
            emojis: [
                '😀', '😎', '🥳', '😍', '🤩', '😂', '🥺', '😱', '🤔', '😴',
                '❤️', '🔥', '⭐', '🌈', '☀️', '🌙', '⚡', '💎', '🎯', '🎪',
                '🎮', '🎸', '🎨', '🎭', '🏆', '🎁', '🎈', '🎉', '🚀', '✈️',
                '🚗', '🏠', '🌍', '🌸', '🌺', '🍕', '🍔', '🍦', '☕', '🍪',
                '⚽', '🏀', '🎾', '🎱', '👑', '💫', '🦋', '🐝', '🌟', '💖'
            ]
        }
    };

    /**
     * Initialize the application
     */
    function init() {
        if (initialized) return;

        // Cache screen elements
        screens = {
            welcome: document.getElementById('welcome-screen'),
            menu: document.getElementById('menu-screen'),
            'category-select': document.getElementById('category-select-screen'),
            'emoji-select': document.getElementById('emoji-select-screen'),
            difficulty: document.getElementById('difficulty-screen'),
            game: document.getElementById('game-screen'),
            summary: document.getElementById('summary-screen'),
            tutorial: document.getElementById('tutorial-screen'),
            settings: document.getElementById('settings-screen')
        };

        // Initialize modules
        Particles.initBackground();
        Particles.initConfetti();
        Game.init();

        // Set up event listeners
        setupWelcomeScreen();
        setupMenuScreen();
        setupCategoryScreen();
        setupEmojiSelectScreen();
        setupDifficultyScreen();
        setupGameScreen();
        setupSummaryScreen();
        setupTutorialScreen();
        setupSettingsScreen();

        // Subscribe to screen changes
        State.subscribe('screenChanged', handleScreenChange);

        // Load settings and update UI
        updateSettingsUI();

        initialized = true;
    }

    /**
     * Handle screen change
     */
    function handleScreenChange({ screen }) {
        // Hide all screens
        Object.values(screens).forEach(s => {
            s.classList.remove('active');
        });

        // Show target screen
        if (screens[screen]) {
            screens[screen].classList.add('active');
        }

        // Stop confetti when leaving summary
        if (screen !== 'summary') {
            Particles.stopConfetti();
        }
    }

    /**
     * Setup Welcome Screen
     */
    function setupWelcomeScreen() {
        const welcomeScreen = screens.welcome;

        const handleStart = () => {
            // Initialize audio on first interaction
            if (!Audio.isInitialized()) {
                Audio.init();
            }
            Audio.playClick();
            State.navigateTo('menu');
        };

        welcomeScreen.addEventListener('click', handleStart);
        welcomeScreen.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleStart();
        }, { passive: false });
    }

    /**
     * Setup Menu Screen
     */
    function setupMenuScreen() {
        const menuButtons = document.querySelectorAll('#menu-screen .menu-btn');

        menuButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                Audio.playClick();
                const action = btn.dataset.action;

                switch (action) {
                    case '1player':
                        State.setState({
                            gameMode: '1player',
                            selectingPlayer: 1,
                            player2Emoji: null
                        });
                        State.navigateTo('category-select');
                        break;

                    case '2player':
                        State.setState({
                            gameMode: '2player',
                            selectingPlayer: 1,
                            player2Emoji: null
                        });
                        State.navigateTo('category-select');
                        break;

                    case 'tutorial':
                        State.navigateTo('tutorial');
                        break;

                    case 'settings':
                        State.navigateTo('settings');
                        break;
                }
            });
        });
    }

    /**
     * Setup Category Selection Screen
     */
    function setupCategoryScreen() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        const backBtn = document.querySelector('#category-select-screen .back-btn');

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                Audio.playClick();
                const category = btn.dataset.category;
                State.setState({ emojiCategory: category });

                // Update particles and welcome screen for this category
                updateParticlesForCategory(category);
                updateWelcomeScreen(category);

                // Populate emoji grid and navigate
                populateEmojiGrid(category);
                updateEmojiSelectTitle(1);
                State.navigateTo('emoji-select');
            });
        });

        backBtn.addEventListener('click', () => {
            Audio.playClick();
            State.navigateTo('menu');
        });
    }

    /**
     * Populate emoji grid based on category
     */
    function populateEmojiGrid(category) {
        const emojiGrid = document.getElementById('emoji-grid');
        const categoryData = EMOJI_CATEGORIES[category];

        // Clear existing emojis
        emojiGrid.innerHTML = '';

        // Add/remove free-choice class for 5-column layout
        if (category === 'free') {
            emojiGrid.classList.add('free-choice');
        } else {
            emojiGrid.classList.remove('free-choice');
        }

        // Create emoji buttons
        categoryData.emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-option';
            btn.dataset.emoji = emoji;
            btn.textContent = emoji;
            emojiGrid.appendChild(btn);
        });

        // Update grid to reflect current state
        updateEmojiGrid();
    }

    /**
     * Update welcome screen based on category
     */
    function updateWelcomeScreen(category) {
        const subtitle = document.getElementById('welcome-subtitle');
        const parade = document.getElementById('emoji-parade');
        const categoryData = EMOJI_CATEGORIES[category];

        if (subtitle) {
            subtitle.textContent = categoryData.subtitle;
        }

        if (parade) {
            parade.innerHTML = '';
            // Show first 4 emojis from the category
            categoryData.emojis.slice(0, 4).forEach(emoji => {
                const span = document.createElement('span');
                span.textContent = emoji;
                parade.appendChild(span);
            });
        }
    }

    /**
     * Update particles for category
     */
    function updateParticlesForCategory(category) {
        const categoryData = EMOJI_CATEGORIES[category];
        if (Particles.setEmojiSet) {
            Particles.setEmojiSet(categoryData.emojis);
        }
    }

    /**
     * Setup Emoji Selection Screen
     */
    function setupEmojiSelectScreen() {
        const emojiGrid = document.getElementById('emoji-grid');
        const backBtn = document.querySelector('#emoji-select-screen .back-btn');

        emojiGrid.addEventListener('click', (e) => {
            const emojiBtn = e.target.closest('.emoji-option');
            if (!emojiBtn || emojiBtn.classList.contains('disabled')) return;

            Audio.playClick();

            const emoji = emojiBtn.dataset.emoji;
            const state = State.getState();

            if (state.selectingPlayer === 1) {
                State.setState({ player1Emoji: emoji });

                if (state.gameMode === '2player') {
                    // Move to player 2 selection
                    State.setState({ selectingPlayer: 2 });
                    updateEmojiSelectTitle(2);
                    updateEmojiGrid();
                } else {
                    // 1-player mode: assign random AI emoji and go to difficulty
                    const aiEmoji = getRandomAiEmoji(emoji);
                    State.setState({ player2Emoji: aiEmoji });
                    State.navigateTo('difficulty');
                }
            } else {
                // Player 2 selection
                State.setState({ player2Emoji: emoji });
                Game.startGame();
            }
        });

        backBtn.addEventListener('click', () => {
            Audio.playClick();
            const state = State.getState();

            if (state.selectingPlayer === 2) {
                // Go back to player 1 selection
                State.setState({
                    selectingPlayer: 1,
                    player1Emoji: null
                });
                updateEmojiSelectTitle(1);
                updateEmojiGrid();
            } else {
                // Go back to category selection
                State.navigateTo('category-select');
            }
        });
    }

    /**
     * Update emoji selection title
     */
    function updateEmojiSelectTitle(player) {
        const title = document.getElementById('emoji-select-title');
        const gameMode = State.get('gameMode');

        if (gameMode === '1player') {
            title.textContent = 'Choose Your Emoji!';
        } else {
            title.textContent = `Player ${player}, Choose Your Emoji!`;
        }
    }

    /**
     * Update emoji grid (disable selected emoji)
     */
    function updateEmojiGrid() {
        const state = State.getState();
        const emojiOptions = document.querySelectorAll('.emoji-option');

        emojiOptions.forEach(option => {
            option.classList.remove('disabled', 'selected');

            if (state.player1Emoji === option.dataset.emoji) {
                option.classList.add('disabled', 'selected');
            }
        });
    }

    /**
     * Get random AI emoji (different from player's)
     */
    function getRandomAiEmoji(playerEmoji) {
        const category = State.get('emojiCategory') || 'animals';
        const emojis = EMOJI_CATEGORIES[category].emojis;
        const available = emojis.filter(e => e !== playerEmoji);
        return available[Math.floor(Math.random() * available.length)];
    }

    /**
     * Setup Difficulty Screen
     */
    function setupDifficultyScreen() {
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        const backBtn = document.querySelector('#difficulty-screen .back-btn');

        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                Audio.playClick();
                const difficulty = btn.dataset.difficulty;
                State.setState({ difficulty });
                Game.startGame();
            });
        });

        backBtn.addEventListener('click', () => {
            Audio.playClick();
            const category = State.get('emojiCategory') || 'animals';
            State.setState({
                selectingPlayer: 1,
                player1Emoji: null,
                player2Emoji: null
            });
            populateEmojiGrid(category);
            updateEmojiSelectTitle(1);
            State.navigateTo('emoji-select');
        });
    }

    /**
     * Setup Game Screen
     */
    function setupGameScreen() {
        const homeBtn = document.querySelector('#game-screen .back-btn');
        const restartBtn = document.getElementById('restart-btn');
        const soundToggle = document.getElementById('quick-sound-toggle');

        homeBtn.addEventListener('click', () => {
            Audio.playClick();
            goToMenu();
        });

        restartBtn.addEventListener('click', () => {
            Audio.playClick();
            Game.resetCurrentGame();
        });

        soundToggle.addEventListener('click', () => {
            const settings = State.get('settings');
            const newSfxState = !settings.sfxEnabled;
            State.updateSetting('sfxEnabled', newSfxState);
            soundToggle.textContent = newSfxState ? '🔊' : '🔇';
            soundToggle.classList.toggle('muted', !newSfxState);
            if (newSfxState) Audio.playClick();
        });
    }

    /**
     * Setup Summary Screen
     */
    function setupSummaryScreen() {
        const summaryBtns = document.querySelectorAll('#summary-screen .summary-btn');

        summaryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                Audio.playClick();
                const action = btn.dataset.action;

                if (action === 'playAgain') {
                    Particles.stopConfetti();
                    Game.resetCurrentGame();
                    State.navigateTo('game');
                } else if (action === 'home') {
                    goToMenu();
                }
            });
        });
    }

    /**
     * Setup Tutorial Screen
     */
    function setupTutorialScreen() {
        const backBtn = document.querySelector('#tutorial-screen .back-btn');

        backBtn.addEventListener('click', () => {
            Audio.playClick();
            State.navigateTo('menu');
        });
    }

    /**
     * Setup Settings Screen
     */
    function setupSettingsScreen() {
        const backBtn = document.querySelector('#settings-screen .back-btn');
        const musicToggle = document.getElementById('music-toggle');
        const sfxToggle = document.getElementById('sfx-toggle');
        const resetScoresBtn = document.getElementById('reset-scores');

        backBtn.addEventListener('click', () => {
            Audio.playClick();
            State.navigateTo('menu');
        });

        musicToggle.addEventListener('click', () => {
            const settings = State.get('settings');
            const newState = !settings.musicEnabled;
            Audio.toggleMusic(newState);
            updateToggleButton(musicToggle, newState);
            Audio.playClick();
        });

        sfxToggle.addEventListener('click', () => {
            const settings = State.get('settings');
            const newState = !settings.sfxEnabled;
            Audio.toggleSfx(newState);
            updateToggleButton(sfxToggle, newState);
            if (newState) Audio.playClick();
        });

        resetScoresBtn.addEventListener('click', () => {
            Audio.playClick();
            if (confirm('Are you sure you want to reset all scores?')) {
                State.resetScores();
                Audio.playClick();
            }
        });
    }

    /**
     * Update toggle button appearance
     */
    function updateToggleButton(button, enabled) {
        const stateSpan = button.querySelector('.toggle-state');
        stateSpan.textContent = enabled ? 'ON' : 'OFF';
        button.classList.toggle('off', !enabled);
    }

    /**
     * Update settings UI from stored settings
     */
    function updateSettingsUI() {
        const settings = State.get('settings');
        const musicToggle = document.getElementById('music-toggle');
        const sfxToggle = document.getElementById('sfx-toggle');
        const quickSoundToggle = document.getElementById('quick-sound-toggle');

        updateToggleButton(musicToggle, settings.musicEnabled);
        updateToggleButton(sfxToggle, settings.sfxEnabled);

        quickSoundToggle.textContent = settings.sfxEnabled ? '🔊' : '🔇';
        quickSoundToggle.classList.toggle('muted', !settings.sfxEnabled);
    }

    /**
     * Go to main menu and reset game state
     */
    function goToMenu() {
        Particles.stopConfetti();
        State.resetAll();
        updateEmojiGrid();
        State.navigateTo('menu');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        goToMenu
    };
})();
