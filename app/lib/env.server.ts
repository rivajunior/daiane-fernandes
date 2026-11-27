import { env } from 'cloudflare:workers'

/** Empty when Web Analytics is off. */
export function readWebAnalyticsToken(): string {
  return env.CF_WEB_ANALYTICS_TOKEN.trim()
}
