import { afterEach, expect, test, vi } from 'vite-plus/test'

import { readWebAnalyticsToken } from './env.server'

vi.mock('cloudflare:workers', () => ({ env: { CF_WEB_ANALYTICS_TOKEN: ' abc123 ' } }))

afterEach(() => {
  vi.unstubAllEnvs()
})

test('a production build reads the Web Analytics token', () => {
  vi.stubEnv('DEV', false)

  expect(readWebAnalyticsToken()).toBe('abc123')
})

test('the dev server never reports visits to Web Analytics', () => {
  vi.stubEnv('DEV', true)

  expect(readWebAnalyticsToken()).toBe('')
})
