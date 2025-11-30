'use client';

/**
 * Error State Component (T021)
 *
 * Displays when dashboard API call fails.
 * Shows:
 * - User-friendly error message
 * - Appropriate action based on error type:
 *   - 401: Redirect to login link
 *   - 404: Support link
 *   - 5xx: Retry button (max 3 attempts)
 * - No internal error details (per FR-009)
 *
 * Feature 016: User Dashboard with Real Data
 */

import React from 'react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { DashboardApiError } from '@/lib/dashboardApi';

interface ErrorStateProps {
  /**
   * The dashboard API error that occurred
   */
  error: DashboardApiError;

  /**
   * Current retry attempt count
   */
  retryCount: number;

  /**
   * Maximum allowed retry attempts
   */
  maxRetries: number;

  /**
   * Callback to retry fetching dashboard data
   */
  onRetry: () => Promise<void>;
}

/**
 * Error state component with appropriate actions based on error type
 */
function ErrorState({
  error,
  retryCount,
  maxRetries,
  onRetry,
}: ErrorStateProps): React.ReactElement {
  const isRetryable = retryCount < maxRetries;
  const attemptsRemaining = maxRetries - retryCount;

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Alert variant="destructive" className="w-full max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to Load Dashboard</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{error.userMessage}</p>

          {/* Auth Required: Show login link */}
          {error.statusCode === 401 && (
            <div>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Go to Login
                </Button>
              </Link>
            </div>
          )}

          {/* User Not Found: Show support link */}
          {error.statusCode === 404 && (
            <div>
              <Link href="/help">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>
          )}

          {/* Server Error: Show retry button */}
          {error.statusCode >= 500 && isRetryable && (
            <div className="space-y-2">
              <Button
                onClick={onRetry}
                disabled={!isRetryable}
                className="w-full"
              >
                Retry
              </Button>
              <p className="text-xs text-center text-gray-500">
                Attempt {retryCount + 1} of {maxRetries}
                {attemptsRemaining <= 1 && ' (last attempt)'}
              </p>
            </div>
          )}

          {/* Max retries exceeded */}
          {error.statusCode >= 500 && !isRetryable && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Maximum retry attempts reached. Please try again later or contact support.
              </p>
              <Link href="/help">
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </div>
          )}

          {/* Network error: Show retry */}
          {error.statusCode === 0 && isRetryable && (
            <div className="space-y-2">
              <Button
                onClick={onRetry}
                disabled={!isRetryable}
                className="w-full"
              >
                Retry
              </Button>
              <p className="text-xs text-center text-gray-500">
                Attempt {retryCount + 1} of {maxRetries}
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ErrorState;
