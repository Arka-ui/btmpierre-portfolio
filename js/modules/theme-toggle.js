/**
 * @module theme-toggle
 * @description Light/dark theme toggle with View Transitions API.
 *
 * Resolution order (matches the inline boot script in index.html):
 *   1. localStorage 'portfolio-theme' — explicit user choice
 *   2. prefers-color-scheme — system preference
 *   3. fallback: 'dark'
 *
 * The boot script sets `document.documentElement.dataset.theme` before any
 * stylesheet parses, so this module just handles the button + transitions.
 *
 * Where supported (Chrome 111+, Edge), `document.startViewTransition` produces
 * a circular reveal from the click point. Firefox/Safari fall back to a 200ms
 * opacity crossfade defined in css/theme.css.
 */

const STORAGE_KEY = 'portfolio-theme';
const VALID_THEMES = new Set(['dark', 'light']);

/**
 * Resolve the theme that should be active right now (no DOM read).
 * @returns {'dark'|'light'}
 */
export function resolveInitialTheme() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (VALID_THEMES.has(stored)) return stored;
    } catch (_) { /* localStorage may be denied — fall through */ }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
}

/**
 * Read the theme currently rendered on the page.
 * @returns {'dark'|'light'}
 */
export function getCurrentTheme() {
    const value = document.documentElement.dataset.theme;
    return VALID_THEMES.has(value) ? value : 'dark';
}

/**
 * Persist a theme choice and apply it. Triggers a View Transition when supported.
 * @param {'dark'|'light'} next
 * @param {{ x?: number, y?: number, persist?: boolean }} [options]
 */
export function setTheme(next, options = {}) {
    if (!VALID_THEMES.has(next)) return;
    const { x = null, y = null, persist = true } = options;

    const apply = () => {
        document.documentElement.dataset.theme = next;
        if (persist) {
            try { localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* ignore */ }
        }
        // Update PWA theme color tag so OS chrome (mobile address bar) follows the theme.
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', next === 'light' ? '#F4F6FA' : '#0A0D12');

        // Notify listeners (particles, aurora, etc.) so they can re-read CSS vars.
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsVT = typeof document.startViewTransition === 'function';

    if (!supportsVT || reduceMotion) {
        apply();
        return;
    }

    if (x !== null && y !== null) {
        document.documentElement.style.setProperty('--vt-origin-x', `${x}px`);
        document.documentElement.style.setProperty('--vt-origin-y', `${y}px`);
        document.documentElement.classList.add('vt-circular-reveal');
    }

    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => {
        document.documentElement.classList.remove('vt-circular-reveal');
        document.documentElement.style.removeProperty('--vt-origin-x');
        document.documentElement.style.removeProperty('--vt-origin-y');
    });
}

/**
 * Wire the theme toggle button (must already exist in DOM with id="theme-toggle").
 * Sets aria-pressed, listens for clicks + system preference changes, exposes a
 * tiny window.btmTheme API for the command palette to call into.
 *
 * @param {{ t: (key: string) => string }} ctx
 * @returns {{ getTheme: () => 'dark'|'light', toggle: (e?: Event) => void } | null}
 */
export function initThemeToggle({ t } = {}) {
    const button = document.getElementById('theme-toggle');
    if (!button) return null;

    const labels = () => ({
        dark: typeof t === 'function' ? t('theme.toggleToLight') : 'Switch to light theme',
        light: typeof t === 'function' ? t('theme.toggleToDark') : 'Switch to dark theme'
    });

    const refresh = () => {
        const theme = getCurrentTheme();
        const map = labels();
        button.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
        button.setAttribute('aria-label', theme === 'dark' ? map.dark : map.light);
        button.dataset.theme = theme;
    };

    const toggle = (event) => {
        const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
        let originX = null;
        let originY = null;
        if (event && 'clientX' in event && 'clientY' in event) {
            originX = event.clientX;
            originY = event.clientY;
        } else {
            const rect = button.getBoundingClientRect();
            originX = rect.left + rect.width / 2;
            originY = rect.top + rect.height / 2;
        }
        setTheme(next, { x: originX, y: originY });
        refresh();
    };

    button.addEventListener('click', toggle);

    // Follow system preference if the user hasn't made an explicit choice.
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!VALID_THEMES.has(stored)) {
            const mql = window.matchMedia('(prefers-color-scheme: light)');
            const onChange = (event) => {
                const sysTheme = event.matches ? 'light' : 'dark';
                if (!VALID_THEMES.has(localStorage.getItem(STORAGE_KEY))) {
                    setTheme(sysTheme, { persist: false });
                    refresh();
                }
            };
            if (mql.addEventListener) mql.addEventListener('change', onChange);
            else if (mql.addListener) mql.addListener(onChange);
        }
    } catch (_) { /* localStorage denied */ }

    refresh();

    // Re-label when language changes (i18n.js dispatches a custom event;
    // fall back to MutationObserver on the lang attribute as a safety net).
    document.addEventListener('languagechange', refresh);
    new MutationObserver(refresh).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang']
    });

    const api = { getTheme: getCurrentTheme, toggle };
    window.btmTheme = api;
    return api;
}
