/**
 * Hero-specific effects: parallax for the `P.` monogram, a caret that tracks
 * the status chip so the chip reads like a line being typed in a terminal,
 * and a mouse-reactive aurora that makes the hero blur shape lerp toward
 * the cursor. All bail out when prefers-reduced-motion is set.
 */

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchOnly = () => !window.matchMedia('(pointer: fine)').matches;

export function initHeroMonogramParallax() {
    const monogram = document.querySelector('.hero-monogram');
    if (!monogram || reduce()) return;

    const depth = Number(monogram.dataset.parallax) || 0.35;
    let targetY = 0;
    let currentY = 0;
    let rafId = 0;

    const onScroll = () => {
        targetY = window.scrollY * depth;
        if (!rafId) rafId = requestAnimationFrame(frame);
    };

    const frame = () => {
        rafId = 0;
        currentY += (targetY - currentY) * 0.12;
        monogram.style.transform = `translate(-50%, calc(-50% + ${currentY.toFixed(1)}px))`;
        if (Math.abs(targetY - currentY) > 0.3) {
            rafId = requestAnimationFrame(frame);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

/**
 * When the status chip's visible text changes, mark it as "typed" by fading the
 * caret in once the text settles. Keeps the caret decorative — we don't actually
 * retype the characters since they come from i18n / live data.
 */
export function initHeroStatusCaret() {
    const chip = document.getElementById('hero-availability');
    if (!chip) return;
    const caret = chip.querySelector('.hero-status-caret');
    if (!caret) return;

    // Hide the caret until the chip has real text, then pin it visible.
    caret.style.opacity = '0';
    const reveal = () => { caret.style.opacity = '1'; };

    const observer = new MutationObserver(() => {
        const text = chip.querySelector('.hero-status-text');
        if (text && text.textContent && text.textContent.trim().length > 0 && text.style.visibility !== 'hidden') {
            reveal();
        }
    });
    observer.observe(chip, { subtree: true, childList: true, characterData: true, attributes: true });

    // Safety net — if nothing mutates within 2s, show it anyway.
    setTimeout(reveal, 2000);
}

/**
 * Mouse-reactive aurora. The .hero-blur-shape (or .hero::before via CSS vars)
 * eases toward the cursor with a cheap lerp; intensity scales with velocity.
 *
 * The hero's CSS reads `--aurora-x`, `--aurora-y`, `--aurora-intensity` to
 * position + brighten the wash. Touch / reduced-motion bail.
 */
export function initAuroraReactive() {
    if (reduce() || isTouchOnly()) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let intensity = 0;
    let targetIntensity = 0;
    let lastMoveAt = 0;
    let lastClientX = 0;
    let lastClientY = 0;
    let rafId = 0;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
        // Decay intensity if no movement for >300ms
        const idle = performance.now() - lastMoveAt > 300;
        if (idle) targetIntensity = 0;

        currentX = lerp(currentX, targetX, 0.08);
        currentY = lerp(currentY, targetY, 0.08);
        intensity = lerp(intensity, targetIntensity, 0.10);

        hero.style.setProperty('--aurora-x', `${currentX.toFixed(2)}%`);
        hero.style.setProperty('--aurora-y', `${currentY.toFixed(2)}%`);
        hero.style.setProperty('--aurora-intensity', intensity.toFixed(3));

        rafId = requestAnimationFrame(tick);
    };

    const onMove = (event) => {
        const rect = hero.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

        targetX = (x / rect.width) * 100;
        targetY = (y / rect.height) * 100;

        const now = performance.now();
        const dt = Math.max(8, now - lastMoveAt);
        const dx = event.clientX - lastClientX;
        const dy = event.clientY - lastClientY;
        const speed = Math.hypot(dx, dy) / dt; // px/ms
        targetIntensity = Math.min(1, speed * 0.10 + 0.25);

        lastMoveAt = now;
        lastClientX = event.clientX;
        lastClientY = event.clientY;
    };

    const onLeave = () => {
        targetIntensity = 0;
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('mouseleave', onLeave);

    // Pause when tab is hidden — saves battery.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        } else if (!rafId) {
            rafId = requestAnimationFrame(tick);
        }
    });

    rafId = requestAnimationFrame(tick);
}
