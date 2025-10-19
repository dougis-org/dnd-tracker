/**
 * E2E tests for user profile setup and management
 * Covers Scenarios 2-4 from quickstart.md
 *
 * Scenario 2: First-time profile setup (lines 61-105)
 * Scenario 3: Skip profile setup (lines 109-143)
 * Scenario 4: Update profile in settings (lines 146-186)
 */
import { test, expect } from '@playwright/test';

test.describe('Profile Setup and Management', () => {
  test.describe('Scenario 2: First-Time Profile Setup', () => {
    test('should complete profile setup and redirect to dashboard', async ({ page }) => {
      // Navigate directly to profile setup page
      // Note: In production, user would be redirected here after auth
      await page.goto('/profile-setup');

      // Verify profile setup page loaded
      await expect(page.locator('h1, h2, h3')).toContainText(/Welcome to D&D Tracker|Set Up Your D&D Profile/i);

      // Fill out profile form
      await page.fill('input[name="displayName"]', 'Dungeon Master Alex');

      // Timezone should default to UTC
      const timezoneInput = page.locator('input[name="timezone"]');
      await expect(timezoneInput).toHaveValue('UTC');

      // Update timezone
      await page.fill('input[name="timezone"]', 'America/New_York');

      // D&D Edition should default to "5th Edition"
      const editionInput = page.locator('input[name="dndEdition"]');
      await expect(editionInput).toHaveValue('5th Edition');

      // Select experience level
      await page.selectOption('select[name="experienceLevel"]', 'intermediate');

      // Select primary role
      await page.selectOption('select[name="primaryRole"]', 'dm');

      // Submit form
      await page.click('button:has-text("Complete Profile")');

      // Verify redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });

      // Verify dashboard loaded
      await expect(page.locator('h1, h2')).toContainText(/dashboard/i);
    });
  });

  test.describe('Scenario 3: Skip Profile Setup', () => {
    test('should allow skipping profile setup', async ({ page }) => {
      // Navigate to profile setup page
      await page.goto('/profile-setup');

      // Verify skip button is present
      const skipButton = page.locator('button:has-text("Skip for now")');
      await expect(skipButton).toBeVisible();

      // Click skip button
      await skipButton.click();

      // Verify redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });

      // Verify dashboard loaded
      await expect(page.locator('h1, h2')).toContainText(/dashboard/i);

      // User should still be able to access settings to complete profile later
      await page.goto('/settings/profile');
      await expect(page.locator('h1, h2')).toContainText(/Profile Settings|Your D&D Profile/i);
    });
  });

  test.describe('Scenario 4: Update Profile in Settings', () => {
    test('should update profile from settings page', async ({ page }) => {
      // Navigate to settings profile page
      await page.goto('/settings/profile');

      // Verify settings page loaded
      await expect(page.locator('h1')).toContainText(/Profile Settings/i);
      await expect(page.locator('h3')).toContainText(/Your D&D Profile/i);

      // Update display name
      const displayNameInput = page.locator('input[name="displayName"]');
      await displayNameInput.clear();
      await displayNameInput.fill('DM Alex the Great');

      // Update experience level
      await page.selectOption('select[name="experienceLevel"]', 'experienced');

      // Update primary role
      await page.selectOption('select[name="primaryRole"]', 'both');

      // Submit form
      await page.click('button:has-text("Save Changes")');

      // Verify success message appears
      await expect(page.locator('text=/Profile updated successfully|success/i')).toBeVisible({
        timeout: 3000,
      });

      // Verify we stay on settings page (no redirect)
      expect(page.url()).toContain('/settings/profile');

      // Verify form still shows updated values
      await expect(displayNameInput).toHaveValue('DM Alex the Great');
      await expect(page.locator('select[name="experienceLevel"]')).toHaveValue('experienced');
      await expect(page.locator('select[name="primaryRole"]')).toHaveValue('both');
    });
  });
});
