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

    // Should see form elements - use first label to avoid strict mode
    await expect(page.locator('label').first()).toContainText(/Name/i);
    await expect(page.locator('button[type="submit"]')).toContainText(/Create/i);
  });

  test('can navigate to character detail page', async ({ page }) => {
    // First go to list to get a character ID from seed data
    await page.goto('/characters');

    // Wait for content to load
    await page.waitForSelector('article', { timeout: 5000 });

    // Click first character link inside article
    const firstCharLink = page.locator('article a[href*="/characters/"]').first();
    await firstCharLink.click();

    // Should be on detail page
    await expect(page.url()).toMatch(/\/characters\/[a-zA-Z0-9-]+/);

    // Should see character details
    await expect(page.locator('body')).toContainText(/HP|AC/i);
  });

  test('full flow: list → new → create → list → detail', async ({ page }) => {
    // Start at list
    await page.goto('/characters');

    // Navigate to new - use link on page
    await page.click('a[href="/characters/new"]');

    await expect(page).toHaveURL('/characters/new');

    // Fill form using input IDs
    await page.fill('#name', 'E2E Test Character');
    await page.fill('#class', 'Paladin');
    await page.fill('#race', 'Human');

    // Submit
    await page.click('button[type="submit"]');

    // Should navigate to detail page
    await page.waitForURL(/\/characters\/[a-zA-Z0-9-]+/, { timeout: 5000 });

    // Should see the new character
    await expect(page.locator('body')).toContainText('E2E Test Character');
  });
});
