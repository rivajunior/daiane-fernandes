# Design notes

Why the site is the way it is. For commands and configuration see the [README](../README.md); for hosting see [deploy.md](deploy.md).

## Intent

Daiane Fernandes is a nutritionist ("Nutricionista", CRN-11 20771) based in Fortaleza, CE, who sees patients online across Brazil. The site is a single pt-BR landing page that explains her work and sends people to WhatsApp to book a first consultation or ask questions. It is her main discoverable presence, so SEO and speed matter more than features. The content and sections come from the second mock she built.

## Goals

- Single page, 100% Brazilian Portuguese (`<html lang="pt-BR">`).
- Server-rendered and prerendered React; semantic HTML, Open Graph, JSON-LD `Nutritionist` with `areaServed: BR`, sitemap, robots, canonical.
- Lighthouse 100 in all four categories on mobile with analytics off, enforced in CI (`lighthouserc.json`; the test server keeps the beacon from running). With analytics on, the floor is 95.
- WCAG 2.2 AA: keyboard, focus states, contrast, reduced motion, landmarks, skip link.
- Cheap to host with good latency in Brazil.

## Non-goals

No blog, CMS, login, payments, multi-language, contact form, online scheduling, phone menu or server API. WhatsApp is the only booking channel, and the footer also links to Instagram. No email address is shown.

## Illustrations and movement

Visitors would rather look than read, so every section has line art or a photo and keeps little text on screen at once. One plant ties the page together: loose leaves at the top, sprouts in "how it works", a potted plant beside the video call, two stems joining at the end.

- **Art:** hand-drawn SVG in `app/components/art/`, thin lines and the leaf from the logo, palette colors only, always `aria-hidden` with labels in real HTML text. No stock or AI-generated photos.
- **Never diet culture:** no scales, measuring tapes, before-and-after bodies, or "good" and "bad" food.
- **Less reading:** the six ways she helps and the reviews are native swipe rows; the four values and five questions open with `details`. All of that text stays in the HTML.
- **Movement:** CSS scroll-driven animation only, in layers. The base styles are the finished drawing, so reduced motion and older browsers see it still. Decorated sections use `overflow: clip`; `hidden` would stop the movement.
- **Leaves never cover text or buttons**, and art never causes sideways page scrolling. E2E tests check both.
- **Booking is always in reach:** the header button from 48rem, the menu from 74rem (where it fits beside the compact logo), and below 48rem a button fixed at the bottom.

## Professional rules

The page has to respect the nutritionists' ethics code: [CFN 599/2018](https://cfn.org.br/wp-content/uploads/2026/04/RESOLUCAO-CFN-No-599_2018.pdf) and its replacement [CFN 856/2026](https://ses.sp.bvs.br/wp-content/uploads/2026/04/U_RS-CFN-856_250426.pdf), which secondary sources say starts on 2027-01-23. Checked on 2026-11-27; not legal advice.

- Name, profession and CRN number are shown.
- The footer says the site was made with AI support (856 art. 37). Keep that line while it is true.
- No AI-generated images of people (856 art. 38 and 69).
- Reviews need the patient's written consent. Never publish one that mentions weight, exams or body changes, and never add results, before-and-after images, guarantees, promotions or discounts.

## Invariants

These are easy to break by accident; tests and CI guard most of them.

- **The WhatsApp number stays out of the page text.** It appears only inside `wa.me` links. The Instagram handle is the only "@" on the page.
- **No third-party scripts** except the Cloudflare Web Analytics beacon, and only when `CF_WEB_ANALYTICS_TOKEN` is set. No cookies, reCAPTCHA or tag managers.
- **Config fails fast.** An invalid `WHATSAPP_NUMBER` (spaces, `+`, letters) must stop the build with a message naming the variable.
- **Only public values in source.** Her WhatsApp number and CRN are published on the page; the number lives in `wrangler.jsonc` and the CRN in `app/content/site.ts`. Tests use placeholders. The site has no secrets.
- **Fonts are self-hosted**, variable, Latin-subset WOFF2 with `font-display: swap`, preloaded, with a size-adjusted fallback. Only open-license look-alikes are used because the brand fonts (Chan Romance, ITC Avant Garde Gothic) are commercial.
- **Palette:** `#143F31` (dark green), `#698476` (sage), `#FFF7F3` (cream), `#FFFFFF`, `#000000`. Sage fails contrast for text; use it for decoration only.
- **Location in SEO and JSON-LD** is Fortaleza/CE (city and state, no street address) with `areaServed: BR`.

## Analytics

Cloudflare Web Analytics, chosen over Google Analytics because the site already runs on Cloudflare and, according to Cloudflare, the beacon stores nothing in the browser. That removes the cookie banner. This is not legal advice on LGPD.

It reports visits, referrers, countries, devices and Core Web Vitals. It has no custom events and ignores query strings, so WhatsApp clicks and campaign tags are not measured. The pre-filled WhatsApp message shows which chats started on the site, unless the visitor rewrites it. Revisit the choice if she starts running ads.

## Technical decisions

- **Framework:** React Router v7 framework mode (Vite, SSR) on TypeScript. The home page, sitemap and robots are prerendered.
- **Hosting:** Cloudflare Workers with static assets (free tier is enough, edge in Brazil, free TLS). The Worker only redirects to HTTPS and adds security headers.
- **JS budget:** only the swipe-row controls (dots and arrows) need script, and hydration is deferred until after `load` to keep Lighthouse at 100. The rows scroll without them.
- **CSS:** plain CSS with variables; no CSS-in-JS or UI framework.
- **Images:** the two photos are served as AVIF/WebP/JPEG at several widths; the hero also has a tiny blur placeholder (see the README for regenerating them).
- **Security headers:** CSP with inline script and style hashes, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, long immutable cache for fonts and images. Generated into `build/client/_headers` by `scripts/generate-headers.ts`.
- **Browser support and targets:** TypeScript targets ES2022 and the build uses Vite's default `baseline-widely-available` target, which is enough for everything we ship. The most demanding features are CSS `color-mix()` (Chrome 111, Safari 16.2, Firefox 113), `aspect-ratio` and `backdrop-filter` (with the `-webkit-` prefix for Safari). Scroll-driven animation (`animation-timeline`) is newer, so it sits behind `@supports` and the page is complete without it. `details` with a shared `name` is newer too; older browsers just let several answers stay open. Raise the targets only if a feature outside this list is added.
- **TypeScript config:** `tsconfig.app.json` covers `app/` and `workers/`; `tsconfig.node.json` covers build tooling, `scripts/`, `e2e/` and the Node-side tests and helpers in `app/` (headers, hydration deferral, CSP hashes). Both extend `tsconfig.json`, which turns on `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`/`noUnusedParameters`, `erasableSyntaxOnly` (scripts run directly under Node's type stripping) and `verbatimModuleSyntax`. `exactOptionalPropertyTypes` stays off because the React Router and Vite+ types don't satisfy it.
- **Tooling:** Vite+ (`vp`) for build, lint, format and tests; Playwright with axe for e2e and accessibility; Lighthouse CI in GitHub Actions.
