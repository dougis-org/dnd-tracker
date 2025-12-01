'use client';

/**
 * Dashboard Container Component (T010)
 *
 * Main dashboard container that:
 * - Fetches dashboard data using SWR on mount
 * - Shows animated skeleton screen while loading
 * - Handles errors with retry button (max 3 attempts)
 * - Routes to appropriate content (empty state or dashboard content)
 *
 * Feature 016: User Dashboard with Real Data
 */

import React, { useState } from 'react';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardData, DashboardApiError, isRetryableError } from '@/lib/dashboardApi';
import type { DashboardPageData } from '@/types/dashboard';
import { logger } from '@/lib/utils/logger';
import DashboardContent from './DashboardContent';
import ErrorState from './ErrorState';

interface DashboardProps {
  /**
   * Maximum number of retry attempts for 5xx errors
   * Default: 3 per FR-009
   */
  maxRetries?: number;
}

/**
 * Loading skeleton while fetching dashboard data
 */
function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-2 w-full mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard component with data fetching and error handling
 *
 * Uses SWR with:
 * - revalidateOnFocus: false (per SC-010, no client-side caching)
 * - Server cache headers enforce no-cache
 *
 * @param maxRetries - Maximum number of retry attempts for 5xx errors
 */
function Dashboard({ maxRetries = 3 }: DashboardProps): React.ReactElement {
  const [retryCount, setRetryCount] = useState(0);

  // Fetch dashboard data with SWR
  // Cache disabled per SC-010: fresh data on each load
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<DashboardPageData, DashboardApiError>(
    '/api/v1/dashboard/usage',
    getDashboardData,
    {
      // Disable all caching per SC-010
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      // Retry policy for 5xx errors
      shouldRetryOnError: (err) => {
        if (err instanceof DashboardApiError) {
          return isRetryableError(err);
        }
        return true;
      },
      dedupingInterval: 0, // Disable deduping to ensure always fresh
      focusThrottleInterval: 0, // Disable focus throttling
    }
  );

  const handleRetry = async (): Promise<void> => {
    if (retryCount >= maxRetries) {
      logger.warn('Maximum retry attempts exceeded', {
        context: { retryCount, maxRetries },
      });
      return;
    }

    setRetryCount(retryCount + 1);
    logger.info('Retrying dashboard fetch', {
      context: { retryCount: retryCount + 1, maxRetries },
    });

    try {
      await mutate();
    } catch (err) {
      logger.error('Retry attempt failed', {
        context: {
          error: err instanceof Error ? err.message : 'Unknown error',
          retryCount: retryCount + 1,
        },
      });
    }
  };

  const containerClasses = 'container mx-auto px-4 md:px-6 py-8';
  const headerClasses = 'text-3xl md:text-4xl font-bold mb-8';

  if (isLoading || !data) {
    return (
      <div className={containerClasses}>
        <h1 className={headerClasses}>Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <h1 className={headerClasses}>Dashboard</h1>
        <ErrorState
          error={error}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Dashboard</h1>
      <DashboardContent data={data} />
    </div>
  );
}

export default Dashboard;
