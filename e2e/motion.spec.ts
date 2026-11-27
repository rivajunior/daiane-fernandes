import { expect, type Page, test } from '@playwright/test'

async function styles(page: Page, selector: string, property: string) {
  return page.evaluate(
    `Array.from(document.querySelectorAll(${JSON.stringify(selector)}), (element) => getComputedStyle(element).${property})`,
  )
}

async function open(page: Page, height: number, reducedMotion: 'reduce' | 'no-preference') {
  await page.emulateMedia({ reducedMotion })
  await page.setViewportSize({ width: 412, height })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

async function scrollTo(page: Page, top: string) {
  await page.evaluate(`window.scrollTo({ top: ${top}, behavior: 'instant' })`)
}

test('near leaves travel further than far ones as the page scrolls', async ({ page }) => {
  await open(page, 800, 'no-preference')
  // The center, so that a changing tilt does not count as movement.
  const center = async (selector: string) => {
    const box = (await page.locator(selector).boundingBox())!
    return box.y + box.height / 2
  }
  const near = '.leaves--hero .leaves__leaf--1'
  const far = '.leaves--hero .leaves__leaf--4'
  const before = { near: await center(near), far: await center(far) }

  await scrollTo(page, '300')
  // Movement beyond the scroll itself.
  const travelled = async (selector: string, start: number) =>
    Math.abs(start - (await center(selector)) - 300)

  await expect.poll(async () => travelled(far, before.far)).toBeGreaterThan(2)
  expect(await travelled(near, before.near)).toBeGreaterThan(await travelled(far, before.far))
})

test('stems start hidden and are drawn once in view', async ({ page }) => {
  await open(page, 800, 'no-preference')
  const last = '.steps li:last-child .art__stem'
  expect(await styles(page, last, 'strokeDashoffset')).toEqual(['1px'])

  await page.evaluate(
    'document.querySelector(".steps li:last-child").scrollIntoView({ block: "center", behavior: "instant" })',
  )
  await expect.poll(async () => styles(page, last, 'strokeDashoffset')).toEqual(['0px'])
})

for (const height of [640, 1600]) {
  test(`at ${height}px tall the closing stems are complete at the bottom`, async ({ page }) => {
    await open(page, height, 'no-preference')
    await scrollTo(page, 'document.documentElement.scrollHeight')

    await expect
      .poll(async () => styles(page, '.stems .art__stem', 'strokeDashoffset'))
      .toEqual(['0px', '0px'])
  })
}

test('with reduced motion everything is finished and still', async ({ page }) => {
  await open(page, 800, 'reduce')

  expect(await styles(page, '.art__stem', 'strokeDasharray')).toEqual(
    Array.from({ length: 5 }, () => 'none'),
  )
  const moving = await styles(page, '.leaves__leaf, .art__stem, .art__leaf', 'animationName')
  expect(new Set(moving as string[])).toEqual(new Set(['none']))
})
