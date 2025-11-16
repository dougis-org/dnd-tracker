/**
 * Service Worker Registration Helper
 *
 * Provides utilities to register the service worker and expose lifecycle hooks.
 * Handles registration, update detection, and client-side SW state management.
 *
 * Features:
 * - Automatic service worker registration with error handling
 * - Lifecycle callbacks for ready, update, and error events
 * - Periodic update checks (every hour)
 * - State tracking for supported/registered/activated status
 * - Message passing to active service worker
 * - Manual update activation support
 *
 * @module sw/register
 */

/**
 * Callback interface for service worker lifecycle events
 *
 * @interface ServiceWorkerCallbacks
 * @property {function} [onReady] - Called when SW is first activated or ready
 * @property {function} [onUpdate] - Called when SW update is available and activated
 * @property {function} [onError] - Called when SW registration or activation fails
 */
export interface ServiceWorkerCallbacks {
  /**
   * Called when service worker is first activated or ready
   * @param registration - The service worker registration object
   */
  onReady?: (registration: ServiceWorkerRegistration) => void;

  /**
   * Called when service worker update is available and activated
   * @param registration - The service worker registration object
   */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;

  /**
   * Called when service worker registration or activation fails
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
}

/**
 * Service worker state tracking interface
 *
 * @interface ServiceWorkerState
 * @property {boolean} isSupported - Whether service workers are supported in this browser
 * @property {boolean} isRegistered - Whether service worker has been registered
 * @property {boolean} isActivated - Whether service worker is currently activated
 * @property {ServiceWorkerRegistration | null} registration - The SW registration object
 */
export interface ServiceWorkerState {
  /** Whether service workers are supported in this browser */
  isSupported: boolean;

  /** Whether service worker has been registered */
  isRegistered: boolean;

  /** Whether service worker is currently activated */
  isActivated: boolean;

  /** The SW registration object */
  registration: ServiceWorkerRegistration | null;
}

/**
 * Internal state tracking for service worker status
 * @private
 */
const swState: ServiceWorkerState = {
  isSupported: false,
  isRegistered: false,
  isActivated: false,
  registration: null,
};

/**
 * Register the service worker and set up lifecycle callbacks
 *
 * This function handles the complete service worker registration process:
 * 1. Checks for browser support
 * 2. Registers the SW at the specified path
 * 3. Sets up event listeners for lifecycle events
 * 4. Starts periodic update checks
 * 5. Calls appropriate callbacks based on SW state
 *
 * @param swPath - Path to service worker file (default: '/sw.js')
 * @param callbacks - Lifecycle callbacks for ready, update, error events
 * @returns Promise that resolves to the SW registration or null if unsupported/failed
 *
 * @example
 * ```typescript
 * import { registerServiceWorker } from '@/lib/sw/register';
 *
 * registerServiceWorker('/sw.js', {
 *   onReady: (reg) => console.log('SW ready:', reg.scope),
 *   onUpdate: (reg) => console.log('SW updated!'),
 *   onError: (err) => console.error('SW error:', err)
 * });
 * ```
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

    // Check for updates periodically (every hour)
    setInterval(
      () => {
        registration.update().catch((err) => {
          console.warn('[SW] Update check failed:', err);
        });
      },
      60 * 60 * 1000
    );

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    callbacks.onError?.(error as Error);
    return null;
  }
}

/**
 * Get current service worker state
 *
 * Returns a copy of the current service worker state to prevent external mutation.
 *
 * @returns Current service worker state object
 *
 * @example
 * ```typescript
 * import { getServiceWorkerState } from '@/lib/sw/register';
 *
 * const state = getServiceWorkerState();
 * if (state.isActivated) {
 *   console.log('SW is active at:', state.registration?.scope);
 * }
 * ```
 */
export function getServiceWorkerState(): ServiceWorkerState {
  return { ...swState };
}

/**
 * Send message to active service worker
 *
 * Posts a message to the currently active service worker controller.
 * Useful for triggering SW actions like skipping waiting or custom commands.
 *
 * @param message - The message to send (can be any serializable object)
 *
 * @example
 * ```typescript
 * import { postMessageToSW } from '@/lib/sw/register';
 *
 * // Trigger update activation
 * postMessageToSW({ type: 'SKIP_WAITING' });
 *
 * // Send custom command
 * postMessageToSW({ type: 'CLEAR_CACHE', cacheName: 'my-cache' });
 * ```
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
 *
 * Convenience function to immediately activate a waiting service worker update.
 * This will cause the new SW to take control without waiting for page reload.
 *
 * @example
 * ```typescript
 * import { activateUpdate } from '@/lib/sw/register';
 *
 * // When user clicks "Update Now" button
 * activateUpdate();
 * ```
 */
export function activateUpdate(): void {
  postMessageToSW({ type: 'SKIP_WAITING' });
}
