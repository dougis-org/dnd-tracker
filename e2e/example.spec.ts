import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/DnD Tracker/);
  
  // Check for common elements
  await expect(page.locator('body')).toBeVisible();
});

test('navigation menu is visible', async ({ page }) => {
  await page.goto('/');

  // This is a placeholder test - update selector based on actual UI
  // For example, look for a <nav> element or an element with a specific role or test ID.
  await expect(page.getByRole('navigation')).toBeVisible();
});