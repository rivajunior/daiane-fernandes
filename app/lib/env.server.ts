import { env } from 'cloudflare:workers'

import { getConfig, getPublicConfig, type PublicConfig, type SiteConfig } from '~/config.server'

import { isRateLimitBinding, type RateLimitBinding } from './pow/rate-limit.server'

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

export function readPublicConfig(): PublicConfig {
  return getPublicConfig(rawEnv)
}

export function readRateLimitBinding(name: string): RateLimitBinding | undefined {
  const binding: unknown = Reflect.get(env, name)
  return isRateLimitBinding(binding) ? binding : undefined
}
