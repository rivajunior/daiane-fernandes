import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { gotoHome } from './support'

const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js'

test('home renders in pt-BR with one h1, wa.me links, no unexpected third-party requests and no a11y violations', async ({
  page,
}) => {
  // A build with an analytics token loads the beacon. Stand in for it, so tests send no data.
  await page.route(BEACON, async (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      headers: { 'access-control-allow-origin': '*' },
      body: '',
    }),
  )
  const externalRequests: string[] = []
  const consoleProblems: string[] = []
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleProblems.push(message.text())
    }
  })
  page.on('pageerror', (error) => consoleProblems.push(error.message))
  page.on('request', (request) => {
    if (!request.url().startsWith('http://localhost:4173')) {
      externalRequests.push(request.url())
    }
  })

  await gotoHome(page)

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const links = page.locator('a[href^="https://wa.me/"]')
  await expect(links).toHaveCount(6)
  const bodyText = (await page.locator('body').innerText()).replaceAll(/\s+/gu, ' ')
  // No phone number as text, whichever number the build uses, and no contact besides Instagram.
  expect(bodyText).not.toMatch(/\d{10,}/u)
  expect(bodyText.match(/@\S*/gu)).toEqual(['@daianefernandes.nutri'])

  expect(externalRequests.filter((url) => url !== BEACON)).toEqual([])
  expect(consoleProblems).toEqual([])

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('the phone page stays short and every illustration is decorative', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gotoHome(page)

  // About 9000px with her second version's content, at this device's 412px width. The margin
  // allows for font rendering that differs between systems.
  expect(await page.evaluate('document.documentElement.scrollHeight')).toBeLessThan(9500)
  await expect(page.locator('svg.art:not([aria-hidden="true"])')).toHaveCount(0)
  await expect(page.locator('main [style]')).toHaveCount(0)
})
