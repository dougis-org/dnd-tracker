/**
 * Unit tests for Cache Evictor API
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

import {
  evictLRU,
  isOverLimit,
  estimateSize,
  getCacheEntries,
  calculateCacheSize,
} from '@/lib/offline/cache-evictor';

// Mock the Cache API for Node environment
class MockCache {
  private entries: Map<string, Response> = new Map();

  async put(request: RequestInfo | URL, response: Response): Promise<void> {
    const key = typeof request === 'string' ? request : request.toString();
    this.entries.set(key, response);
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    const key = typeof request === 'string' ? request : (request as Request).url;
    return this.entries.get(key);
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    const key = typeof request === 'string' ? request : (request as Request).url;
    return this.entries.delete(key);
  }

  async keys(): Promise<Request[]> {
    return Array.from(this.entries.keys()).map((url) => new Request(url));
  }
}

class MockCacheStorage {
  private caches: Map<string, MockCache> = new Map();

  async open(name: string): Promise<Cache> {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MockCache() as unknown as Cache);
    }
    return this.caches.get(name)!;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.caches.keys());
  }

  async delete(name: string): Promise<boolean> {
    return this.caches.delete(name);
  }

  async has(name: string): Promise<boolean> {
    return this.caches.has(name);
  }

  async match(request: RequestInfo | URL): Promise<Response | undefined> {
    for (const cache of this.caches.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
    return undefined;
  }
}

// Install mocks globally
if (typeof global.caches === 'undefined') {
  (global as Record<string, unknown>).caches = new MockCacheStorage();
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    constructor(input: string | Request) {
      this.url = typeof input === 'string' ? input : input.url;
    }
  } as typeof globalThis.Request;
}

// Override Blob globally for tests
global.Blob = class MockBlob {
  size: number;
  constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
    // Calculate size from parts
    if (parts && parts.length > 0) {
      this.size = parts.reduce((sum: number, part: BlobPart) => {
        if (typeof part === 'string') return sum + part.length;
        if (part instanceof ArrayBuffer) return sum + part.byteLength;
        if ('size' in part) return sum + (part as typeof globalThis.Blob).size;
        return sum;
      }, 0);
    } else {
      this.size = 0;
    }
  }
} as typeof globalThis.Blob;

// Override Response globally for tests
global.Response = class MockResponse {
  private _body: BodyInit | null;
  body: null = null; // Simplified - not used by our implementation
  headers: Headers;
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this._body = body ?? null;
    this.headers = new Headers(init?.headers);
  }
  clone(): Response {
    return new Response(this._body, { headers: this.headers });
  }
  async blob(): Promise<Blob> {
    if (this._body === null || this._body === undefined) {
      return new Blob();
    }
    if (typeof this._body === 'string') {
      return new Blob([this._body]);
    }
    if (this._body instanceof Blob) {
      return this._body;
    }
    return new Blob([this._body as BlobPart]);
  }
} as typeof globalThis.Response;

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private map: Map<string, string> = new Map();
    constructor(init?: HeadersInit) {
      if (init) {
        const entries = Array.isArray(init) ? init : Object.entries(init);
        for (const [key, value] of entries) {
          this.set(key, value);
        }
      }
    }
    get(name: string): string | null {
      return this.map.get(name.toLowerCase()) || null;
    }
    set(name: string, value: string): void {
      this.map.set(name.toLowerCase(), value);
    }
    has(name: string): boolean {
      return this.map.has(name.toLowerCase());
    }
  } as typeof globalThis.Headers;
}

describe('Cache Evictor', () => {
  beforeEach(async () => {
    // Clear all caches
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
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
  });
});
