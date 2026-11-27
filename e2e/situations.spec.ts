import { expect, test } from '@playwright/test'

for (const width of [320, 412, 768, 1280]) {
  test(`at ${width}px the next card peeks in and the row scrolls by keyboard`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const track = page.locator('#situations')
    await track.scrollIntoViewIfNeeded()

    const row = (await track.boundingBox())!
    const edge = row.x + row.width
    const cards = await track.locator('.carousel__card').all()
    const boxes = await Promise.all(cards.map(async (card) => (await card.boundingBox())!))
    expect(boxes.some((card) => card.x < edge - 8 && card.x + card.width > edge + 8)).toBe(true)
    expect(await page.evaluate('document.documentElement.scrollWidth')).toBeLessThanOrEqual(width)

    await track.focus()
    await page.keyboard.press('ArrowRight')
    await expect
      .poll(async () => page.evaluate('document.querySelector("#situations").scrollLeft'))
      .toBeGreaterThan(0)
  })
}
