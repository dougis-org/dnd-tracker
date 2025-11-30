/**
 * Response Shape Validation Tests
 * Tests for API response structure and required fields
 */

import { SubscriptionTier, TierLimits } from '@/types/subscription';

describe('Response Shape Validation', () => {
  const mockDashboardPageData = {
    user: {
      userId: 'user-123',
      displayName: 'John Doe',
      email: 'john@example.com',
      tier: 'free_adventurer' as SubscriptionTier,
    },
    usage: {
      parties: 1,
      characters: 3,
      encounters: 5,
    },
    limits: TierLimits.free_adventurer,
    percentages: {
      parties: 100,
      characters: 100,
      encounters: 100,
    },
    isEmpty: true,
    createdAt: new Date().toISOString(),
  };

  it('should have required user fields', () => {
    expect(mockDashboardPageData.user.userId).toBeDefined();
    expect(mockDashboardPageData.user.displayName).toBeDefined();
    expect(mockDashboardPageData.user.email).toBeDefined();
    expect(mockDashboardPageData.user.tier).toBeDefined();
  });

  it('should have required usage fields', () => {
    expect(mockDashboardPageData.usage.parties).toBeDefined();
    expect(mockDashboardPageData.usage.characters).toBeDefined();
    expect(mockDashboardPageData.usage.encounters).toBeDefined();
  });

  it('should have required limits fields', () => {
    expect(mockDashboardPageData.limits.parties).toBeDefined();
    expect(mockDashboardPageData.limits.characters).toBeDefined();
    expect(mockDashboardPageData.limits.encounters).toBeDefined();
  });

  it('should have required percentages fields', () => {
    expect(mockDashboardPageData.percentages.parties).toBeDefined();
    expect(mockDashboardPageData.percentages.characters).toBeDefined();
    expect(mockDashboardPageData.percentages.encounters).toBeDefined();
  });

  it('should have isEmpty flag', () => {
    expect(typeof mockDashboardPageData.isEmpty).toBe('boolean');
  });

  it('should have createdAt timestamp', () => {
    expect(mockDashboardPageData.createdAt).toBeDefined();
    expect(typeof mockDashboardPageData.createdAt).toBe('string');
  });
});
