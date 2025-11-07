/**
 * E2E tests for character management pages
 * T032: Basic navigation to /characters, /characters/new, /characters/:id
 */
import { test, expect } from '@playwright/test';

test.describe('Character Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('/');
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

    // Should see form elements
    await expect(page.locator('label')).toContainText(/Name/i);
    await expect(page.locator('button')).toContainText(/Create/i);
  });

  test('can navigate to character detail page', async ({ page }) => {
    // First go to list to get a character ID from seed data
    await page.goto('/characters');

    // Wait for list to load
    await page.waitForSelector('a[href*="/characters/"]', { timeout: 5000 });

    // Click first character link
    const firstCharLink = page.locator('a[href*="/characters/"]').first();
    await firstCharLink.click();

    // Should be on detail page
    await expect(page.url()).toMatch(/\/characters\/[a-f0-9]+/);

    // Should see character details
    await expect(page.locator('body')).toContainText(/HP:|AC:/i);
  });

  test('full flow: list → new → create → list → detail', async ({ page }) => {
    // Start at list
    await page.goto('/characters');

    // Navigate to new
    await page.click('text=Create New Character');

    await expect(page).toHaveURL('/characters/new');

    // Fill form
    await page.fill('input[name="name"]', 'E2E Test Character');
    await page.fill('input[name="className"]', 'Paladin');
    await page.fill('input[name="race"]', 'Human');

    // Submit
    await page.click('button:has-text("Create")');

    // Should navigate back to detail page
    await page.waitForURL(/\/characters\/[a-f0-9]+/, { timeout: 5000 });

    // Should see the new character
    await expect(page.locator('body')).toContainText('E2E Test Character');
  });
});
