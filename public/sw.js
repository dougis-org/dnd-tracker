/**
 * Service Worker: App Shell Precaching & Runtime Caching
 *
 * Responsibilities:
 * - Precache app shell assets on install
 * - Implement runtime caching strategies (cache-first for static, network-first for APIs)
 * - Handle cache eviction with size limits
 * - Manage offline queue and sync on reconnect
 * - Emit lifecycle events to clients via postMessage
 *
 * This file will be populated with:
 * - install event: precache app shell from manifest
 * - activate event: clean old caches, claim clients
 * - fetch event: apply caching strategies
 * - message event: handle client commands
 */

/* global URL */

// Cache names
const CACHE_VERSION = '1';
const PRECACHE_NAME = `precache-v${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `runtime-v${CACHE_VERSION}`;

// Precache manifest (in production, this would be injected during build)
const PRECACHE_URLS = [
  '/',
  '/favicon.ico',
  // Note: In production, use workbox or similar to inject actual hashed URLs
];

// Install event - precache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Install event - precaching app shell');

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(PRECACHE_NAME);
        await cache.addAll(PRECACHE_URLS);
        console.log(
          '[SW] App shell precached:',
          PRECACHE_URLS.length,
          'assets'
        );

        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('[SW] Precache failed:', error);
        throw error;
      }
    })()
  );
});

// Activate event - cleanup and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event - cleaning up old caches');

  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      const cachesToDelete = cacheNames.filter((name) => {
        return name !== PRECACHE_NAME && name !== RUNTIME_CACHE_NAME;
      });

      await Promise.all(
        cachesToDelete.map((name) => {
          console.log('[SW] Deleting old cache:', name);
          return caches.delete(name);
        })
      );

      // Claim all clients immediately
      await self.clients.claim();
      console.log('[SW] Service worker activated and claimed clients');

      // Notify clients that SW is ready
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_ACTIVATED' });
      });
    })()
  );
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Apply caching strategies based on request type
  if (isStaticAsset(request)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request)) {
    // Network-first for API requests
    event.respondWith(networkFirst(request));
  } else {
    // Default: network with cache fallback
    event.respondWith(networkWithCacheFallback(request));
  }
});

// Helper functions for caching strategies

function isStaticAsset(request) {
  const url = request.url;
  return (
    url.includes('.js') ||
    url.includes('.css') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.jpeg') ||
    url.includes('.gif') ||
    url.includes('.svg') ||
    url.includes('.ico') ||
    url.includes('.woff') ||
    url.includes('.woff2')
  );
}

function isApiRequest(request) {
  const url = request.url;
  return url.includes('/api/') || url.includes('/sync/');
}

async function cacheFirst(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    // Return offline page or error
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function networkWithCacheFallback(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Message event - handle client commands
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  // TODO: Handle commands like SKIP_WAITING, CHECK_UPDATE, etc.
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
