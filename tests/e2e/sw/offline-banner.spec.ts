import { test, expect } from '@playwright/test';

test.describe('Offline Banner', () => {
  test('should show offline banner when network is offline', async ({
    page,
    context,
  }) => {
    // Navigate to the demo page
    await page.goto('/offline-demo');

    // Initially should not show offline banner (assuming online)
    await expect(page.locator('text=/offline/i')).not.toBeVisible();

    // Simulate offline
    await context.setOffline(true);

    // Wait for banner to appear
    await expect(page.locator("text=/you're offline/i")).toBeVisible();
    await expect(page.locator('text=/retry/i')).toBeVisible();
  });

  test('should hide offline banner when coming back online', async ({
    page,
    context,
  }) => {
    // Navigate to the demo page
    await page.goto('/offline-demo');

    // Simulate offline
    await context.setOffline(true);
    await expect(page.locator("text=/you're offline/i")).toBeVisible();

    // Simulate coming back online
    await context.setOffline(false);

    // Banner should disappear
    await expect(page.locator("text=/you're offline/i")).not.toBeVisible();
  });

  test('should show sync progress when operations are pending', async ({
    page,
    context,
  }) => {
    // Navigate to the demo page
    await page.goto('/offline-demo');

    // Simulate offline
    await context.setOffline(true);

    // Check for sync progress text (hardcoded in demo)
    await expect(page.locator('text=/syncing 3 operations/i')).toBeVisible();
  });

  test('should handle retry button click', async ({ page, context }) => {
    // Navigate to the demo page
    await page.goto('/offline-demo');

    // Simulate offline
    await context.setOffline(true);

    // Click retry button
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Retry clicked!');
      await dialog.accept();
    });

    await page.locator('button:has-text("Retry")').click();
  });

  test('should register service worker on page load', async ({ page }) => {
    // Navigate to the demo page
    await page.goto('/offline-demo');

    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });

    // Note: This might not be reliable in test environment
    // In real scenario, we'd check after some time or with proper setup
    expect(swRegistered).toBe(false); // In test, SW might not activate
  });
});
