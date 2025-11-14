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
import {
  createValidSubscription,
  createValidUsageMetric,
  createValidPlan,
} from './schemaTestHelpers';

describe('SubscriptionSchema', () => {
  it('should validate a valid subscription with all required fields', () => {
    const validSubscription = createValidSubscription();
    const result = SubscriptionSchema.safeParse(validSubscription);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.planName).toBe('Seasoned Adventurer');
    }
  });

  it('should validate a subscription with trialDaysRemaining', () => {
    const trialSubscription = createValidSubscription({
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
    });
    const result = SubscriptionSchema.safeParse(trialSubscription);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trialDaysRemaining).toBe(7);
    }
  });

  it('should reject subscription with invalid planName', () => {
    const invalidSubscription = {
      ...createValidSubscription(),
      planId: 'plan_invalid',
      planName: 'InvalidPlan' as string,
    };
    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });

  it('should reject subscription with invalid status', () => {
    const invalidSubscription = {
      ...createValidSubscription(),
      status: 'suspended' as string,
    };
    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });

  it('should reject subscription with negative trialDaysRemaining', () => {
    const invalidSubscription = createValidSubscription({
      status: 'trial' as const,
      trialDaysRemaining: -1,
    });
    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });

  it('should reject subscription with empty ID', () => {
    const invalidSubscription = createValidSubscription({ id: '' });
    const result = SubscriptionSchema.safeParse(invalidSubscription);
    expect(result.success).toBe(false);
  });
});

describe('SubscriptionResponseSchema', () => {
  it('should validate a complete subscription response', () => {
    const validResponse = {
      subscription: createValidSubscription(),
      usageMetrics: [createValidUsageMetric()],
      availablePlans: [createValidPlan()],
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
