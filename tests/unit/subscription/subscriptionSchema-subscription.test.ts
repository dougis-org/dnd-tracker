/**
 * Subscription Schema Validation Tests
 *
 * Tests for SubscriptionSchema and SubscriptionResponseSchema validation.
 * Validates required fields, enum constraints, and composite response structures.
 */

import {
  SubscriptionSchema,
  SubscriptionResponseSchema,
} from '../../../src/lib/schemas/subscriptionSchema';

describe('SubscriptionSchema', () => {
  it('should validate a valid subscription with all required fields', () => {
    const validSubscription = {
      id: 'sub_abc123',
      userId: 'user-123',
      planId: 'plan_sa',
      planName: 'Seasoned Adventurer' as const,
      billingFrequency: 'annual' as const,
      renewalDate: new Date('2026-11-13'),
      status: 'active' as const,
      trialDaysRemaining: null,
      createdAt: new Date('2025-11-01'),
      updatedAt: new Date('2025-11-13'),
    };

    const result = SubscriptionSchema.safeParse(validSubscription);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.planName).toBe('Seasoned Adventurer');
    }
  });

  it('should validate a subscription with trialDaysRemaining', () => {
    const trialSubscription = {
      id: 'sub_trial',
      userId: 'user-456',
      planId: 'plan_free',
      planName: 'Free' as const,
      billingFrequency: 'monthly' as const,
      renewalDate: new Date('2025-12-13'),
      status: 'trial' as const,
      trialDaysRemaining: 7,
      createdAt: new Date('2025-11-06'),
      updatedAt: new Date('2025-11-13'),
    };

    const result = SubscriptionSchema.safeParse(trialSubscription);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trialDaysRemaining).toBe(7);
    }
  });

  it('should reject subscription with invalid planName', () => {
    const invalidSubscription = {
      id: 'sub_abc123',
      userId: 'user-123',
      planId: 'plan_invalid',
      planName: 'InvalidPlan',
      billingFrequency: 'annual' as const,
      renewalDate: new Date(),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });

  it('should reject subscription with invalid status', () => {
    const invalidSubscription = {
      id: 'sub_abc123',
      userId: 'user-123',
      planId: 'plan_sa',
      planName: 'Seasoned Adventurer' as const,
      billingFrequency: 'annual' as const,
      renewalDate: new Date(),
      status: 'suspended',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });

  it('should reject subscription with negative trialDaysRemaining', () => {
    const invalidSubscription = {
      id: 'sub_abc123',
      userId: 'user-123',
      planId: 'plan_sa',
      planName: 'Seasoned Adventurer' as const,
      billingFrequency: 'annual' as const,
      renewalDate: new Date(),
      status: 'trial' as const,
      trialDaysRemaining: -1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });

  it('should reject subscription with empty ID', () => {
    const invalidSubscription = {
      id: '',
      userId: 'user-123',
      planId: 'plan_sa',
      planName: 'Seasoned Adventurer' as const,
      billingFrequency: 'annual' as const,
      renewalDate: new Date(),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });
});

describe('SubscriptionResponseSchema', () => {
  it('should validate a complete subscription response', () => {
    const validResponse = {
      subscription: {
        id: 'sub_abc123',
        userId: 'user-123',
        planId: 'plan_sa',
        planName: 'Seasoned Adventurer' as const,
        billingFrequency: 'annual' as const,
        renewalDate: new Date(),
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      usageMetrics: [
        {
          id: 'metric_parties',
          userId: 'user-123',
          metricName: 'parties' as const,
          currentUsage: 2,
          maxAllowed: 5,
          category: 'party' as const,
          updatedAt: new Date(),
        },
      ],
      availablePlans: [
        {
          id: 'plan_free',
          name: 'Free' as const,
          monthlyPrice: 0,
          annualPrice: 0,
          features: ['Feature'],
          usageLimits: { parties: 1 },
        },
      ],
    };

    const result = SubscriptionResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('should reject response with missing subscription', () => {
    const invalidResponse = {
      usageMetrics: [],
      availablePlans: [],
    };

    const result = SubscriptionResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});
