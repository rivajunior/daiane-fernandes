import { expect, type Page, test } from '@playwright/test'

const dots = (page: Page) => page.getByRole('button', { name: /^Ir para a posição/u })
const next = (page: Page) => page.getByRole('button', { name: 'Próxima situação' })
const current = (page: Page) => page.locator('.carousel__dot[aria-current="true"]')
const scrollLeft = async (page: Page) =>
  page.evaluate('document.querySelector("#situations").scrollLeft')

async function open(page: Page, width: number) {
  await page.setViewportSize({ width, height: 800 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  // The controls appear once the page has hydrated.
  await expect(dots(page).first()).toBeAttached()
  await page.locator('.carousel__controls').scrollIntoViewIfNeeded()
}

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

test('phone: five dots, no arrows, and swiping moves the current dot', async ({ page }) => {
  await open(page, 412)
  await expect(dots(page)).toHaveCount(5)
  await expect(next(page)).toBeHidden()
  await expect(current(page)).toHaveAccessibleName('Ir para a posição 1 de 5')

  await page.evaluate('document.querySelector("#situations").scrollLeft = 100000')
  await expect(current(page)).toHaveAccessibleName('Ir para a posição 5 de 5')
})

test('desktop: two quick clicks advance two positions and a later swipe still updates', async ({
  page,
}) => {
  await open(page, 1280)
  await expect(dots(page)).toHaveCount(3)
  await next(page).click()
  await next(page).click()
  await expect(current(page)).toHaveAccessibleName('Ir para a posição 3 de 3')
  await expect
    .poll(async () =>
      page.evaluate(
        '(() => { const row = document.querySelector("#situations"); return row.scrollWidth - row.clientWidth - row.scrollLeft })()',
      ),
    )
    .toBeLessThan(2)

  await page.locator('#situations').hover()
  await page.mouse.wheel(-2000, 0)
  await expect(current(page)).toHaveAccessibleName('Ir para a posição 1 de 3')
})

test('a dot jumps to its position', async ({ page }) => {
  await open(page, 412)
  await dots(page).nth(3).click()
  await expect(current(page)).toHaveAccessibleName('Ir para a posição 4 de 5')
  await expect.poll(async () => scrollLeft(page)).toBeGreaterThan(600)
})

test('desktop: at the last position focus stays on next', async ({ page }) => {
  await open(page, 1280)
  await next(page).focus()
  for (let step = 0; step < 4; step += 1) {
    await page.keyboard.press('Enter')
  }
  await expect(current(page)).toHaveAccessibleName('Ir para a posição 3 de 3')
  await expect(next(page)).toBeFocused()
  await expect(next(page)).toHaveAttribute('aria-disabled', 'true')
})

test('resizing changes the dot count', async ({ page }) => {
  await open(page, 412)
  await expect(dots(page)).toHaveCount(5)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(dots(page)).toHaveCount(3)
})

test('with reduced motion an arrow jumps immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1280)
  const second = await page.evaluate(
    '(() => { const cards = document.querySelectorAll(".carousel__card"); return cards[1].offsetLeft - cards[0].offsetLeft })()',
  )
  await next(page).click()
  // Read once, without polling: a smooth scroll would still be on its way.
  expect(Math.abs(Number(await scrollLeft(page)) - Number(second))).toBeLessThan(2)
})

test('without JavaScript the row has no controls and keeps every card', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://localhost:4173/')

  await expect(page.locator('.carousel__card')).toHaveCount(5)
  await expect(dots(page)).toHaveCount(0)
  await context.close()
})

test('adding the controls does not shift the page', async ({ browser }) => {
  const noteTop = async (javaScriptEnabled: boolean) => {
    const context = await browser.newContext({
      javaScriptEnabled,
      reducedMotion: 'reduce',
      viewport: { width: 412, height: 800 },
    })
    const page = await context.newPage()
    await page.goto('http://localhost:4173/')
    await page.waitForLoadState('networkidle')
    if (javaScriptEnabled) {
      await expect(dots(page)).toHaveCount(5)
    }
    const { y } = (await page.locator('.statements__note').boundingBox())!
    await context.close()
    return y
  }

  expect(Math.abs((await noteTop(true)) - (await noteTop(false)))).toBeLessThan(1)
})
