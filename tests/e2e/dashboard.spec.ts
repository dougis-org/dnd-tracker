import { test, expect } from '@playwright/test';

test('dashboard shows widgets and quick actions', async ({ page }) => {
  await page.goto('/dashboard');

  // Use role selector to avoid strict mode violations with multiple text matches
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Active Parties')).toBeVisible();

  // Open quick actions area and click New Party
  const newParty = page.getByRole('link', { name: 'New Party' });
  await expect(newParty).toBeVisible();
  await newParty.click();

  // Expect NotImplemented fallback after clicking an unimplemented route
  // Look for the span with "On the roadmap" text
  await expect(page.locator('span')).toContainText('On the roadmap');
});
