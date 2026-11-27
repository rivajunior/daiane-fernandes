import { expect, type Page, test } from '@playwright/test'

async function open(page: Page, width: number, reducedMotion: 'reduce' | 'no-preference') {
  await page.emulateMedia({ reducedMotion })
  await page.setViewportSize({ width, height: 800 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

async function scrollBy(page: Page, distance: number) {
  const before = (await box(page, 'main')).y
  await page.mouse.wheel(0, distance)
  // Also proves that shrinking the header does not shift the page underneath.
  await expect.poll(async () => (await box(page, 'main')).y).toBeCloseTo(before - distance, 0)
}

async function box(page: Page, selector: string) {
  return (await page.locator(selector).boundingBox())!
}

async function logoParts(page: Page) {
  return {
    header: await box(page, '.site-header'),
    monogram: await box(page, '.site-header .logo__monogram'),
    daiane: await box(page, '.site-header .logo__daiane'),
    fernandes: await box(page, '.site-header .logo__fernandes'),
    subtitle: await box(page, '.site-header .logo__subtitle'),
  }
}

test('at the top the name is stacked on two lines', async ({ page }) => {
  await open(page, 1280, 'no-preference')
  const { header, daiane, fernandes, subtitle } = await logoParts(page)

  expect(header.height).toBeCloseTo(92, 0)
  expect(fernandes.y).toBeGreaterThan(daiane.y + daiane.height)
  expect(subtitle.y).toBeGreaterThan(fernandes.y + fernandes.height)
})

for (const width of [320, 360, 390, 1280]) {
  test(`once scrolled at ${width}px the header is compact with the name on one line`, async ({
    page,
  }) => {
    await open(page, width, 'no-preference')
    await scrollBy(page, 400)
    const { header, monogram, daiane, fernandes, subtitle } = await logoParts(page)

    expect(header.height).toBeLessThanOrEqual(57)
    // One line, in reading order, with the role below the name.
    expect(Math.abs(fernandes.y - daiane.y)).toBeLessThan(2)
    expect(daiane.x).toBeGreaterThan(monogram.x + monogram.width)
    expect(fernandes.x).toBeGreaterThan(daiane.x + daiane.width)
    expect(subtitle.y).toBeGreaterThan(daiane.y + daiane.height)
    expect(subtitle.x + subtitle.width).toBeCloseTo(fernandes.x + fernandes.width, -1)
    // Everything fits inside the header and the screen.
    expect(subtitle.y + subtitle.height).toBeLessThanOrEqual(header.height)
    expect(monogram.y).toBeGreaterThanOrEqual(0)
    expect(fernandes.x + fernandes.width).toBeLessThanOrEqual(width - 16)
  })
}

for (const width of [320, 1280]) {
  test(`at ${width}px the moving parts stay inside the header and apart from each other`, async ({
    page,
  }) => {
    await open(page, width, 'no-preference')
    for (let step = 0; step < 8; step += 1) {
      await scrollBy(page, 12)
      const { header, daiane, fernandes, subtitle } = await logoParts(page)

      expect(subtitle.y + subtitle.height).toBeLessThanOrEqual(header.height)
      const sideBySide = fernandes.x >= daiane.x + daiane.width
      const stacked = fernandes.y >= daiane.y + daiane.height - 0.5
      expect(sideBySide || stacked).toBe(true)
      expect(subtitle.y).toBeGreaterThanOrEqual(fernandes.y + fernandes.height)
    }
  })
}

test('with reduced motion the logo switches without intermediate states', async ({ page }) => {
  await open(page, 1280, 'reduce')
  await scrollBy(page, 24)
  expect((await logoParts(page)).header.height).toBeCloseTo(92, 0)

  await scrollBy(page, 176)
  expect((await logoParts(page)).header.height).toBeLessThanOrEqual(57)
})
