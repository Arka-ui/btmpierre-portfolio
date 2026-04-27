# Fork Upgrade Roadmap — btmpierre.riftmc.net

**Date:** 2026-04-25
**Owner:** Arka (`Arka-ui/btmpierre-portfolio`)
**Live:** <https://btmpierre.riftmc.net> (GitHub Pages, Cloudflare-proxied)
**Last green deploy:** `285e60a chore(cache): bump asset versions` (2026-04-24, 22:46 UTC)

> Goal: take a working, performant, accessible portfolio fork and push it to a 2026-grade reference site — every meaningful axis (UX, perf, SEO, a11y, code health, tooling, observability) gets a concrete, ordered set of changes.

---

## 0. Ground rules for the fork

These constrain everything below:

- **Read-only contracts.** Anything inside a `.feature-blocked` wrapper (contact form, booking tools, booking modal) and the bot/Supabase pipeline behind them stay frozen. They belong to upstream. Visual polish on the *overlay itself* is allowed, the gated functionality is not.
- **No build step (yet).** Static ES modules + plain CSS. Phase 4 introduces optional tooling, but every phase before that has to ship without touching deploy mechanics.
- **Don't break the Cloudflare → GitHub Pages chain we just fixed.** That means no rename of `index.html`, no path moves that break the existing CNAME (`btmpierre.riftmc.net → arka-ui.github.io`), no removal of `.nojekyll`, no removal of `_headers`/`_redirects` (harmless on GH Pages, useful if user ever moves back to CF Pages).
- **Bilingual parity.** Every user-facing string change ships in both `js/i18n/fr.js` and `js/i18n/en.js`. No exceptions.
- **Visual-regression CI is the trip wire.** `.github/workflows/visual-tests.yml` runs Puppeteer screenshots + a metrics check on every push. Treat its failures as blocking. When a redesign is intentional, update the baselines in the same PR.

---

## 1. Current state — one-paragraph summary

Solid bones. ~9k lines of CSS (one 5.8k-line monolith), ~4.2k lines of JS across 14 ES modules, no build step, service worker, CSP, honeypot, Turnstile, web-vitals instrumentation, visual-regression CI, FR/EN i18n, JSON-LD structured data, IntersectionObserver-driven reveals. Real gaps: no `<h1>`, no light theme, no project case-studies, monolithic `components.css`, several modules over 500 LOC, no linter/formatter/type-check, no error reporting, no font-display strategy, no image aspect-ratio reservations, dark-only palette. The fork-specific work (feature-blocked overlays, steel/ice palette, Fraunces/Geist Mono pairing) is healthy — the backlog below is what makes the *rest* match.

---

## 2. Phased plan

Effort key: **S** ≤ 2 h · **M** = half-day · **L** = full day · **XL** = multi-day

### Phase 1 — Quick wins (≤ 1 day combined)

**Goal:** every change you can ship today that moves a metric or removes a regression risk.

| # | Task | Files | Effort | Acceptance |
|---|------|-------|--------|------------|
| 1.1 | Add a real `<h1>` to the hero (currently only `<span>`/`<div>`) — wrap the name+tagline in `<h1>` with `data-i18n="hero.h1"` | `index.html`, `js/i18n/{fr,en}.js`, `css/hero-style.css` (visual parity) | S | Lighthouse "Heading order" passes; one and only one `<h1>` per page |
| 1.2 | Add `font-display: swap` to all Google Font `<link>` tags via `&display=swap` URL param | `index.html` | S | No text remains invisible >100ms on slow 3G; FOIT eliminated |
| 1.3 | Add `width`/`height` (or `aspect-ratio` in CSS) to every `<img>` and dynamically-injected image to lock layout | `index.html`, `js/modules/projects-ui.js`, `js/modules/discord-realtime.js` | M | CLS score < 0.05 in Lighthouse |
| 1.4 | Ship `robots.txt` and `sitemap.xml` at repo root | new files | S | `curl btmpierre.riftmc.net/robots.txt` returns 200 with a valid `Sitemap:` line |
| 1.5 | Add `<link rel="canonical" href="https://btmpierre.riftmc.net/">` to head | `index.html` | S | View-source shows canonical; Google search console accepts it |
| 1.6 | Replace the upstream-pointing project URLs in `assets/structured-data.json` with the same fork-neutral URLs already used in JSON-LD (or remove the duplicate file entirely — it's superseded by inline LD-JSON) | `assets/structured-data.json` or `index.html` | S | Only one source of truth for structured data |
| 1.7 | Add `prefers-reduced-data` and `prefers-reduced-transparency` queries to gate the aurora + particle effects | `css/hero-style.css`, `css/animations.css` | S | DevTools "emulate reduced-data" visibly disables decorative loads |
| 1.8 | Cache-bust strategy: stop hand-bumping `?v=` query strings — use the file mtime via a tiny build-free `sw.js` revision constant + content-hash for CSS imports. *Compromise:* keep `?v=` but document the bump-on-publish rule in `CONTRIBUTING.md`. | `CONTRIBUTING.md` (new), or longer-term `sw.js` | S | Every CSS/JS edit ships with a version bump; documented |

**Phase 1 ships as a single PR.** Visual-regression baselines should not move.

---

### Phase 2 — Structural cleanup (2–3 days)

**Goal:** make the codebase pleasant to extend. No user-visible behavior changes.

#### 2.1 Split `css/components.css` (5,823 lines → 6 focused files) — **L**

Today every selector lives in one file. Split along the boundaries already implied by the section IDs:

```
css/components.css                  # only shared primitives (≤ 800 lines)
css/sections/hero.css               # already roughly here, normalize
css/sections/about.css
css/sections/skills.css             # incl. skill-bar pure-CSS rules
css/sections/projects.css           # carousel + project-card + filter UI
css/sections/contact.css            # contact-form + feature-blocked overlay
css/sections/booking.css
css/components/cards.css            # all card-base / card-* shared rules
css/components/modal.css            # all overlay/dialog primitives
css/components/feature-blocked.css  # extract — used in 2 places, ~200 lines
```

Update `index.html` to pull each one. Use `@layer` to formalize the cascade order:

```css
@layer reset, base, layout, components, sections, utilities, overrides;
```

Delete `css/ui-modern.css` after redistributing its contents — it's a "miscellaneous" bucket that breaks single-purpose-file discipline.

**Acceptance:** total CSS bytes within ±2% of current (no regressions); visual-regression baselines unchanged; new file count = 9; old `components.css` ≤ 800 lines.

#### 2.2 Decompose the three giant modules — **L**

| Module | LOC today | Split into |
|--------|----------:|------------|
| `discord-realtime.js` | 732 | `lanyard-client.js` (WS lifecycle, retry, parsing) + `discord-presence-ui.js` (DOM updates, asset URLs) |
| `projects-ui.js` | 693 | `projects-data.js` (GitHub API fetch + cache) + `projects-carousel.js` (touch/keyboard/autoplay) + `projects-modal.js` (detail view) |
| `ui-effects.js` | 517 | `effects/scroll-reveal.js`, `effects/nav-spy.js`, `effects/cursor.js`, `effects/tilt.js`, `effects/header-scroll.js`. The remaining initializers stay in `ui-effects.js` as a thin orchestrator. |

`app.js` becomes the only place that knows about the new module names. **Public API of `ui-effects.js` (the exported `init*` functions) does not change.**

**Acceptance:** no module exceeds 350 LOC; `npm run lint` (when added in Phase 4) passes; visual regression unchanged.

#### 2.3 Standardize patterns — **M**

- **Error handling:** every `fetch` goes through `fetchWithTimeout` from `js/modules/net.js`; every `.catch` either re-throws or calls a single `reportError(err, context)` helper in `js/modules/errors.js`.
- **Module shape:** each module exports a default `init({ root, i18n })` and named utilities. No more `window.__VITALS__` style globals — expose via `window.btm = { vitals, … }` namespace.
- **i18n:** auto-derive `en.js` keys from `fr.js` at module-load time and assert no missing keys (warn in dev). Catches the FR/EN drift we already had to fix.

**Acceptance:** zero `window.<Caps>` globals (other than `window.btm`); every `fetch` callsite goes through the wrapper; missing-i18n-key warning visible in console for any drift.

#### 2.4 Document the public surface — **M**

Add JSDoc `@typedef` + `@param`/`@returns` to every exported function. Run `tsc --noEmit --allowJs --checkJs` to type-check JS via JSDoc — no TypeScript migration yet, just type validation. Add a `types/` folder with shared `@typedef` definitions (`I18n`, `LanyardPresence`, `Project`).

**Acceptance:** `npm run typecheck` passes; every exported function has a `@param` for each argument and a `@returns`.

---

### Phase 3 — New features & polish (3–5 days)

**Goal:** the things that make a 2026 portfolio feel current, scoped tightly so each one ships independently.

#### 3.1 Light/dark theme toggle — **L**

- Drive everything from CSS custom properties, scoped under `[data-theme="light"]` / `[data-theme="dark"]`.
- Default = system (`prefers-color-scheme`), persist user choice in `localStorage`.
- Toggle lives in the nav — animated icon (sun ↔ moon), `<button>` with `aria-pressed`.
- The steel/ice palette stays the dark default; design a coherent ice/parchment palette for light: `--bg: #F4F6FA`, `--text: #0A0D12`, `--accent: #2563EB`, etc. Maintain the same contrast ratios.
- Update aurora + particle colors to read from custom properties so they respect the theme.

**Acceptance:** toggling theme changes the page within one frame with no FOUC; persists across reloads; respects system preference on first visit; visual regression baseline added for both themes.

#### 3.2 Project case studies — **L**

Today projects are surface-level cards. For 4–6 flagship projects, add a "deep view":

- Click a project → existing modal expands into a multi-section layout: hero quote, problem, approach, stack, screenshots, lessons, links.
- Content lives in `js/data/projects.js` (typed data, one entry per project) — no separate routes, no hash-based navigation needed.
- `projects-modal.js` (from Phase 2.2) renders from this shape.
- Skeleton loader while images load.

**Acceptance:** at least 4 projects have full case-study payloads; modal scroll is locked to the modal; `Esc` closes; focus returns to the triggering card.

#### 3.3 Smooth section navigation — **S**

- Add `html { scroll-behavior: smooth }` (already partly there in some sections).
- Ensure section IDs match nav anchor `href`s.
- When `prefers-reduced-motion` is on, skip the smooth scroll entirely.

**Acceptance:** clicking a nav item smoothly scrolls; reduced-motion users get instant jumps.

#### 3.4 Form-feedback polish on the *blocked* overlay — **S**

The blocking is correct, but the overlay can be more delightful. Add:
- A subtle entrance animation on first scroll-into-view.
- "Why is this blocked?" expandable note (already partial — wire it up via `<details>`).
- Direct CTAs to upstream's contact form + a secondary CTA to "fork your own".

This is the *only* legit way to upgrade the contact area without violating the read-only contract.

**Acceptance:** Lighthouse a11y audit clean; CTA click-through tracked locally via web-vitals beacon.

#### 3.5 Micro-interactions pass — **M**

- Hover on project cards → tilt is already there; tone it down (current 8° is dizzy; 3° is plenty).
- Skill bars → on visible, fill animates from 0 to value in 600ms with `cubic-bezier(0.22, 1, 0.36, 1)`; tooltip appears on hover only after fill completes.
- Nav: active link gets an animated underline (CSS `::after` with `transform: scaleX()`).
- Buttons: subtle `transform: translateY(-1px)` + shadow lift on hover, `:active` resets.
- Use the `View Transitions API` (where supported) for theme toggle and modal open/close. Polyfill-free fallback for non-Chrome.

**Acceptance:** none of these break the visual-regression suite without an intentional baseline update; reduced-motion respects all of them.

#### 3.6 Hero: replace the static monogram with a more memorable identity moment — **M**

Options to A/B (pick one in implementation):
- **Option A:** Animated terminal-style typewriter that prints a 4-line "what I do" block, then settles. Uses existing `terminal-ui.js`.
- **Option B:** Interactive "particles spell my initials" that reacts to cursor.
- **Option C:** Generative noise field with the monogram cut out as a mask — slow drift, high-end feel.

Decision should fall to design taste. Implementation: ≈ 250 LOC + assets.

**Acceptance:** runs at 60fps on a mid-2020 laptop; pauses on `prefers-reduced-motion`; doesn't increase LCP.

---

### Phase 4 — Tooling, observability, durability (2–4 days)

**Goal:** make the next ten changes safer than the previous ten were.

#### 4.1 Tooling baseline — **M**

```
package.json (new)
├─ devDependencies: prettier, eslint, eslint-plugin-jsdoc,
│   typescript (for tsc --checkJs), htmlhint, stylelint,
│   stylelint-config-standard, npm-run-all, husky, lint-staged
└─ scripts:
   ├─ format          → prettier --write
   ├─ lint            → eslint . && stylelint "css/**/*.css" && htmlhint "*.html"
   ├─ typecheck       → tsc --noEmit -p jsconfig.json
   ├─ check           → npm-run-all --parallel lint typecheck
   └─ prepare         → husky install
```

Pre-commit hook via `lint-staged`: run `prettier --write` + `eslint --fix` on staged JS/CSS. Pre-push: `npm run check`.

**Acceptance:** `npm run check` is green on a fresh clone; `git commit` rejects unformatted code.

#### 4.2 CI hardening — **S**

Extend `.github/workflows/visual-tests.yml` (or split into two workflows):
- **`ci.yml`:** `npm run check` on every push.
- **`lighthouse.yml`:** Lighthouse CI with budgets — LCP < 2.5s, CLS < 0.05, TBT < 200ms, JS < 200KB. Fails the PR if budgets blow.
- **`a11y.yml`:** axe-core via Puppeteer on the existing Puppeteer setup. Zero violations enforced.

**Acceptance:** every PR shows three green checks (visual, perf, a11y) before merge.

#### 4.3 Observability — **M**

`web-vitals.js` already collects metrics locally. Add an opt-in beacon endpoint:
- Cloudflare Worker (or Supabase function) that accepts `POST /vitals` with `{lcp, fid, cls, ttfb, fcp, route, ua}` and writes to a small KV store.
- Privacy-by-default: no IP, no UA fingerprinting beyond browser family; respect `Do-Not-Track`.
- Tiny dashboard page (or Grafana hook) for trend visibility.
- Capture top-3 longest tasks per session for INP analysis.

Add **error reporting** with the same constraints — Sentry-lite, or a minimal Worker that logs `{message, stack, url, line, col}` to KV.

**Acceptance:** can answer "did the last deploy regress LCP?" in under 60 seconds; errors during the last 7 days are inspectable.

#### 4.4 Service-worker hygiene — **S**

- Move `sw.js` precache list to a generated file (`sw-precache.json`) emitted by a `node scripts/build-precache.mjs` step, ideally run via `lint-staged` on CSS/JS changes.
- Bump SW version on every deploy by reading the latest commit SHA at build/precache time.
- Keep "stale-while-revalidate" for HTML; switch CSS/JS to "cache-first with version key" so the bumping `?v=` strings actually work.

**Acceptance:** users on the previous SW version transition to the new one within a single navigation; no infinite-stale states reproducible.

#### 4.5 Security pass — **S**

- Add **SRI** (`integrity="sha384-…"`) to every `cdn.jsdelivr.net` script and stylesheet. Generate with a `npm run sri` script.
- Tighten CSP: drop `style-src 'unsafe-inline'` (audit existing inline styles, move them to nonced or hashed inline blocks; eliminate where possible).
- Add `Permissions-Policy: interest-cohort=(), browsing-topics=()` to `_headers`.
- Add `Cross-Origin-Embedder-Policy: credentialless` (already have COOP/CORP — finish the trio).

**Acceptance:** observatory.mozilla.org grade A+; report-uri receives zero CSP violations from real traffic over a week.

---

## 3. Out-of-scope (explicit "no" list)

So the plan is honest about what we're *not* doing:

- ❌ TypeScript migration. JSDoc + `tsc --checkJs` gives 80% of the value at 5% of the cost. Reconsider when the codebase is 2× larger.
- ❌ Bundler (Vite/Rollup/esbuild). HTTP/2 multiplexing + service-worker precache is good enough at this scale. Reconsider when JS > 300 KB or modules > 25.
- ❌ React/Vue/Svelte/Astro rewrite. The whole point of this fork is "vanilla, fast, mine."
- ❌ CMS. Project data lives in `js/data/projects.js` — version-controlled and editable.
- ❌ Server-side rendering / Edge Functions for content. Static + Cloudflare proxy is the architecture.
- ❌ Touching the upstream-owned features behind `.feature-blocked`.

---

## 4. Phase ordering rationale

Phase 1 is risk-free and metric-moving — ship it Monday morning.

Phase 2 (structural cleanup) goes second, **before** new features, because the giant `components.css` and 700-LOC modules become harder to split the more new code piles on top.

Phase 3 (features) takes the cleaned-up structure and adds visible value.

Phase 4 (tooling/observability) lands last so it doesn't slow down the iteration during 1–3, but is in place before any *next* round of changes.

That's the only safe order. Anything else either accumulates structural debt during feature work or stalls feature work behind a tooling rewrite.

---

## 5. Effort & calendar (informal)

| Phase | Effort | Calendar (1 person, half-time) |
|------:|-------:|-------------------------------:|
| Phase 1 | ~6 h | 1 day |
| Phase 2 | ~3 d | 1 week |
| Phase 3 | ~5 d | 1.5 weeks |
| Phase 4 | ~3 d | 1 week |
| **Total** | **~12 d** | **~4 weeks** |

Assumes interrupted work, zero-context resumes (the JSDoc+plan investment pays here), and visual-regression baseline updates absorbed into each phase.

---

## 6. First-three-PRs concrete starting kit

If you want to begin tomorrow without re-reading this whole doc, this is the shortlist:

1. **PR 1 — `feat(seo+a11y): hero h1, robots, sitemap, canonical, font-display`** *(Phase 1.1, 1.2, 1.4, 1.5)* — lands every metric-moving Phase-1 win in one PR. ~3 h.
2. **PR 2 — `refactor(css): split components.css into sections + components`** *(Phase 2.1)* — pure refactor, baseline-stable. ~5 h.
3. **PR 3 — `feat(ui): light theme toggle`** *(Phase 3.1)* — first user-visible feature, lands cleanly on the split CSS. ~6 h.

Each one independently improves the site; together they ship the most-noticed third of this whole roadmap in a working week.

---

*End of plan. Update this doc as phases land — strike completed items, add date+commit to each.*
