import { expect, type Page } from '@playwright/test'

// Animations that run on their own clock. Scroll-driven ones never finish.
const LOAD_ANIMATIONS = `Promise.allSettled(
  document.getAnimations()
    .filter((animation) => animation.timeline instanceof DocumentTimeline)
    .map((animation) => animation.finished),
)`

/**
 * Opens the home page and waits until it has settled: the swipe rows get their dots only once the
 * page has hydrated, fonts change the layout when they arrive, and the hero animates into place.
 */
export async function gotoHome(page: Page): Promise<void> {
  await page.goto('/')
  await expect(page.locator('.carousel__dot').first()).toBeAttached()
  await page.evaluate('document.fonts.ready.then(() => true)')
  await page.evaluate(LOAD_ANIMATIONS)
}
