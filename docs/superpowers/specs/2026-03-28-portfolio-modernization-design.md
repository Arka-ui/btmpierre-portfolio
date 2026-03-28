# Portfolio Modernization — Design Spec

**Date:** 2026-03-28
**Scope:** Bug fixes, security hardening, visual refresh (option B), JSDoc + README
**Approach:** Incremental — fix first, then modernize layer by layer. No build tooling added; stays vanilla HTML/CSS/JS.

---

## 1. Bug Fixes

### 1.1 Missing `<title>` tag
- **Problem:** No `<title>` in `<head>`. Critical for SEO and browser tabs.
- **Fix:** Add `<title>Pierre Bouteman | Développeur Full-Stack</title>` with `data-i18n` for EN translation.

### 1.2 Broken `ld+json` structured data
- **Problem:** `<script type="application/ld+json" src="assets/structured-data.json">` — browsers do not load external src for this script type. Structured data is silently ignored.
- **Fix:** Inline the JSON content from `assets/structured-data.json` directly in the `<script>` tag.

### 1.3 Duplicate OG/Twitter meta tags
- **Problem:** Two `og:image` and two `twitter:image` declarations. Social crawlers use the last value, which may differ from intent.
- **Fix:** Keep only the `raw.githubusercontent.com` SVG source; remove the `opengraph.githubassets.com` duplicates.

### 1.4 `data-i18n-placeholder` not handled
- **Problem:** Inputs use `data-i18n-placeholder` attribute, but `applyLanguage()` has no handler for it — placeholders are never translated.
- **Fix:** Add handler in `applyLanguage()`:
  ```js
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
  });
  ```

### 1.5 Frame buster without try/catch
- **Problem:** `window.top.location = window.self.location` throws `SecurityError` in sandboxed cross-origin iframes (e.g. CSP sandbox).
- **Fix:** Wrap in `try/catch` with a silent fallback.

### 1.6 Partial innerHTML sanitization
- **Problem:** i18n HTML content is sanitized by stripping `<script>` tags only. Inline event handlers (`onerror`, `onclick`) and other vectors are not covered.
- **Fix:** Replace regex approach with a DOM-based sanitizer: create a detached `div`, set `innerHTML`, then walk the tree removing elements/attributes outside an allowlist (`strong`, `em`, `a[href]`, `span`, `br`). No external library needed.

---

## 2. Security

### 2.1 CSP: `style-src-attr 'unsafe-inline'`
- **Problem:** Allows inline style attributes on all elements — weakens style injection protection.
- **Fix:** Remove `style-src-attr 'unsafe-inline'`. Audit JS that sets `element.style.*` directly (these are fine — only `style="..."` HTML attributes are affected). Move any remaining inline styles in HTML to classes.

### 2.2 CSP: missing `frame-ancestors`
- **Problem:** The JS frame buster is fragile (throws errors, can be bypassed). `frame-ancestors` in CSP is the correct defense.
- **Fix:** Add `frame-ancestors 'none';` to the CSP meta tag. Keep the JS frame buster as defense-in-depth (with try/catch).

### 2.3 CSP `script-src` SHA hash
- **Note:** The SHA256 hash in `script-src` will need to be updated if the inline script changes. Document this in README.

---

## 3. Visual Modernization

All changes stay within the existing DA: dark (`#0a0812`), violet (`#7c3aed`), accent (`#f0abfc`), DM Mono + Syne fonts.

### 3.1 New CSS Design Tokens
Add to `base.css` `:root`:
```css
--shadow-card: 0 4px 24px rgba(0,0,0,0.4), 0 1px 0 rgba(124,58,237,0.08);
--glow-hover: 0 0 24px rgba(124,58,237,0.3), 0 0 48px rgba(124,58,237,0.12);
--glass-bg: rgba(21,17,34,0.6);
--glass-border: rgba(124,58,237,0.2);
--glass-blur: blur(16px);
```

### 3.2 Hero Section
- Increase headline size: `clamp(3.5rem, 8vw, 7rem)` with tighter `letter-spacing: -0.03em`
- Animated gradient on "Full-Stack" span: `background: linear-gradient(135deg, var(--violet-light), var(--accent))` with `background-clip: text`
- Status tag and visitor counter: increase gap and add subtle separator
- CTA buttons: larger padding, glow shadow on `btn-primary` hover
- Hero orb (`::before`): increase opacity from 0.15 → 0.22, add `animation: pulse 4s ease-in-out infinite alternate`

### 3.3 About Section
- Increase `gap` in `.bio-grid` from current value to `3rem`
- `.big-text`: bump `font-size` to `clamp(1.1rem, 1.5vw, 1.35rem)`, `line-height: 1.8`
- Glass panels: use `--glass-bg`, `--glass-border`, `--glass-blur` tokens; increase `border-radius` to `var(--radius-xl)`
- Expertise panel header: add colored icon background pill
- GitHub card lang bar: increase height from current to `8px`, rounder ends

### 3.4 Projects Section
- Carousel cards: apply `--glass-bg` + `--glass-blur` + `box-shadow: var(--shadow-card)`
- Cards hover: `box-shadow: var(--glow-hover)`, `border-color` shifts to `rgba(124,58,237,0.45)`
- Tech pills: `background: rgba(124,58,237,0.15)`, `border: 1px solid rgba(124,58,237,0.3)`, `color: var(--violet-pale)`
- Client mode toolbar: active button gets a solid violet background + white text (more distinct than current)
- Featured metrics panel: tighter grid, metric values use `font-size: 1.5rem` with `font-family: var(--font-heading)`

### 3.5 Contact Section
- Form inputs focus: add `box-shadow: 0 0 0 3px rgba(124,58,237,0.25)` instead of just border
- Social links: redesign as mini-cards (`display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--glass-bg); border-radius: var(--radius-md); border: 1px solid var(--glass-border)`) with hover glow
- Response time pill: already good, keep as-is
- Footer: add `border-top: 1px solid var(--border)` separator above copyright

### 3.6 Global Micro-interactions
- Nav links: current underline effect → keep but increase animation speed to `0.2s`
- `.reveal` elements: keep `slideUp` but reduce distance from `40px` to `24px` for a subtler feel
- Scrollbar (webkit): style with violet accent (thin, dark track)

---

## 4. Documentation

### 4.1 JSDoc
Add JSDoc comments to all exported functions in:
- `js/app.js` — module bootstrap, key helpers (`t`, `applyLanguage`, `renderLiveVisitorsCount`)
- `js/modules/app-features.js` — all public functions
- `js/modules/contact-form.js` — form init, payload format, Supabase flow
- `js/modules/discord-realtime.js` — WebSocket init, reconnect, status rendering
- `js/modules/projects-ui.js` — carousel, filters, GitHub data fetching
- `js/modules/perf-mode.js`, `modal.js`, `retry.js`, `web-vitals.js`, `ui-effects.js`, `lazy-images.js`, `scroll-animations.js`, `terminal-ui.js`, `skills-modal.js`, `project-search-ui.js`

Format: `@param`, `@returns`, `@description`, file-level `@module` comment.

### 4.2 README rewrite
Sections:
1. **Project overview** — what it is, live URL
2. **Tech stack** — HTML/CSS/JS vanilla, Supabase, Lanyard/Discord, GitHub API
3. **File structure** — annotated tree of key files
4. **Local setup** — clone → run any static server (`npx serve .` or VS Code Live Server)
5. **Configuration** — `js/config.js` fields: `supabaseUrl`, `supabaseAnonKey`, `discordId`, `githubUsername`
6. **Adding a project** — step-by-step: HTML card in `index.html`, data in `projects-ui.js`, i18n keys in `i18n.js`
7. **Adding translations** — i18n key structure, adding a new language
8. **CSP SHA hash** — how to regenerate after modifying the inline script
9. **Deployment** — GitHub Pages, CNAME setup

---

## 5. Out of Scope

- No build tooling (Vite, webpack) introduced
- No framework migration (stays vanilla)
- No Supabase schema changes
- No new sections added to the portfolio content
- `supabase/` edge functions not touched
- `sw.js` service worker not modified

---

## 6. File Change Summary

| File | Change type |
|---|---|
| `index.html` | Bug fixes (title, ld+json, og meta, CSP), minor markup cleanup |
| `css/base.css` | New tokens, hero/nav/loader improvements |
| `css/components.css` | Cards, forms, social links, carousel visual refresh |
| `js/app.js` | JSDoc, frame buster fix, i18n placeholder handler |
| `js/modules/app-features.js` | JSDoc, innerHTML sanitizer fix |
| `js/modules/contact-form.js` | JSDoc |
| `js/modules/discord-realtime.js` | JSDoc |
| `js/modules/projects-ui.js` | JSDoc |
| `js/modules/*.js` (others) | JSDoc |
| `README.md` | Full rewrite |
