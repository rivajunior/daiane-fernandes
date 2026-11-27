import { expect, type Page, test } from '@playwright/test'

import { clickControl, controlsNamed, focusedControl } from './controls'
import { gotoHome } from './support'

const ROWS = [
  {
    id: 'help-row',
    section: '#atendimento',
    cards: 6,
    tabletPositions: 5,
    desktopPositions: 4,
    dot: 'Áreas: ir para a posição',
    next: 'Próxima área',
    previous: 'Área anterior',
  },
  {
    id: 'reviews-row',
    section: '#avaliacoes',
    cards: 5,
    tabletPositions: 4,
    desktopPositions: 3,
    dot: 'Avaliações: ir para a posição',
    next: 'Próxima avaliação',
    previous: 'Avaliação anterior',
  },
] as const

const exactly = (name: string) => new RegExp(`^${name}$`, 'u')

// The controls and measurements of one row. The browser draws the controls itself, so they are read
// from the accessibility tree.
function rowOf(row: (typeof ROWS)[number]) {
  const dots = async (page: Page) => controlsNamed(page, exactly(`${row.dot} \\d+`))
  return {
    dotCount: async (page: Page) => (await dots(page)).length,
    current: async (page: Page) =>
      (await dots(page)).filter((dot) => dot.selected).map((dot) => dot.name),
    arrow: async (page: Page, name: string) => (await controlsNamed(page, exactly(name)))[0],
    name: (position: number) => `${row.dot} ${position}`,
    scrollLeft: async (page: Page) =>
      Number(await page.evaluate(`document.querySelector("#${row.id}").scrollLeft`)),
    remaining: async (page: Page) =>
      Number(
        await page.evaluate(
          `(() => { const row = document.querySelector("#${row.id}"); return row.scrollWidth - row.clientWidth - row.scrollLeft })()`,
        ),
      ),
  }
}

// Clicks the arrow until it has nothing further to show.
async function clickUntilDisabled(page: Page, name: string, limit: number) {
  for (let press = 0; press < limit; press += 1) {
    const [arrow] = await controlsNamed(page, exactly(name))
    if (arrow!.disabled) {
      return
    }
    await clickControl(page, name)
  }
}

// Presses Shift+Tab until the named control has focus, and returns what has it.
async function shiftTabTo(page: Page, name: string, limit: number) {
  for (let step = 0; step < limit; step += 1) {
    await page.keyboard.press('Shift+Tab')
    if ((await focusedControl(page))?.name === name) {
      break
    }
  }
  return (await focusedControl(page))?.name
}

async function open(page: Page, row: (typeof ROWS)[number], width: number) {
  await page.setViewportSize({ width, height: 800 })
  await gotoHome(page)
  await page.locator(`${row.section} .row-note`).scrollIntoViewIfNeeded()
}

for (const row of ROWS) {
  test.describe(row.id, () => {
    const { dotCount, current, arrow, name, scrollLeft, remaining } = rowOf(row)

    for (const width of [320, 412, 768, 1280]) {
      test(`at ${width}px the next card peeks in and the row scrolls by keyboard`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 800 })
        await gotoHome(page)
        const track = page.locator(`#${row.id}`)
        await track.scrollIntoViewIfNeeded()

        const bounds = (await track.boundingBox())!
        const edge = bounds.x + bounds.width
        const cards = await track.locator('.carousel__card').all()
        const boxes = await Promise.all(cards.map(async (card) => (await card.boundingBox())!))
        expect(boxes.some((card) => card.x < edge - 8 && card.x + card.width > edge + 8)).toBe(true)
        expect(await page.evaluate('document.documentElement.scrollWidth')).toBeLessThanOrEqual(
          width,
        )

        await track.focus()
        await page.keyboard.press('ArrowRight')
        await expect.poll(async () => scrollLeft(page)).toBeGreaterThan(0)
      })
    }

    test('phone: one dot per card, no arrows, and swiping moves the current dot', async ({
      page,
    }) => {
      await open(page, row, 412)
      await expect.poll(async () => dotCount(page)).toBe(row.cards)
      expect(await arrow(page, row.next)).toBeUndefined()
      await expect.poll(async () => current(page)).toEqual([name(1)])

      await page.evaluate(`document.querySelector("#${row.id}").scrollLeft = 100000`)
      await expect.poll(async () => current(page)).toEqual([name(row.cards)])
    })

    test('tablet: one dot per position the row can rest at', async ({ page }) => {
      await open(page, row, 800)
      await expect.poll(async () => dotCount(page)).toBe(row.tabletPositions)
      await page.evaluate(`document.querySelector("#${row.id}").scrollLeft = 100000`)
      await expect.poll(async () => current(page)).toEqual([name(row.tabletPositions)])
    })

    test('desktop: arrows reach both ends, and dots go to their card', async ({ page }) => {
      const total = row.desktopPositions
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, row, 1280)
      await expect.poll(async () => dotCount(page)).toBe(total)
      expect((await arrow(page, row.previous))!.disabled).toBe(true)

      await clickUntilDisabled(page, row.next, total)
      await expect.poll(async () => remaining(page)).toBeLessThan(2)
      await expect.poll(async () => current(page)).toEqual([name(total)])
      expect((await arrow(page, row.next))!.disabled).toBe(true)
      expect((await arrow(page, row.previous))!.disabled).toBe(false)

      await clickControl(page, name(2))
      const second = Number(
        await page.evaluate(
          `(() => { const cards = document.querySelectorAll("#${row.id} .carousel__card"); return cards[1].offsetLeft - cards[0].offsetLeft })()`,
        ),
      )
      await expect.poll(async () => Math.abs((await scrollLeft(page)) - second)).toBeLessThan(2)
      await expect.poll(async () => current(page)).toEqual([name(2)])
    })

    test('the keyboard reaches the dots and moves between them', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, row, 1280)
      await page.locator(`#${row.id}`).focus()
      // The controls come just before the row in the tab order.
      expect(await shiftTabTo(page, name(1), 3)).toBe(name(1))

      await page.keyboard.press('ArrowRight')
      await expect.poll(async () => scrollLeft(page)).toBeGreaterThan(0)
      await expect.poll(async () => current(page)).toEqual([name(2)])
    })

    test('with reduced motion an arrow jumps immediately', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, row, 1280)
      await clickControl(page, row.next)
      // Read once, without polling: a smooth scroll would still be on its way.
      const first = await scrollLeft(page)
      expect(first).toBeGreaterThan(0)
      await page.evaluate('new Promise((done) => setTimeout(done, 500))')
      expect(await scrollLeft(page)).toBe(first)
    })

    test('the controls work without JavaScript', async ({ browser }) => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
        reducedMotion: 'reduce',
        viewport: { width: 1280, height: 800 },
      })
      const page = await context.newPage()
      await page.goto('http://localhost:4173/')
      await page.locator(`${row.section} .row-note`).scrollIntoViewIfNeeded()

      await expect.poll(async () => dotCount(page)).toBe(row.desktopPositions)
      await clickControl(page, row.next)
      await expect.poll(async () => scrollLeft(page)).toBeGreaterThan(0)
      await context.close()
    })
  })
}
