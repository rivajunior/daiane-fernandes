import { env } from 'cloudflare:workers'

/** Empty when Web Analytics is off, as it always is on the dev server. */
export function readWebAnalyticsToken(): string {
  return import.meta.env.DEV ? '' : env.CF_WEB_ANALYTICS_TOKEN.trim()
}
