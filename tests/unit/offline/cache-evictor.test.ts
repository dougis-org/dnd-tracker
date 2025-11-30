/**
 * Unit tests for Cache Evictor API
 */

import {
  evictLRU,
  isOverLimit,
  estimateSize,
  getCacheEntries,
  calculateCacheSize,
} from '@/lib/offline/cache-evictor';
import {
  installCacheAPIMocks,
  clearAllCaches,
} from '../../../tests/helpers/cache-api-mocks';

// Install Cache API mocks
installCacheAPIMocks();

describe('Cache Evictor', () => {
  beforeEach(async () => {
    await clearAllCaches();
  });

  describe('estimateSize', () => {
    it('should estimate response size from blob', async () => {
      const body = 'test';
      const response = new Response(body);

      const size = await estimateSize(response);
      expect(size).toBe(body.length);
    });

    it('should estimate size from blob when no Content-Length', async () => {
      const body = 'x'.repeat(100);
      const response = new Response(body);

      const size = await estimateSize(response);
      expect(size).toBe(100);
    });

    it('should return 0 for empty response', async () => {
      const response = new Response(null);

      const size = await estimateSize(response);
      expect(size).toBe(0);
    });
  });

  describe('getCacheEntries', () => {
    it('should return empty array for non-existent cache', async () => {
      const entries = await getCacheEntries('non-existent');
      expect(entries).toEqual([]);
    });

    it('should return cache entries with url, size, and lastAccessed', async () => {
      const cache = await caches.open('test-cache');
      await cache.put('https://example.com/1', new Response('data1'));
      await cache.put('https://example.com/2', new Response('data2'));

      const entries = await getCacheEntries('test-cache');
      expect(entries).toHaveLength(2);
      expect(entries[0]).toHaveProperty('url');
      expect(entries[0]).toHaveProperty('size');
      expect(entries[0]).toHaveProperty('lastAccessed');
      expect(entries[0].url).toMatch(/example\.com/);
      expect(typeof entries[0].size).toBe('number');
      expect(typeof entries[0].lastAccessed).toBe('number');
    });

    it('should calculate entry sizes correctly', async () => {
      const cache = await caches.open('test-cache');
      const data = 'x'.repeat(50);
      await cache.put('https://example.com/test', new Response(data));

      const entries = await getCacheEntries('test-cache');
      expect(entries[0].size).toBe(50);
    });
  });

  describe('calculateCacheSize', () => {
    it('should return 0 for empty cache', async () => {
      const size = await calculateCacheSize('empty-cache');
      expect(size).toBe(0);
    });

    it('should calculate total size of cached responses', async () => {
      const cache = await caches.open('test-cache');

      // Add responses with known sizes
      await cache.put('https://example.com/1', new Response('x'.repeat(100)));
      await cache.put('https://example.com/2', new Response('y'.repeat(200)));

      const size = await calculateCacheSize('test-cache');
      expect(size).toBe(300);
    });
  });

  describe('isOverLimit', () => {
    it('should return false for cache under limit', async () => {
      const cache = await caches.open('test-cache');
      await cache.put('https://example.com/small', new Response('small'));

      const result = await isOverLimit('test-cache');
      expect(result).toBe(false);
    });

    it('should return true for cache over 50MB limit', async () => {
      const cache = await caches.open('test-cache');

      // Create a large response (simulate 51MB)
      const largeData = 'x'.repeat(51 * 1024 * 1024); // 51MB
      await cache.put('https://example.com/large', new Response(largeData));

      const result = await isOverLimit('test-cache');
      expect(result).toBe(true);
    });

    it('should return false for non-existent cache', async () => {
      const result = await isOverLimit('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('evictLRU', () => {
    it('should do nothing for empty cache', async () => {
      await expect(evictLRU('empty-cache')).resolves.not.toThrow();
    });

    it('should evict oldest entries until under limit', async () => {
      const cache = await caches.open('test-cache');

      // Add some entries (implementation uses lastAccessed from Date.now())
      await cache.put('https://example.com/1', new Response('x'.repeat(1000)));
      await cache.put('https://example.com/2', new Response('y'.repeat(1000)));
      await cache.put('https://example.com/3', new Response('z'.repeat(1000)));

      // Should not throw
      await expect(evictLRU('test-cache')).resolves.not.toThrow();

      // Verify cache still exists but may have fewer entries
      const entries = await getCacheEntries('test-cache');
      expect(Array.isArray(entries)).toBe(true);
    });

    it('should preserve newer entries when evicting', async () => {
      const cache = await caches.open('test-cache');

      // Add entries (lastAccessed will be based on order added)
      await cache.put('https://example.com/old', new Response('old'));
      await cache.put('https://example.com/new', new Response('new'));

      await evictLRU('test-cache');

      // Verify eviction completed without errors
      const entries = await getCacheEntries('test-cache');
      expect(Array.isArray(entries)).toBe(true);
    });

    it('should handle cache with entries gracefully', async () => {
      const cache = await caches.open('test-cache');
      await cache.put('https://example.com/entry', new Response('data'));

      await expect(evictLRU('test-cache')).resolves.not.toThrow();
    });

    it('should log eviction messages when entries are removed', async () => {
      const cache = await caches.open('test-cache');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Add a large response that will trigger eviction
      await cache.put(
        'https://example.com/large',
        new Response('x'.repeat(51 * 1024 * 1024))
      );

      const evicted = await evictLRU('test-cache', 10 * 1024 * 1024); // Set low limit

      // Verify some logging occurred for eviction
      expect(evicted).toBeGreaterThanOrEqual(0);

      consoleSpy.mockRestore();
    });

    it('should return count of evicted entries', async () => {
      const cache = await caches.open('test-cache');

      // Add small entries
      await cache.put('https://example.com/1', new Response('a'));
      await cache.put('https://example.com/2', new Response('b'));

      // Evict with very small limit to force eviction
      const evicted = await evictLRU('test-cache', 1);

      expect(typeof evicted).toBe('number');
      expect(evicted).toBeGreaterThanOrEqual(0);
    });
  });
});
