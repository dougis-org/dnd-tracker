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

// Cache names
const CACHE_VERSION = '1';
const PRECACHE_NAME = `precache-v${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `runtime-v${CACHE_VERSION}`;

// Install event - precache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  // TODO: Load precache manifest and cache assets
  // For now, skip waiting to activate immediately
  event.waitUntil(self.skipWaiting());
});

// Activate event - cleanup and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      // TODO: Delete old caches
      // Claim all clients immediately
      await self.clients.claim();
      console.log('[SW] Service worker activated and claimed clients');
    })()
  );
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  // TODO: Implement caching strategies
  // For now, pass through to network
  event.respondWith(fetch(event.request));
});

// Message event - handle client commands
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  // TODO: Handle commands like SKIP_WAITING, CHECK_UPDATE, etc.
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
