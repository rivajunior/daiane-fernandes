import { expect, test } from 'vite-plus/test'

import { getConfig } from './config.server'

const validEnv = {
  SITE_URL: 'https://example.com.br/',
  WHATSAPP_NUMBER: '5585900000000',
  CRN: 'CRN-6 1',
}

test('getConfig normalizes valid env and leaves optional values undefined', () => {
  expect(getConfig({ ...validEnv, CF_WEB_ANALYTICS_TOKEN: '' })).toEqual({
    siteUrl: 'https://example.com.br',
    whatsappNumber: '5585900000000',
    webAnalyticsToken: undefined,
    crn: 'CRN-6 1',
    indexable: false,
  })
  expect(getConfig({ ...validEnv, ALLOW_INDEXING: 'true' }).indexable).toBe(true)
})

test('getConfig reads the Web Analytics token', () => {
  expect(getConfig({ ...validEnv, CF_WEB_ANALYTICS_TOKEN: ' abc123 ' }).webAnalyticsToken).toBe(
    'abc123',
  )
})

test('getConfig fails fast naming the offending variable', () => {
  for (const badNumber of ['+55 85 9', 'abc', '']) {
    expect(() => getConfig({ ...validEnv, WHATSAPP_NUMBER: badNumber })).toThrow(/WHATSAPP_NUMBER/u)
  }
  expect(() => getConfig({ ...validEnv, SITE_URL: undefined })).toThrow(/SITE_URL/u)
})

test('the professional registration number is required', () => {
  for (const missing of [undefined, '', '  ']) {
    expect(() => getConfig({ ...validEnv, CRN: missing })).toThrow(/CRN/u)
  }
})
