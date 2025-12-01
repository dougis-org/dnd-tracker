/**
 * Test helpers for Dashboard integration tests
 * Centralizes mock data and setup functions
 */

import type { DashboardPageData } from '@/types/dashboard';

/**
 * Mock dashboard data factory
 */
export function createMockDashboardData(
  overrides?: Partial<DashboardPageData>
): DashboardPageData {
  return {
    user: {
      id: 'user-123',
      displayName: 'John Adventurer',
      email: 'john@example.com',
      tier: 'free_adventurer',
    },
    usage: {
      parties: 1,
      characters: 2,
      encounters: 3,
    },
    limits: {
      parties: 1,
      characters: 3,
      encounters: 5,
    },
    percentages: {
      parties: 100,
      characters: 67,
      encounters: 60,
    },
    isEmpty: false,
    createdAt: new Date('2025-01-01').toISOString(),
    ...overrides,
  };
}

/**
 * Create mock error with status code
 */
export function createMockError(
  message: string,
  statusCode: number
): Error & { statusCode?: number } {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

/**
 * Mock empty state data
 */
export function createEmptyDashboardData(): DashboardPageData {
  return createMockDashboardData({ isEmpty: true });
}

/**
 * Mock upgraded tier data
 */
export function createUpgradedTierData(): DashboardPageData {
  return createMockDashboardData({
    user: {
      id: 'user-123',
      displayName: 'John Adventurer',
      email: 'john@example.com',
      tier: 'seasoned_adventurer',
    },
    limits: {
      parties: 3,
      characters: 10,
      encounters: 20,
    },
  });
}
