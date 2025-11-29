'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw/register';

/**
 * Service Worker Provider
 *
 * This component handles service worker registration on app startup.
 * It should be placed in the root layout to ensure SW is registered
 * for all pages and is available for offline functionality.
 */
export function ServiceWorkerProvider() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Register service worker
    const registerSW = async () => {
      try {
        await registerServiceWorker('/sw.js', {
          onReady: () => {
            console.log('[SW] Service worker is ready');
          },
          onUpdate: () => {
            console.log('[SW] Service worker update available');
          },
          onError: (error) => {
            console.error('[SW] Service worker registration error:', error);
          },
        });
      } catch (error) {
        console.error('[SW] Failed to register service worker:', error);
      }
    };

    registerSW();
  }, []);

  // This component doesn't render anything
  return null;
}
