/**
 * Subscription Schema Type Inference Tests
 *
 * Tests to verify TypeScript type inference from Zod schemas.
 * Ensures type definitions are correctly inferred for all schema entities.
 */

import type {
  Subscription,
  Plan,
  UsageMetric,
  Invoice,
} from '../../../src/lib/schemas/subscriptionSchema';

describe('Type Inference', () => {
  it('should correctly infer Subscription type', () => {
    const sub: Subscription = {
      id: 'sub_123',
      userId: 'user_123',
      planId: 'plan_sa',
      planName: 'Seasoned Adventurer',
      billingFrequency: 'annual',
      renewalDate: new Date(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(sub.planName).toBe('Seasoned Adventurer');
  });

  it('should correctly infer Plan type', () => {
    const plan: Plan = {
      id: 'plan_free',
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      features: ['Feature 1'],
      usageLimits: { parties: 1 },
    };
    expect(plan.name).toBe('Free');
  });

  it('should correctly infer UsageMetric type', () => {
    const metric: UsageMetric = {
      id: 'metric_1',
      userId: 'user_123',
      metricName: 'parties',
      currentUsage: 1,
      maxAllowed: 5,
      category: 'party',
      updatedAt: new Date(),
    };
    expect(metric.metricName).toBe('parties');
  });

  it('should correctly infer Invoice type', () => {
    const invoice: Invoice = {
      id: 'inv_1',
      userId: 'user_123',
      date: new Date(),
      description: 'Invoice',
      amount: 100,
      currency: 'USD',
      status: 'Paid',
    };
    expect(invoice.status).toBe('Paid');
  });
});
