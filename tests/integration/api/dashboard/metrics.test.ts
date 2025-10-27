/**
 * Dashboard Metrics API Integration Tests
 * Lightweight tests verifying API route wiring
 * Detailed logic tested in dashboardService.test.ts
 *
 * @jest-environment node
 */

import { describe, test, expect } from '@jest/globals';

describe('Dashboard Metrics API Contract', () => {
  describe('GET /api/dashboard/metrics', () => {
    test('should export GET handler', async () => {
      const route = await import('@/app/api/dashboard/metrics/route');
      expect(route.GET).toBeDefined();
      expect(typeof route.GET).toBe('function');
    });

    test('GET handler should return Response object', async () => {
      // Mock Clerk auth to return unauthorized
      jest.doMock('@clerk/nextjs/server', () => ({
        auth: jest.fn().mockResolvedValue({ userId: null }),
      }));

      // Clear module cache and re-import
      jest.resetModules();
      const { GET } = await import('@/app/api/dashboard/metrics/route');

      const response = await GET();

      expect(response).toBeDefined();
      expect(typeof response.json).toBe('function');
      expect(typeof response.status).toBe('number');

      jest.dontMock('@clerk/nextjs/server');
    });

    test('should return 401 for unauthenticated requests', async () => {
      // Mock unauthenticated request
      jest.doMock('@clerk/nextjs/server', () => ({
        auth: jest.fn().mockResolvedValue({ userId: null }),
      }));

      jest.resetModules();
      const { GET } = await import('@/app/api/dashboard/metrics/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Unauthorized');

      jest.dontMock('@clerk/nextjs/server');
    });

    test('API route structure matches contract specification', () => {
      // Verify the route file exists and has correct exports
      const route = require('@/app/api/dashboard/metrics/route');

      // Should export GET method
      expect(route).toHaveProperty('GET');
      expect(typeof route.GET).toBe('function');

      // Should not export other HTTP methods (this is GET-only endpoint)
      expect(route.POST).toBeUndefined();
      expect(route.PUT).toBeUndefined();
      expect(route.DELETE).toBeUndefined();
      expect(route.PATCH).toBeUndefined();
    });
  });
});

/**
 * Note: Detailed dashboard metrics logic is tested in:
 * - tests/unit/lib/services/dashboardService.test.ts (11 tests)
 * - tests/unit/lib/utils/subscription.test.ts (24 tests)
 * - tests/unit/lib/utils/metrics.test.ts (22 tests)
 *
 * Total coverage: 57 tests for dashboard functionality
 * This file focuses on API route wiring and authentication
 */
