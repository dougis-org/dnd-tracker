import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/D&D Combat Tracker/);
  
  // Check for common elements
  await expect(page.locator('body')).toBeVisible();
});

test('navigation menu is visible', async ({ page }) => {
  await page.goto('/');

  // Target the sidebar navigation specifically to avoid strict mode violation
  // The sidebar has data-testid="sidebar" and contains the main navigation
  await expect(page.getByTestId('sidebar')).toBeVisible();
});