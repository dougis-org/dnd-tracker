/**
 * Service Worker Registration Helper
 *
 * Provides utilities to register the service worker and expose lifecycle hooks.
 * Handles registration, update detection, and client-side SW state management.
 *
 * @module sw/register
 */

export interface ServiceWorkerCallbacks {
  onReady?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isActivated: boolean;
  registration: ServiceWorkerRegistration | null;
}

const swState: ServiceWorkerState = {
  isSupported: false,
  isRegistered: false,
  isActivated: false,
  registration: null,
};

/**
 * Register the service worker and set up lifecycle callbacks
 *
 * @param swPath - Path to service worker file (default: '/sw.js')
 * @param callbacks - Lifecycle callbacks for ready, update, error events
 * @returns Promise<ServiceWorkerRegistration | null>
 */
export async function registerServiceWorker(
  swPath: string = '/sw.js',
  callbacks: ServiceWorkerCallbacks = {}
): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW] Service workers not supported');
    swState.isSupported = false;
    return null;
  }

  swState.isSupported = true;

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register(swPath);
    swState.isRegistered = true;
    swState.registration = registration;

    console.log('[SW] Service worker registered:', registration.scope);

    // Wait for activation
    if (registration.active) {
      swState.isActivated = true;
      callbacks.onReady?.(registration);
    } else {
      // Listen for activation
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              swState.isActivated = true;

              // If this is an update, trigger update callback
              if (navigator.serviceWorker.controller) {
                callbacks.onUpdate?.(registration);
              } else {
                callbacks.onReady?.(registration);
              }
            }
          });
        }
      });
    }

    // Check for updates periodically
    setInterval(
      () => {
        registration.update().catch((err) => {
          console.warn('[SW] Update check failed:', err);
        });
      },
      60 * 60 * 1000
    ); // Check every hour

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    callbacks.onError?.(error as Error);
    return null;
  }
}

/**
 * Get current service worker state
 */
export function getServiceWorkerState(): ServiceWorkerState {
  return { ...swState };
}

/**
 * Send message to active service worker
 */
export function postMessageToSW(message: unknown): void {
  if (typeof window === 'undefined' || !navigator.serviceWorker) {
    return;
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  } else {
    console.warn('[SW] No active service worker to message');
  }
}

/**
 * Trigger service worker update activation (skip waiting)
 */
export function activateUpdate(): void {
  postMessageToSW({ type: 'SKIP_WAITING' });
}
