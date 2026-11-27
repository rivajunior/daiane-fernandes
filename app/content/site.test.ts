import { expect, test } from 'vite-plus/test'

import { content } from './site'

test('the site address and WhatsApp number are in the shape the links need', () => {
  expect(content.siteUrl).toMatch(/^https:\/\/[^/\s]+$/u)
  expect(content.whatsappNumber).toMatch(/^\d{10,15}$/u)
})
