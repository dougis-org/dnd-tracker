import { test, expect } from '@playwright/test';
import { mockSignIn } from './test-data/mock-auth';

test('dashboard shows widgets and quick actions', async ({ page }) => {
  await mockSignIn(page, '/dashboard');

  // Use role selector to avoid strict mode violations with multiple text matches
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Active Parties')).toBeVisible();

  // Open quick actions area and click New Party
  const newParty = page.getByRole('button', { name: 'New Party' });
  await expect(newParty).toBeVisible();
  await newParty.click();

  // Wait for navigation
  await page.waitForURL('/parties/new', { timeout: 5000 });

  // Should either show Create New Party form or fallback
  await expect(page.locator('body')).toContainText(/Create New Party|On the roadmap/i, { timeout: 5000 });
});
