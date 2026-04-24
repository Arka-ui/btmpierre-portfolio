# btmpierre-portfolio — unofficial variant

> **This is NOT the official portfolio of Pierre Bouteman.**
> The official, owner-maintained version lives at **[btmpierre.me](https://btmpierre.me/)**.
> This repository is an unofficial redesign served at [btmpierre.riftmc.net](https://btmpierre.riftmc.net/).

---

## What this is

An **unofficial, alternative variant** of Pierre Bouteman's (NeXoS_20) portfolio, reworked by **[Arka](https://github.com/Arka-ui)** as a personal training exercise for working on someone else's codebase.

The goal of this fork is two-fold:

1. **Training** — forking, reading, and refactoring a non-trivial existing codebase end to end (palette overhaul, hero/animation rework, contact-form hardening, CI fixes, performance metrics rewrite, i18n refactor). It is much more instructive than starting from a blank repo.
2. **Alternative skin** — Pierre can point curious visitors at a second, stylistically different build of the same portfolio without me ever touching his official source of truth.

**This repo is maintained by Arka, not by Pierre.** Pull requests, issues, and deploy decisions on this fork are my responsibility — not Pierre's. For anything authoritative about Pierre's work, identity, or contact info, go to [btmpierre.me](https://btmpierre.me/).

---

## Relationship to the upstream

| | Upstream (official) | This fork (unofficial) |
|---|---|---|
| Owner | Pierre Bouteman / NeXoS_20 | Arka |
| Repository | [nexos20lv/nexos20lv.github.io](https://github.com/nexos20lv/nexos20lv.github.io) | [Arka-ui/btmpierre-portfolio](https://github.com/Arka-ui/btmpierre-portfolio) |
| Live site | [btmpierre.me](https://btmpierre.me/) | [btmpierre.riftmc.net](https://btmpierre.riftmc.net/) |
| Hosting | GitHub Pages | Cloudflare Pages |
| Canonical? | ✅ Yes | ❌ No — alternative skin only |

**No changes on this fork are pushed upstream.** This repository is isolated on purpose.

---

## What changed vs upstream (high level)

- **Design tokens** — new steel/ice palette (`#0A0D12` → `#C8D0DE` with `#5B9DFF` accent), Fraunces + Geist Mono + VT323 font stack, no more purple system.
- **Hero** — monogram parallax, status caret, viewport-scaled particle count, ice-blue aurora. Custom cursor and hero video dropped in favor of the native cursor.
- **Reading progress** — ARIA slider with keyboard seek (Arrow / Home / End / Shift-Arrow).
- **Contact form** — Cloudflare Turnstile, server-side rate limiting, honeypot field with silent-drop, 4000-char payload cap.
- **Network resilience** — `fetch-timeout.js` AbortController wrapper, Lanyard WebSocket cleanup on reconnect.
- **i18n** — monolithic FR/EN strings file split into `js/i18n/fr.js` + `js/i18n/en.js`.
- **Performance** — `PerformanceNavigationTiming` + LCP/FID/CLS/TTFB observers, regression gate vs baseline (1.15× threshold).
- **CI** — puppeteer `--no-sandbox` for Ubuntu 24 runners, removed silent `.catch(console.error)` that hid launch crashes, replaced removed `page.waitForTimeout`, dropped unused GitHub Pages workflow.
- **Deploy** — Cloudflare Pages `_headers` (CSP allowing Turnstile + Lanyard + Supabase), `_redirects` SPA 404 fallback, `CNAME → btmpierre.riftmc.net`.

---

## Tech stack (brief)

| Layer | Tech |
|---|---|
| Markup | HTML5, single-page (`index.html`) |
| Styles | CSS custom properties — `css/base.css`, `css/components.css`, `css/hero-style.css`, `css/animations.css`, `css/ui-modern.css`, `css/components-critical.css` |
| Logic | Vanilla ES modules — `js/app.js` + `js/modules/` |
| Realtime | [Lanyard](https://github.com/phineas/lanyard) (Discord presence) |
| Backend | [Supabase](https://supabase.com/) edge function (contact form) |
| External APIs | GitHub REST v3 (repo stats) |
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com/) |
| Anti-spam | Cloudflare Turnstile + honeypot + rate-limiting |

No build step. Any static file server will do.

---

## Running locally

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:3000` (or `:8080`).

---

## Deployment (Cloudflare Pages)

| Field | Value |
|---|---|
| Framework preset | `None` |
| Build command | *(empty)* |
| Build output directory | `/` |
| Production branch | `main` |

Attach the custom domain `btmpierre.riftmc.net` after the first deploy.

---

## License

**Proprietary — all rights reserved.** See [`LICENSE`](./LICENSE).

This repository is permitted to be used **only** for the live deployment at `btmpierre.riftmc.net`. Any other use (redeploying to another domain, copying into another portfolio, redistributing, etc.) requires prior written consent from [Arka](https://github.com/Arka-ui). The original upstream work remains the property of its original author.

---

## Credits & attribution

- **Original author & canonical portfolio owner** — Pierre Bouteman ([NeXoS_20](https://github.com/nexos20lv)) — [btmpierre.me](https://btmpierre.me/).
- **This fork's maintainer & redesigner** — [Arka](https://github.com/Arka-ui) ([arka.riftmc.net](https://arka.riftmc.net/)).

If you are looking for Pierre himself, his projects, or an official link to share, use **[btmpierre.me](https://btmpierre.me/)** — not this repository.
