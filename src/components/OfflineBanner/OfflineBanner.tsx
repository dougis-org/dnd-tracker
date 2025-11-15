'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerServiceWorker } from '@/lib/sw/register';

interface OfflineBannerProps {
  onRetry?: () => void;
  pendingOperations?: number;
}

export function OfflineBanner({ onRetry, pendingOperations = 0 }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    registerServiceWorker('/sw.js', {
      onUpdate: () => setUpdateAvailable(true),
      onReady: () => {},
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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