import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home renders in pt-BR with one h1, wa.me links, no third-party requests and no a11y violations', async ({
  page,
}) => {
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

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)

  const links = page.locator('a[href^="https://wa.me/"]')
  await expect(links).toHaveCount(4)
  const bodyText = (await page.locator('body').innerText()).replaceAll(/\s+/gu, ' ')
  expect(bodyText).not.toContain('5585900000000')
  expect(bodyText).not.toContain('@')

  expect(externalRequests).toEqual([])
  expect(consoleProblems).toEqual([])
  await expect(page.getByRole('region', { name: 'Cookies' })).toHaveCount(0)

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('the phone page is shorter than before and every illustration is decorative', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // About 7400px before the redesign, at this device's 412px width.
  expect(await page.evaluate('document.documentElement.scrollHeight')).toBeLessThan(7400)
  await expect(page.locator('svg.art:not([aria-hidden="true"])')).toHaveCount(0)
  await expect(page.locator('main [style]')).toHaveCount(0)
})
