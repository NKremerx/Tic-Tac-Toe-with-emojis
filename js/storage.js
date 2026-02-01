/**
 * Storage Module - LocalStorage persistence for scores and settings
 */
const Storage = (function() {
    const KEYS = {
        SCORES: 'tictactoe_scores',
        SETTINGS: 'tictactoe_settings'
    };

    const DEFAULT_SCORES = {
        player1Wins: 0,
        player2Wins: 0,
        aiWins: 0,
        draws: 0
    };

    const DEFAULT_SETTINGS = {
        musicEnabled: true,
        sfxEnabled: true
    };

    /**
     * Get scores from localStorage
     */
    function getScores() {
        try {
            const stored = localStorage.getItem(KEYS.SCORES);
            if (stored) {
                return { ...DEFAULT_SCORES, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load scores from localStorage:', e);
        }
        return { ...DEFAULT_SCORES };
    }

    /**
     * Save scores to localStorage
     */
    function saveScores(scores) {
        try {
            localStorage.setItem(KEYS.SCORES, JSON.stringify(scores));
        } catch (e) {
            console.warn('Failed to save scores to localStorage:', e);
        }
    }

    /**
     * Reset all scores
     */
    function resetScores() {
        try {
            localStorage.setItem(KEYS.SCORES, JSON.stringify(DEFAULT_SCORES));
        } catch (e) {
            console.warn('Failed to reset scores:', e);
        }
        return { ...DEFAULT_SCORES };
    }

    /**
     * Get settings from localStorage
     */
    function getSettings() {
        try {
            const stored = localStorage.getItem(KEYS.SETTINGS);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.warn('Failed to load settings from localStorage:', e);
        }
        return { ...DEFAULT_SETTINGS };
    }

    /**
     * Save settings to localStorage
     */
    function saveSettings(settings) {
        try {
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings to localStorage:', e);
        }
    }

    /**
     * Update a single setting
     */
    function updateSetting(key, value) {
        const settings = getSettings();
        settings[key] = value;
        saveSettings(settings);
        return settings;
    }

    /**
     * Clear all stored data
     */
    function clearAll() {
        try {
            localStorage.removeItem(KEYS.SCORES);
            localStorage.removeItem(KEYS.SETTINGS);
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
    }

    return {
        getScores,
        saveScores,
        resetScores,
        getSettings,
        saveSettings,
        updateSetting,
        clearAll,
        DEFAULT_SCORES,
        DEFAULT_SETTINGS
    };
})();
