# Design notes

Why the site is the way it is. For commands and configuration see the [README](../README.md); for hosting see [deploy.md](deploy.md).

## Intent

Daiane Fernandes is a nutritionist ("Nutricionista", CRN-11 20771) based in Fortaleza, CE, who sees patients online across Brazil. The site is a single pt-BR landing page that explains her work and sends people to WhatsApp to book a first consultation or ask questions. It is her main discoverable presence, so SEO and speed matter more than features.

Her text decides the words and the sections. The design decides the look: logo, palette, fonts, line art, movement, speed and accessibility.

## Goals

- Single page, 100% Brazilian Portuguese (`<html lang="pt-BR">`).
- Prerendered React; semantic HTML, Open Graph, JSON-LD `Nutritionist` with `areaServed: BR`, sitemap, robots, canonical.
- Lighthouse 100 in all four categories on mobile with analytics off, enforced in CI (`lighthouserc.json`; the test server keeps the analytics beacon from running). With analytics on, the target is at least 95.
- WCAG 2.2 AA: keyboard, focus states, contrast, reduced motion, landmarks, skip link.
- A complete page without animation or JavaScript.
- Cheap to host, with good latency in Brazil.

## Non-goals

No blog, CMS, login, payments, multi-language, contact form, online scheduling, phone menu, review collection, social feed or server API. WhatsApp is the only booking channel, and the footer also links to Instagram and credits the developer with a LinkedIn link. No email address is shown.

## Anti-goals

The work has failed, even if it functions, when:

- art or movement covers text or buttons, or pulls attention from booking;
- the page gets noticeably slower to load or scroll on a phone;
- imagery suggests diet culture: scales, measuring tapes, before-and-after bodies, "good" and "bad" food;
- her wording is changed without her knowing.

## Illustrations and movement

Visitors would rather look than read, so the page leans on line art and two photos and keeps little text on screen at once. One plant ties it together: loose leaves at the top, sprouts in "how it works", a potted plant beside the video call, two stems joining at the end.

- **Art:** SVG in `app/components/art/`, thin lines and the leaf from the logo, palette colors only, always `aria-hidden` with labels in real HTML text. No stock or AI-generated photos.
- **Less reading:** the six ways she helps and the reviews are native swipe rows; the four values and five questions open with `details`. All of that text stays in the HTML.
- **Movement:** CSS scroll-driven animation only, in layers. The base styles are the finished drawing, so reduced motion and older browsers see it still. Decorated sections use `overflow: clip`; `hidden` would stop the movement.
- **Leaves never cover text or buttons**, and art never causes sideways page scrolling. E2E tests check both.
- **Booking is always in reach:** the header button from 48rem, the menu from 74rem (where it fits beside the compact logo), and below 48rem a button fixed at the bottom.

## Decisions

| Question            | Options considered                                                 | Choice and trade-off                                                                                   |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Source of images    | Illustrator, more photos, AI generation, vector art                | Vector art: light and easy to animate, but no detailed people                                          |
| Illustration style  | Botanical line, flat shapes with people, painted food              | Botanical line: fits the logo and needs no new colors                                                  |
| Fitting new content | Existing patterns, stacked card grids, building on a static mockup | Existing patterns: little on screen at once, with some text behind a tap or swipe                      |
| Long lists          | Tap to open, picture story, swipe row                              | Swipe row: keeps the full text, though later cards are easy to miss, so the next one always peeks in   |
| Movement            | CSS only, CSS with a script fallback, an animation library         | CSS only: one version and no extra download; browsers without scroll-driven animation see a still page |
| Swipe-row controls  | React, a small plain script, CSS, none                             | CSS: the page ships no app script; browsers without scroll markers show the row alone                  |
| Email address       | Protect it with a proof-of-work check, or remove it                | Removed: the page lost its API and its only secret, and became fully static                            |
| Analytics           | Google Analytics, Cloudflare Web Analytics                         | Cloudflare: no cookie banner, at the cost of custom events (see [Analytics](#analytics))               |

## Professional rules

The page has to respect the Brazilian nutritionists' ethics code: [CFN 599/2018](https://cfn.org.br/wp-content/uploads/2026/04/RESOLUCAO-CFN-No-599_2018.pdf) and its replacement, [CFN 856/2026](https://ses.sp.bvs.br/wp-content/uploads/2026/04/U_RS-CFN-856_250426.pdf). Checked on 2026-11-27; not legal advice.

- Name, profession and CRN number are shown.
- The footer says the site was made with AI support (856 art. 37). Keep that line while it is true.
- No AI-generated images of people (856 art. 38 and 69).
- Publish a review only with the patient's written consent. Never publish one that mentions weight, exams or body changes, and never add results, before-and-after images, guarantees, promotions or discounts.

## Invariants

These are easy to break by accident; tests and CI guard most of them.

- **The WhatsApp number stays out of the page text.** It appears only inside `wa.me` links. The Instagram handle is the only "@" on the page.
- **No third-party scripts** except the Cloudflare Web Analytics beacon, only when `CF_WEB_ANALYTICS_TOKEN` is set, and never on the dev server. No cookies, reCAPTCHA or tag managers.
- **No `style` attributes.** The Content Security Policy allows styles by hash only, so position and speed come from classes.
- **No animation, carousel or icon libraries.**
- **One `h1`**, with headings in order.
- **Contact details are checked.** A unit test fails on a `whatsappNumber` with spaces, `+` or letters, and on a `siteUrl` that isn't a bare `https://` address.
- **Only public values in source.** Her WhatsApp number and CRN are published on the page and live in `app/content/site.ts`. The site has no secrets.
- **Fonts are self-hosted**, variable, Latin-subset WOFF2 with `font-display: swap`, preloaded, with a size-adjusted fallback. Only open-license look-alikes are used because the brand fonts (Chan Romance, ITC Avant Garde Gothic) are commercial.
- **Palette:** `#143F31` (dark green), `#698476` (sage), `#FFF7F3` (cream), `#FFFFFF`, `#000000`. Sage fails contrast for text; use it for decoration only.
- **Location in SEO and JSON-LD** is Fortaleza/CE (city and state, no street address) with `areaServed: BR`.

## Analytics

Cloudflare Web Analytics, chosen over Google Analytics because the site already runs on Cloudflare and, according to Cloudflare, the beacon stores nothing in the browser. That removes the cookie banner. This is not legal advice on LGPD.

It reports visits, referrers, countries, devices and Core Web Vitals. It has no custom events and ignores query strings, so WhatsApp clicks and campaign tags are not measured. The pre-filled WhatsApp message shows which chats started on the site, unless the visitor rewrites it. Revisit the choice if she starts running ads.

## Technical decisions

- **Framework:** React Router v8 framework mode (Vite) on TypeScript. The home page, sitemap and robots are prerendered.
- **Hosting:** Cloudflare Workers with static assets (the free tier is enough, with an edge in Brazil and free TLS). The Worker only handles requests that match no file and adds security headers to them; Cloudflare's Always Use HTTPS setting does the redirect.
- **JS budget:** none of our own. The built page is static HTML and CSS, so it leaves out React Router's scripts (`app/root.tsx`); the dev server keeps them for live reload. The browser draws the swipe rows' dots and arrows from `app/styles/carousel.css`, which holds the dot count for each screen width. Adding or removing a card means updating those counts, and `e2e/rows.spec.ts` checks them.
- **CSS:** plain CSS with variables; no CSS-in-JS or UI framework.
- **Images:** the two photos are served as AVIF, WebP and JPEG at several widths; the hero also has a tiny blur placeholder (see the README for regenerating them).
- **Security headers:** CSP with inline script and style hashes, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and long cache lifetimes for fonts and images. Generated into `build/client/_headers` by `scripts/generate-headers.ts`. The dev server sends no CSP, so check CSP changes against the production build.
- **Browser support and targets:** TypeScript targets ES2022 and the build uses Vite's default `baseline-widely-available` target, which is enough for everything we ship. The most demanding features are CSS `color-mix()` (Chrome 111, Safari 16.2, Firefox 113), `aspect-ratio` and `backdrop-filter` (with the `-webkit-` prefix for Safari). Scroll-driven animation (`animation-timeline`) is newer, so it sits behind `@supports` and the page is complete without it. Scroll markers and scroll buttons (Chrome and Edge 135) are not in Safari or Firefox as of 2026-11-27, where the rows have no dots or arrows. `details` with a shared `name` is newer too; older browsers just let several answers stay open. Raise the targets only if a feature outside this list is added.
- **TypeScript config:** `tsconfig.app.json` covers `app/` and `workers/`; `tsconfig.node.json` covers build tooling, `scripts/`, `e2e/` and the Node-side tests and helpers in `app/` (headers, CSP hashes). Both extend `tsconfig.json`, which turns on `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noUnusedLocals`/`noUnusedParameters`, `erasableSyntaxOnly` (scripts run directly under Node's type stripping) and `verbatimModuleSyntax`. `exactOptionalPropertyTypes` stays off because the React Router and Vite+ types don't satisfy it.
- **Tooling:** Vite+ (`vp`) for build, lint, format and tests; Playwright with axe for end-to-end and accessibility tests; Lighthouse CI in GitHub Actions.

## Known limitations

- Safari, including every iPhone browser we know of, and Firefox show the swipe rows without dots or arrows ([support](https://caniuse.com/wf-scroll-markers)).
- Where the dots and arrows exist, an arrow loses keyboard focus when it reaches the end and becomes disabled, and they come before the cards in the keyboard order although they are drawn below. Both are the browser's behavior, and both are weak points against the WCAG 2.2 AA goal. They have not been tried with a screen reader.
- An arrow moves most of a screen, not one card.
- The scroll movement has not been checked on a real iPhone (Safari 26 or later), where a feature tracker flags an issue.
- Lighthouse performance measures 0.98 to 1 on a local machine, against a target of 100.
- The `workers.dev` address also serves the site; its canonical link points to `daianefernandes.ntr.br`.
