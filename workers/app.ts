import { createRequestHandler } from 'react-router'

import type { SiteVars } from '../app/config.server'
import { buildSecurityHeaders, withSecurityHeaders } from '../app/headers'

import styles from '../app/styles/main.css?inline'

const requestHandler = createRequestHandler(
  async () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

async function styleHash(): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(styles))
  return `sha256-${btoa(String.fromCodePoint(...new Uint8Array(digest)))}`
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

let dynamicHeaders: Promise<Record<string, string>> | undefined

async function getDynamicHeaders(analyticsEnabled: boolean) {
  dynamicHeaders ??= styleHash().then((hash) =>
    buildSecurityHeaders({ scriptHashes: [], styleHashes: [hash], analyticsEnabled }),
  )
  return dynamicHeaders
}

export default {
  async fetch(request, env) {
    // Wrangler types each value as its current text; `SiteVars` widens them to any string.
    const vars: SiteVars = env

    const url = new URL(request.url)
    if (url.protocol === 'http:' && !LOCAL_HOSTS.has(url.hostname)) {
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }

    return withSecurityHeaders(
      await requestHandler(request),
      await getDynamicHeaders(Boolean(vars.CF_WEB_ANALYTICS_TOKEN?.trim())),
    )
  },
} satisfies ExportedHandler<Env>
