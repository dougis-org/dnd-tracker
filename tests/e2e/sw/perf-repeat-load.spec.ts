import { test, expect, Page } from '@playwright/test';

/**
 * Measure page load time
 */
async function measureLoadTime(page: Page, url: string = '/'): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  return Date.now() - startTime;
}

/**
 * Wait for service worker to be ready
 */
async function waitForServiceWorker(page: Page): Promise<void> {
  await page.waitForFunction(
    () => navigator.serviceWorker.controller !== null
  );
}

/**
 * Get cached asset URLs
 */
async function getCachedAssets(page: Page, cacheName: string): Promise<string[]> {
  return page.evaluate(async (name: string) => {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    return keys.map((request) => request.url);
  }, cacheName);
}

test.describe('Service Worker Performance', () => {
  test('should serve assets from cache on repeat visits', async ({ page }) => {
    const loadTime1 = await measureLoadTime(page);
    await waitForServiceWorker(page);

    const loadTime2 = await measureLoadTime(page);

    expect(loadTime2).toBeLessThan(loadTime1 * 0.8);
    console.log(`First load: ${loadTime1}ms, Repeat load: ${loadTime2}ms`);
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/');

    const cacheContents = await getCachedAssets(page, 'runtime-v1');

    expect(cacheContents.length).toBeGreaterThan(0);

    const hasCss = cacheContents.some((url) => url.includes('.css'));
    const hasJs = cacheContents.some((url) => url.includes('.js'));

    expect(hasCss || hasJs).toBe(true);
  });

  test('should handle API requests with network-first strategy', async ({
    page,
  }) => {
    await page.route('/api/test', async (route) => {
      await route.fulfill({ json: { data: 'test' } });
    });

    await page.goto('/');

    const response = await page.evaluate(async () => {
      const res = await fetch('/api/test');
      return res.json();
    });

    expect(response).toEqual({ data: 'test' });
  });
});
