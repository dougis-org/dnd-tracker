/**
 * Centralized test data and parameterized test definitions for subscription tests
 * Reduces duplication and enables consistent test scenarios across components
 */

import {
  createMockSubscription,
  createMockUsageMetrics,
  createMockPlans,
} from '../../fixtures/subscription-fixtures';

/**
 * Standard test data scenarios for subscription states
 */
export const SUBSCRIPTION_TEST_SCENARIOS = {
  paidSubscription: () =>
    createMockSubscription({
      status: 'active',
      planName: 'Seasoned Adventurer',
      billingFrequency: 'annual',
    }),

  trialSubscription: (daysRemaining: number = 7) =>
    createMockSubscription({
      status: 'trial',
      trialDaysRemaining: daysRemaining,
    }),

  pausedSubscription: () =>
    createMockSubscription({
      status: 'paused',
    }),

  freeSubscription: () =>
    createMockSubscription({
      planName: 'Free',
      planId: 'plan_free',
      billingFrequency: 'monthly',
      status: 'active',
    }),
};

/**
 * Trial day scenarios for parameterized testing
 */
export const TRIAL_DAY_SCENARIOS = [
  { days: 1, label: '1 day', expectSingular: true, expectWarning: true },
  { days: 3, label: '3 days', expectSingular: false, expectWarning: true },
  { days: 4, label: '4 days', expectSingular: false, expectWarning: false },
  { days: 7, label: '7 days', expectSingular: false, expectWarning: false },
  { days: 14, label: '14 days', expectSingular: false, expectWarning: false },
];

/**
 * Subscription status scenarios for parameterized testing
 */
export const STATUS_BADGE_SCENARIOS = [
  {
    status: 'active' as const,
    expectedText: 'Current Plan',
    testId: 'status-active',
  },
  {
    status: 'paused' as const,
    expectedText: 'Paused',
    testId: 'status-paused',
  },
  { status: 'trial' as const, expectedText: 'Trial', testId: 'status-trial' },
];

/**
 * Billing frequency scenarios for parameterized testing
 */
export const BILLING_FREQUENCY_SCENARIOS = [
  { frequency: 'annual' as const, expectedText: 'Yearly' },
  { frequency: 'monthly' as const, expectedText: 'Monthly' },
];

/**
 * Renewal date scenarios for parameterized testing
 */
export const RENEWAL_DATE_SCENARIOS = [
  {
    name: 'renewing tomorrow',
    getDays: () => 1,
    expectText: /Renewing tomorrow/,
  },
  {
    name: 'renewing in 30 days',
    getDays: () => 30,
    expectText: /Renews/,
  },
  {
    name: 'expired (past date)',
    getDays: () => -1,
    expectText: /Expired/,
  },
];

/**
 * Fetch error scenarios for parameterized testing
 */
export const FETCH_ERROR_SCENARIOS = [
  { error: 'Network error', description: 'network failure' },
  { error: 'Unauthorized', description: 'auth failure' },
  { error: 'Server error', description: 'server failure' },
];

/**
 * Complete subscription page data for successful render tests
 */
export function createCompleteSubscriptionData() {
  return {
    subscription: createMockSubscription(),
    usageMetrics: createMockUsageMetrics(),
    availablePlans: createMockPlans(),
  };
}

/**
 * Helper to create renewal date offset from today
 */
export function createRenewalDateOffset(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
