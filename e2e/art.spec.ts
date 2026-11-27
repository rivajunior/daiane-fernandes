import { AxeBuilder } from '@axe-core/playwright'
import { expect, type Locator, type Page, test } from '@playwright/test'

const TEXT = 'main :is(h1, h2, h3, p, li, summary, blockquote, figcaption, a.button)'
const HEIGHT = 800

type Box = { x: number; y: number; width: number; height: number }

function intersects(a: Box, b: Box, tolerance: number): boolean {
  return (
    a.x < b.x + b.width - tolerance &&
    b.x < a.x + a.width - tolerance &&
    a.y < b.y + b.height - tolerance &&
    b.y < a.y + a.height - tolerance
  )
}

// Boxes of the matches that are at least partly on screen, with a name for failure messages.
async function onScreen(locator: Locator): Promise<Array<{ name: string; box: Box }>> {
  const found = []
  for (const element of await locator.all()) {
    const box = await element.boundingBox()
    if (box !== null && box.width > 0 && box.y < HEIGHT && box.y + box.height > 0) {
      const name = (await element.getAttribute('class')) ?? (await element.innerText()).slice(0, 40)
      found.push({ name, box })
    }
  }
  return found
}

async function scrollTo(page: Page, top: number) {
  await page.evaluate(`window.scrollTo({ top: ${top}, behavior: 'instant' })`)
  // Two frames, so scroll-driven animations have caught up.
  await page.evaluate(
    'new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))',
  )
}

for (const width of [320, 412, 1280]) {
  test(`at ${width}px leaves never touch text and the page never scrolls sideways`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.setViewportSize({ width, height: HEIGHT })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const height = Number(await page.evaluate('document.documentElement.scrollHeight'))
    let leavesSeen = 0
    for (let top = 0; top < height; top += 400) {
      await scrollTo(page, top)
      expect(await page.evaluate('document.documentElement.scrollWidth')).toBeLessThanOrEqual(width)

      const leaves = await onScreen(page.locator('.leaves__leaf'))
      leavesSeen += leaves.length
      if (leaves.length === 0) {
        continue
      }
      for (const text of await onScreen(page.locator(TEXT))) {
        for (const leaf of leaves) {
          expect(
            intersects(leaf.box, text.box, 2),
            `${leaf.name} over "${text.name}" at scroll ${top}`,
          ).toBe(false)
        }
      }
    }
    // Guards against the check passing because there is nothing to check.
    expect(leavesSeen).toBeGreaterThan(0)
  })
}

for (const width of [320, 412, 1280]) {
  test(`at ${width}px an open answer never overlaps the plate and axe passes`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: HEIGHT })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const questions = page.locator('details[name="approach"]')
    await expect(questions).toHaveCount(4)
    for (const question of await questions.all()) {
      await question.locator('summary').click()
      await expect(page.locator('details[name="approach"][open]')).toHaveCount(1)
      const answer = (await question.locator('p').boundingBox())!
      const plate = (await page.locator('.plate__art').boundingBox())!
      expect(intersects(answer, plate, 0)).toBe(false)
    }

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

test('questions open one at a time and pass axe', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const questions = page.locator('details[name="faq"]')
  await expect(questions).toHaveCount(5)
  for (const question of await questions.all()) {
    await question.locator('summary').click()
    await expect(page.locator('details[name="faq"][open]')).toHaveCount(1)
    await expect(question.locator('p')).toBeVisible()
  }

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

for (const width of [320, 1280]) {
  test(`at ${width}px no leaf is cut off by its drawing`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: HEIGHT })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const clipped = await page.evaluate(`
      Array.from(document.querySelectorAll('main svg.art .art__leaf'), (leaf) => {
        const inner = leaf.getBoundingClientRect()
        const outer = leaf.ownerSVGElement.getBoundingClientRect()
        const inside = inner.left >= outer.left - 0.5 && inner.right <= outer.right + 0.5 &&
          inner.top >= outer.top - 0.5 && inner.bottom <= outer.bottom + 0.5
        return inside ? null : leaf.ownerSVGElement.getAttribute('class')
      }).filter(Boolean)
    `)
    expect(clipped).toEqual([])
  })
}
