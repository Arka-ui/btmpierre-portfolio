/**
 * @module command-palette
 * @description Cmd/Ctrl+K command palette. Fuzzy-searchable list of nav
 * sections, theme toggle, language toggle, project case-studies, social
 * links, and `>`-prefixed terminal commands.
 *
 * Pure vanilla — no dependencies. ARIA combobox pattern with:
 *   - role="dialog" on overlay, role="listbox" on results
 *   - aria-activedescendant pointing at the highlighted option
 *   - keyboard nav: ↑↓ to move, Enter to activate, Esc to close
 *   - focus trap inside palette, return focus to trigger on close
 *
 * Ranking: token-prefix > substring > all-tokens-found. Stable sort by
 * group + index for predictable ordering.
 */

const PALETTE_ID = 'command-palette';

/** Simple weighted score: 0 = no match, higher = better. */
function scoreEntry(entry, query) {
    if (!query) return 1;
    const q = query.toLowerCase().trim();
    if (!q) return 1;
    const haystack = [entry.label, entry.description || '', ...(entry.keywords || [])].join(' ').toLowerCase();

    if (haystack.startsWith(q)) return 100;
    if (haystack.includes(` ${q}`)) return 60;
    if (haystack.includes(q)) return 40;

    const tokens = q.split(/\s+/).filter(Boolean);
    let allFound = true;
    for (const tok of tokens) {
        if (!haystack.includes(tok)) { allFound = false; break; }
    }
    return allFound ? 20 : 0;
}

/** Highlight matched substring inside a label (HTML-safe). */
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function highlight(label, query) {
    const safe = escapeHtml(label);
    if (!query) return safe;
    const q = query.trim();
    if (!q) return safe;
    try {
        const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return safe.replace(re, '<mark class="palette-hl">$1</mark>');
    } catch (_) {
        return safe;
    }
}

/**
 * Build the static + dynamic entries every time the palette opens.
 * Static entries reference DOM that's already there; dynamic ones (projects)
 * read from the live carousel so titles stay i18n-correct.
 */
function buildEntries({ t, applyLanguage, getCurrentLang, theme, projectsUI }) {
    const entries = [];

    // Group: nav
    const navItems = [
        { id: 'nav-about', icon: 'bi-person-fill', section: 'about' },
        { id: 'nav-skills', icon: 'bi-bar-chart-fill', section: 'skills' },
        { id: 'nav-experience', icon: 'bi-briefcase-fill', section: 'experience' },
        { id: 'nav-projects', icon: 'bi-code-slash', section: 'projects' },
        { id: 'nav-contact', icon: 'bi-envelope-at-fill', section: 'contact' }
    ];
    for (const it of navItems) {
        entries.push({
            id: it.id,
            group: 'nav',
            groupLabel: t('palette.groups.nav'),
            label: t(`nav.${it.section === 'experience' ? 'experience' : it.section}`),
            description: t('palette.scrollTo'),
            icon: it.icon,
            keywords: [it.section, 'go', 'aller', 'section'],
            run: () => {
                const target = document.getElementById(it.section);
                if (!target) return;
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
            }
        });
    }

    // Group: settings
    const currentTheme = theme && theme.getTheme ? theme.getTheme() : (document.documentElement.dataset.theme || 'dark');
    entries.push({
        id: 'theme-toggle',
        group: 'settings',
        groupLabel: t('palette.groups.settings'),
        label: currentTheme === 'dark' ? t('theme.toggleToLight') : t('theme.toggleToDark'),
        description: t('palette.themeHint'),
        icon: currentTheme === 'dark' ? 'bi-sun' : 'bi-moon-stars',
        keywords: ['theme', 'thème', 'dark', 'light', 'sombre', 'clair', 'mode'],
        run: () => {
            if (theme && typeof theme.toggle === 'function') theme.toggle();
        }
    });

    const lang = getCurrentLang();
    const otherLang = lang === 'fr' ? 'en' : 'fr';
    entries.push({
        id: 'lang-toggle',
        group: 'settings',
        groupLabel: t('palette.groups.settings'),
        label: lang === 'fr' ? t('palette.switchToEnglish') : t('palette.switchToFrench'),
        description: t('palette.langHint'),
        icon: 'bi-translate',
        keywords: ['language', 'langue', 'fr', 'en', 'français', 'english'],
        run: () => {
            if (typeof applyLanguage === 'function') applyLanguage(otherLang);
        }
    });

    // Group: projects (read live from the carousel — titles stay i18n-correct)
    document.querySelectorAll('.carousel-item').forEach((card) => {
        const idx = Number(card.dataset.index);
        if (Number.isNaN(idx)) return;
        const titleNode = card.querySelector('.project-title');
        const metaNode = card.querySelector('.project-meta');
        const title = titleNode ? titleNode.textContent.trim() : `Projet ${idx + 1}`;
        const meta = metaNode ? metaNode.textContent.trim() : '';
        entries.push({
            id: `project-${idx}`,
            group: 'projects',
            groupLabel: t('palette.groups.projects'),
            label: title,
            description: meta,
            icon: 'bi-folder-fill',
            keywords: ['projet', 'project', meta.toLowerCase()],
            run: () => {
                if (projectsUI && typeof projectsUI.openModal === 'function') {
                    projectsUI.openModal(idx);
                } else {
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Group: links
    entries.push(
        {
            id: 'link-github',
            group: 'links',
            groupLabel: t('palette.groups.links'),
            label: 'GitHub · @nexos20lv',
            description: 'github.com/nexos20lv',
            icon: 'bi-github',
            keywords: ['github', 'repo', 'code', 'source'],
            run: () => window.open('https://github.com/nexos20lv', '_blank', 'noopener,noreferrer')
        },
        {
            id: 'link-discord',
            group: 'links',
            groupLabel: t('palette.groups.links'),
            label: 'Discord · @nexos20lv',
            description: 'discord.com/users/1288079115248992297',
            icon: 'bi-discord',
            keywords: ['discord', 'chat'],
            run: () => window.open('https://discord.com/users/1288079115248992297', '_blank', 'noopener,noreferrer')
        },
        {
            id: 'link-email',
            group: 'links',
            groupLabel: t('palette.groups.links'),
            label: 'pierre.bouteman@icloud.com',
            description: t('palette.emailHint'),
            icon: 'bi-envelope-fill',
            keywords: ['email', 'mail', 'contact'],
            run: () => window.open('mailto:pierre.bouteman@icloud.com', '_self')
        },
        {
            id: 'link-upstream',
            group: 'links',
            groupLabel: t('palette.groups.links'),
            label: t('palette.upstream'),
            description: 'btmpierre.me',
            icon: 'bi-box-arrow-up-right',
            keywords: ['officiel', 'official', 'upstream', 'btmpierre'],
            run: () => window.open('https://btmpierre.me/', '_blank', 'noopener,noreferrer')
        }
    );

    // Group: terminal commands (`>` prefix routes here)
    entries.push(
        {
            id: 'cmd-whoami',
            group: 'terminal',
            groupLabel: t('palette.groups.terminal'),
            label: '> whoami',
            description: t('palette.cmds.whoami'),
            icon: 'bi-terminal-fill',
            keywords: ['whoami', 'who'],
            terminalOnly: true,
            run: () => alert(t('palette.cmds.whoamiOutput'))
        },
        {
            id: 'cmd-matrix',
            group: 'terminal',
            groupLabel: t('palette.groups.terminal'),
            label: '> matrix',
            description: t('palette.cmds.matrix'),
            icon: 'bi-terminal-fill',
            keywords: ['matrix', 'easter', 'konami'],
            terminalOnly: true,
            run: () => document.dispatchEvent(new CustomEvent('btm:matrix-trigger'))
        },
        {
            id: 'cmd-coffee',
            group: 'terminal',
            groupLabel: t('palette.groups.terminal'),
            label: '> sudo make coffee',
            description: t('palette.cmds.coffee'),
            icon: 'bi-terminal-fill',
            keywords: ['coffee', 'sudo'],
            terminalOnly: true,
            run: () => alert(t('palette.cmds.coffeeOutput'))
        },
        {
            id: 'cmd-credits',
            group: 'terminal',
            groupLabel: t('palette.groups.terminal'),
            label: '> credits',
            description: t('palette.cmds.credits'),
            icon: 'bi-terminal-fill',
            keywords: ['credits', 'about', 'arka'],
            terminalOnly: true,
            run: () => alert(t('palette.cmds.creditsOutput'))
        },
        {
            id: 'cmd-source',
            group: 'terminal',
            groupLabel: t('palette.groups.terminal'),
            label: '> open source',
            description: t('palette.cmds.source'),
            icon: 'bi-terminal-fill',
            keywords: ['source', 'fork', 'github'],
            terminalOnly: true,
            run: () => window.open('https://github.com/Arka-ui/btmpierre-portfolio', '_blank', 'noopener,noreferrer')
        }
    );

    return entries;
}

function filterAndSort(entries, query) {
    const isTerm = query.startsWith('>');
    const q = isTerm ? query.slice(1).trim() : query.trim();

    const scored = entries
        .filter((e) => isTerm ? e.terminalOnly : !e.terminalOnly || q.length > 0)
        .map((e) => ({ entry: e, score: scoreEntry(e, q) }))
        .filter((s) => s.score > 0);

    scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.entry.group !== b.entry.group) return a.entry.group < b.entry.group ? -1 : 1;
        return 0;
    });

    return scored.map((s) => s.entry);
}

function renderResults(listEl, entries, query, activeIndex) {
    if (!entries.length) {
        listEl.innerHTML = `<div class="palette-empty" data-i18n="palette.noResults">${escapeHtml('Aucun résultat.')}</div>`;
        return [];
    }

    const itemEls = [];
    let html = '';
    let currentGroup = null;
    entries.forEach((entry, i) => {
        if (entry.groupLabel && entry.group !== currentGroup) {
            currentGroup = entry.group;
            html += `<div class="palette-group-label mono">${escapeHtml(entry.groupLabel)}</div>`;
        }
        const isActive = i === activeIndex;
        html += `
            <div id="palette-opt-${i}"
                 class="palette-item${isActive ? ' is-active' : ''}"
                 role="option"
                 aria-selected="${isActive ? 'true' : 'false'}"
                 data-index="${i}">
                <i class="palette-item-icon bi ${entry.icon || 'bi-arrow-right'}" aria-hidden="true"></i>
                <span class="palette-item-label">${highlight(entry.label, query)}</span>
                ${entry.description ? `<span class="palette-item-desc">${escapeHtml(entry.description)}</span>` : ''}
                <span class="palette-item-enter mono" aria-hidden="true">↵</span>
            </div>`;
    });

    listEl.innerHTML = html;
    listEl.querySelectorAll('.palette-item').forEach((el) => itemEls.push(el));
    return itemEls;
}

/**
 * Initialize the command palette. Wires Cmd/Ctrl+K, the trigger button, and
 * the existing palette markup in index.html.
 *
 * @param {object} ctx
 * @param {(key: string) => string} ctx.t
 * @param {(lang: string) => void} ctx.applyLanguage
 * @param {() => string} ctx.getCurrentLang
 * @param {{ getTheme: () => string, toggle: () => void } | null} ctx.theme
 * @param {{ openModal: (idx: number) => unknown } | null} ctx.projectsUI
 */
export function initCommandPalette({ t, applyLanguage, getCurrentLang, theme, projectsUI } = {}) {
    const overlay = document.getElementById(PALETTE_ID);
    const input = document.getElementById('palette-input');
    const list = document.getElementById('palette-list');
    const trigger = document.getElementById('palette-trigger');
    if (!overlay || !input || !list) return;

    let activeIndex = 0;
    let currentEntries = [];
    let currentItems = [];
    let lastTrigger = null;

    const open = (triggerEl) => {
        lastTrigger = triggerEl || document.activeElement;
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('palette-locked');
        input.value = '';
        update();
        // Focus after the next frame so the View Transition / fade has begun.
        requestAnimationFrame(() => input.focus());
    };

    const close = () => {
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('palette-locked');
        input.setAttribute('aria-activedescendant', '');
        if (lastTrigger && typeof lastTrigger.focus === 'function') {
            lastTrigger.focus();
        }
    };

    const update = () => {
        const allEntries = buildEntries({ t, applyLanguage, getCurrentLang, theme, projectsUI });
        currentEntries = filterAndSort(allEntries, input.value);
        if (!currentEntries.length) {
            currentItems = renderResults(list, [], input.value, -1);
            input.setAttribute('aria-activedescendant', '');
            return;
        }
        if (activeIndex >= currentEntries.length) activeIndex = 0;
        currentItems = renderResults(list, currentEntries, input.value, activeIndex);
        const activeEl = currentItems[activeIndex];
        input.setAttribute('aria-activedescendant', activeEl ? activeEl.id : '');
    };

    const setActive = (i) => {
        if (!currentEntries.length) return;
        activeIndex = (i + currentEntries.length) % currentEntries.length;
        currentItems.forEach((el, idx) => {
            const isActive = idx === activeIndex;
            el.classList.toggle('is-active', isActive);
            el.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        const activeEl = currentItems[activeIndex];
        if (activeEl) {
            input.setAttribute('aria-activedescendant', activeEl.id);
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    };

    const activate = () => {
        const entry = currentEntries[activeIndex];
        if (!entry) return;
        close();
        // Run after close to let focus settle and the modal fade out.
        setTimeout(() => entry.run(), 60);
    };

    // Input search
    input.addEventListener('input', () => {
        activeIndex = 0;
        update();
    });

    // Keyboard nav
    input.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActive(activeIndex + 1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActive(activeIndex - 1);
                break;
            case 'Home':
                e.preventDefault();
                setActive(0);
                break;
            case 'End':
                e.preventDefault();
                setActive(currentEntries.length - 1);
                break;
            case 'Enter':
                e.preventDefault();
                activate();
                break;
            case 'Escape':
                e.preventDefault();
                close();
                break;
            case 'Tab':
                // Trap focus inside the palette by preventing default Tab leakage.
                e.preventDefault();
                break;
        }
    });

    // Click activation
    list.addEventListener('click', (e) => {
        const target = e.target.closest('.palette-item');
        if (!target) return;
        const idx = Number(target.dataset.index);
        if (Number.isNaN(idx)) return;
        activeIndex = idx;
        activate();
    });

    list.addEventListener('mousemove', (e) => {
        const target = e.target.closest('.palette-item');
        if (!target) return;
        const idx = Number(target.dataset.index);
        if (!Number.isNaN(idx) && idx !== activeIndex) setActive(idx);
    });

    // Close on overlay click outside the shell
    overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) close();
    });

    // Global hotkey: Cmd/Ctrl+K
    document.addEventListener('keydown', (e) => {
        const isOpen = overlay.classList.contains('is-open');
        const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
        if (isCmdK) {
            e.preventDefault();
            if (isOpen) close(); else open(trigger || document.activeElement);
            return;
        }
        if (!isOpen && e.key === 'Escape') return;
    });

    // Trigger button + the existing #quick-tour-btn? leave tour intact.
    trigger?.addEventListener('click', () => open(trigger));

    // Provide a tiny global API so the konami easter-egg + others can open it.
    window.btmPalette = { open: () => open(trigger || document.activeElement), close };
}
