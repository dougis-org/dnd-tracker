import { test, expect } from '@playwright/test';

test('dashboard shows widgets and quick actions', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByText('Dashboard')).toBeVisible();
  await expect(page.getByText('Active Parties')).toBeVisible();

  // Open quick actions area and click New Party
  const newParty = page.getByRole('link', { name: 'New Party' });
  await expect(newParty).toBeVisible();
  await newParty.click();

  // Expect NotImplemented fallback after clicking an unimplemented route
  await expect(page.getByText(/on the roadmap/i)).toBeVisible();
});
