/**
 * UI testing utilities
 * Extracted to reduce test complexity
 */
import { Page, expect } from '@playwright/test'

/**
 * Verify dashboard navigation elements
 */
export async function verifyDashboardNavigation(page: Page): Promise<void> {
  await expect(page.locator('text=D&D Tracker')).toBeVisible()
  await expect(page.locator('text=Dashboard')).toBeVisible()
  await expect(page.locator('text=Parties')).toBeVisible()
  await expect(page.locator('text=Encounters')).toBeVisible()
  await expect(page.locator('text=Creatures')).toBeVisible()
}

/**
 * Verify shadcn/ui button components
 */
export async function verifyShadcnButtons(page: Page): Promise<void> {
  const startButton = page.locator('text=Start Free Trial').first()
  await expect(startButton).toBeVisible()

  const buttonClasses = await startButton.getAttribute('class')
  expect(buttonClasses).toContain('inline-flex')
}

/**
 * Verify card components on landing page
 */
export async function verifyLandingPageCards(page: Page): Promise<void> {
  await expect(page.locator('[class*="card"], .rounded-lg')).toHaveCount(3)
}

/**
 * Verify theme styling is applied
 */
export async function verifyThemeStyling(page: Page): Promise<void> {
  const heroSection = page.locator('h1').first()
  const heroStyles = await heroSection.evaluate((el) => {
    return window.getComputedStyle(el)
  })

  expect(heroStyles.backgroundClip || heroStyles.webkitBackgroundClip).toBeTruthy()
}

/**
 * Verify tier limits display on landing page
 */
export async function verifyTierLimitsDisplay(page: Page): Promise<void> {
  await expect(page.locator('text=/1.*party|party.*1/i')).toBeVisible()
  await expect(page.locator('text=/3.*encounter|encounter.*3/i')).toBeVisible()
  await expect(page.locator('text=/10.*creature|creature.*10/i')).toBeVisible()
  await expect(page.locator('text=Free Forever')).toBeVisible()
  await expect(page.locator('text=$0')).toBeVisible()
  await expect(page.locator('text=/upgrade|premium|unlock/i')).toBeVisible()
}

/**
 * Get computed styles for an element
 */
export async function getElementStyles(page: Page, selector: string): Promise<{
  fontSize: string
  fontWeight: string
  display: string
}> {
  const element = page.locator(selector).first()
  return await element.evaluate((el) => {
    const styles = window.getComputedStyle(el)
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      display: styles.display,
    }
  })
}