/**
 * Service Worker Caching Strategies
 *
 * Provides utilities for cache naming, versioning, and strategy application.
 * Used by the service worker to manage different caching approaches.
 */

export const CACHE_VERSION = '1';

export const CACHE_NAMES = {
  PRECACHE: `precache-v${CACHE_VERSION}`,
  RUNTIME: `runtime-v${CACHE_VERSION}`,
  QUEUE: `queue-v${CACHE_VERSION}`,
} as const;

/**
 * Determine if a request should use cache-first strategy
 */
const STATIC_ASSET_REGEX =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|map)(?:\?|$)/i;

/**
 * Determine if a request should use a cache-first strategy.
 * This reduces branching in the original implementation by using a single
 * regular expression instead of multiple `includes` checks, which also
 * improves maintainability and satisfies complexity checks.
 */
export function shouldUseCacheFirst(request: Request): boolean {
  try {
    const url = request.url;
    return STATIC_ASSET_REGEX.test(url);
  } catch (_e) {
    // If url parsing fails, default to network-first for safety
    return false;
  }
}

/**
 * Determine if a request should use network-first strategy
 */
export function shouldUseNetworkFirst(request: Request): boolean {
  const url = request.url;
  return url.includes('/api/') || url.includes('/sync/');
}

/**
 * Generate cache key for a request
 */
export function generateCacheKey(request: Request): string {
  return `${request.method}:${request.url}`;
}

/**
 * Check if response is cacheable
 */
export function isCacheable(response: Response): boolean {
  return response.ok && response.type === 'basic';
}

/**
 * Clean up old caches
 */
export async function cleanupOldCaches(currentCaches: string[]): Promise<void> {
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(
    (name) => !currentCaches.includes(name)
  );

  await Promise.all(
    cachesToDelete.map((name) => {
      console.log('[SW] Deleting old cache:', name);
      return caches.delete(name);
    })
  );
}

/**
 * Get cache size estimate (rough approximation)
 */
export async function getCacheSize(cacheName: string): Promise<number> {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    let totalSize = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('[SW] Failed to get cache size:', error);
    return 0;
  }
}
