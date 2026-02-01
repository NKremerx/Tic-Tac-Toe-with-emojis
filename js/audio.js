/**
 * Audio Module - Web Audio API manager for music and sound effects
 */
const Audio = (function() {
    let audioContext = null;
    let initialized = false;
    let buffers = {};
    let bgmSource = null;
    let bgmGain = null;
    let sfxGain = null;

    // Audio file definitions (we'll generate these programmatically)
    const sounds = {
        click: { frequency: 800, duration: 0.1, type: 'sine' },
        place: { frequency: 400, duration: 0.15, type: 'triangle' },
        win: { frequencies: [523.25, 659.25, 783.99], duration: 0.5, type: 'sine' },
        lose: { frequencies: [392, 349.23, 311.13], duration: 0.5, type: 'sawtooth' },
        draw: { frequency: 440, duration: 0.3, type: 'square' }
    };

    /**
     * Initialize Web Audio API (must be called after user interaction)
     */
    function init() {
        if (initialized) return Promise.resolve();

        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create gain nodes for volume control
            bgmGain = audioContext.createGain();
            sfxGain = audioContext.createGain();

            bgmGain.connect(audioContext.destination);
            sfxGain.connect(audioContext.destination);

            // Set initial volumes
            const settings = State.get('settings');
            bgmGain.gain.value = settings.musicEnabled ? 0.3 : 0;
            sfxGain.gain.value = settings.sfxEnabled ? 0.5 : 0;

            initialized = true;
            State.setState({ audioInitialized: true });

            // Start background music if enabled
            if (settings.musicEnabled) {
                startBgm();
            }

            return Promise.resolve();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            return Promise.reject(e);
        }
    }

    /**
     * Resume audio context (needed for some browsers)
     */
    function resume() {
        if (audioContext && audioContext.state === 'suspended') {
            return audioContext.resume();
        }
        return Promise.resolve();
    }

    /**
     * Generate a simple tone
     */
    function playTone(frequency, duration, type = 'sine', gainNode = sfxGain) {
        if (!initialized || !audioContext) return;

        const oscillator = audioContext.createOscillator();
        const envelope = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        envelope.gain.setValueAtTime(0.5, audioContext.currentTime);
        envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.connect(envelope);
        envelope.connect(gainNode);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    /**
     * Play a melody (sequence of tones)
     */
    function playMelody(frequencies, duration, type, delay = 0.15) {
        if (!initialized || !audioContext) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                playTone(freq, duration / frequencies.length, type);
            }, index * delay * 1000);
        });
    }

    /**
     * Play click sound
     */
    function playClick() {
        if (!State.get('settings').sfxEnabled) return;
        const { frequency, duration, type } = sounds.click;
        playTone(frequency, duration, type);
    }

    /**
     * Play piece placement sound
     */
    function playPlace() {
        if (!State.get('settings').sfxEnabled) return;
        const { frequency, duration, type } = sounds.place;
        playTone(frequency, duration, type);
    }

    /**
     * Play win sound
     */
    function playWin() {
        if (!State.get('settings').sfxEnabled) return;
        const { frequencies, duration, type } = sounds.win;
        playMelody(frequencies, duration, type);
    }

    /**
     * Play lose sound
     */
    function playLose() {
        if (!State.get('settings').sfxEnabled) return;
        const { frequencies, duration, type } = sounds.lose;
        playMelody(frequencies, duration, type, 0.2);
    }

    /**
     * Play draw sound
     */
    function playDraw() {
        if (!State.get('settings').sfxEnabled) return;
        const { frequency, duration, type } = sounds.draw;
        playTone(frequency, duration, type);
    }

    /**
     * Start background music (simple procedural melody loop)
     */
    function startBgm() {
        if (!initialized || !audioContext || !State.get('settings').musicEnabled) return;

        stopBgm();

        // Create a simple ambient background sound
        const playAmbient = () => {
            if (!State.get('settings').musicEnabled) return;

            // Create a soft, ambient chord
            const baseFreq = 220; // A3
            const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Minor chord

            chord.forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.5);
                gain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 2);
                gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 4);

                osc.connect(gain);
                gain.connect(bgmGain);

                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 4);
            });
        };

        // Play ambient sound and loop
        playAmbient();
        bgmSource = setInterval(playAmbient, 4000);
    }

    /**
     * Stop background music
     */
    function stopBgm() {
        if (bgmSource) {
            clearInterval(bgmSource);
            bgmSource = null;
        }
    }

    /**
     * Toggle background music
     */
    function toggleMusic(enabled) {
        if (!initialized) return;

        if (enabled) {
            bgmGain.gain.value = 0.3;
            startBgm();
        } else {
            bgmGain.gain.value = 0;
            stopBgm();
        }

        State.updateSetting('musicEnabled', enabled);
    }

    /**
     * Toggle sound effects
     */
    function toggleSfx(enabled) {
        if (!initialized) return;

        sfxGain.gain.value = enabled ? 0.5 : 0;
        State.updateSetting('sfxEnabled', enabled);
    }

    /**
     * Check if audio is initialized
     */
    function isInitialized() {
        return initialized;
    }

    // Subscribe to setting changes
    State.subscribe('settingChanged', ({ key, value }) => {
        if (key === 'musicEnabled') {
            if (value && initialized) {
                bgmGain.gain.value = 0.3;
                startBgm();
            } else {
                if (bgmGain) bgmGain.gain.value = 0;
                stopBgm();
            }
        } else if (key === 'sfxEnabled' && sfxGain) {
            sfxGain.gain.value = value ? 0.5 : 0;
        }
    });

    return {
        init,
        resume,
        playClick,
        playPlace,
        playWin,
        playLose,
        playDraw,
        startBgm,
        stopBgm,
        toggleMusic,
        toggleSfx,
        isInitialized
    };
})();
