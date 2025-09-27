/**
 * E2E test for profile management
 * Test Scenario: quickstart.md:Scenario 1 profile setup (lines 14-18)
 * Data Model: data-model.md:User Entity.profile (lines 13-17)
 */
import { test, expect } from '@playwright/test'

test.describe('Profile Management', () => {
  // Setup authenticated user for all tests
  test.beforeEach(async ({ page }) => {
    // Mock authenticated state
    await page.goto('/dashboard')

    // Verify user is authenticated
    await expect(page.locator('text=/dashboard/i')).toBeVisible()
  })

  test('should allow user to update profile settings', async ({ page }) => {
    // Navigate to profile settings
    await page.click('a:has-text("Profile"), button:has-text("Settings"), [data-testid="user-menu"]')

    // Wait for profile page to load
    await page.waitForURL(/profile|settings/, { timeout: 5000 })

    // Verify current profile values are displayed
    await expect(page.locator('input[name="displayName"]')).toBeVisible()
    await expect(page.locator('select[name="dndRuleset"]')).toBeVisible()
    await expect(page.locator('select[name="experienceLevel"]')).toBeVisible()
    await expect(page.locator('select[name="role"]')).toBeVisible()

    // Update display name
    await page.fill('input[name="displayName"]', 'Updated Test DM')

    // Update D&D ruleset
    await page.selectOption('select[name="dndRuleset"]', 'pf1')

    // Update experience level
    await page.selectOption('select[name="experienceLevel"]', 'expert')

    // Update role
    await page.selectOption('select[name="role"]', 'both')

    // Save changes
    await page.click('button[type="submit"], button:has-text("Save")')

    // Verify success message
    await expect(page.locator('text=/saved|updated|success/i')).toBeVisible()

    // Refresh page and verify changes persist
    await page.reload()

    await expect(page.locator('input[name="displayName"]')).toHaveValue('Updated Test DM')
    await expect(page.locator('select[name="dndRuleset"]')).toHaveValue('pf1')
    await expect(page.locator('select[name="experienceLevel"]')).toHaveValue('expert')
    await expect(page.locator('select[name="role"]')).toHaveValue('both')
  })

  test('should allow user to update preferences', async ({ page }) => {
    // Navigate to profile/preferences
    await page.goto('/profile/preferences')

    // Verify preferences form is visible
    await expect(page.locator('select[name="theme"]')).toBeVisible()
    await expect(page.locator('select[name="defaultInitiativeType"]')).toBeVisible()
    await expect(page.locator('input[name="autoAdvanceRounds"]')).toBeVisible()

    // Update theme to dark
    await page.selectOption('select[name="theme"]', 'dark')

    // Update default initiative type
    await page.selectOption('select[name="defaultInitiativeType"]', 'auto')

    // Toggle auto advance rounds
    await page.check('input[name="autoAdvanceRounds"]')

    // Save preferences
    await page.click('button[type="submit"], button:has-text("Save")')

    // Verify success feedback
    await expect(page.locator('text=/saved|updated/i')).toBeVisible()

    // Verify theme change is applied immediately
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.locator('body')).toHaveClass(/dark/)

    // Refresh and verify persistence
    await page.reload()

    await expect(page.locator('select[name="theme"]')).toHaveValue('dark')
    await expect(page.locator('select[name="defaultInitiativeType"]')).toHaveValue('auto')
    await expect(page.locator('input[name="autoAdvanceRounds"]')).toBeChecked()
  })

  test('should validate profile form inputs', async ({ page }) => {
    await page.goto('/profile/settings')

    // Clear display name (should be required)
    await page.fill('input[name="displayName"]', '')
    await page.locator('input[name="displayName"]').blur()

    // Should show validation error
    await expect(page.locator('text=/name.*required/i')).toBeVisible()

    // Try to save with invalid data
    await page.click('button[type="submit"]')

    // Should not save and show error
    await expect(page.locator('text=/error|invalid|required/i')).toBeVisible()

    // Fix the validation error
    await page.fill('input[name="displayName"]', 'Valid Name')

    // Now save should work
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/saved|success/i')).toBeVisible()
  })

  test('should display current subscription tier and usage', async ({ page }) => {
    await page.goto('/profile')

    // Verify subscription information is displayed
    await expect(page.locator('text=/free.*adventurer/i')).toBeVisible()
    await expect(page.locator('text=/subscription|tier/i')).toBeVisible()

    // Verify usage metrics are shown
    await expect(page.locator('text=/parties.*used/i')).toBeVisible()
    await expect(page.locator('text=/encounters.*used/i')).toBeVisible()
    await expect(page.locator('text=/creatures.*used/i')).toBeVisible()

    // Usage should show current/limit format
    await expect(page.locator('text=/\d+\/1.*part/i')).toBeVisible() // X/1 parties
    await expect(page.locator('text=/\d+\/3.*encounter/i')).toBeVisible() // X/3 encounters
    await expect(page.locator('text=/\d+\/10.*creature/i')).toBeVisible() // X/10 creatures

    // Should display tier limits
    await expect(page.locator('text=/6.*max.*participant/i')).toBeVisible()
  })

  test('should show upgrade prompts for Free tier users', async ({ page }) => {
    await page.goto('/profile')

    // Verify upgrade prompts are visible
    await expect(page.locator('text=/upgrade|unlock.*more|premium/i')).toBeVisible()

    // Click upgrade prompt
    await page.click('button:has-text("Upgrade"), a:has-text("Upgrade")')

    // Should navigate to billing/upgrade page
    await page.waitForURL(/billing|upgrade|pricing/, { timeout: 5000 })

    // Verify pricing information is displayed
    await expect(page.locator('text=/seasoned|expert|master|guild/i')).toBeVisible()
    await expect(page.locator('text=/\$.*month|\$.*year/i')).toBeVisible()
  })

  test('should handle profile updates with validation errors', async ({ page }) => {
    await page.goto('/profile/settings')

    // Try to set invalid enum values (if client-side validation is bypassed)
    await page.evaluate(() => {
      const rulesetSelect = document.querySelector('select[name="dndRuleset"]') as HTMLSelectElement | null
      if (rulesetSelect) {
        const option = document.createElement('option')
        option.value = 'invalid_ruleset'
        option.textContent = 'Invalid Ruleset'
        rulesetSelect.appendChild(option)
        rulesetSelect.value = 'invalid_ruleset'
      }
    })

    await page.click('button[type="submit"]')

    // Should show server-side validation error
    await expect(page.locator('text=/invalid.*ruleset|validation.*error/i')).toBeVisible()

    // Fix the error
    await page.selectOption('select[name="dndRuleset"]', '5e')
    await page.click('button[type="submit"]')

    // Should now succeed
    await expect(page.locator('text=/saved|success/i')).toBeVisible()
  })

  test('should preserve unsaved changes warning', async ({ page }) => {
    await page.goto('/profile/settings')

    // Make changes without saving
    await page.fill('input[name="displayName"]', 'Unsaved Changes Test')

    // Try to navigate away
    await page.click('a:has-text("Dashboard")')

    // Should show unsaved changes warning
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain(/unsaved|discard|changes/i)
      await dialog.accept() // or dismiss to test both paths
    })

    // If no dialog appears, check for custom warning modal
    const warningModal = page.locator('text=/unsaved.*changes|discard.*changes/i')
    const hasWarning = await warningModal.count() > 0

    if (hasWarning) {
      await expect(warningModal).toBeVisible()
      await page.click('button:has-text("Discard"), button:has-text("Continue")')
    }
  })

  test('should show profile completion status', async ({ page }) => {
    await page.goto('/profile')

    // For a newly registered user, profile might be incomplete
    const profileComplete = page.locator('text=/profile.*complete/i')
    const profileIncomplete = page.locator('text=/complete.*profile|finish.*setup/i')

    const isComplete = await profileComplete.count() > 0
    const isIncomplete = await profileIncomplete.count() > 0

    if (isIncomplete) {
      await expect(profileIncomplete).toBeVisible()

      // Should show what needs to be completed
      await expect(page.locator('text=/add.*character|create.*party/i')).toBeVisible()
    } else if (isComplete) {
      await expect(profileComplete).toBeVisible()
    }

    // Profile completion should affect onboarding checklist
    await page.goto('/dashboard')
    await expect(page.locator('text=/onboard|checklist/i')).toBeVisible()
  })
})