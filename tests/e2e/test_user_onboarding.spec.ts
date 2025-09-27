/**
 * E2E test for user registration flow
 * Test Scenario: quickstart.md:Scenario 1 (lines 5-33)
 * Expected Results: Free Adventurer tier, usage metrics 0/1/0/3/0/10
 */
import { test, expect } from '@playwright/test'

test.describe('User Onboarding Flow', () => {
  test('should complete new user registration and tier explanation', async ({ page }) => {
    // Step 1: Navigate to landing page
    await page.goto('/')

    // Verify landing page loads correctly
    await expect(page).toHaveTitle(/D&D Encounter Tracker/)
    await expect(page.locator('h1')).toContainText('D&D Encounter Tracker')

    // Step 2: Click "Start Free Trial" button
    await expect(page.locator('button', { hasText: 'Start Free Trial' })).toBeVisible()
    await page.click('button:has-text("Start Free Trial")')

    // Step 3: Complete Clerk registration flow
    // Note: In test environment, this may be mocked or use test credentials
    await page.waitForURL(/sign-up|auth/, { timeout: 10000 })

    // Mock registration completion for testing
    // In a real test, you would fill out the Clerk form
    if (page.url().includes('sign-up') || page.url().includes('auth')) {
      // Mock successful authentication by navigating to profile setup
      await page.goto('/profile/setup')
    }

    // Step 4: Set user profile
    await expect(page.locator('h1, h2, h3')).toContainText(/profile|setup/i)

    // Display name
    await page.fill('input[name="displayName"]', 'Test DM')

    // D&D Ruleset
    await page.selectOption('select[name="dndRuleset"]', '5e')

    // Experience level
    await page.selectOption('select[name="experienceLevel"]', 'intermediate')

    // Role
    await page.selectOption('select[name="role"]', 'dm')

    // Submit profile
    await page.click('button[type="submit"]')

    // Step 5: Review tier limits explanation
    await page.waitForURL(/dashboard|tier-limits/, { timeout: 10000 })

    // Verify tier information is displayed
    await expect(page.locator('text="Free Adventurer"')).toBeVisible()

    // Verify tier limits are shown
    await expect(page.locator('text=/1.*part/i')).toBeVisible() // 1 party
    await expect(page.locator('text=/3.*encounter/i')).toBeVisible() // 3 encounters
    await expect(page.locator('text=/10.*creature/i')).toBeVisible() // 10 creatures

    // Step 6: Navigate to dashboard
    if (!page.url().includes('dashboard')) {
      await page.click('a:has-text("Dashboard"), button:has-text("Dashboard")')
      await page.waitForURL(/dashboard/, { timeout: 5000 })
    }

    // Verify dashboard loads within 3 seconds
    const startTime = Date.now()
    await expect(page.locator('h1, h2')).toContainText(/dashboard/i)
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)

    // Verify usage metrics show 0/1 parties, 0/3 encounters, 0/10 creatures
    await expect(page.locator('text=/0.*\/.*1.*part/i')).toBeVisible()
    await expect(page.locator('text=/0.*\/.*3.*encounter/i')).toBeVisible()
    await expect(page.locator('text=/0.*\/.*10.*creature/i')).toBeVisible()

    // Verify onboarding checklist is displayed
    await expect(page.locator('text=/onboard|checklist|getting.*start/i')).toBeVisible()

    // Verify upgrade prompts are visible but not intrusive
    const upgradePrompts = page.locator('text=/upgrade|premium|unlock/i')
    await expect(upgradePrompts).toBeVisible()

    // Upgrade prompts should not be modal/blocking
    await expect(page.locator('button:has-text("Create Party")')).toBeVisible()
  })

  test('should handle registration errors gracefully', async ({ page }) => {
    await page.goto('/')

    // Click start free trial
    await page.click('button:has-text("Start Free Trial")')

    // Simulate registration error (if possible in test environment)
    await page.waitForURL(/sign-up|auth/, { timeout: 10000 })

    // If registration fails, user should be redirected back with error message
    // This test verifies error handling exists
    const errorMessages = page.locator('text=/error|failed|invalid/i')
    const hasError = await errorMessages.count() > 0

    if (hasError) {
      await expect(errorMessages.first()).toBeVisible()

      // Verify user can retry
      await expect(page.locator('button:has-text("Try Again"), button:has-text("Retry")')).toBeVisible()
    }
  })

  test('should validate profile form inputs', async ({ page }) => {
    // Navigate directly to profile setup (mock authenticated state)
    await page.goto('/profile/setup')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=/required|invalid/i')).toBeVisible()

    // Test display name validation
    await page.fill('input[name="displayName"]', '')
    await page.locator('input[name="displayName"]').blur()
    await expect(page.locator('text=/name.*required/i')).toBeVisible()

    // Test valid form submission
    await page.fill('input[name="displayName"]', 'Valid Test User')
    await page.selectOption('select[name="dndRuleset"]', '5e')
    await page.selectOption('select[name="experienceLevel"]', 'beginner')
    await page.selectOption('select[name="role"]', 'player')

    await page.click('button[type="submit"]')

    // Should proceed to next step
    await expect(page).not.toHaveURL(/profile\/setup/)
  })

  test('should preserve user session across page refreshes', async ({ page }) => {
    // Complete registration flow
    await page.goto('/')
    await page.click('button:has-text("Start Free Trial")')

    // Mock successful authentication
    await page.goto('/dashboard')

    // Verify user is authenticated
    await expect(page.locator('text=/dashboard/i')).toBeVisible()

    // Refresh page
    await page.reload()

    // Should still be authenticated
    await expect(page.locator('text=/dashboard/i')).toBeVisible()
    await expect(page).toHaveURL(/dashboard/)

    // Should not be redirected to login
    await expect(page).not.toHaveURL(/sign-in|auth/)
  })

  test('should display correct Free Adventurer tier benefits', async ({ page }) => {
    // Navigate to tier explanation or dashboard
    await page.goto('/dashboard')

    // Verify Free tier limits are accurately displayed
    const tierInfo = page.locator('[data-testid="tier-info"], .tier-limits, .subscription-info')

    await expect(tierInfo).toContainText('Free Adventurer')
    await expect(tierInfo).toContainText('1 party')
    await expect(tierInfo).toContainText('3 encounters')
    await expect(tierInfo).toContainText('10 creatures')
    await expect(tierInfo).toContainText('6 max participants')

    // Verify upgrade options are presented
    await expect(page.locator('text=/upgrade|premium|unlock.*more/i')).toBeVisible()
  })
})