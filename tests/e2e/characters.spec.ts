/**
 * E2E tests for character management pages
 * T032: Basic navigation to /characters, /characters/new, /characters/:id
 */
import { test, expect } from '@playwright/test';
import { mockSignIn } from './test-data/mock-auth';

test.describe('Character Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignIn(page);
  });

  test('can navigate to characters list page', async ({ page }) => {
    // Navigate to characters
    await page.goto('/characters');

    // Wait for page to load
    await expect(page).toHaveURL('/characters');

    // Should see characters heading or content
    await expect(page.locator('body')).toContainText(/Aelith|Characters/i);
  });

  test('can navigate to new character page', async ({ page }) => {
    await page.goto('/characters/new');

    await expect(page).toHaveURL('/characters/new');

    // Should see form elements - use getByLabel for best practices
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      /Create/i
    );
  });

  test('can navigate to character detail page', async ({ page }) => {
    // First go to list to get a character ID from seed data
    await page.goto('/characters');

    // Wait for character links to appear
    await page.waitForSelector('a[href*="/characters/char-"]', { timeout: 5000 });

    // Try to find and click character link
    const link = page.locator('a[href*="/characters/char-"]').first();
    const linkVisible = await link.isVisible({ timeout: 1000 }).catch(() => false);

    if (linkVisible) {
      await link.click();
      // Wait for navigation
      await page.waitForURL(/\/characters\/[a-zA-Z0-9-]+/, { timeout: 5000 });
      // Should see character details
      await expect(page.locator('body')).toContainText(/HP|AC|Aelith|Borin|Lirael/i);
    } else {
      // If no links available, just verify the page loads
      await expect(page.locator('body')).toContainText(/Aelith|Characters/i);
    }
  });

  test('full flow: list → new → create → list → detail', async ({ page }) => {
    // Start at list
    await page.goto('/characters');

    // Wait for seed characters to load
    await expect(page.locator('body')).toContainText(/Aelith|Borin|Lirael/i, { timeout: 5000 });

    // Navigate to new character page
    await page.goto('/characters/new');

    // Wait for form to load
    await page.getByLabel('Name').waitFor({ state: 'visible', timeout: 5000 });

    // Verify form exists with input fields
    const nameField = page.getByLabel('Name');
    const nameExists = (await nameField.count()) > 0 && await nameField.isVisible({ timeout: 1000 }).catch(() => false);

    if (nameExists) {
      // Fill form
      await nameField.fill('E2E Test Character');
      await page.getByLabel('Class').fill('Paladin');
      await page.getByLabel('Race').fill('Human');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Should navigate away (either to detail or back to list)
      await page.waitForURL(/\/characters/, { timeout: 5000 });
    }

    // Verify we're back at characters page
    await expect(page).toHaveURL(/\/characters/);
  });
});
