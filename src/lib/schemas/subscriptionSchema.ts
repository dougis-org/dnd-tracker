/**
 * Subscription & Billing Zod Schemas
 *
 * Single source of truth for validation and TypeScript types for all
 * subscription and billing data structures. All types are inferred from
 * Zod schemas to ensure type safety.
 *
 * Entities:
 * - Subscription: User's current plan subscription status
 * - Plan: Available subscription tier (shared across users)
 * - UsageMetric: Single usage category with current and max values
 * - Invoice: Billing transaction in user's history
 * - PaginatedInvoices: Paginated response for invoice list API
 */

import { z } from 'zod';

/**
 * SubscriptionSchema: Represents a user's current plan subscription status
 */
export const SubscriptionSchema = z.object({
  id: z.string().min(1, 'Subscription ID required'),
  userId: z.string().min(1, 'User ID required'),
  planId: z.string().min(1, 'Plan ID required'),
  planName: z.enum(['Free', 'Seasoned Adventurer', 'Master DM']),
  billingFrequency: z.enum(['monthly', 'annual']),
  renewalDate: z.coerce.date(),
  status: z.enum(['active', 'trial', 'paused', 'canceled']),
  trialDaysRemaining: z.number().min(0).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

/**
 * PlanSchema: Represents an available subscription tier with features and limits
 */
export const PlanSchema = z.object({
  id: z.string().min(1, 'Plan ID required'),
  name: z.enum(['Free', 'Seasoned Adventurer', 'Master DM']),
  monthlyPrice: z.number().min(0),
  annualPrice: z.number().min(0),
  features: z.array(z.string()).min(1),
  usageLimits: z.record(z.string(), z.number().min(0)),
});

export type Plan = z.infer<typeof PlanSchema>;

/**
 * UsageMetricSchema: Represents a single usage category with current and max values
 */
export const UsageMetricSchema = z.object({
  id: z.string().min(1, 'Metric ID required'),
  userId: z.string().min(1, 'User ID required'),
  metricName: z.enum(['parties', 'encounters', 'characters', 'combatSessions']),
  currentUsage: z.number().min(0),
  maxAllowed: z.number().min(0),
  category: z.enum(['character', 'party', 'encounter']),
  updatedAt: z.coerce.date(),
});

export type UsageMetric = z.infer<typeof UsageMetricSchema>;

/**
 * InvoiceSchema: Represents a billing transaction in user's history
 */
export const InvoiceSchema = z.object({
  id: z.string().min(1, 'Invoice ID required'),
  userId: z.string().min(1, 'User ID required'),
  date: z.coerce.date(),
  description: z.string().min(1),
  amount: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  status: z.enum(['Paid', 'Pending', 'Failed']),
  taxAmount: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  downloadUrl: z.string().url().optional(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

/**
 * PaginatedInvoicesSchema: Response schema for paginated invoice list API
 */
export const PaginatedInvoicesSchema = z.object({
  invoices: z.array(InvoiceSchema),
  totalCount: z.number().min(0),
  pageSize: z.number().min(1),
  currentPage: z.number().min(1),
  hasNextPage: z.boolean().optional(),
});

export type PaginatedInvoices = z.infer<typeof PaginatedInvoicesSchema>;

/**
 * Response schema for GET /api/subscription endpoint
 */
export const SubscriptionResponseSchema = z.object({
  subscription: SubscriptionSchema,
  usageMetrics: z.array(UsageMetricSchema),
  availablePlans: z.array(PlanSchema),
});

export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
