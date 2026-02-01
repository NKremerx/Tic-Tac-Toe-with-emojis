/**
 * Particles Module - Canvas particle effects for background and celebrations
 */
const Particles = (function() {
    // Background particles canvas
    let bgCanvas = null;
    let bgCtx = null;
    let bgParticles = [];
    let bgAnimationId = null;

    // Confetti canvas
    let confettiCanvas = null;
    let confettiCtx = null;
    let confettiParticles = [];
    let confettiAnimationId = null;

    // Settings
    const BG_PARTICLE_COUNT = 50;
    const CONFETTI_COUNT = 150;

    /**
     * Initialize background particles
     */
    function initBackground() {
        bgCanvas = document.getElementById('particles');
        if (!bgCanvas) return;

        bgCtx = bgCanvas.getContext('2d');
        resizeCanvas(bgCanvas);

        // Create particles
        bgParticles = [];
        for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
            bgParticles.push(createBgParticle());
        }

        // Start animation
        animateBackground();

        // Handle resize
        window.addEventListener('resize', () => {
            resizeCanvas(bgCanvas);
        });
    }

    /**
     * Create a background particle
     */
    function createBgParticle() {
        const emojis = ['🐱', '🐶', '🦊', '🐰', '🐼', '🐨', '🦁', '🐯', '🐻', '🐷', '🐸', '🦄', '⭐', '✨'];
        return {
            x: Math.random() * (bgCanvas?.width || window.innerWidth),
            y: Math.random() * (bgCanvas?.height || window.innerHeight),
            size: Math.random() * 20 + 10,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.3 + 0.1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        };
    }

    /**
     * Animate background particles
     */
    function animateBackground() {
        if (!bgCtx || !bgCanvas) return;

        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

        bgParticles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += particle.rotationSpeed;

            // Wrap around edges
            if (particle.x < -particle.size) particle.x = bgCanvas.width + particle.size;
            if (particle.x > bgCanvas.width + particle.size) particle.x = -particle.size;
            if (particle.y < -particle.size) particle.y = bgCanvas.height + particle.size;
            if (particle.y > bgCanvas.height + particle.size) particle.y = -particle.size;

            // Draw particle
            bgCtx.save();
            bgCtx.translate(particle.x, particle.y);
            bgCtx.rotate(particle.rotation);
            bgCtx.globalAlpha = particle.opacity;
            bgCtx.font = `${particle.size}px serif`;
            bgCtx.textAlign = 'center';
            bgCtx.textBaseline = 'middle';
            bgCtx.fillText(particle.emoji, 0, 0);
            bgCtx.restore();
        });

        bgAnimationId = requestAnimationFrame(animateBackground);
    }

    /**
     * Stop background animation
     */
    function stopBackground() {
        if (bgAnimationId) {
            cancelAnimationFrame(bgAnimationId);
            bgAnimationId = null;
        }
    }

    /**
     * Initialize confetti canvas
     */
    function initConfetti() {
        confettiCanvas = document.getElementById('confetti-canvas');
        if (!confettiCanvas) return;

        confettiCtx = confettiCanvas.getContext('2d');
        resizeCanvas(confettiCanvas);

        window.addEventListener('resize', () => {
            resizeCanvas(confettiCanvas);
        });
    }

    /**
     * Create a confetti particle
     */
    function createConfettiParticle() {
        const colors = ['#e94560', '#4ecdc4', '#ffd93d', '#6bcb77', '#ff6b6b', '#9b59b6'];
        const emojis = ['🎉', '🎊', '⭐', '✨', '🏆', '👑'];
        const isEmoji = Math.random() > 0.7;

        return {
            x: Math.random() * (confettiCanvas?.width || window.innerWidth),
            y: -20,
            size: isEmoji ? Math.random() * 15 + 15 : Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            emoji: isEmoji ? emojis[Math.floor(Math.random() * emojis.length)] : null,
            speedX: (Math.random() - 0.5) * 6,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            gravity: 0.1,
            opacity: 1,
            decay: 0.005
        };
    }

    /**
     * Start confetti celebration
     */
    function startConfetti() {
        if (!confettiCanvas) {
            initConfetti();
        }
        if (!confettiCanvas) return;

        stopConfetti();

        // Create confetti particles
        confettiParticles = [];
        for (let i = 0; i < CONFETTI_COUNT; i++) {
            const particle = createConfettiParticle();
            particle.y = -Math.random() * 200 - 20; // Stagger start positions
            confettiParticles.push(particle);
        }

        animateConfetti();
    }

    /**
     * Animate confetti
     */
    function animateConfetti() {
        if (!confettiCtx || !confettiCanvas) return;

        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        let activeParticles = 0;

        confettiParticles.forEach(particle => {
            if (particle.opacity <= 0) return;

            activeParticles++;

            // Update physics
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.speedY += particle.gravity;
            particle.rotation += particle.rotationSpeed;
            particle.speedX *= 0.99; // Air resistance

            // Fade out when below canvas
            if (particle.y > confettiCanvas.height * 0.8) {
                particle.opacity -= particle.decay * 3;
            }

            // Draw particle
            confettiCtx.save();
            confettiCtx.translate(particle.x, particle.y);
            confettiCtx.rotate(particle.rotation);
            confettiCtx.globalAlpha = Math.max(0, particle.opacity);

            if (particle.emoji) {
                confettiCtx.font = `${particle.size}px serif`;
                confettiCtx.textAlign = 'center';
                confettiCtx.textBaseline = 'middle';
                confettiCtx.fillText(particle.emoji, 0, 0);
            } else {
                confettiCtx.fillStyle = particle.color;
                confettiCtx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
            }

            confettiCtx.restore();
        });

        if (activeParticles > 0) {
            confettiAnimationId = requestAnimationFrame(animateConfetti);
        } else {
            stopConfetti();
        }
    }

    /**
     * Stop confetti animation
     */
    function stopConfetti() {
        if (confettiAnimationId) {
            cancelAnimationFrame(confettiAnimationId);
            confettiAnimationId = null;
        }
        confettiParticles = [];
        if (confettiCtx && confettiCanvas) {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    /**
     * Resize canvas to fill window
     */
    function resizeCanvas(canvas) {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    /**
     * Create burst effect at a position (for cell placement)
     */
    function createBurst(x, y, emoji) {
        if (!bgCtx || !bgCanvas) return;

        const burstParticles = [];
        const count = 8;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            burstParticles.push({
                x: x,
                y: y,
                speedX: Math.cos(angle) * 3,
                speedY: Math.sin(angle) * 3,
                size: 20,
                emoji: emoji,
                opacity: 1,
                decay: 0.05
            });
        }

        const animateBurst = () => {
            let active = 0;

            burstParticles.forEach(p => {
                if (p.opacity <= 0) return;
                active++;

                p.x += p.speedX;
                p.y += p.speedY;
                p.speedX *= 0.95;
                p.speedY *= 0.95;
                p.opacity -= p.decay;

                bgCtx.save();
                bgCtx.globalAlpha = p.opacity;
                bgCtx.font = `${p.size}px serif`;
                bgCtx.textAlign = 'center';
                bgCtx.textBaseline = 'middle';
                bgCtx.fillText(p.emoji, p.x, p.y);
                bgCtx.restore();
            });

            if (active > 0) {
                requestAnimationFrame(animateBurst);
            }
        };

        animateBurst();
    }

    return {
        initBackground,
        stopBackground,
        initConfetti,
        startConfetti,
        stopConfetti,
        createBurst
    };
})();
