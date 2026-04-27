/**
 * @module project-modal
 * @description Renders the rich case-study modal for flagship projects.
 * Reads typed data from js/data/projects.js. Reuses the existing
 * createOverlayManager() for focus trap + ESC handling.
 *
 * Hash deep-link: #project=<slug> opens the matching case-study on load.
 */

import { FLAGSHIP_PROJECTS, findFlagshipByIndex, findFlagshipBySlug } from '../data/projects.js';

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderScreenshots(screenshots, accent) {
    if (!screenshots || !screenshots.length) {
        // Generate 3 gradient placeholders so the section is never empty.
        const tints = [accent, '#8DBAFF', '#C8D0DE'];
        return tints.map((c, i) => `
            <figure class="case-study-shot case-study-shot--placeholder" data-aspect="16/9" style="--shot-accent: ${escapeHtml(c)};">
                <span class="case-study-shot-pip mono">0${i + 1}</span>
            </figure>
        `).join('');
    }
    return screenshots.map((shot) => `
        <figure class="case-study-shot" data-aspect="16/9">
            <img src="${escapeHtml(shot.src)}" alt="${escapeHtml(shot.alt || '')}" loading="lazy" decoding="async" width="960" height="540">
        </figure>
    `).join('');
}

function renderLinks(links, t) {
    if (!links || !links.length) return '';
    return links.map((l) => {
        const icon = l.type === 'github' ? 'bi-github' : (l.type === 'docs' ? 'bi-book-fill' : 'bi-box-arrow-up-right');
        const cls = l.type === 'github' ? 'btn btn-secondary' : 'btn btn-primary';
        return `<a href="${escapeHtml(l.href)}" target="_blank" rel="noopener noreferrer" class="${cls}"><i class="bi ${icon}"></i> <span>${escapeHtml(l.label)}</span></a>`;
    }).join('');
}

function renderModal(project, lang, t) {
    const c = project.content[lang] || project.content.fr;
    const stackHtml = (project.stack || []).map((s) => `<span class="tech-pill case-study-pill">${escapeHtml(s)}</span>`).join('');

    return `
        <button class="case-study-close" type="button" aria-label="${escapeHtml(t('palette.closeHint') || 'fermer')}" data-case-study-close>
            <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
        <div class="case-study-hero" style="--accent: ${escapeHtml(project.accent || '#5B9DFF')}">
            <div class="case-study-hero-top">
                <span class="case-study-tag mono">${escapeHtml(t('caseStudy.tag') || 'CASE STUDY · ' + project.slug.toUpperCase())}</span>
                <i class="case-study-icon bi ${project.icon || 'bi-code-square'}" aria-hidden="true"></i>
            </div>
            <h2 class="case-study-title">${escapeHtml(c.tagline)}</h2>
            <div class="case-study-meta">
                <div class="case-study-metric">
                    <span class="case-study-metric-value">${escapeHtml(project.metric || '—')}</span>
                    <span class="case-study-metric-label">${escapeHtml(c.metricLabel || '')}</span>
                </div>
                <div class="case-study-stack">${stackHtml}</div>
            </div>
        </div>
        <div class="case-study-body">
            <section class="case-study-section">
                <h3 class="case-study-h3"><span class="case-study-h3-pip mono">01</span> ${escapeHtml(t('caseStudy.problem') || 'Problème')}</h3>
                <p>${escapeHtml(c.problem)}</p>
            </section>
            <section class="case-study-section">
                <h3 class="case-study-h3"><span class="case-study-h3-pip mono">02</span> ${escapeHtml(t('caseStudy.approach') || 'Approche')}</h3>
                <p>${escapeHtml(c.approach)}</p>
            </section>
            <section class="case-study-section">
                <h3 class="case-study-h3"><span class="case-study-h3-pip mono">03</span> ${escapeHtml(t('caseStudy.shots') || 'Aperçus')}</h3>
                <div class="case-study-shots">${renderScreenshots(c.screenshots, project.accent)}</div>
            </section>
            <section class="case-study-section">
                <h3 class="case-study-h3"><span class="case-study-h3-pip mono">04</span> ${escapeHtml(t('caseStudy.lessons') || 'Ce que j\'en retiens')}</h3>
                <p>${escapeHtml(c.lessons)}</p>
            </section>
            <div class="case-study-actions">${renderLinks(project.links, t)}</div>
        </div>
    `;
}

/**
 * Init the project modal renderer.
 * @param {object} ctx
 * @param {(key: string) => string} ctx.t
 * @param {() => string} ctx.getCurrentLang
 * @param {{ openOverlay: Function, closeOverlay: Function }} ctx.overlayManager
 * @returns {{ open: (slugOrIndex: string|number) => boolean, hasFlagship: (idx: number) => boolean }}
 */
export function initProjectModal({ t, getCurrentLang, overlayManager } = {}) {
    let overlay = document.getElementById('case-study-modal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'case-study-modal';
        overlay.className = 'case-study-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.setAttribute('aria-labelledby', 'case-study-modal-title');
        const shell = document.createElement('div');
        shell.className = 'case-study-shell';
        shell.setAttribute('tabindex', '-1');
        overlay.appendChild(shell);
        document.body.appendChild(overlay);
    }
    const shell = overlay.querySelector('.case-study-shell');

    const handleClose = () => overlayManager.closeOverlay(overlay);

    const open = (target, triggerEl) => {
        const project = typeof target === 'number'
            ? findFlagshipByIndex(target)
            : findFlagshipBySlug(target);
        if (!project) return false;

        const lang = (getCurrentLang && getCurrentLang()) || 'fr';
        shell.innerHTML = renderModal(project, lang, t);

        // Update hash for shareable deep link (without scroll jump).
        const hash = `#project=${project.slug}`;
        if (window.location.hash !== hash) {
            history.replaceState(null, '', hash);
        }

        overlayManager.openOverlay(overlay, triggerEl, handleClose);

        // Wire close button (rendered fresh every open)
        shell.querySelector('[data-case-study-close]')?.addEventListener('click', handleClose);

        // Click outside the shell closes
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) handleClose();
        }, { once: true });

        return true;
    };

    // Listen for hash changes too (back-button friendly)
    const handleHash = () => {
        const m = window.location.hash.match(/#project=([\w-]+)/);
        if (m && m[1]) open(m[1], document.activeElement);
    };
    window.addEventListener('hashchange', handleHash);

    // Strip the hash on close so refresh doesn't re-open with stale focus
    const observeClose = new MutationObserver(() => {
        if (overlay.getAttribute('aria-hidden') === 'true' && window.location.hash.startsWith('#project=')) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    });
    observeClose.observe(overlay, { attributes: true, attributeFilter: ['aria-hidden'] });

    // Auto-open on load if URL already has the hash
    if (window.location.hash.startsWith('#project=')) {
        // Defer a tick to let the rest of the page settle.
        setTimeout(handleHash, 200);
    }

    const hasFlagship = (idx) => Boolean(findFlagshipByIndex(idx));

    return { open, hasFlagship };
}
