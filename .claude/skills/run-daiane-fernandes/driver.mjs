// Drives the running site in headless Chromium. Commands come from stdin, one per line.
// See SKILL.md next to this file.
import { mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline'

import { AxeBuilder } from '@axe-core/playwright'
import { chromium, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'http://localhost:5173'
const shotDir = resolve(process.env.SHOT_DIR ?? 'node_modules/.cache/run-skill')
const TIMEOUT_MS = 30_000

const browser = await chromium.launch()
let context
let page
let problems = []
let device = devices['Pixel 7']
// Kept apart from the device so that switching screen size does not drop them.
let flags = {}

async function newPage() {
  await context?.close()
  context = await browser.newContext({ ...device, ...flags, baseURL })
  context.setDefaultTimeout(TIMEOUT_MS)
  page = await context.newPage()
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      problems.push(`console.${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  page.on('response', (response) => {
    if (response.status() >= 400) {
      problems.push(`HTTP ${response.status()} ${response.url()}`)
    }
  })
}

// `role=button name=Ver e-mail` is shorthand for getByRole; anything else is a Playwright selector.
function locate(target) {
  const byRole = /^role=(\S+) name=(.+)$/u.exec(target)
  return byRole ? page.getByRole(byRole[1], { name: byRole[2] }) : page.locator(target)
}

// Waits out load animations (the hero starts blurred). Scroll-driven ones never "finish".
async function capture(name, fullPage = false) {
  await page.evaluate(async () => {
    const running = document
      .getAnimations()
      .filter((animation) => animation.timeline instanceof DocumentTimeline)
    await Promise.allSettled(running.map((animation) => animation.finished))
  })
  const file = join(shotDir, `${name}.png`)
  await page.screenshot({ path: file, fullPage })
  console.log(file)
}

const commands = {
  async nav(path) {
    const response = await page.goto(path || '/', { waitUntil: 'networkidle' })
    console.log(`${response?.status() ?? '(same document)'} ${page.url()}`)
  },
  async desktop() {
    device = { viewport: { width: 1280, height: 800 } }
    await newPage()
  },
  async mobile(width) {
    const pixel = devices['Pixel 7']
    device = width ? { ...pixel, viewport: { width: Number(width), height: 800 } } : pixel
    await newPage()
  },
  async nojs() {
    flags.javaScriptEnabled = false
    await newPage()
  },
  // The dev server's CSP blocks React Router's inline scripts, so nothing hydrates without this.
  async 'bypass-csp'() {
    flags.bypassCSP = true
    await newPage()
  },
  async 'reduced-motion'() {
    flags.reducedMotion = 'reduce'
    await newPage()
  },
  async click(target) {
    await locate(target).first().click()
  },
  async 'wait-for'(target) {
    await locate(target).first().waitFor()
  },
  async text(target) {
    console.log(
      await locate(target || 'body')
        .first()
        .innerText(),
    )
  },
  async count(target) {
    console.log(await locate(target).count())
  },
  async box(target) {
    console.log(JSON.stringify(await locate(target).first().boundingBox()))
  },
  // Real wheel events, then a pause so scroll-driven header styles settle.
  async scroll(pixels) {
    await page.mouse.wheel(0, Number(pixels))
    await page.waitForTimeout(600)
    console.log(`scrollY=${await page.evaluate(() => Math.round(globalThis.scrollY))}`)
  },
  async eval(expression) {
    console.log(JSON.stringify(await page.evaluate(expression)))
  },
  async ss(name) {
    await capture(name || 'page')
  },
  async 'ss-full'(name) {
    // Content below the fold stays invisible until scrolled into view unless motion is off.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    // Walk the page first so lazy images load and are present in the capture.
    const height = await page.evaluate(() => document.body.scrollHeight)
    for (let y = 0; y < height; y += 600) {
      await page.mouse.wheel(0, 600)
      await page.waitForTimeout(100)
    }
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => globalThis.scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(600)
    await capture(name || 'full', true)
    await page.emulateMedia({ reducedMotion: flags.reducedMotion ?? 'no-preference' })
  },
  async axe() {
    const { violations } = await new AxeBuilder({ page }).analyze()
    console.log(`${violations.length} axe violations`)
    for (const violation of violations) {
      console.log(`  ${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`)
    }
    if (violations.length > 0) {
      process.exitCode = 1
    }
  },
  // Prints and clears what the browser has complained about. Fails the run if there was anything.
  async problems() {
    console.log(problems.length === 0 ? 'no problems' : problems.join('\n'))
    if (problems.length > 0) {
      process.exitCode = 1
    }
    problems = []
  },
}

mkdirSync(shotDir, { recursive: true })
await newPage()
try {
  for await (const raw of createInterface({ input: process.stdin })) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) {
      continue
    }
    const [name, ...rest] = line.split(' ')
    if (name === 'quit') {
      break
    }
    console.log(`> ${line}`)
    const command = Object.hasOwn(commands, name) ? commands[name] : undefined
    if (!command) {
      throw new Error(`unknown command "${name}" (have: ${Object.keys(commands).join(', ')}, quit)`)
    }
    await command(rest.join(' '))
  }
} catch (error) {
  console.error(`FAILED: ${error.message}`)
  await page.screenshot({ path: join(shotDir, 'failure.png') }).catch(() => {})
  console.error(`screenshot: ${join(shotDir, 'failure.png')}`)
  if (problems.length > 0) {
    console.error(problems.join('\n'))
  }
  process.exitCode = 1
} finally {
  await browser.close()
}
