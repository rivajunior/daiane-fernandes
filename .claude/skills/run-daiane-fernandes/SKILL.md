---
name: run-daiane-fernandes
description: Run, start, build, test, drive or screenshot the Daiane Fernandes landing page (React Router on Cloudflare Workers). Use to confirm a UI, header, animation, cookie banner, email reveal or /api/pow change works in the real app in a browser.
---

pt-BR landing page: a prerendered home page plus two Worker endpoints (`/api/pow/*`). Drive it with
`.claude/skills/run-daiane-fernandes/driver.mjs`, a headless Chromium script that reads commands
from stdin. All paths are relative to the repo root.

Verified on macOS (arm64) with `vp` 1.8.0 and Node 26. Not verified on Linux.

## Prerequisites

The global `vp` (Vite+) CLI. It provides Node (`.node-version`) and pnpm.

## Setup

```bash
vp install
vp exec playwright install chromium
test -f .dev.vars || cp .env.example .dev.vars   # never overwrite an existing one
```

`.dev.vars` must exist **before** building (it supplies `POW_SECRET`).

`playwright install` also deletes browser builds that no installed project uses from the shared
Playwright cache.

## Run (agent path)

Build, serve the production build on 4173, drive it, stop it.

```bash
vp run build
mkdir -p node_modules/.cache/run-skill
nohup vp preview --port 4173 --strictPort > node_modules/.cache/run-skill/preview.log 2>&1 &
curl -s -o /dev/null --retry 40 --retry-delay 1 --retry-all-errors --max-time 60 -w '%{http_code}\n' http://localhost:4173/
```

```bash
BASE_URL=http://localhost:4173 node .claude/skills/run-daiane-fernandes/driver.mjs <<'EOF'
nav /
ss home-mobile
axe
click role=button name=Ver e-mail
wait-for a[href^="mailto:"]
text .email-reveal
desktop
nav /
ss desktop-top
box .site-header
scroll 600
box .site-header
ss desktop-scrolled
ss-full desktop-full
problems
EOF
```

```bash
lsof -ti tcp:4173 -sTCP:LISTEN | xargs kill
```

Expected: 0 axe violations, an email address printed, header height 92 then about 56, `no problems`.
Screenshots land in `node_modules/.cache/run-skill/` (override with `SHOT_DIR`). Open them.

### Driver commands

One per line; `#` starts a comment. The first failure saves `failure.png`, prints the browser's
complaints and exits 1.

| Command                                             | Does                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| `nav <path>`                                        | Load a path and wait for network idle                                          |
| `mobile [width]` / `desktop`                        | Fresh page at Pixel 7 (default, optional width) or 1280x800; `nav` again after |
| `nojs` / `reduced-motion` / `bypass-csp`            | Fresh page with that setting, which sticks for the run; `nav` after            |
| `click <target>` / `wait-for <target>`              | Target is a Playwright selector or `role=<role> name=<name>`                   |
| `text <target>` / `count <target>` / `box <target>` | Print inner text, match count, bounding box                                    |
| `scroll <px>`                                       | Mouse-wheel scroll, then settle                                                |
| `eval <js expression>`                              | Run in the page and print the result as JSON                                   |
| `ss [name]` / `ss-full [name]`                      | Viewport or full-page screenshot                                               |
| `axe`                                               | Accessibility scan; violations exit 1                                          |
| `problems`                                          | Print and clear console errors/warnings and HTTP >= 400; any exit 1            |

## Run: dev server (HMR)

**You must put `bypass-csp` first.** The Worker sends `script-src 'self'` in dev, which blocks React
Router's inline scripts: the page renders but never hydrates, and "Ver e-mail" stays disabled.
`BASE_URL` defaults to `http://localhost:5173`.

```bash
mkdir -p node_modules/.cache/run-skill
nohup vp run dev --port 5173 --strictPort > node_modules/.cache/run-skill/dev.log 2>&1 &
curl -s -o /dev/null --retry 40 --retry-delay 1 --retry-all-errors --max-time 60 -w '%{http_code}\n' http://localhost:5173/
node .claude/skills/run-daiane-fernandes/driver.mjs <<'EOF'
bypass-csp
nav /
click role=button name=Ver e-mail
wait-for a[href^="mailto:"]
ss dev-email
problems
EOF
lsof -ti tcp:5173 -sTCP:LISTEN | xargs kill
```

A bypassed CSP proves nothing about the headers. Check CSP changes against the production build.

### Cookie banner

It only renders when `GA_MEASUREMENT_ID` is set, and it is empty by default. Add
`GA_MEASUREMENT_ID=G-TEST0000` to `.dev.vars`, start the dev server, run the commands below, then
remove the line.

```text
bypass-csp
nav /
wait-for role=region name=Cookies
ss cookie-banner
click role=button name=Recusar
count .cookie-banner
click role=button name=Preferências de cookies
count .cookie-banner
```

A build with the id only in `.dev.vars` shows it in the HTML, but the generated CSP still says
`ga=false` (`scripts/generate-headers.ts` reads the `wrangler.jsonc` vars). "Aceitar" loads Google's
tag from a third party and was not exercised.

## API without a browser

With either server up (swap the port):

```bash
curl -s -w ' %{http_code}\n' http://localhost:4173/api/pow/challenge
curl -s -X POST http://localhost:4173/api/pow/verify -H 'content-type: application/json' -d '{}' -w ' %{http_code}\n'   # 400
```

## Direct invocation

For changes inside `app/lib`, skip the server. Write a scratch `.ts` file and run it with `vpx`:

```bash
mkdir -p node_modules/.cache/run-skill
cat > node_modules/.cache/run-skill/try.ts <<'EOF'
import { createChallenge, verifySolution } from '../../../app/lib/pow/pow.server.ts'
import { findNonce } from '../../../app/lib/pow/shared.ts'

const challenge = await createChallenge('local-secret', Date.now())
const nonce = await findNonce(challenge.salt, challenge.difficulty)
console.log({ nonce, ok: await verifySolution('local-secret', { ...challenge, nonce }, Date.now()) })
EOF
vpx node_modules/.cache/run-skill/try.ts
```

## Test

```bash
vp run typecheck
vp check
vp run test
vp test run app/lib/pow/pow.server.test.ts   # one file
```

End-to-end needs a fresh build **and a preview server you started yourself** (see Run above), then:

```bash
vp run test:e2e
```

Lighthouse starts its own server on 4173, so stop the preview first: `vp run lhci`.

As of commit `4622cd4`, `vp check` reports 2 lint errors in `app/` and local `lhci` fails
(SEO 0.69 from `is-crawlable`, since `ALLOW_INDEXING=false`; performance 0.98). Compare with that
baseline before blaming your change.

## Run (human path)

`vp run dev`, open the printed URL, Ctrl-C. The page will not hydrate (see the dev server section).

## Gotchas

- Content below the fold animates in on scroll, so it looks blurred or missing in screenshots until
  scrolled into view. `ss-full` turns motion off for the capture; `ss` shows what a visitor sees.
- `ss-full` can draw the sticky header slightly low, over the top of the hero. Judge those with `ss`.
- The hero starts blurred. `ss` and `ss-full` wait for load animations; other screenshot tools may not.
- `scripts/serve-static.ts` (used by `lhci`) serves files only: `/api/pow/*` returns 404 there.
- `vp run test:e2e` reuses whatever already listens on 4173, including a stale build.
- The API is rate limited per minute (`wrangler.jsonc`: 20 challenges, 10 verifications). Repeated
  runs can get 429, which the page shows as a verification error.

## Troubleshooting

| Symptom                                                                                       | Fix                                                                                         |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Executing inline script violates ... script-src 'self'`, button stays disabled               | Dev server: add `bypass-csp` as the first driver command                                    |
| `npm error code EBADDEVENGINES` then `config.webServer was not able to start`                 | Playwright's `npx vite preview` is rejected by npm. Start the preview server yourself first |
| `/api/pow/challenge` returns 500, log says `Missing required environment variable POW_SECRET` | Create `.dev.vars`, then `vp run build` again (the build copies it) and restart preview     |
| Port already in use with `--strictPort`                                                       | `lsof -nP -iTCP:4173 -sTCP:LISTEN`; confirm it is yours before killing it                   |
