/**
 * @module monogram-particles
 * @description Replaces the static "P." monogram in the hero with an
 * interactive particle field. Particles sample the letter's pixel mask
 * from an offscreen canvas, then ease toward their home position with
 * cursor proximity repulsion.
 *
 * Falls back to the existing static .hero-monogram (kept in DOM) when:
 *   - prefers-reduced-motion: reduce
 *   - hardwareConcurrency < 4 AND viewport width < 768
 *   - the canvas context can't be acquired
 *
 * No deps. Canvas 2D. Targets 60fps via a single rAF loop.
 */

const SAMPLE_STEP_DESKTOP = 5; // pixel sampling stride
const SAMPLE_STEP_MOBILE = 7;
const REPEL_RADIUS = 100;       // px around cursor
const REPEL_STRENGTH = 1100;    // higher = pushier

function isLowEnd() {
    const cores = navigator.hardwareConcurrency || 4;
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    return cores < 4 && narrow;
}

/**
 * @returns {{ destroy: () => void } | null}
 */
export function initMonogramParticles() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || isLowEnd()) return null;

    const canvas = document.getElementById('monogram-canvas');
    const staticMono = document.querySelector('.hero-monogram');
    const hero = document.querySelector('.hero');
    if (!canvas || !hero) return null;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return null;

    let DPR = Math.min(2, window.devicePixelRatio || 1);
    let particles = [];
    let running = true;
    let rafId = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const sampleStep = isMobile ? SAMPLE_STEP_MOBILE : SAMPLE_STEP_DESKTOP;

    /** Read a CSS color from the host so theme switches recolor particles. */
    const readAccent = () => {
        const styles = getComputedStyle(document.documentElement);
        const accent = styles.getPropertyValue('--ice-blue').trim() || '#5B9DFF';
        return accent;
    };

    let particleColor = readAccent();

    const resize = () => {
        const heroRect = hero.getBoundingClientRect();
        const w = heroRect.width;
        const h = heroRect.height;
        DPR = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        rebuildParticles(w, h);
    };

    const rebuildParticles = (w, h) => {
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const offCtx = off.getContext('2d');
        if (!offCtx) return;

        // Render a transparent "P." sized to the hero. Match the existing
        // monogram size — clamp(18rem, 38vw, 30rem) per CSS — close enough.
        const fontSize = Math.min(w, h) * 0.62;
        offCtx.fillStyle = '#fff';
        offCtx.font = `900 ${fontSize}px Fraunces, serif`;
        offCtx.textBaseline = 'middle';
        offCtx.textAlign = 'center';
        offCtx.fillText('P.', w / 2, h / 2);

        let img;
        try {
            img = offCtx.getImageData(0, 0, w, h);
        } catch (_) {
            return; // tainted canvas (shouldn't happen — same-origin)
        }
        const data = img.data;
        const next = [];
        for (let y = 0; y < h; y += sampleStep) {
            for (let x = 0; x < w; x += sampleStep) {
                const i = (y * w + x) * 4;
                if (data[i + 3] > 128) {
                    next.push({
                        homeX: x,
                        homeY: y,
                        x: x + (Math.random() - 0.5) * 60,
                        y: y + (Math.random() - 0.5) * 60,
                        vx: 0,
                        vy: 0,
                        r: 1.0 + Math.random() * 1.4,
                        alpha: 0.45 + Math.random() * 0.45
                    });
                }
            }
        }
        particles = next;
    };

    const tick = () => {
        if (!running) return;
        const w = canvas.width / DPR;
        const h = canvas.height / DPR;
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            const dx = p.homeX - p.x;
            const dy = p.homeY - p.y;

            // Spring toward home
            p.vx = p.vx * 0.82 + dx * 0.06;
            p.vy = p.vy * 0.82 + dy * 0.06;

            // Cursor repel
            const mx = mouseX - p.x;
            const my = mouseY - p.y;
            const dist2 = mx * mx + my * my;
            if (dist2 < REPEL_RADIUS * REPEL_RADIUS && dist2 > 0.0001) {
                const dist = Math.sqrt(dist2);
                const force = REPEL_STRENGTH / dist2;
                p.vx -= (mx / dist) * force * 0.16;
                p.vy -= (my / dist) * force * 0.16;
            }

            p.x += p.vx;
            p.y += p.vy;
        }

        ctx.fillStyle = particleColor;
        for (let i = 0; i < particles.length; i += 1) {
            const p = particles[i];
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        rafId = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    };

    const onLeave = () => {
        mouseX = -9999;
        mouseY = -9999;
    };

    const onThemeChange = () => {
        particleColor = readAccent();
    };

    const onVisibility = () => {
        if (document.hidden) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = 0;
        } else if (!running) {
            running = true;
            rafId = requestAnimationFrame(tick);
        }
    };

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('mousemove', onMove, { passive: true });
    hero.addEventListener('mouseleave', onLeave);
    document.addEventListener('themechange', onThemeChange);
    document.addEventListener('visibilitychange', onVisibility);

    // Hide the static fallback now that we're rendering — keep it in DOM as a
    // graceful fallback if anything throws below.
    if (staticMono) staticMono.classList.add('is-replaced');

    resize();
    rafId = requestAnimationFrame(tick);

    return {
        destroy: () => {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('resize', resize);
            document.removeEventListener('mousemove', onMove);
            hero.removeEventListener('mouseleave', onLeave);
            document.removeEventListener('themechange', onThemeChange);
            document.removeEventListener('visibilitychange', onVisibility);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (staticMono) staticMono.classList.remove('is-replaced');
        }
    };
}
