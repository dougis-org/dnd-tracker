import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load the landing page without errors', async ({ page }) => {
    await page.goto('/');

    // Check that page loaded
    await expect(page).toHaveTitle(/D&D Tracker/i);

    // Check for main content
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    // Check initial theme (should be light or dark)
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');

    // Click theme toggle
    await themeToggle.click();

    // Wait for theme change by polling until the class attribute is different
    await expect(async () => {
      const newClass = await html.getAttribute('class');
      expect(newClass).not.toBe(initialClass);
    }).toPass();
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check for errors
    expect(consoleErrors).toHaveLength(0);
  });
});
