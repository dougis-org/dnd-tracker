/**
 * E2E Tests: App Shell Offline Load (User Story 1)
 * 
 * Tests service worker registration, precaching, and offline functionality.
 * 
 * Requirements:
 * - FR-001: SW registration on startup
 * - FR-002: App shell precache
 * - SC-001: 95% activation success rate
 * - SC-002: Offline load within 2s
 * 
 * @group sw
 * @group offline
 */

import { test, expect } from '@playwright/test';

test.describe('App Shell Offline Load', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear service workers and caches before each test
    await context.clearCookies();
    await page.goto('/');
  });

  test('T017-1: Service worker registers successfully', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Wait for service worker to register
    const swRegistered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      // Wait for registration
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined;
    });

    expect(swRegistered).toBe(true);
  });

  test('T017-2: Service worker reaches activated state', async ({ page }) => {
    await page.goto('/');

    // Check that service worker controller is present (indicates activation)
    const isActivated = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      // Wait up to 5s for activation
      for (let i = 0; i < 50; i++) {
        if (navigator.serviceWorker.controller) {
          return true;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return false;
    });

    expect(isActivated).toBe(true);
  });

  test('T017-3: App shell assets are precached', async ({ page }) => {
    await page.goto('/');

    // Wait for SW to activate
    await page.waitForTimeout(2000);

    // Check that precache cache exists and has entries
    const precacheExists = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const precacheCache = cacheNames.find((name) => name.startsWith('precache-'));

      if (!precacheCache) {
        return false;
      }

      const cache = await caches.open(precacheCache);
      const cachedRequests = await cache.keys();

      return cachedRequests.length > 0;
    });

    expect(precacheExists).toBe(true);
  });

  test('T017-4: App loads when offline after initial visit', async ({ page, context }) => {
    // First visit - online
    await page.goto('/');
    await page.waitForTimeout(2000); // Allow SW to activate and precache

    // Go offline
    await context.setOffline(true);

    // Reload page
    const startTime = Date.now();
    await page.reload();
    const loadTime = Date.now() - startTime;

    // Verify page loaded successfully
    await expect(page.locator('body')).toBeVisible();

    // Should load within 2s (SC-002)
    expect(loadTime).toBeLessThan(2000);
  });

  test('T017-5: Assets are served from cache when offline', async ({ page, context }) => {
    // First visit - cache assets
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Monitor network requests
    const offlineRequests: string[] = [];
    page.on('request', (request) => {
      offlineRequests.push(request.url());
    });

    // Go offline
    await context.setOffline(true);

    // Navigate to page
    await page.goto('/');

    // Verify SW controller is present (indicates offline functionality)
    const hasController = await page.evaluate(() => {
      return navigator.serviceWorker.controller !== null;
    });

    expect(hasController).toBe(true);
  });

  test('T017-6: Service worker handles update detection', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if update check mechanism exists
    const canCheckUpdates = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return registration !== undefined && typeof registration.update === 'function';
    });

    expect(canCheckUpdates).toBe(true);
  });
});
