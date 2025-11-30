/**
 * Dashboard API Client
 *
 * Fetch dashboard data from API with error handling and validation.
 * Feature 016: User Dashboard with Real Data
 */

import { logger } from '@/lib/utils/logger';
import { DashboardBuilder, type DashboardPageData, type DashboardErrorResponse } from '@/types/dashboard';

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
 * Fetch dashboard data from API
 *
 * @throws DashboardApiError with user-friendly message
 */
export async function getDashboardData(): Promise<DashboardPageData> {
  const startTime = Date.now();

  try {
    logger.info('Fetching dashboard data', {
      context: { endpoint: '/api/v1/dashboard/usage', timestamp: new Date().toISOString() },
    });

    const response = await fetch('/api/v1/dashboard/usage', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as Partial<DashboardErrorResponse>;
      const errorCode = errorData?.code || 'INTERNAL_ERROR';
      const userMessage = errorData?.error || 'We encountered an error. Please try again.';

      logger.warn('Dashboard API error', {
        context: { statusCode: response.status, errorCode, elapsedTime: Date.now() - startTime },
      });

      throw new DashboardApiError(response.status, errorCode, userMessage);
    }

    const data = (await response.json()) as unknown;
    if (!DashboardBuilder.isValidPageData(data)) {
      logger.error('Invalid dashboard API response', { context: { elapsedTime: Date.now() - startTime } });
      throw new DashboardApiError(500, 'INVALID_RESPONSE', 'Invalid response format. Please refresh.');
    }

    logger.info('Dashboard data fetched successfully', {
      context: { tier: data.user.tier, isEmpty: data.isEmpty, elapsedTime: Date.now() - startTime },
    });

    return data;
  } catch (error) {
    if (error instanceof DashboardApiError) throw error;

    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Dashboard API error', { context: { error: message, elapsedTime: Date.now() - startTime } });

    throw new DashboardApiError(500, 'INTERNAL_ERROR', 'We encountered an error. Please try again.');
  }
}

/**
 * Check if error is retryable (5xx or network errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof DashboardApiError) {
    // 401 and 404 are not retryable
    if (error.statusCode === 401 || error.statusCode === 404) {
      return false;
    }
    // 5xx and network errors (0) are retryable
    return error.statusCode >= 500 || error.statusCode === 0;
  }
  return false;
}
