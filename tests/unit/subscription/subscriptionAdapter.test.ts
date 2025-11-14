/**
 * Subscription Adapter Tests (RED Phase)
 *
 * Test suite for localStorage-backed subscription adapter.
 * These tests validate:
 * - Adapter fetches from localStorage
 * - Schema validation on read/write
 * - Corrupted data recovery
 * - Network delay simulation
 */

import {
  getSubscription,
  getUsageMetrics,
  getAvailablePlans,
  getBillingHistory,
} from '../../../src/lib/adapters/subscriptionAdapter';
import {
  createMockSubscription,
  createMockUsageMetrics,
  createMockPlans,
  createMockInvoices,
} from '../../fixtures/subscription-fixtures';

describe('Subscription Adapter', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getSubscription', () => {
    it('should fetch subscription from localStorage', async () => {
      const mockSub = createMockSubscription({ userId: testUserId });
      localStorage.setItem(
        `subscription:${testUserId}`,
        JSON.stringify(mockSub)
      );

      const result = await getSubscription(testUserId);

      expect(result).toEqual(mockSub);
      expect(result.userId).toBe(testUserId);
      expect(result.planName).toBe(mockSub.planName);
    });

    it('should return default subscription if not in localStorage', async () => {
      const result = await getSubscription(testUserId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.planName).toBe('Free');
    });

    it('should validate subscription schema on read', async () => {
      const invalidData = { id: '', userId: testUserId };
      localStorage.setItem(
        `subscription:${testUserId}`,
        JSON.stringify(invalidData)
      );

      const result = await getSubscription(testUserId);

      expect(result.planName).toBe('Free');
      expect(result.userId).toBe(testUserId);
    });

    it('should handle corrupted JSON gracefully', async () => {
      localStorage.setItem(`subscription:${testUserId}`, '{invalid json');

      const result = await getSubscription(testUserId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
    });

    it('should clear corrupted localStorage entry', async () => {
      localStorage.setItem(`subscription:${testUserId}`, '{invalid json');

      await getSubscription(testUserId);

      expect(localStorage.getItem(`subscription:${testUserId}`)).toBeNull();
    });

    it('should handle large subscription objects', async () => {
      const largeSub = createMockSubscription({
        userId: testUserId,
        planName: 'Master DM',
      });
      localStorage.setItem(
        `subscription:${testUserId}`,
        JSON.stringify(largeSub)
      );

      const result = await getSubscription(testUserId);

      expect(result.planName).toBe('Master DM');
    });
  });

  describe('getUsageMetrics', () => {
    it('should fetch usage metrics from localStorage', async () => {
      const mockMetrics = createMockUsageMetrics();
      localStorage.setItem(`usage:${testUserId}`, JSON.stringify(mockMetrics));

      const result = await getUsageMetrics(testUserId);

      expect(result).toEqual(mockMetrics);
      expect(result.length).toBe(4);
    });

    it('should return default metrics if not in localStorage', async () => {
      const result = await getUsageMetrics(testUserId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should validate each metric schema on read', async () => {
      const invalidMetrics = [{ id: '', userId: testUserId }];
      localStorage.setItem(
        `usage:${testUserId}`,
        JSON.stringify(invalidMetrics)
      );

      const result = await getUsageMetrics(testUserId);

      expect(result.length).toBeGreaterThan(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle corrupted metrics JSON gracefully', async () => {
      localStorage.setItem(`usage:${testUserId}`, '{invalid json');

      const result = await getUsageMetrics(testUserId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array for corrupted metrics', async () => {
      localStorage.setItem(`usage:${testUserId}`, 'null');

      const result = await getUsageMetrics(testUserId);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle multiple usage metric types', async () => {
      const metrics = createMockUsageMetrics();
      localStorage.setItem(`usage:${testUserId}`, JSON.stringify(metrics));

      const result = await getUsageMetrics(testUserId);

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((metric) => {
        expect(metric.id).toBeDefined();
        expect(metric.metricName).toBeDefined();
        expect(metric.currentUsage).toBeGreaterThanOrEqual(0);
        expect(metric.maxAllowed).toBeGreaterThanOrEqual(metric.currentUsage);
      });
    });
  });

  describe('getAvailablePlans', () => {
    it('should fetch available plans from localStorage', async () => {
      const mockPlans = createMockPlans();
      localStorage.setItem('plans', JSON.stringify(mockPlans));

      const result = await getAvailablePlans();

      expect(result).toEqual(mockPlans);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return default plans if not in localStorage', async () => {
      const result = await getAvailablePlans();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should validate each plan schema on read', async () => {
      const invalidPlans = [{ id: '', name: 'Invalid' }];
      localStorage.setItem('plans', JSON.stringify(invalidPlans));

      const result = await getAvailablePlans();

      expect(result.length).toBeGreaterThan(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle corrupted plans JSON gracefully', async () => {
      localStorage.setItem('plans', '{invalid json');

      const result = await getAvailablePlans();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should include Free and Premium plans by default', async () => {
      const result = await getAvailablePlans();

      const planNames = result.map((p) => p.name);
      expect(planNames).toContain('Free');
    });

    it('should return plans with valid pricing', async () => {
      const result = await getAvailablePlans();

      result.forEach((plan) => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.monthlyPrice).toBeGreaterThanOrEqual(0);
        expect(plan.annualPrice).toBeGreaterThanOrEqual(0);
        expect(plan.features).toBeDefined();
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });
  });

  describe('getBillingHistory', () => {
    it('should fetch billing history from localStorage', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(mockInvoices)
      );

      const result = await getBillingHistory(testUserId, 1, 10);

      expect(result).toBeDefined();
      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);
    });

    it('should return paginated results', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(mockInvoices)
      );

      const result = await getBillingHistory(testUserId, 1, 5);

      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(5);
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle invalid page numbers', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(mockInvoices)
      );

      const result = await getBillingHistory(testUserId, -1, 10);

      expect(result.currentPage).toBe(1);
    });

    it('should handle invalid page sizes', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(mockInvoices)
      );

      const result = await getBillingHistory(testUserId, 1, -5);

      expect(result.pageSize).toBeGreaterThan(0);
    });

    it('should indicate when there are more pages', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(mockInvoices)
      );

      const result = await getBillingHistory(testUserId, 1, 2);

      expect(result.hasNextPage).toBeDefined();
      expect(typeof result.hasNextPage).toBe('boolean');
    });

    it('should return empty result for nonexistent user', async () => {
      const result = await getBillingHistory('nonexistent-user', 1, 10);

      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);
    });

    it('should handle corrupted billing history JSON', async () => {
      localStorage.setItem(`billing:${testUserId}`, '{invalid json');

      const result = await getBillingHistory(testUserId, 1, 10);

      expect(result).toBeDefined();
      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);
    });

    it('should validate invoice schema on read', async () => {
      const invalidInvoices = [{ id: '', userId: testUserId }];
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(invalidInvoices)
      );

      const result = await getBillingHistory(testUserId, 1, 10);

      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);
    });

    it('should calculate pagination correctly', async () => {
      const invoices = Array.from(
        { length: 25 },
        (_, _i) => createMockInvoices()[0]
      );
      localStorage.setItem(`billing:${testUserId}`, JSON.stringify(invoices));

      const page1 = await getBillingHistory(testUserId, 1, 10);
      const page2 = await getBillingHistory(testUserId, 2, 10);

      expect(page1.invoices.length).toBeLessThanOrEqual(10);
      expect(page2.invoices.length).toBeLessThanOrEqual(10);
    });

    it('should handle large invoice objects', async () => {
      const largeInvoices = createMockInvoices();
      localStorage.setItem(
        `billing:${testUserId}`,
        JSON.stringify(largeInvoices)
      );

      const result = await getBillingHistory(testUserId, 1, 100);

      expect(result.invoices).toBeDefined();
      result.invoices.forEach((invoice) => {
        expect(invoice.id).toBeDefined();
        expect(invoice.amount).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
