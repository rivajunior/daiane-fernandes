import { createRequestHandler } from 'react-router'

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

let dynamicHeaders: Promise<Record<string, string>> | undefined

async function getDynamicHeaders(analyticsEnabled: boolean) {
  dynamicHeaders ??= styleHash().then((hash) =>
    buildSecurityHeaders({
      scriptHashes: [],
      styleHashes: [hash],
      analyticsEnabled,
      development: import.meta.env.DEV,
    }),
  )
  return dynamicHeaders
}

export default {
  async fetch(request, env) {
    return withSecurityHeaders(
      await requestHandler(request),
      await getDynamicHeaders(Boolean(env.CF_WEB_ANALYTICS_TOKEN.trim())),
    )
  },
} satisfies ExportedHandler<Env>
