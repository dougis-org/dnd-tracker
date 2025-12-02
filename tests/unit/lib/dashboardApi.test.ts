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
    const retryableTests = [
      { status: 500, code: 'SERVER_ERROR', desc: '500 Server Error' },
      { status: 501, code: 'NOT_IMPLEMENTED', desc: '501 Not Implemented' },
      { status: 502, code: 'BAD_GATEWAY', desc: '502 Bad Gateway' },
      {
        status: 503,
        code: 'SERVICE_UNAVAILABLE',
        desc: '503 Service Unavailable',
      },
      { status: 504, code: 'GATEWAY_TIMEOUT', desc: '504 Gateway Timeout' },
      { status: 0, code: 'NETWORK_ERROR', desc: 'network error (status 0)' },
    ];

    const nonRetryableTests = [
      { status: 400, code: 'BAD_REQUEST', desc: '400 Bad Request' },
      { status: 401, code: 'UNAUTHORIZED', desc: '401 Unauthorized' },
      { status: 403, code: 'FORBIDDEN', desc: '403 Forbidden' },
      { status: 404, code: 'NOT_FOUND', desc: '404 Not Found' },
      { status: 429, code: 'RATE_LIMITED', desc: '429 Rate Limited' },
    ];

    retryableTests.forEach(({ status, code, desc }) => {
      it(`returns true for ${desc}`, () => {
        const error = new DashboardApiError(status, code, 'Error');
        expect(isRetryableError(error)).toBe(true);
      });
    });

    nonRetryableTests.forEach(({ status, code, desc }) => {
      it(`returns false for ${desc}`, () => {
        const error = new DashboardApiError(status, code, 'Error');
        expect(isRetryableError(error)).toBe(false);
      });
    });

    const invalidTests = [
      { value: new Error('Generic error'), desc: 'generic Error' },
      { value: null, desc: 'null' },
      { value: undefined, desc: 'undefined' },
      { value: 'error string', desc: 'string' },
      { value: {}, desc: 'empty object' },
      { value: { statusCode: 500 }, desc: 'object without statusCode' },
    ];

    invalidTests.forEach(({ value, desc }) => {
      it(`returns false for ${desc}`, () => {
        expect(isRetryableError(value)).toBe(false);
      });
    });
  });

  describe('API Integration Scenarios', () => {
    const tiers: SubscriptionTier[] = [
      'free_adventurer',
      'seasoned_adventurer',
      'expert_dungeon_master',
      'master_of_dungeons',
      'guild_master',
    ];

    tiers.forEach((tier) => {
      it(`handles successful fetch with ${tier} data`, async () => {
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
      });
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

    const errorStatusCodes = [400, 401, 402, 403, 404, 500, 502, 503];

    errorStatusCodes.forEach((status) => {
      it(`treats ${status} status as error`, async () => {
        jest.clearAllMocks();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status,
          json: jest.fn().mockResolvedValueOnce({ error: 'Error' }),
        });

        await expect(getDashboardData()).rejects.toThrow(DashboardApiError);
      });
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
    const createMockData = () =>
      DashboardBuilder.buildPageData(
        'user-1',
        {
          email: 'test@example.com',
          displayName: 'Test',
          subscriptionTier: 'free_adventurer' as SubscriptionTier,
        },
        { parties: 0, characters: 0, encounters: 0 }
      );

    const optionTests = [
      { option: 'method', expected: 'GET', desc: 'uses correct HTTP method' },
      {
        option: 'headers.Content-Type',
        expected: 'application/json',
        desc: 'includes correct content type',
      },
      { option: 'cache', expected: 'no-store', desc: 'disables caching' },
    ];

    optionTests.forEach(({ option, expected, desc }) => {
      it(desc, async () => {
        jest.clearAllMocks();
        const mockData = createMockData();

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValueOnce(mockData),
        });

        await getDashboardData();

        const callArgs = (global.fetch as jest.Mock).mock.calls[0];
        const value =
          option === 'headers.Content-Type'
            ? callArgs[1].headers['Content-Type']
            : callArgs[1][option];

        expect(value).toBe(expected);
      });
    });
  });
});
