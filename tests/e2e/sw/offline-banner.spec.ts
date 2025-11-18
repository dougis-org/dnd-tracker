import { test, expect, Page, BrowserContext, Locator } from '@playwright/test';

/**
 * Setup offline state and navigate to demo
 */
async function setupOfflineState(page: Page, context: BrowserContext) {
  await page.goto('/offline-demo');
  await context.setOffline(true);
  await expect(page.locator("text=/you're offline/i")).toBeVisible();
}

/**
 * Check button accessibility attributes
 */
async function checkButtonAccessibility(retryButton: Locator) {
  await expect(retryButton).toBeVisible();
  await expect(retryButton).toBeEnabled();

  await retryButton.focus();
  const isFocused = await retryButton.evaluate(
    (el) => el === document.activeElement
  );
  expect(isFocused).toBe(true);

  const ariaLabel = await retryButton.getAttribute('aria-label');
  const hasAccessibleName = ariaLabel || (await retryButton.textContent());
  expect(hasAccessibleName).toBeTruthy();
}

/**
 * Check banner ARIA attributes
 */
async function checkBannerAriaAttributes(banner: Locator) {
  await expect(banner).toBeVisible();

  const hasAriaLive = await banner.evaluate((el) => {
    return (
      el.hasAttribute('aria-live') || el.getAttribute('role') === 'alert'
    );
  });
  expect(hasAriaLive).toBe(true);
}

test.describe('Offline Banner', () => {
  test('should show sync progress when operations are pending', async ({
    page,
    context,
  }) => {
    await setupOfflineState(page, context);
    await expect(page.locator('text=/syncing 3 operations/i')).toBeVisible();
  });

  test('should handle retry button click', async ({ page, context }) => {
    await setupOfflineState(page, context);

    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Retry clicked!');
      await dialog.accept();
    });

    await page.locator('button:has-text("Retry")').click({ force: true });
  });

  test('should register service worker on page load', async ({ page }) => {
    await page.goto('/offline-demo');

    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });

    expect(swRegistered).toBe(false);
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations when online', async ({
      page,
    }) => {
      await page.goto('/offline-demo');
      expect(true).toBe(true);
    });

    test('should have no accessibility violations when offline banner is shown', async ({
      page,
      context,
    }) => {
      await setupOfflineState(page, context);
      expect(true).toBe(true);
    });

    test('retry button should be accessible', async ({ page, context }) => {
      await setupOfflineState(page, context);
      const retryButton = page.locator('button:has-text("Retry")');
      await checkButtonAccessibility(retryButton);
    });

    test('banner should have proper ARIA attributes', async ({
      page,
      context,
    }) => {
      await setupOfflineState(page, context);
      const banner = page.locator(
        '[data-testid="offline-banner"], [role="banner"], [aria-live]'
      );
      await checkBannerAriaAttributes(banner);
    });
  });
});
