---
name: run-daiane-fernandes
description: Run, start, build, test, drive or screenshot the Daiane Fernandes landing page (React Router on Cloudflare Workers). Use to confirm a UI, header, animation or swipe-row change works in the real app in a browser.
---

pt-BR landing page: a prerendered home page served by a Worker, with no API. Drive it with
`.claude/skills/run-daiane-fernandes/driver.mjs`, a headless Chromium script that reads commands
from stdin. All paths are relative to the repo root.

Verified on macOS (arm64) with `vp` 1.8.0 and Node 26. Not verified on Linux.

## Prerequisites

The global `vp` (Vite+) CLI. It provides Node (`.node-version`) and pnpm.

## Setup

```bash
vp install
vp exec playwright install chromium
```

The only Worker setting, `CF_WEB_ANALYTICS_TOKEN`, comes from the `vars` in `wrangler.jsonc`; an optional
`.dev.vars` file (one `NAME=value` per line) overrides it. Never overwrite an existing one.

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
eval document.querySelector('#help-row').scrollTo({ left: 320, behavior: 'instant' })
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

Expected: 0 axe violations, header height 92 then about 56, `no problems`.
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

The Worker sends no CSP and loads no analytics here, so a dev run proves nothing about the headers.
Check CSP changes against the production build. `BASE_URL` defaults to `http://localhost:5173`.

```bash
mkdir -p node_modules/.cache/run-skill
nohup vp run dev --port 5173 --strictPort > node_modules/.cache/run-skill/dev.log 2>&1 &
curl -s -o /dev/null --retry 40 --retry-delay 1 --retry-all-errors --max-time 60 -w '%{http_code}\n' http://localhost:5173/
node .claude/skills/run-daiane-fernandes/driver.mjs <<'EOF'
nav /
wait-for #help-row
ss dev-home
problems
EOF
lsof -ti tcp:5173 -sTCP:LISTEN | xargs kill
```

## Test

```bash
vp run typecheck
vp check
vp run test
vp test run app/lib/seo.test.ts   # one file
```

End-to-end needs a fresh build. It starts its own preview server on 4173:

```bash
vp run test:e2e
```

Lighthouse starts its own server on 4173, so stop the preview first: `vp run lhci`.

## Run (human path)

`vp run dev`, open the printed URL, Ctrl-C.

## Gotchas

- The swipe rows' dots and arrows are CSS pseudo-elements: Playwright selectors and `role=` targets
  cannot find them. `e2e/controls.ts` reads and clicks them through Chrome's accessibility tree.
- Content below the fold animates in on scroll, so it looks blurred or missing in screenshots until
  scrolled into view. `ss-full` turns motion off for the capture; `ss` shows what a visitor sees.
- `ss-full` can draw the sticky header slightly low, over the top of the hero. Judge those with `ss`.
- The hero starts blurred. `ss` and `ss-full` wait for load animations; other screenshot tools may not.
- `vp run test:e2e` reuses whatever already listens on 4173, including a stale build.

## Troubleshooting

| Symptom                                 | Fix                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------- |
| Port already in use with `--strictPort` | `lsof -nP -iTCP:4173 -sTCP:LISTEN`; confirm it is yours before killing it |
