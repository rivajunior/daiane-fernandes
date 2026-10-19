import { createHash } from 'node:crypto'

import { expect, test } from 'vite-plus/test'

import { deferHydration } from './defer-hydration'

const moduleBody = 'import("/assets/entry.client-abc.js");'
const html = [
  '<head>',
  '<link rel="modulepreload" href="/assets/a.js"/>',
  '<link rel="modulepreload" href="/assets/b.js"/>',
  '<link rel="stylesheet" href="/x.css"/>',
  '</head><body>',
  '<script>window.__ctx={a:1}</script>',
  `<script type="module" async="">${moduleBody}</script>`,
  '<script type="application/ld+json">{"a":1}</script>',
  '</body>',
].join('')

test('hydration starts after load and idle, without modulepreload, keeping CSP hashes valid', () => {
  const result = deferHydration(html)

  expect(result.html).not.toContain('modulepreload')
  expect(result.html).not.toContain('<script type="module"')
  expect(result.html).toContain('<link rel="stylesheet" href="/x.css"/>')
  expect(result.html).toContain('<script>window.__ctx={a:1}</script>')
  expect(result.html).toContain('<script type="application/ld+json">{"a":1}</script>')
  expect(result.html).toContain('addEventListener("load"')
  expect(result.html).toContain('requestIdleCallback')
  expect(result.html).toContain(JSON.stringify(moduleBody))

  const expectedHash = `sha256-${createHash('sha256').update(moduleBody).digest('base64')}`
  expect(result.extraScriptHashes).toEqual([expectedHash])
})

test('angle brackets in the bootstrap are escaped inside the loader string', () => {
  const result = deferHydration('<script type="module" async="">if(a<b){}</script>')

  expect(result.html).toContain('if(a\\u003cb){}')
  expect(result.html).not.toContain('a<b')
})

test('html without an inline module script is returned unchanged apart from modulepreload removal', () => {
  const result = deferHydration('<link rel="modulepreload" href="/a.js"/><p>oi</p>')

  expect(result).toEqual({ html: '<p>oi</p>', extraScriptHashes: [] })
})
