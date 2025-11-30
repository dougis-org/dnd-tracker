/**
 * Dashboard API Client
 *
 * Client-side utilities for fetching dashboard data from the API.
 * Handles error handling, logging, and cache control.
 *
 * Feature 016: User Dashboard with Real Data
 */

import { logger } from '@/lib/utils/logger';
import type {
  DashboardPageData,
  DashboardErrorResponse,
} from '@/types/dashboard';
import { isValidDashboardPageData } from '@/types/dashboard';

/**
 * Dashboard API error class
 */
export class DashboardApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public userMessage: string
  ) {
    super(`Dashboard API Error (${code}): ${userMessage}`);
    this.name = 'DashboardApiError';
  }
}

/**
 * Error messages for common scenarios
 */
const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Please log in to view your dashboard',
  USER_NOT_FOUND: 'Your profile could not be found',
  INTERNAL_ERROR: 'We encountered an error. Please try again.',
  NETWORK_ERROR: 'Unable to reach the server. Please check your connection.',
  PARSE_ERROR: 'Unable to load dashboard data. Please refresh the page.',
  INVALID_RESPONSE: 'Invalid response format. Please refresh the page.',
} as const;

/**
 * Fetch dashboard data from API
 *
 * Implements error handling with user-friendly messages and structured logging.
 * Per SC-010, ensures fresh data on each call (no client-side caching).
 *
 * @returns Promise resolving to DashboardPageData
 * @throws DashboardApiError with appropriate error code and user-friendly message
 *
 * @example
 * ```typescript
 * try {
 *   const data = await getDashboardData();
 *   // Display data on dashboard
 * } catch (error) {
 *   if (error instanceof DashboardApiError) {
 *     if (error.statusCode === 401) {
 *       // Redirect to login
 *     } else if (error.statusCode === 500) {
 *       // Show retry button
 *     }
 *   }
 * }
 * ```
 */
export async function getDashboardData(): Promise<DashboardPageData> {
  const startTime = Date.now();

  try {
    logger.info('Fetching dashboard data', {
      context: {
        endpoint: '/api/v1/dashboard/usage',
        timestamp: new Date().toISOString(),
      },
    });

    const response = await fetch('/api/v1/dashboard/usage', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Disable caching per SC-010: no-cache and must-revalidate
      // The server response header also enforces no-cache
      cache: 'no-store',
    });

    const elapsedTime = Date.now() - startTime;

    // Handle HTTP errors
    if (!response.ok) {
      let errorCode: string = 'INTERNAL_ERROR';
      let userMessage: string = ERROR_MESSAGES.INTERNAL_ERROR;

      // Map HTTP status to specific error codes
      if (response.status === 401) {
        errorCode = 'AUTH_REQUIRED';
        userMessage = ERROR_MESSAGES.AUTH_REQUIRED;
      } else if (response.status === 404) {
        errorCode = 'USER_NOT_FOUND';
        userMessage = ERROR_MESSAGES.USER_NOT_FOUND;
      } else {
        // Try to parse error response for custom message
        try {
          const errorData =
            (await response.json()) as Partial<DashboardErrorResponse>;
          if (errorData?.code) {
            errorCode = errorData.code;
          }
          if (errorData?.error) {
            userMessage = errorData.error;
          }
        } catch {
          // JSON parse error - use default message
        }
      }

      logger.warn('Dashboard API error', {
        context: {
          statusCode: response.status,
          errorCode,
          userMessage,
          elapsedTime,
        },
      });

      throw new DashboardApiError(response.status, errorCode, userMessage);
    }

    // Parse response
    let data: unknown;
    try {
      data = await response.json();
    } catch (error) {
      logger.error('Failed to parse dashboard API response', {
        context: {
          error: error instanceof Error ? error.message : 'Unknown error',
          elapsedTime,
        },
      });
      throw new DashboardApiError(
        500,
        'PARSE_ERROR',
        ERROR_MESSAGES.PARSE_ERROR
      );
    }

    // Validate response structure
    if (!isValidDashboardPageData(data)) {
      logger.error('Invalid dashboard API response structure', {
        context: {
          dataType: typeof data,
          elapsedTime,
        },
      });
      throw new DashboardApiError(
        500,
        'INVALID_RESPONSE',
        ERROR_MESSAGES.INVALID_RESPONSE
      );
    }

    logger.info('Dashboard data fetched successfully', {
      context: {
        statusCode: response.status,
        isEmpty: data.isEmpty,
        tier: data.user.tier,
        elapsedTime,
      },
    });

    // Log performance metric
    if (elapsedTime > 300) {
      logger.warn('Dashboard API response time exceeds target', {
        context: {
          elapsedTime,
          targetTime: 300,
        },
      });
    }

    return data;
  } catch (error) {
    // If it's already a DashboardApiError, re-throw as-is
    if (error instanceof DashboardApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError) {
      logger.error('Network error fetching dashboard data', {
        context: {
          error: error.message,
          elapsedTime: Date.now() - startTime,
        },
      });
      throw new DashboardApiError(
        0,
        'NETWORK_ERROR',
        ERROR_MESSAGES.NETWORK_ERROR
      );
    }

    // Unknown error
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    logger.error('Unexpected error fetching dashboard data', {
      context: {
        error: message,
        elapsedTime: Date.now() - startTime,
      },
    });
    throw new DashboardApiError(
      500,
      'INTERNAL_ERROR',
      ERROR_MESSAGES.INTERNAL_ERROR
    );
  }
}

/**
 * Check if an error is a retry-able API error (5xx)
 * 401 and 404 errors should not be retried
 *
 * @param error - Error to check
 * @returns True if error is retryable (5xx status code)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof DashboardApiError) {
    // 401 (auth) and 404 (not found) are not retryable
    if (error.statusCode === 401 || error.statusCode === 404) {
      return false;
    }
    // 5xx errors are retryable
    if (error.statusCode >= 500) {
      return true;
    }
    // Network errors (statusCode = 0) are retryable
    if (error.statusCode === 0) {
      return true;
    }
  }
  return false;
}
