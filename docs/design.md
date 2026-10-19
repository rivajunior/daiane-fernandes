# Design notes

Why the site is the way it is. For commands and configuration see the [README](../README.md); for hosting see [deploy.md](deploy.md).

## Intent

Daiane Fernandes is a behavioral nutritionist ("Nutricionista Comportamental") based in Fortaleza, CE, who sees patients online across Brazil. The site is a single pt-BR landing page that explains her approach and sends people to WhatsApp to book a first consultation or ask questions. It is her main discoverable presence, so SEO and speed matter more than features.

## Goals

- Single page, 100% Brazilian Portuguese (`<html lang="pt-BR">`).
- Server-rendered and prerendered React; semantic HTML, Open Graph, JSON-LD `Nutritionist` with `areaServed: BR`, sitemap, robots, canonical.
- Lighthouse 100 in all four categories on mobile with analytics off, enforced in CI (`lighthouserc.json`). With analytics on, the floor is 95.
- WCAG 2.2 AA: keyboard, focus states, contrast, reduced motion, landmarks, skip link.
- Cheap to host with good latency in Brazil.

## Non-goals

No blog, CMS, login, payments, multi-language, contact form or online scheduling. WhatsApp is the only booking channel.

## Invariants

These are easy to break by accident; tests and CI guard most of them.

- **Contact details stay out of the HTML.** The WhatsApp number appears only inside the `wa.me` link, never as text. The email is never in the HTML or JS bundle; it is returned by `/api/pow/verify` after a proof-of-work check.
- **No third-party scripts** except GA4, and only after the visitor accepts the cookie banner and only when `GA_MEASUREMENT_ID` is set (LGPD). No reCAPTCHA or tag managers.
- **Config fails fast.** An invalid `WHATSAPP_NUMBER` (spaces, `+`, letters) must stop the build with a message naming the variable, never produce a broken `wa.me` link.
- **No real values in source.** The WhatsApp number, GA ID and `POW_SECRET` come from env vars or secrets.
- **Fonts are self-hosted**, variable, Latin-subset WOFF2 with `font-display: swap`, preloaded, with a size-adjusted fallback. Only open-license look-alikes are used because the brand fonts (Chan Romance, ITC Avant Garde Gothic) are commercial.
- **Palette:** `#143F31` (dark green), `#698476` (sage), `#FFF7F3` (cream), `#FFFFFF`, `#000000`. Sage fails contrast for text; use it for decoration only.
- **Location in SEO and JSON-LD** is Fortaleza/CE (city and state, no street address) with `areaServed: BR`.

## Proof-of-work email reveal

Self-hosted, no third-party service. The client requests a challenge (random salt, difficulty, expiry, HMAC signature). A Web Worker finds a nonce so that SHA-256(salt + nonce) has the required leading zero bits. The client posts the solution and the server verifies signature, expiry and hash before returning the address.

- Stateless on the server; replay is limited by a 5-minute expiry and a rate limit of 10 verifications per minute per IP.
- Expired, tampered (changed difficulty or salt) and malformed solutions get a 4xx with no email in the body.
- The UI stays responsive (worker), announces progress in an `aria-live` region and can be cancelled or retried. Without JavaScript it shows a WhatsApp fallback.
- The code loads only when the visitor activates the control.

## Analytics and consent

GA4 loads only after consent. Events: `whatsapp_click` (with the section) and `email_reveal`. The banner is keyboard accessible, fixed-position (no layout shift) and renders only when a GA ID is configured. The choice is kept in `localStorage`; if storage is unavailable, nothing loads and nothing crashes. It can be changed from the footer.

## Technical decisions

- **Framework:** React Router v7 framework mode (Vite, SSR) on TypeScript. The home page, sitemap and robots are prerendered; only the two `/api/pow/*` endpoints run on the server.
- **Hosting:** Cloudflare Workers with static assets (free tier is enough, edge in Brazil, free TLS). The endpoints sit behind a thin adapter in `app/lib/pow/handlers.server.ts` so moving host is a small change.
- **JS budget:** only the cookie banner and email reveal hydrate, and hydration is deferred until after `load` to keep Lighthouse at 100.
- **CSS:** plain CSS with variables; no CSS-in-JS or UI framework.
- **Images:** the hero photo is a 4:5 crop served as AVIF/WebP/JPEG at several widths with a tiny blur placeholder (see the README for regenerating it).
- **Security headers:** CSP with inline script and style hashes, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, long immutable cache for fonts and images, `no-store` for `/api/*`. Generated into `build/client/_headers` by `scripts/generate-headers.ts`.
- **Tooling:** Vite+ (`vp`) for build, lint, format and tests; Playwright with axe for e2e and accessibility; Lighthouse CI in GitHub Actions.

## Still open

Placeholders until real inputs exist:

- Real WhatsApp number (currently `5585900000000`).
- GA4 measurement ID (none yet).
- Final domain, then set `SITE_URL` and `ALLOW_INDEXING=true`. Until then the site is `noindex` with `Disallow`.
- CRN (professional registration number): normally shown by nutritionists in Brazil; omitted until provided. Set `CRN` to show it in the footer and structured data.
