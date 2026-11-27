import { expect, type Locator, type Page, test } from '@playwright/test'

const TEXT = 'main :is(h1, h2, h3, p, li, summary, a.button)'
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
