import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('email is absent from the HTML and appears after the proof-of-work check', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/')).text()
  expect(html).not.toContain('daianefernandesnutricionista')

  await page.goto('/')
  await page.getByRole('button', { name: 'Ver e-mail' }).click()

  const link = page.getByRole('link', { name: /@gmail\.com$/u })
  await expect(link).toBeVisible({ timeout: 30_000 })
  await expect(link).toHaveAttribute('href', /^mailto:/u)
  await expect(link).toBeFocused()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('with JavaScript disabled the page is readable and offers the WhatsApp alternative', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://localhost:4173/')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('noscript p')).toContainText('ative o JavaScript')
  await expect(page.locator('noscript a')).toBeVisible()
  await expect(page.locator('a[href^="https://wa.me/"]').first()).toBeVisible()
  await context.close()
})

test('verify endpoint rejects a forged solution without leaking the email', async ({ request }) => {
  const response = await request.post('/api/pow/verify', {
    data: {
      salt: 'aa',
      difficulty: 0,
      expiresAt: 9_999_999_999_999,
      signature: 'forged',
      nonce: 0,
    },
  })

  expect(response.status()).toBe(400)
  expect(await response.text()).not.toContain('@')
})
