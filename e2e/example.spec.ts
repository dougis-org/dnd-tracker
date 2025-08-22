import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/DnD Tracker/);
  
  // Check for common elements
  await expect(page.locator('body')).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Test basic navigation if there are nav links
  // This is a placeholder test - update based on actual UI
  await expect(page.locator('body')).toBeVisible();
});