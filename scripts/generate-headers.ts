import { readFileSync, writeFileSync } from 'node:fs'

import { deferHydration } from '../app/defer-hydration.ts'
import { buildHeadersFile } from '../app/headers.ts'
import { extractInlineScriptHashes, extractInlineStyleHashes } from '../app/inline-script-hashes.ts'

const deferred = deferHydration(readFileSync('build/client/index.html', 'utf8'))
const html = deferred.html
writeFileSync('build/client/index.html', html)
// Our own `wrangler` build output, so its shape is known.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const serverConfig = JSON.parse(readFileSync('build/server/wrangler.json', 'utf8')) as {
  vars?: Record<string, string | undefined>
}
const analyticsEnabled = Boolean(serverConfig.vars?.CF_WEB_ANALYTICS_TOKEN?.trim())

const scriptHashes = [
  ...new Set([...extractInlineScriptHashes(html), ...deferred.extraScriptHashes]),
]
const styleHashes = [...new Set(extractInlineStyleHashes(html))]
writeFileSync(
  'build/client/_headers',
  buildHeadersFile({ scriptHashes, styleHashes, analyticsEnabled }),
)
console.log(
  `Wrote build/client/_headers (${scriptHashes.length} script and ${styleHashes.length} style hashes, analytics=${analyticsEnabled})`,
)
