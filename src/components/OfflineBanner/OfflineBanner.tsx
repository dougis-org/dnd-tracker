'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerServiceWorker } from '@/lib/sw/register';

interface OfflineBannerProps {
  onRetry?: () => void;
  pendingOperations?: number;
}

/**
 * Setup online/offline event listeners
 */
function setupNetworkListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Setup service worker registration
 */
async function setupServiceWorker(
  onUpdate: () => void,
  onReady: () => void
): Promise<void> {
  try {
    await registerServiceWorker('/sw.js', { onUpdate, onReady });
  } catch (error) {
    console.error('Failed to register service worker:', error);
  }
}

export function OfflineBanner({ onRetry, pendingOperations = 0 }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const cleanup = setupNetworkListeners(handleOnline, handleOffline);
    
    // Call async setupServiceWorker without awaiting (fire and forget)
    setupServiceWorker(() => setUpdateAvailable(true), () => {});

    return cleanup;
  }, []);

  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {updateAvailable ? (
            <span>Update available! Refresh to get the latest version.</span>
          ) : (
            <>
              <span>You're offline. Some features may not be available.</span>
              {pendingOperations > 0 && (
                <span className="ml-2">Syncing {pendingOperations} operations...</span>
              )}
            </>
          )}
        </div>
        <div className="flex gap-2">
          {!isOnline && onRetry && (
            <Button onClick={onRetry} variant="secondary" size="sm">
              Retry
            </Button>
          )}
          {updateAvailable && (
            <Button onClick={() => window.location.reload()} variant="secondary" size="sm">
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}