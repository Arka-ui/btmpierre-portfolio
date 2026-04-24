/**
 * Hero-specific effects: parallax for the `P.` monogram and a caret that tracks
 * the status chip so the chip reads like a line being typed in a terminal.
 * Both bail out when prefers-reduced-motion is set.
 */

const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
