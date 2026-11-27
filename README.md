# Daiane Fernandes — landing page

[![CI](https://github.com/rivajunior/daiane-fernandes/actions/workflows/ci.yml/badge.svg)](https://github.com/rivajunior/daiane-fernandes/actions/workflows/ci.yml)

The production website of Daiane Fernandes, a nutritionist who sees patients online across Brazil: a single page in Brazilian Portuguese that explains her work and sends visitors to WhatsApp to book.

**Live:** [daianefernandes.ntr.br](https://daianefernandes.ntr.br/)

![The top of the page on a desktop screen: logo, menu, headline, booking button and portrait](docs/screenshot.jpg)

## My role

Daiane wrote the page's text. I made the product, design and technical decisions, and I build and run the site.

## Highlights

- **Fast by default.** The page is prerendered and served as static files from Cloudflare's edge. Hydration waits until after `load` ([how](app/defer-hydration.ts)), and photos are responsive AVIF, WebP and JPEG.
- **Works without JavaScript.** Swipe rows scroll natively and `details` elements open the answers. Script only adds the rows' dots and arrows.
- **Accessible.** Targets WCAG 2.2 AA. Playwright runs axe against the built page, and tests cover keyboard focus, reduced motion and narrow screens.
- **Strict security headers.** A Content Security Policy with no `unsafe-inline`: the build [hashes the inline scripts and styles](scripts/generate-headers.ts).
- **Motion without a library.** The line art is SVG in the repo, animated with CSS scroll-driven animation. Tests check that leaves never cover text.
- **Private by design.** No cookies and no cookie banner. The only third-party script is Cloudflare Web Analytics.
- **Checked in CI.** Dependency audit, types, lint, format, unit tests, build, end-to-end tests and Lighthouse CI, which requires 100 in all four categories.

[Design notes](docs/design.md) record the goals, the trade-offs and the rules the page must keep.

## Working with AI

I built this site with Claude Code as a coding agent, and the page footer says it was made with AI support, as the nutritionists' ethics code asks.

- **Decisions are mine.** For example: botanical line art over painted illustrations, a swipe row over tap-to-open cards, and Cloudflare Web Analytics over Google Analytics to drop the cookie banner.
- **Design before code.** Larger changes started from a written design with goals, things that would count as failure, and how to verify the result.
- **Automated checks hold the line.** Strict TypeScript and lint rules, tests in a real browser, accessibility scans and Lighthouse apply to every change, whoever wrote it.
- **The agent has tools to check its work.** [AGENTS.md](AGENTS.md) describes the toolchain, and a [project skill](.claude/skills/run-daiane-fernandes/SKILL.md) lets it run and screenshot the real page.

## Run it

Install the [Vite+](https://viteplus.dev/guide/) CLI (`vp`), which provides Node and pnpm, then:

```bash
vp install
vp run dev
```

| Command            | Does                                                  |
| ------------------ | ----------------------------------------------------- |
| `vp run dev`       | Dev server                                            |
| `vp run build`     | Production build                                      |
| `vp check`         | Format, lint and type check                           |
| `vp run typecheck` | Generate Worker and route types, then check them      |
| `vp run test`      | Unit tests (Vitest)                                   |
| `vp run test:e2e`  | Playwright and axe (run `vp run build` first)         |
| `vp run lhci`      | Lighthouse CI (run `vp run build` first)              |
| `vp run deploy`    | Build and `wrangler deploy` ([guide](docs/deploy.md)) |

Before the first end-to-end run, install the browser with `vp exec playwright install chromium`.

## Project layout

| Path                  | Holds                                             |
| --------------------- | ------------------------------------------------- |
| `app/content/site.ts` | All page text and contact details                 |
| `app/components/`     | Page sections, swipe-row controls and the SVG art |
| `app/styles/`         | Plain CSS with design tokens                      |
| `app/headers.ts`      | Security and cache headers                        |
| `workers/`            | The Cloudflare Worker                             |
| `scripts/`            | Build steps, photo generation and the test server |
| `e2e/`                | Browser tests                                     |

## Configuration

The site address (`siteUrl`), WhatsApp number (`whatsappNumber`) and professional registration (`crn`) are in `app/content/site.ts` with the rest of the page content.

The only Worker setting is `CF_WEB_ANALYTICS_TOKEN`, in `wrangler.jsonc` `vars`. To override it for a local preview, set it in an optional `.dev.vars` file as `NAME=value`; the dev server ignores it. All of these values are public and appear in the page HTML. The site has no secrets.

## Swapping assets

- **Logo:** the artwork is in `public/logo-v2.svg` (green), `public/logo-light-v2.svg` (cream, for the footer) and `public/logo-parts-v2.svg` (the green artwork split into the pieces the header animates; keep it in step with `logo-v2.svg`). `public/favicon.svg`, `public/apple-touch-icon.png` and the social card `public/images/og-image-v3.jpg` (the About photo above the logo, both inside the center square because chat apps crop the thumbnail to it) derive from it. These files are cached for a year: rename them when they change.
- **Photos:** put the original in a scratch folder and regenerate `public/images/daiane-hero-*` or `daiane-about-*` with `node scripts/generate-photos.ts <hero|about> <original>` (cropped to the shape on the page, AVIF, WebP and JPEG at several widths, plus a tiny blur placeholder for the hero). Images are cached for a year, so change the preset's `basename` in the script when replacing a photo. The About photo comes from a 640px copy; when you have the original, add wider sizes.
- **Fonts:** see [`public/fonts/LICENSES.md`](public/fonts/LICENSES.md) for how the fonts were subset.

## Rights

This repository is published so you can read and evaluate it. It is not open source: see [LICENSE.md](LICENSE.md). Daiane's name, photos, logo and text, and the patient reviews (published with consent), may not be reused.
