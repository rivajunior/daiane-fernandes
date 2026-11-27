import { expect, type Page, test } from '@playwright/test'

import { gotoHome } from './support'

const ROWS = [
  {
    id: 'help-row',
    section: '#atendimento',
    cards: 6,
    desktopPositions: 4,
    dot: 'Áreas: ir para a posição',
    next: 'Próxima área',
    previous: 'Área anterior',
  },
  {
    id: 'reviews-row',
    section: '#avaliacoes',
    cards: 5,
    desktopPositions: 3,
    dot: 'Avaliações: ir para a posição',
    next: 'Próxima avaliação',
    previous: 'Avaliação anterior',
  },
] as const

// The controls and measurements of one row.
function controlsOf(row: (typeof ROWS)[number]) {
  return {
    dots: (page: Page) => page.getByRole('button', { name: new RegExp(`^${row.dot}`, 'u') }),
    next: (page: Page) => page.getByRole('button', { name: row.next }),
    current: (page: Page) => page.locator(`${row.section} .carousel__dot[aria-current="true"]`),
    name: (position: number, total: number) => `${row.dot} ${position} de ${total}`,
    scrollLeft: async (page: Page) =>
      Number(await page.evaluate(`document.querySelector("#${row.id}").scrollLeft`)),
  }
}

for (const row of ROWS) {
  test.describe(row.id, () => {
    const { dots, next, current, name, scrollLeft } = controlsOf(row)

    async function open(page: Page, width: number) {
      await page.setViewportSize({ width, height: 800 })
      await gotoHome(page)
      await page.locator(`${row.section} .carousel__controls`).scrollIntoViewIfNeeded()
    }

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
      await open(page, 412)
      await expect(dots(page)).toHaveCount(row.cards)
      await expect(next(page)).toBeHidden()
      await expect(current(page)).toHaveAccessibleName(name(1, row.cards))

      await page.evaluate(`document.querySelector("#${row.id}").scrollLeft = 100000`)
      await expect(current(page)).toHaveAccessibleName(name(row.cards, row.cards))
    })

    test('desktop: arrows move, focus stays at the end, and a later swipe still updates', async ({
      page,
    }) => {
      const total = row.desktopPositions
      await open(page, 1280)
      await expect(dots(page)).toHaveCount(total)
      await next(page).focus()
      for (let step = 0; step < total + 1; step += 1) {
        await page.keyboard.press('Enter')
      }
      await expect(current(page)).toHaveAccessibleName(name(total, total))
      await expect(next(page)).toBeFocused()
      await expect(next(page)).toHaveAttribute('aria-disabled', 'true')
      await expect(page.getByRole('button', { name: row.previous })).toHaveAttribute(
        'aria-disabled',
        'false',
      )
      await expect
        .poll(async () =>
          page.evaluate(
            `(() => { const row = document.querySelector("#${row.id}"); return row.scrollWidth - row.clientWidth - row.scrollLeft })()`,
          ),
        )
        .toBeLessThan(2)

      await page.locator(`#${row.id}`).hover()
      await page.mouse.wheel(-4000, 0)
      await expect(current(page)).toHaveAccessibleName(name(1, total))
    })

    test('with reduced motion an arrow jumps immediately', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await open(page, 1280)
      const second = await page.evaluate(
        `(() => { const cards = document.querySelectorAll("#${row.id} .carousel__card"); return cards[1].offsetLeft - cards[0].offsetLeft })()`,
      )
      await next(page).click()
      // Read once, without polling: a smooth scroll would still be on its way.
      expect(Math.abs((await scrollLeft(page)) - Number(second))).toBeLessThan(2)
    })

    test('without JavaScript the row has no controls and keeps every card', async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false })
      const page = await context.newPage()
      await page.goto('http://localhost:4173/')

      await expect(page.locator(`#${row.id} .carousel__card`)).toHaveCount(row.cards)
      await expect(dots(page)).toHaveCount(0)
      await context.close()
    })

    test('adding the controls does not shift the page', async ({ browser }) => {
      const noteTop = async (javaScriptEnabled: boolean, dotCount: number) => {
        const context = await browser.newContext({
          javaScriptEnabled,
          reducedMotion: 'reduce',
          viewport: { width: 412, height: 800 },
        })
        const page = await context.newPage()
        await page.goto('http://localhost:4173/')
        await expect(dots(page)).toHaveCount(dotCount)
        await page.evaluate('document.fonts.ready.then(() => true)')
        const { y } = (await page.locator(`${row.section} .row-note`).boundingBox())!
        await context.close()
        return y
      }

      expect(Math.abs((await noteTop(true, row.cards)) - (await noteTop(false, 0)))).toBeLessThan(1)
    })
  })
}
