import { expect, type Page, test } from '@playwright/test'

interface Box {
  x: number
  y: number
  width: number
  height: number
}

const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

async function open(page: Page, width: number, height = 800) {
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

// The heading each in-page link should bring into view, below the sticky header.
async function expectBelowHeader(page: Page, heading: string) {
  await expect
    .poll(async () => {
      const header = (await page.locator('.site-header').boundingBox())!
      const title = (await page.locator(heading).boundingBox())!
      return title.y >= header.y + header.height - 1 && title.y < 600
    })
    .toBe(true)
}

const MENU = [
  ['Sobre mim', '#about-title'],
  ['Como posso ajudar', '#help-title'],
  ['Acompanhamento', '#how-title'],
  ['Avaliações', '#reviews-title'],
  ['Dúvidas', '#faq-title'],
] as const

test('each menu link brings its section below the header', async ({ page }) => {
  await open(page, 1280)
  for (const [name, heading] of MENU) {
    await page
      .getByRole('navigation', { name: 'Menu principal' })
      .getByRole('link', { name })
      .click()
    await expectBelowHeader(page, heading)
  }
})

test('without JavaScript the in-page buttons still reach their sections', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 412, height: 800 },
  })
  const page = await context.newPage()
  await page.goto('http://localhost:4173/')
  await page.getByRole('link', { name: 'Quero cuidar da minha alimentação' }).click()
  await expectBelowHeader(page, '#closing-title')
  await page.getByRole('link', { name: 'Conheça meu acompanhamento' }).click()
  await expectBelowHeader(page, '#how-title')
  await context.close()
})

test('tabbing through a phone page never hides the focused control behind the button', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 412)
  const total = await page.locator('a[href], button, summary, [tabindex="0"]').count()
  const checked: string[] = []

  for (let step = 0; step < total; step += 1) {
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    if ((await focused.count()) === 0) {
      continue
    }
    const className = (await focused.getAttribute('class')) ?? ''
    if (className.includes('mobile-cta')) {
      continue
    }
    const box = await focused.boundingBox()
    const button = (await page.locator('.mobile-cta').boundingBox())!
    // Rows and the skip link are larger than the gap or off screen by design.
    if (box === null || className.includes('carousel__track')) {
      continue
    }
    checked.push(className)
    expect(overlaps(box, button), `${className} at step ${step}`).toBe(false)
  }
  expect(checked.filter((name) => name.includes('footer__link'))).toHaveLength(2)
})

test('at 320px nothing makes the page scroll sideways, even with every answer open', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 320)
  await page.evaluate(
    'document.querySelectorAll("details").forEach((item) => { item.removeAttribute("name"); item.open = true })',
  )
  expect(await page.evaluate('document.documentElement.scrollWidth')).toBeLessThanOrEqual(320)

  const outside = await page.evaluate(`
    Array.from(document.querySelectorAll('h1, h2, .eyebrow, .footer li, .footer p, .button'))
      .filter((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 0 && (box.left < -0.5 || box.right > 320.5 || element.scrollWidth > element.clientWidth + 1)
      })
      .map((element) => element.textContent.slice(0, 40))
  `)
  expect(outside).toEqual([])
})

test('a button label that wraps stays centered', async ({ page }) => {
  await open(page, 320)
  const button = page.getByRole('link', { name: 'Quero cuidar da minha alimentação' })
  await expect(button).toHaveCSS('text-align', 'center')
})

for (const width of [412, 1280]) {
  test(`at ${width}px the focused skip link is on top of the header`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, width)
    await page.keyboard.press('Tab')
    await expect(page.locator('.skip-link')).toBeFocused()

    const onTop = await page.evaluate(`(() => {
      const link = document.querySelector('.skip-link')
      const box = link.getBoundingClientRect()
      return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === link
    })()`)
    expect(onTop).toBe(true)
  })
}
