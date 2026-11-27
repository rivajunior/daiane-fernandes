import { env } from 'cloudflare:workers'

import { getConfig, type SiteConfig } from '~/config.server'

export function toStringRecord(source: object): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : undefined,
    ]),
  )
}

const rawEnv = toStringRecord(env)

export function readConfig(): SiteConfig {
  return getConfig(rawEnv)
}
