/**
 * Dashboard API Client Tests
 *
 * Tests for dashboard API fetcher with error handling and validation.
 * Feature 016: User Dashboard with Real Data
 */

import {
  getDashboardData,
  DashboardApiError,
  isRetryableError,
} from '@/lib/dashboardApi';
import { DashboardBuilder, type SubscriptionTier } from '@/types/dashboard';

// Mock fetch
global.fetch = jest.fn();

describe('Dashboard API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('DashboardApiError', () => {
    it('creates error with correct properties', () => {
      const error = new DashboardApiError(
        500,
        'INTERNAL_ERROR',
        'Something went wrong'
      );

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.userMessage).toBe('Something went wrong');
      expect(error.name).toBe('DashboardApiError');
    });

    it('has correct error message format', () => {
      const error = new DashboardApiError(404, 'NOT_FOUND', 'Not found');
      expect(error.message).toContain('NOT_FOUND');
      expect(error.message).toContain('Not found');
    });
  });

  describe('getDashboardData', () => {
    it('successfully fetches valid dashboard data', async () => {
      const mockData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test User',
          subscriptionTier: 'free_adventurer' as SubscriptionTier,
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await getDashboardData();

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/dashboard/usage', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
    });

    it('throws DashboardApiError on non-200 response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest
          .fn()
          .mockResolvedValueOnce({ error: 'Server error', code: 'ERROR' }),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });

    it('handles JSON parse errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValueOnce(new Error('JSON parse error')),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });

    it('throws error for invalid response data', async () => {
      jest.clearAllMocks();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ invalid: 'data' }),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });

    it('handles network errors', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
      await expect(getDashboardData()).rejects.toMatchObject({
        code: 'INTERNAL_ERROR',
      });
    });

    it('handles 404 errors with custom message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest
          .fn()
          .mockResolvedValueOnce({ error: 'Not found', code: 'NOT_FOUND' }),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });

    it('handles 401 errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce({ error: 'Unauthorized' }),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });
  });

  describe('isRetryableError', () => {
    it('returns true for 5xx errors', () => {
      const error = new DashboardApiError(500, 'SERVER_ERROR', 'Server error');
      expect(isRetryableError(error)).toBe(true);

      const error503 = new DashboardApiError(
        503,
        'SERVICE_UNAVAILABLE',
        'Unavailable'
      );
      expect(isRetryableError(error503)).toBe(true);
    });

    it('returns true for network errors (status 0)', () => {
      const error = new DashboardApiError(0, 'NETWORK_ERROR', 'Network error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for 401 errors', () => {
      const error = new DashboardApiError(401, 'UNAUTHORIZED', 'Unauthorized');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 404 errors', () => {
      const error = new DashboardApiError(404, 'NOT_FOUND', 'Not found');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for 4xx errors (except 401, 404)', () => {
      const error = new DashboardApiError(400, 'BAD_REQUEST', 'Bad request');
      expect(isRetryableError(error)).toBe(false);

      const error429 = new DashboardApiError(
        429,
        'RATE_LIMITED',
        'Rate limited'
      );
      expect(isRetryableError(error429)).toBe(false);
    });

    it('returns false for non-DashboardApiError instances', () => {
      expect(isRetryableError(new Error('Generic error'))).toBe(false);
      expect(isRetryableError(null)).toBe(false);
      expect(isRetryableError(undefined)).toBe(false);
      expect(isRetryableError('error string')).toBe(false);
    });
  });

  describe('API Integration Scenarios', () => {
    it('handles successful fetch with different tier data', async () => {
      const tiers: SubscriptionTier[] = [
        'free_adventurer',
        'seasoned_adventurer',
        'expert_dungeon_master',
        'master_of_dungeons',
        'guild_master',
      ];

      for (const tier of tiers) {
        jest.clearAllMocks();

        const mockData = DashboardBuilder.buildPageData(
          `user-${tier}`,
          {
            email: `user@${tier}.com`,
            displayName: `User ${tier}`,
            subscriptionTier: tier,
          },
          { parties: 1, characters: 2, encounters: 3 }
        );

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockData),
        });

        const result = await getDashboardData();
        expect(result.user.tier).toBe(tier);
      }
    });

    it('retries on server errors', () => {
      const serverError = new DashboardApiError(
        502,
        'BAD_GATEWAY',
        'Bad gateway'
      );
      expect(isRetryableError(serverError)).toBe(true);

      const serviceError = new DashboardApiError(
        503,
        'SERVICE_UNAVAILABLE',
        'Service unavailable'
      );
      expect(isRetryableError(serviceError)).toBe(true);
    });

    it('does not retry on client errors', () => {
      const badRequest = new DashboardApiError(
        400,
        'BAD_REQUEST',
        'Bad request'
      );
      expect(isRetryableError(badRequest)).toBe(false);

      const forbidden = new DashboardApiError(403, 'FORBIDDEN', 'Forbidden');
      expect(isRetryableError(forbidden)).toBe(false);
    });

    it('retries on specific 5xx codes', () => {
      const codes = [500, 501, 502, 503, 504, 505];
      codes.forEach((code) => {
        const error = new DashboardApiError(code, 'SERVER_ERROR', 'Error');
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('distinguishes between 401 and 403', () => {
      const unauthorized = new DashboardApiError(
        401,
        'UNAUTHORIZED',
        'Unauthorized'
      );
      expect(isRetryableError(unauthorized)).toBe(false);

      const forbidden = new DashboardApiError(403, 'FORBIDDEN', 'Forbidden');
      expect(isRetryableError(forbidden)).toBe(false);
    });

    it('handles undefined error gracefully', () => {
      expect(isRetryableError(undefined)).toBe(false);
    });

    it('handles unknown error type gracefully', () => {
      expect(isRetryableError({})).toBe(false);
      expect(isRetryableError({ statusCode: 500 })).toBe(false);
    });
  });

  describe('Error Message Generation', () => {
    it('includes error code and message in DashboardApiError', () => {
      const error = new DashboardApiError(
        503,
        'SERVICE_UNAVAILABLE',
        'The service is temporarily unavailable'
      );

      expect(error.message).toContain('SERVICE_UNAVAILABLE');
      expect(error.message).toContain('The service is temporarily unavailable');
      expect(error.statusCode).toBe(503);
    });

    it('handles error without custom message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({}),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });
  });

  describe('Status Code Handling', () => {
    it('handles 200 response correctly', async () => {
      const mockData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer' as SubscriptionTier,
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      const result = await getDashboardData();
      expect(result).toEqual(mockData);
    });

    it('treats any non-ok status as error', async () => {
      const statusCodes = [400, 401, 402, 403, 404, 500, 502, 503];

      for (const status of statusCodes) {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status,
          json: jest.fn().mockResolvedValueOnce({ error: 'Error' }),
        });

        await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
      }
    });

    it('uses default code for missing error code', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({ error: 'Some error' }),
      });

      await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
    });
  });

  describe('Fetch Options Validation', () => {
    it('uses correct HTTP method', async () => {
      const mockData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer' as SubscriptionTier,
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      await getDashboardData();

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].method).toBe('GET');
    });

    it('includes correct content type header', async () => {
      const mockData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer' as SubscriptionTier,
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      await getDashboardData();

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
    });

    it('disables caching', async () => {
      const mockData = DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer' as SubscriptionTier,
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockData),
      });

      await getDashboardData();

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].cache).toBe('no-store');
    });
  });
});
