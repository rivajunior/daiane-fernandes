# Daiane Fernandes — landing page

Landing page (pt-BR) for the behavioral nutritionist Daiane Fernandes. React Router v7 (SSR) on Cloudflare Workers.

See [docs/design.md](docs/design.md) for goals, invariants and decisions, and [docs/deploy.md](docs/deploy.md) for hosting.

## Scripts

Install the global `vp` (Vite+) CLI, then run `vp install`.

- `vp run dev` — dev server
- `vp run build` — production build
- `vp run test` — unit tests (Vitest)
- `vp run typecheck` — types
- `vp run lint` / `vp run format` — oxlint / oxfmt

- `vp run test:e2e` — Playwright + axe (build first: `vp run build`)
- `vp run lhci` — Lighthouse CI against the production build (needs `vp run build`; asserts 100 in all four categories on mobile)
- `vp run deploy` — build and `wrangler deploy` (see `docs/deploy.md`)

## Configuration

Local development uses the `vars` in `wrangler.jsonc`. To override any of them, set it in an optional `.dev.vars` file, one `NAME=value` per line.

Non-secret values (`SITE_URL`, `WHATSAPP_NUMBER`, `CF_WEB_ANALYTICS_TOKEN`, `CRN`) live in `wrangler.jsonc` `vars` and are baked into the prerendered HTML at build time. There are no secrets. The build stops if the WhatsApp number or `CRN` is missing.

## How it works

- The home page, `sitemap.xml` and `robots.txt` are prerendered; there is no API. After the build, `scripts/generate-headers.ts` defers hydration until after `load` (keeps Lighthouse at 100) and writes `build/client/_headers` with a CSP that allow-lists the inline script and style hashes.
- Cloudflare Web Analytics loads only when `CF_WEB_ANALYTICS_TOKEN` is set. It stores nothing in the browser, so there is no cookie banner. See [docs/deploy.md](docs/deploy.md#analytics) for the setup.

## Swapping assets

- **Logo:** the artwork is in `public/logo-v2.svg` (green) and `public/logo-light-v2.svg` (cream, for the footer), `public/logo-parts-v2.svg` (the green artwork split into the pieces the header animates; keep it in step with `logo-v2.svg`), with `public/favicon.svg`, `public/apple-touch-icon.png` and the social card `public/images/og-image-v2.jpg` derived from it. The official artwork said "Nutricionista Comportamental"; the second word was removed here and the first re-spaced, so replace these if a designer supplies new files. These files are cached for a year: rename them when they change.
- **Photos:** drop the original into a scratch folder and regenerate `public/images/daiane-hero-*` or `daiane-about-*` with `node scripts/generate-photos.ts <hero|about> <original>` (cropped to the shape on the page, AVIF/WebP/JPEG at several widths, plus a tiny blur placeholder for the hero). Images are cached for a year, so change the preset's `basename` in the script when replacing a photo. The About photo comes from a 640px copy; regenerate it from the original, adding wider sizes.
- **Fonts:** see `public/fonts/LICENSES.md` for how the current fonts were subset.
