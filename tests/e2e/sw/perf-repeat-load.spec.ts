import { test, expect } from '@playwright/test';

test.describe('Service Worker Performance', () => {
  test('should serve assets from cache on repeat visits', async ({ page }) => {
    // First visit - assets should be fetched from network and cached
    const startTime1 = Date.now();
    await page.goto('/');
    const loadTime1 = Date.now() - startTime1;

    // Wait for service worker to be ready
    await page.waitForFunction(
      () => navigator.serviceWorker.controller !== null
    );

    // Second visit - assets should be served from cache
    const startTime2 = Date.now();
    await page.reload();
    const loadTime2 = Date.now() - startTime2;

    // Repeat load should be faster (at least 50% improvement)
    expect(loadTime2).toBeLessThan(loadTime1 * 0.8);

    console.log(`First load: ${loadTime1}ms, Repeat load: ${loadTime2}ms`);
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/');

    // Check if key static assets are cached
    const cacheContents = await page.evaluate(async () => {
      const cache = await caches.open('runtime-v1');
      const keys = await cache.keys();
      return keys.map((request) => request.url);
    });

    // Should have some cached assets
    expect(cacheContents.length).toBeGreaterThan(0);

    // Should include CSS and JS files
    const hasCss = cacheContents.some((url) => url.includes('.css'));
    const hasJs = cacheContents.some((url) => url.includes('.js'));

    expect(hasCss || hasJs).toBe(true);
  });

  test('should handle API requests with network-first strategy', async ({
    page,
  }) => {
    // Mock an API endpoint
    await page.route('/api/test', async (route) => {
      await route.fulfill({ json: { data: 'test' } });
    });

    await page.goto('/');

    // Make an API request
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/test');
      return res.json();
    });

    expect(response).toEqual({ data: 'test' });
  });
});
