/**
 * Schema Validation Unit Tests
 *
 * Test suite for Zod schema validation across all subscription entities.
 * These tests validate:
 * - Valid data passes schema validation
 * - Invalid data is rejected appropriately
 * - Type inference works correctly
 * - Enum constraints are enforced
 * - Numeric bounds are enforced
 */

import {
  SubscriptionSchema,
  PlanSchema,
  UsageMetricSchema,
  InvoiceSchema,
  PaginatedInvoicesSchema,
  SubscriptionResponseSchema,
  type Subscription,
  type Plan,
  type UsageMetric,
  type Invoice,
} from '../../../src/lib/schemas/subscriptionSchema';

describe('Subscription Schemas', () => {
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

  describe('UsageMetricSchema', () => {
    it('should validate a valid usage metric', () => {
      const validMetric = {
        id: 'metric_parties',
        userId: 'user-123',
        metricName: 'parties' as const,
        currentUsage: 2,
        maxAllowed: 5,
        category: 'party' as const,
        updatedAt: new Date(),
      };

      const result = UsageMetricSchema.safeParse(validMetric);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currentUsage).toBe(2);
      }
    });

    it('should validate a metric at max usage', () => {
      const maxMetric = {
        id: 'metric_parties',
        userId: 'user-123',
        metricName: 'encounters' as const,
        currentUsage: 50,
        maxAllowed: 50,
        category: 'encounter' as const,
        updatedAt: new Date(),
      };

      const result = UsageMetricSchema.safeParse(maxMetric);
      expect(result.success).toBe(true);
    });

    it('should validate a metric with zero usage', () => {
      const zeroMetric = {
        id: 'metric_characters',
        userId: 'user-123',
        metricName: 'characters' as const,
        currentUsage: 0,
        maxAllowed: 50,
        category: 'character' as const,
        updatedAt: new Date(),
      };

      const result = UsageMetricSchema.safeParse(zeroMetric);
      expect(result.success).toBe(true);
    });

    it('should reject metric with invalid metricName', () => {
      const invalidMetric = {
        id: 'metric_invalid',
        userId: 'user-123',
        metricName: 'invalidMetric',
        currentUsage: 2,
        maxAllowed: 5,
        category: 'party' as const,
        updatedAt: new Date(),
      };

      const result = UsageMetricSchema.safeParse(invalidMetric);
      expect(result.success).toBe(false);
    });

    it('should reject metric with negative usage', () => {
      const invalidMetric = {
        id: 'metric_parties',
        userId: 'user-123',
        metricName: 'parties' as const,
        currentUsage: -1,
        maxAllowed: 5,
        category: 'party' as const,
        updatedAt: new Date(),
      };

      const result = UsageMetricSchema.safeParse(invalidMetric);
      expect(result.success).toBe(false);
    });
  });

  describe('InvoiceSchema', () => {
    it('should validate a valid invoice', () => {
      const validInvoice = {
        id: 'inv_001',
        userId: 'user-123',
        date: new Date('2025-10-13'),
        description: 'Seasoned Adventurer - Annual Subscription',
        amount: 99.99,
        currency: 'USD',
        status: 'Paid' as const,
        taxAmount: 7.5,
        taxRate: 0.08,
        downloadUrl: 'https://example.com/invoices/inv_001.pdf',
      };

      const result = InvoiceSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(99.99);
        expect(result.data.status).toBe('Paid');
      }
    });

    it('should validate invoice with default currency', () => {
      const invoice = {
        id: 'inv_002',
        userId: 'user-123',
        date: new Date(),
        description: 'Subscription charge',
        amount: 50,
        status: 'Pending' as const,
      };

      const result = InvoiceSchema.safeParse(invoice);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
      }
    });

    it('should reject invoice with invalid currency code', () => {
      const invalidInvoice = {
        id: 'inv_invalid',
        userId: 'user-123',
        date: new Date(),
        description: 'Invoice',
        amount: 50,
        currency: 'INVALID',
        status: 'Paid' as const,
      };

      const result = InvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('should reject invoice with invalid status', () => {
      const invalidInvoice = {
        id: 'inv_invalid',
        userId: 'user-123',
        date: new Date(),
        description: 'Invoice',
        amount: 50,
        status: 'Processing',
      };

      const result = InvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('should reject invoice with negative amount', () => {
      const invalidInvoice = {
        id: 'inv_invalid',
        userId: 'user-123',
        date: new Date(),
        description: 'Invoice',
        amount: -50,
        status: 'Paid' as const,
      };

      const result = InvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('should reject invoice with taxRate > 1', () => {
      const invalidInvoice = {
        id: 'inv_invalid',
        userId: 'user-123',
        date: new Date(),
        description: 'Invoice',
        amount: 50,
        status: 'Paid' as const,
        taxRate: 1.5,
      };

      const result = InvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it('should reject invoice with invalid URL', () => {
      const invalidInvoice = {
        id: 'inv_invalid',
        userId: 'user-123',
        date: new Date(),
        description: 'Invoice',
        amount: 50,
        status: 'Paid' as const,
        downloadUrl: 'not-a-url',
      };

      const result = InvoiceSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });
  });

  describe('PaginatedInvoicesSchema', () => {
    it('should validate a valid paginated response', () => {
      const validResponse = {
        invoices: [
          {
            id: 'inv_001',
            userId: 'user-123',
            date: new Date(),
            description: 'Invoice 1',
            amount: 99.99,
            status: 'Paid' as const,
          },
        ],
        totalCount: 5,
        pageSize: 10,
        currentPage: 1,
        hasNextPage: false,
      };

      const result = PaginatedInvoicesSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.invoices.length).toBe(1);
        expect(result.data.totalCount).toBe(5);
      }
    });

    it('should validate empty invoice list', () => {
      const emptyResponse = {
        invoices: [],
        totalCount: 0,
        pageSize: 10,
        currentPage: 1,
        hasNextPage: false,
      };

      const result = PaginatedInvoicesSchema.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('should reject response with invalid pageSize', () => {
      const invalidResponse = {
        invoices: [],
        totalCount: 0,
        pageSize: 0,
        currentPage: 1,
      };

      const result = PaginatedInvoicesSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject response with invalid currentPage', () => {
      const invalidResponse = {
        invoices: [],
        totalCount: 0,
        pageSize: 10,
        currentPage: 0,
      };

      const result = PaginatedInvoicesSchema.safeParse(invalidResponse);
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
});
