# Daiane Fernandes — landing page

Landing page (pt-BR) for the behavioral nutritionist Daiane Fernandes. React Router v7 (SSR) on Cloudflare Workers.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm test` — unit tests (Vitest)
- `npm run typecheck` — types
- `npm run lint` / `npm run format` — oxlint / oxfmt

- `npm run test:e2e` — Playwright + axe (build first: `npm run build`)
- `npm run lhci` — Lighthouse CI against the production build (needs `npm run build`; asserts 100 in all four categories on mobile)
- `npm run deploy` — build and `wrangler deploy` (see `docs/deploy.md`)

## Configuration

Copy `.env.example` to `.dev.vars` for local development. See the file for every variable.

Non-secret values (`SITE_URL`, `WHATSAPP_NUMBER`, `CONTACT_EMAIL`, `GA_MEASUREMENT_ID`, `CRN`) live in `wrangler.jsonc` `vars` and are baked into the prerendered HTML at build time. `POW_SECRET` goes in `.dev.vars` locally and in `wrangler secret` in production.

## How it works

- The home page, `sitemap.xml` and `robots.txt` are prerendered. After the build, `scripts/generate-headers.ts` defers hydration until after `load` (keeps Lighthouse at 100) and writes `build/client/_headers` with a CSP that allow-lists the inline script and style hashes.
- The email address is never in the HTML. "Ver e-mail" runs a SHA-256 proof-of-work in a Web Worker (`app/lib/pow`), then `/api/pow/verify` returns the address.
- Google Analytics only loads after the visitor accepts the cookie banner, and only when `GA_MEASUREMENT_ID` is set.

## Swapping assets

- **Logo:** the official artwork is in `public/logo.svg` (green) and `public/logo-light.svg` (cream, for the footer), with `public/favicon.svg`, `public/apple-touch-icon.png` and the social card `public/images/og-image.jpg` derived from it.
- **Photo:** drop the original into a scratch folder and regenerate `public/images/daiane-{360,720}.{avif,webp,jpg}`. Images are cached for a year, so give new files new names when replacing them.
- **Fonts:** see `public/fonts/LICENSES.md` for how the current fonts were subset.
