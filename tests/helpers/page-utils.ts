/**
 * Page utility functions for E2E tests
 * Extracted to reduce test complexity
 */
import { Page, expect } from '@playwright/test'

/**
 * Wait for page to load and measure load time
 */
export async function measurePageLoadTime(page: Page, url: string): Promise<number> {
  const startTime = Date.now()
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  return Date.now() - startTime
}

/**
 * Filter console errors to exclude non-critical ones
 */
export function filterCriticalErrors(errors: string[]): string[] {
  return errors.filter(error =>
    !error.includes('favicon') &&
    !error.includes('404') &&
    !error.includes('net::ERR_FAILED')
  )
}

/**
 * Setup console error collection
 */
export function setupErrorCollection(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return errors
}

/**
 * Setup TypeScript error collection
 */
export function setupTsErrorCollection(page: Page): string[] {
  const tsErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('TypeError')) {
      tsErrors.push(msg.text())
    }
  })
  return tsErrors
}

/**
 * Test responsive design at different viewport sizes
 */
export async function testResponsiveDesign(page: Page, selector: string): Promise<void> {
  // Test desktop
  await page.setViewportSize({ width: 1200, height: 800 })
  await expect(page.locator(selector)).toBeVisible()

  // Test tablet
  await page.setViewportSize({ width: 768, height: 1024 })
  await expect(page.locator(selector)).toBeVisible()

  // Test mobile
  await page.setViewportSize({ width: 375, height: 667 })
  await expect(page.locator(selector)).toBeVisible()
}