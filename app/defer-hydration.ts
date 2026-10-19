import { createHash } from 'node:crypto'

const MODULE_PRELOAD = /<link rel="modulepreload"[^>]*>/gu
const INLINE_MODULE_SCRIPT = /<script type="module"[^>]*>([\s\S]*?)<\/script>/u

function escapeForInlineScript(body: string): string {
  return JSON.stringify(body).replaceAll('<', '\\u003c')
}

// Hydration JavaScript competes with the first paint on slow connections. The prerendered page is
// fully usable without it, so the inline module bootstrap runs after `load`, when the browser is
// idle. The original bootstrap text is re-inserted unchanged, so its CSP hash stays the same.
export function deferHydration(html: string): { html: string; extraScriptHashes: string[] } {
  const withoutPreloads = html.replace(MODULE_PRELOAD, '')
  const body = withoutPreloads.match(INLINE_MODULE_SCRIPT)?.[1]
  if (body === undefined) {
    return { html: withoutPreloads, extraScriptHashes: [] }
  }

  const loader =
    `<script>addEventListener("load",function(){var run=function(){var script=document.createElement("script");` +
    `script.type="module";script.textContent=${escapeForInlineScript(body)};document.body.appendChild(script)};` +
    `"requestIdleCallback"in window?requestIdleCallback(run):setTimeout(run,0)})</script>`

  return {
    html: withoutPreloads.replace(INLINE_MODULE_SCRIPT, () => loader),
    extraScriptHashes: [`sha256-${createHash('sha256').update(body).digest('base64')}`],
  }
}
