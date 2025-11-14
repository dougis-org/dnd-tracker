/**
 * Default data factory functions for subscription adapter
 */

import type {
  Subscription,
  Plan,
  UsageMetric,
} from '../schemas/subscriptionSchema';

export function createDefaultSubscription(userId: string): Subscription {
  const renewalDate = new Date();
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  return {
    id: `sub_${userId}`,
    userId,
    planId: 'plan_free',
    planName: 'Free',
    billingFrequency: 'monthly',
    renewalDate,
    status: 'active',
    trialDaysRemaining: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createDefaultUsageMetrics(userId: string): UsageMetric[] {
  return [
    {
      id: 'metric_parties',
      userId,
      metricName: 'parties',
      currentUsage: 0,
      maxAllowed: 1,
      category: 'party',
      updatedAt: new Date(),
    },
    {
      id: 'metric_encounters',
      userId,
      metricName: 'encounters',
      currentUsage: 0,
      maxAllowed: 5,
      category: 'encounter',
      updatedAt: new Date(),
    },
    {
      id: 'metric_characters',
      userId,
      metricName: 'characters',
      currentUsage: 0,
      maxAllowed: 10,
      category: 'character',
      updatedAt: new Date(),
    },
    {
      id: 'metric_combatSessions',
      userId,
      metricName: 'combatSessions',
      currentUsage: 0,
      maxAllowed: 3,
      category: 'encounter',
      updatedAt: new Date(),
    },
  ];
}

export function createDefaultPlans(): Plan[] {
  return [
    {
      id: 'plan_free',
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Up to 1 party',
        'Up to 5 encounters',
        'Basic character management',
        'Limited combat tracking',
      ],
      usageLimits: {
        parties: 1,
        encounters: 5,
        characters: 10,
        combatSessions: 3,
      },
    },
    {
      id: 'plan_sa',
      name: 'Seasoned Adventurer',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: [
        'Up to 5 parties',
        'Up to 50 encounters',
        'Advanced character management',
        'Full combat tracking',
        'Encounter builder',
      ],
      usageLimits: {
        parties: 5,
        encounters: 50,
        characters: 50,
        combatSessions: 50,
      },
    },
    {
      id: 'plan_md',
      name: 'Master DM',
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      features: [
        'Unlimited parties',
        'Unlimited encounters',
        'Advanced character management',
        'Full combat tracking',
        'Encounter builder',
        'Monster library',
        'Advanced reporting',
        'Priority support',
      ],
      usageLimits: {
        parties: 999999,
        encounters: 999999,
        characters: 999999,
        combatSessions: 999999,
      },
    },
  ];
}
