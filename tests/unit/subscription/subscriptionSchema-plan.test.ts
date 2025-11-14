/**
 * Plan Schema Validation Tests
 *
 * Tests for PlanSchema validation.
 * Validates pricing, features, and usage limits.
 */

import { PlanSchema } from '../../../src/lib/schemas/subscriptionSchema';

describe('PlanSchema', () => {
  it('should validate a valid plan with all fields', () => {
    const validPlan = {
      id: 'plan_sa',
      name: 'Seasoned Adventurer' as const,
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      usageLimits: {
        parties: 5,
        encounters: 50,
        characters: 50,
        combatSessions: 50,
      },
    };

    const result = PlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthlyPrice).toBe(9.99);
      expect(result.data.features.length).toBe(3);
    }
  });

  it('should validate a free tier plan', () => {
    const freePlan = {
      id: 'plan_free',
      name: 'Free' as const,
      monthlyPrice: 0,
      annualPrice: 0,
      features: ['Limited Feature'],
      usageLimits: {
        parties: 1,
        encounters: 5,
      },
    };

    const result = PlanSchema.safeParse(freePlan);
    expect(result.success).toBe(true);
  });

  it('should reject plan with empty features array', () => {
    const invalidPlan = {
      id: 'plan_invalid',
      name: 'Free' as const,
      monthlyPrice: 0,
      annualPrice: 0,
      features: [],
      usageLimits: { parties: 1 },
    };

    const result = PlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });

  it('should reject plan with negative price', () => {
    const invalidPlan = {
      id: 'plan_invalid',
      name: 'Free' as const,
      monthlyPrice: -10,
      annualPrice: 0,
      features: ['Feature'],
      usageLimits: { parties: 1 },
    };

    const result = PlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });

  it('should reject plan with invalid negative usage limit', () => {
    const invalidPlan = {
      id: 'plan_invalid',
      name: 'Free' as const,
      monthlyPrice: 0,
      annualPrice: 0,
      features: ['Feature'],
      usageLimits: { parties: -1 },
    };

    const result = PlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });
});
