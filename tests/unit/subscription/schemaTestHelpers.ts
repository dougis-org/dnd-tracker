/**
 * Shared test data helpers for subscription schema tests
 * 
 * Extracts common test object creation to reduce code duplication
 */

/**
 * Creates a valid subscription object for testing
 */
export const createValidSubscription = (overrides = {}) => ({
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
  ...overrides,
});

/**
 * Creates a valid plan object for testing
 */
export const createValidPlan = (overrides = {}) => ({
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
  ...overrides,
});

/**
 * Creates a valid usage metric object for testing
 */
export const createValidUsageMetric = (overrides = {}) => ({
  id: 'metric_parties',
  userId: 'user-123',
  metricName: 'parties' as const,
  currentUsage: 2,
  maxAllowed: 5,
  category: 'party' as const,
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Creates a valid invoice object for testing
 */
export const createValidInvoice = (overrides = {}) => ({
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
  ...overrides,
});
