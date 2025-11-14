/**
 * Subscription Mock Adapter (localStorage)
 *
 * Provides localStorage-backed data access for subscription and billing features.
 * Implements 300ms network delay simulation and Zod schema validation.
 * Ready to be swapped for MongoDB adapter in F014.
 */
'use client';

import type {
  Subscription,
  Plan,
  UsageMetric,
  Invoice,
  PaginatedInvoices,
} from '../schemas/subscriptionSchema';
import {
  delay,
  getStorage,
  safeJsonParse,
} from '../subscription/storageUtils';
import {
  validateSubscription,
  validateUsageMetrics,
  validatePlans,
  validateInvoices,
} from '../subscription/validationHelpers';
import { createDefaultSubscription, createDefaultUsageMetrics, createDefaultPlans } from './subscriptionDefaults';

const NETWORK_DELAY_MS = 300;
const storage = getStorage();

export async function getSubscription(userId: string): Promise<Subscription> {
  await delay(NETWORK_DELAY_MS);

  try {
    const data = safeJsonParse(
      storage.getItem(`subscription:${userId}`) as string | null
    );

    const validated = validateSubscription(data);
    if (validated) return validated;

    storage.removeItem(`subscription:${userId}`);
    return createDefaultSubscription(userId);
  } catch (error) {
    console.error(`Error fetching subscription for user ${userId}:`, error);
    return createDefaultSubscription(userId);
  }
}

export async function getUsageMetrics(userId: string): Promise<UsageMetric[]> {
  await delay(NETWORK_DELAY_MS);

  try {
    const data = safeJsonParse(
      storage.getItem(`usage:${userId}`) as string | null
    );

    if (!Array.isArray(data) || data.length === 0) {
      return createDefaultUsageMetrics(userId);
    }

    const metrics = validateUsageMetrics(data);
    return metrics.length > 0 ? metrics : createDefaultUsageMetrics(userId);
  } catch (error) {
    console.error(`Error fetching usage metrics for user ${userId}:`, error);
    return createDefaultUsageMetrics(userId);
  }
}

export async function getAvailablePlans(): Promise<Plan[]> {
  await delay(NETWORK_DELAY_MS);

  try {
    const data = safeJsonParse(storage.getItem('plans') as string | null);

    if (!Array.isArray(data) || data.length === 0) {
      return createDefaultPlans();
    }

    const plans = validatePlans(data);
    return plans.length > 0 ? plans : createDefaultPlans();
  } catch (error) {
    console.error('Error fetching available plans:', error);
    return createDefaultPlans();
  }
}

export async function getBillingHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedInvoices> {
  await delay(NETWORK_DELAY_MS);

  const safePage = Math.max(1, parseInt(String(page), 10) || 1);
  const safePageSize = Math.max(
    1,
    Math.min(100, parseInt(String(pageSize), 10) || 10)
  );

  try {
    const data = safeJsonParse(
      storage.getItem(`billing:${userId}`) as string | null
    );

    if (!Array.isArray(data) || data.length === 0) {
      return createEmptyPaginatedInvoices(safePage, safePageSize);
    }

    const invoices = validateInvoices(data);
    return paginateInvoices(invoices, safePage, safePageSize);
  } catch (error) {
    console.error(`Error fetching billing history for user ${userId}:`, error);
    return createEmptyPaginatedInvoices(safePage, safePageSize);
  }
}

function createEmptyPaginatedInvoices(
  page: number,
  pageSize: number
): PaginatedInvoices {
  return {
    invoices: [],
    totalCount: 0,
    pageSize,
    currentPage: page,
    hasNextPage: false,
  };
}

function paginateInvoices(
  invoices: Invoice[],
  page: number,
  pageSize: number
): PaginatedInvoices {
  const totalCount = invoices.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedInvoices = invoices.slice(startIndex, endIndex);
  const hasNextPage = endIndex < totalCount;

  return {
    invoices: paginatedInvoices,
    totalCount,
    pageSize,
    currentPage: page,
    hasNextPage,
  };
}

export function initializeMockData(userId: string): void {
  try {
    const subscription = createDefaultSubscription(userId);
    storage.setItem(`subscription:${userId}`, JSON.stringify(subscription));

    const metrics = createDefaultUsageMetrics(userId);
    storage.setItem(`usage:${userId}`, JSON.stringify(metrics));

    if (!storage.getItem('plans')) {
      const plans = createDefaultPlans();
      storage.setItem('plans', JSON.stringify(plans));
    }

    storage.setItem(`billing:${userId}`, JSON.stringify([]));
  } catch (error) {
    console.error(`Error initializing mock data for user ${userId}:`, error);
  }
}
