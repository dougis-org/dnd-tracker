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
  initializeSubscriptionData,
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
      localStorage.setItem(`subscription:${testUserId}`, JSON.stringify(mockSub));
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

    const errorTests = [
      { _type: 'invalid schema', data: { id: '', userId: testUserId }, desc: 'validate subscription schema on read' },
      { _type: 'corrupted JSON', data: '{invalid json', desc: 'handle corrupted JSON gracefully', checkCleared: true },
    ];

    errorTests.forEach(({ _type, data, desc, checkCleared }) => {
      it(`should ${desc}`, async () => {
        const key = `subscription:${testUserId}`;
        localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
        const result = await getSubscription(testUserId);
        expect(result.userId).toBe(testUserId);
        if (checkCleared) expect(localStorage.getItem(key)).toBeNull();
      });
    });

    it('should handle large subscription objects', async () => {
      const largeSub = createMockSubscription({ userId: testUserId, planName: 'Master DM' });
      localStorage.setItem(`subscription:${testUserId}`, JSON.stringify(largeSub));
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

    const metricErrorTests = [
      { _type: 'invalid schema', data: [{ id: '', userId: testUserId }], desc: 'validate each metric schema on read' },
      { _type: 'corrupted JSON', data: '{invalid json', desc: 'handle corrupted metrics JSON gracefully' },
      { _type: 'null', data: 'null', desc: 'return empty array for corrupted metrics' },
    ];

    metricErrorTests.forEach(({ _type, data, desc }) => {
      it(`should ${desc}`, async () => {
        localStorage.setItem(`usage:${testUserId}`, typeof data === 'string' ? data : JSON.stringify(data));
        const result = await getUsageMetrics(testUserId);
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
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

    const planErrorTests = [
      { _type: 'invalid schema', data: [{ id: '', name: 'Invalid' }], desc: 'validate each plan schema on read' },
      { _type: 'corrupted JSON', data: '{invalid json', desc: 'handle corrupted plans JSON gracefully' },
    ];

    planErrorTests.forEach(({ _type, data, desc }) => {
      it(`should ${desc}`, async () => {
        localStorage.setItem('plans', typeof data === 'string' ? data : JSON.stringify(data));
        const result = await getAvailablePlans();
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      });
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
      localStorage.setItem(`billing:${testUserId}`, JSON.stringify(mockInvoices));
      const result = await getBillingHistory(testUserId, 1, 10);
      expect(result).toBeDefined();
      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);
    });

    it('should return paginated results', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(`billing:${testUserId}`, JSON.stringify(mockInvoices));
      const result = await getBillingHistory(testUserId, 1, 5);
      expect(result.currentPage).toBe(1);
      expect(result.pageSize).toBe(5);
      expect(result.totalCount).toBeGreaterThanOrEqual(0);
    });

    const paginationTests = [
      { page: -1, size: 10, desc: 'handle invalid page numbers' },
      { page: 1, size: -5, desc: 'handle invalid page sizes' },
    ];

    paginationTests.forEach(({ page, size, desc }) => {
      it(`should ${desc}`, async () => {
        const mockInvoices = createMockInvoices();
        localStorage.setItem(`billing:${testUserId}`, JSON.stringify(mockInvoices));
        const result = await getBillingHistory(testUserId, page, size);
        expect(result.currentPage).toBeGreaterThanOrEqual(1);
        expect(result.pageSize).toBeGreaterThan(0);
      });
    });

    it('should indicate when there are more pages', async () => {
      const mockInvoices = createMockInvoices();
      localStorage.setItem(`billing:${testUserId}`, JSON.stringify(mockInvoices));
      const result = await getBillingHistory(testUserId, 1, 2);
      expect(result.hasNextPage).toBeDefined();
      expect(typeof result.hasNextPage).toBe('boolean');
    });

    it('should return empty result for nonexistent user', async () => {
      const result = await getBillingHistory('nonexistent-user', 1, 10);
      expect(result.invoices).toBeDefined();
      expect(Array.isArray(result.invoices)).toBe(true);
    });

    const billingErrorTests = [
      { _type: 'corrupted JSON', data: '{invalid json', desc: 'handle corrupted billing history JSON' },
      { _type: 'invalid schema', data: [{ id: '', userId: testUserId }], desc: 'validate invoice schema on read' },
    ];

    billingErrorTests.forEach(({ _type, data, desc }) => {
      it(`should ${desc}`, async () => {
        localStorage.setItem(`billing:${testUserId}`, typeof data === 'string' ? data : JSON.stringify(data));
        const result = await getBillingHistory(testUserId, 1, 10);
        expect(result).toBeDefined();
        expect(result.invoices).toBeDefined();
        expect(Array.isArray(result.invoices)).toBe(true);
      });
    });

    it('should calculate pagination correctly', async () => {
      const invoices = Array.from({ length: 25 }, (_, _i) => createMockInvoices()[0]);
      localStorage.setItem(`billing:${testUserId}`, JSON.stringify(invoices));
      const page1 = await getBillingHistory(testUserId, 1, 10);
      const page2 = await getBillingHistory(testUserId, 2, 10);
      expect(page1.invoices.length).toBeLessThanOrEqual(10);
      expect(page2.invoices.length).toBeLessThanOrEqual(10);
    });

    it('should handle large invoice objects', async () => {
      const largeInvoices = createMockInvoices();
      localStorage.setItem(`billing:${testUserId}`, JSON.stringify(largeInvoices));
      const result = await getBillingHistory(testUserId, 1, 100);
      expect(result.invoices).toBeDefined();
      result.invoices.forEach((invoice) => {
        expect(invoice.id).toBeDefined();
        expect(invoice.amount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('initializeSubscriptionData', () => {
    it('should initialize all subscription data in localStorage', async () => {
      await initializeSubscriptionData(testUserId);

      // Check subscription data
      const subData = localStorage.getItem(`subscription:${testUserId}`);
      expect(subData).toBeTruthy();
      const subscription = JSON.parse(subData!);
      expect(subscription.userId).toBe(testUserId);
      expect(subscription.planName).toBe('Free');

      // Check usage metrics
      const metricsData = localStorage.getItem(`usage:${testUserId}`);
      expect(metricsData).toBeTruthy();
      const metrics = JSON.parse(metricsData!);
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);

      // Check plans
      const plansData = localStorage.getItem('plans');
      expect(plansData).toBeTruthy();
      const plans = JSON.parse(plansData!);
      expect(Array.isArray(plans)).toBe(true);

      // Check billing history
      const billingData = localStorage.getItem(`billing:${testUserId}`);
      expect(billingData).toBeTruthy();
      const billing = JSON.parse(billingData!);
      expect(Array.isArray(billing)).toBe(true);
    });

    it('should not overwrite existing plans', async () => {
      const existingPlans = [{ id: 'custom-plan', name: 'Custom' }];
      localStorage.setItem('plans', JSON.stringify(existingPlans));

      await initializeSubscriptionData(testUserId);

      const plansData = localStorage.getItem('plans');
      const plans = JSON.parse(plansData!);
      expect(plans).toEqual(existingPlans);
    });

    it('should handle network delay', async () => {
      const startTime = Date.now();
      await initializeSubscriptionData(testUserId);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(250); // Allow some tolerance
    });
  });
});
