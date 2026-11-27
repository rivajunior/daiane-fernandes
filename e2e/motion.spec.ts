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

test('no leaf unfolds before its stem has reached it', async ({ page }) => {
  await open(page, 800, 'no-preference')
  const step = 'document.querySelector(".steps li:last-child")'
  const start = Number(
    await page.evaluate(`${step}.getBoundingClientRect().top + scrollY - innerHeight`),
  )
  const height = Number(await page.evaluate(`${step}.getBoundingClientRect().height`))

  let growing = 0
  // From the step entering the screen to just past fully visible.
  for (let part = 0; part <= 1.1; part += 0.05) {
    await scrollTo(page, String(Math.round(start + height * part)))
    await page.evaluate(
      'new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))',
    )
    const { drawn, leaf } = await page.evaluate<{ drawn: number; leaf: number }>(`(() => {
      const step = ${step}
      return {
        drawn: 1 - parseFloat(getComputedStyle(step.querySelector('.art__stem')).strokeDashoffset),
        leaf: new DOMMatrix(getComputedStyle(step.querySelector('.art__leaf')).transform).a,
      }
    })()`)
    if (leaf > 0.01) {
      expect(drawn, `leaf at scale ${leaf}`).toBeGreaterThan(0.99)
    }
    if (drawn > 0.05 && drawn < 0.95) {
      growing += 1
    }
  }
  // Guards against sampling only the finished or the empty drawing.
  expect(growing).toBeGreaterThan(2)
})

test('the plant beside the video call grows as it comes into view', async ({ page }) => {
  await open(page, 800, 'no-preference')
  const stems = '.online-call .art__stem'
  expect(await styles(page, stems, 'strokeDashoffset')).toEqual(['1px', '1px', '1px'])

  await page.evaluate(
    'document.querySelector(".online__art").scrollIntoView({ block: "center", behavior: "instant" })',
  )
  await expect
    .poll(async () => styles(page, stems, 'strokeDashoffset'))
    .toEqual(['0px', '0px', '0px'])
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
    Array.from({ length: 8 }, () => 'none'),
  )
  const moving = await styles(page, '.leaves__leaf, .art__stem, .art__leaf', 'animationName')
  expect(new Set(moving as string[])).toEqual(new Set(['none']))
})
