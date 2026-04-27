/**
 * @module konami-matrix
 * @description Konami code easter egg. Listens for ↑↑↓↓←→←→BA on the document
 * (only when focus is on body — won't interfere with form inputs / nav arrows
 * / palette). Triggers a 6-second matrix-rain canvas overlay.
 *
 * Also listens for `btm:matrix-trigger` events so the command palette can
 * fire it without typing the code.
 */

const SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
];

const DURATION_MS = 6000;
const COLUMN_WIDTH = 16;
const FONT_SIZE = 18;
const CHARS = 'アァカサタナハマヤラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨロヲゴゾドボポヴッン01';

let active = false;

function showToast() {
    const toast = document.getElementById('konami-toast');
    if (!toast) return;
    toast.classList.add('is-on');
    toast.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
        toast.classList.remove('is-on');
        toast.setAttribute('aria-hidden', 'true');
    }, 2400);
}

function runMatrix() {
    if (active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Reduced motion: skip the animation, just toast that it happened.
        showToast();
        return;
    }
    active = true;

    const overlay = document.createElement('div');
    overlay.className = 'matrix-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);

    // Force a reflow so the .is-on class transition kicks in
    void overlay.offsetWidth;
    overlay.classList.add('is-on');

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `bold ${FONT_SIZE}px Geist Mono, monospace`;
    };
    resize();

    const cols = Math.ceil(window.innerWidth / COLUMN_WIDTH);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -50);

    const accent = getComputedStyle(document.documentElement).getPropertyValue('--ice-blue').trim() || '#5B9DFF';

    let rafId = 0;
    let started = performance.now();

    const tick = () => {
        if (!active) return;
        // Trail — semi-transparent black keeps the rain effect
        ctx.fillStyle = 'rgba(2, 4, 9, 0.18)';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < drops.length; i += 1) {
            const ch = CHARS[(Math.random() * CHARS.length) | 0];
            const x = i * COLUMN_WIDTH;
            const y = drops[i] * FONT_SIZE;

            // Head glyph in white, trail in accent
            ctx.fillStyle = '#ffffff';
            ctx.fillText(ch, x, y);
            ctx.fillStyle = accent;
            ctx.fillText(ch, x, y - FONT_SIZE);

            if (y > window.innerHeight && Math.random() > 0.965) {
                drops[i] = 0;
            }
            drops[i] += 1;
        }

        // Auto-stop after duration
        if (performance.now() - started >= DURATION_MS) {
            stop();
            return;
        }

        rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
        active = false;
        if (rafId) cancelAnimationFrame(rafId);
        overlay.classList.remove('is-on');
        setTimeout(() => overlay.remove(), 600);
        document.removeEventListener('keydown', onKey);
        window.removeEventListener('resize', resize);
    };

    const onKey = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            stop();
        }
    };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', resize, { passive: true });

    showToast();
    rafId = requestAnimationFrame(tick);
}

/**
 * Listen for the Konami code on the document. Quietly resets the buffer if
 * the user types other keys, and only fires when focus is on body / non-form
 * elements (so inputs, textareas, and the palette don't trigger it).
 */
export function initKonamiMatrix() {
    let buffer = [];

    const isInteractive = (el) => {
        if (!el) return false;
        const tag = el.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
        if (el.isContentEditable) return true;
        return false;
    };

    document.addEventListener('keydown', (e) => {
        if (isInteractive(document.activeElement)) {
            buffer = [];
            return;
        }
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        const expected = SEQUENCE[buffer.length];
        if (key === expected) {
            buffer.push(key);
            if (buffer.length === SEQUENCE.length) {
                buffer = [];
                runMatrix();
            }
        } else {
            // Restart only if the key is the first of the sequence; otherwise discard.
            buffer = key === SEQUENCE[0] ? [key] : [];
        }
    });

    document.addEventListener('btm:matrix-trigger', runMatrix);
}
