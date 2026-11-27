import { expect, type Page, test } from '@playwright/test'

import { gotoHome } from './support'

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
  await gotoHome(page)
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

// Tabs through the page and records where each control and the bottom button were at that moment.
async function tabThrough(page: Page) {
  const total = await page.locator('a[href], button, summary, [tabindex="0"]').count()
  const checked: Array<{ className: string; step: number; box: Box; button: Box }> = []

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
    checked.push({ className, step, box, button })
  }
  return checked
}

test('tabbing through a phone page never hides the focused control behind the button', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 412)
  const checked = await tabThrough(page)

  for (const { className, step, box, button } of checked) {
    expect(overlaps(box, button), `${className} at step ${step}`).toBe(false)
  }
  expect(checked.filter(({ className }) => className.includes('footer__link'))).toHaveLength(2)
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

    // Polled: the link slides into view with a transition, however short.
    await expect
      .poll(async () =>
        page.evaluate(`(() => {
          const link = document.querySelector('.skip-link')
          const box = link.getBoundingClientRect()
          return document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2) === link
        })()`),
      )
      .toBe(true)
  })
}

// The mark under a menu link is a stem, which carries a leaf on the section being read.
async function linksWithLeaf(page: Page) {
  return page.evaluate<string[]>(`
    Array.from(document.querySelectorAll('.site-nav a'))
      .filter((link) => getComputedStyle(link, '::before').scale === '1')
      .map((link) => link.textContent)
  `)
}

async function linksWithStem(page: Page) {
  return page.evaluate<string[]>(`
    Array.from(document.querySelectorAll('.site-nav a'))
      .filter((link) => getComputedStyle(link, '::after').clipPath === 'inset(0px 0% 0px 0px)')
      .map((link) => link.textContent)
  `)
}

// Brings the section's top to the given distance below the top of the screen.
async function placeSection(page: Page, selector: string, top: number) {
  await page.evaluate(
    `window.scrollBy({ top: document.querySelector('${selector}').getBoundingClientRect().top - ${top}, behavior: 'instant' })`,
  )
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`with motion set to ${reducedMotion} the menu marks the section being read`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion })
    await open(page, 1280)
    await expect.poll(async () => linksWithLeaf(page)).toEqual([])

    for (const [name, heading] of MENU) {
      await placeSection(page, `section:has(${heading})`, 100)
      await expect.poll(async () => linksWithLeaf(page)).toEqual([name])
    }
    // Back up the page, the mark follows.
    await placeSection(page, '#sobre', 100)
    await expect.poll(async () => linksWithLeaf(page)).toEqual(['Sobre mim'])
  })
}

test('a section that is not in the menu marks nothing', async ({ page }) => {
  await open(page, 1280)
  for (const selector of ['section:has(#approach-title)', '#contato']) {
    await placeSection(page, '#processo', 100)
    await expect.poll(async () => linksWithLeaf(page)).toEqual(['Acompanhamento'])
    await placeSection(page, selector, 100)
    await expect.poll(async () => linksWithLeaf(page)).toEqual([])
  }
})

test('without JavaScript a menu link marks its section', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()
  await page.goto('http://localhost:4173/')
  await page
    .getByRole('navigation', { name: 'Menu principal' })
    .getByRole('link', { name: 'Avaliações' })
    .click()
  await expect.poll(async () => linksWithLeaf(page)).toEqual(['Avaliações'])
  await context.close()
})

test('hovering a menu link grows a stem without a leaf, and never a second line', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1280)
  const menu = page.getByRole('navigation', { name: 'Menu principal' })
  await expect.poll(async () => linksWithStem(page)).toEqual([])

  await menu.getByRole('link', { name: 'Dúvidas' }).hover()
  await expect.poll(async () => linksWithStem(page)).toEqual(['Dúvidas'])
  expect(await linksWithLeaf(page)).toEqual([])

  await placeSection(page, '#sobre', 100)
  const current = menu.getByRole('link', { name: 'Sobre mim' })
  // The pointer is moved directly: `hover()` would first scroll the page to another section.
  const box = (await current.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await expect.poll(async () => linksWithStem(page)).toEqual(['Sobre mim'])
  await expect.poll(async () => linksWithLeaf(page)).toEqual(['Sobre mim'])
  await expect(current).toHaveCSS('text-decoration-line', 'none')
  await expect(current).toHaveCSS('border-bottom-width', '0px')
})

test('keyboard focus grows the same stem as hovering', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await open(page, 1280)
  // The skip link comes first, then the menu.
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Sobre mim' })).toBeFocused()
  await expect.poll(async () => linksWithStem(page)).toEqual(['Sobre mim'])
})
