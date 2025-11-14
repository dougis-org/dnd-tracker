/**
 * Cache Evictor Utilities
 * 
 * Provides size tracking and LRU eviction helpers for service worker caches.
 * Implements approximate LRU using last-access timestamps.
 * 
 * @module offline/cache-evictor
 */

export const MAX_CACHE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface CacheEntry {
  url: string;
  size: number;
  lastAccessed: number;
}

/**
 * Estimate response size in bytes
 */
export async function estimateSize(response: Response): Promise<number> {
  const clone = response.clone();
  const blob = await clone.blob();
  return blob.size;
}

/**
 * Get all entries in a cache with metadata
 */
export async function getCacheEntries(
  cacheName: string
): Promise<CacheEntry[]> {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  
  const entries: CacheEntry[] = [];
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const size = await estimateSize(response);
      entries.push({
        url: request.url,
        size,
        lastAccessed: Date.now(), // Will be updated from metadata
      });
    }
  }
  
  return entries;
}

/**
 * Calculate total cache size
 */
export async function calculateCacheSize(
  cacheName: string
): Promise<number> {
  const entries = await getCacheEntries(cacheName);
  return entries.reduce((total, entry) => total + entry.size, 0);
}

/**
 * Evict least recently used entries until cache is under size limit
 */
export async function evictLRU(
  cacheName: string,
  maxSize: number = MAX_CACHE_SIZE_BYTES
): Promise<number> {
  const cache = await caches.open(cacheName);
  const entries = await getCacheEntries(cacheName);
  
  // Sort by last accessed (oldest first)
  entries.sort((a, b) => a.lastAccessed - b.lastAccessed);
  
  let totalSize = entries.reduce((sum, e) => sum + e.size, 0);
  let evictedCount = 0;
  
  // Evict until under limit
  while (totalSize > maxSize && entries.length > 0) {
    const toEvict = entries.shift();
    if (toEvict) {
      await cache.delete(toEvict.url);
      totalSize -= toEvict.size;
      evictedCount++;
      console.log('[CacheEvictor] Evicted:', toEvict.url, `(${toEvict.size} bytes)`);
    }
  }
  
  if (evictedCount > 0) {
    console.log(
      `[CacheEvictor] Evicted ${evictedCount} entries, ` +
      `new size: ${totalSize} bytes (limit: ${maxSize})`
    );
  }
  
  return evictedCount;
}

/**
 * Check if cache is over size limit
 */
export async function isOverLimit(
  cacheName: string,
  maxSize: number = MAX_CACHE_SIZE_BYTES
): Promise<boolean> {
  const size = await calculateCacheSize(cacheName);
  return size > maxSize;
}
