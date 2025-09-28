/**
 * Authentication test utilities
 * Extracted to reduce test complexity
 */
import { Page, expect } from '@playwright/test'

/**
 * Navigate to authentication flow
 */
export async function navigateToAuth(page: Page): Promise<void> {
  await page.goto('/')
  await page.click('text=Start Free Trial')
  await page.waitForURL(/sign-up|auth/, { timeout: 10000 })
}

/**
 * Verify authentication page elements
 */
export async function verifyAuthPageElements(page: Page): Promise<void> {
  await expect(page.locator('[data-clerk-element], .cl-rootBox, form')).toBeVisible()
}

/**
 * Navigate to profile setup and verify form elements
 */
export async function verifyProfileSetupForm(page: Page): Promise<void> {
  await page.goto('/profile/setup')

  // Verify all form fields are present
  await expect(page.locator('input[name="displayName"], input[id*="displayName"]')).toBeVisible()
  await expect(page.locator('select[name="dndRuleset"], select[id*="dndRuleset"]')).toBeVisible()
  await expect(page.locator('select[name="experienceLevel"], select[id*="experienceLevel"]')).toBeVisible()
  await expect(page.locator('select[name="role"], select[id*="role"]')).toBeVisible()
}

/**
 * Fill profile form with test data
 */
export async function fillProfileForm(page: Page): Promise<void> {
  await page.fill('input[name="displayName"], input[id*="displayName"]', 'Test User')
  await page.selectOption('select[name="dndRuleset"], select[id*="dndRuleset"]', '5e')
  await page.selectOption('select[name="experienceLevel"], select[id*="experienceLevel"]', 'intermediate')
  await page.selectOption('select[name="role"], select[id*="role"]', 'dm')
}

/**
 * Verify profile form values
 */
export async function verifyProfileFormValues(page: Page): Promise<void> {
  await expect(page.locator('input[name="displayName"], input[id*="displayName"]')).toHaveValue('Test User')
}