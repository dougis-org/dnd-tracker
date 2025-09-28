/**
 * Accessibility testing utilities
 * Extracted to reduce test complexity
 */
import { Page, expect } from '@playwright/test'

/**
 * Verify basic accessibility requirements
 */
export async function verifyBasicAccessibility(page: Page): Promise<void> {
  // Check that main heading exists
  await expect(page.locator('h1')).toBeVisible()

  // Check that buttons are accessible
  const buttons = page.locator('button, [role="button"]')
  const buttonCount = await buttons.count()
  expect(buttonCount).toBeGreaterThan(0)

  // Check that main navigation exists
  await expect(page.locator('nav, [role="navigation"]')).toBeVisible()
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(page: Page): Promise<void> {
  await page.keyboard.press('Tab')
  const focusedElement = page.locator(':focus')
  await expect(focusedElement).toBeVisible()
}

/**
 * Verify page has content for error cases
 */
export async function verifyPageHasContent(page: Page): Promise<void> {
  const hasContent = await page.locator('body *').count()
  expect(hasContent).toBeGreaterThan(0)
}