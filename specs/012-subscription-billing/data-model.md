# Data Model & Schemas: Subscription & Billing (Feature 012)

**Feature**: Feature 012 - Subscription & Billing Pages  
**Document Type**: Phase 1 Design Artifact  
**Date**: 2025-11-13  
**Status**: Design  

---

## Overview

This document defines the core data entities, relationships, validation rules, and storage patterns for Feature 012 (Subscription & Billing Pages). All data structures are defined using Zod for runtime validation and TypeScript type inference.

**Key Design Principles**:

- Single source of truth: Zod schemas define both validation and TypeScript types
- Immutability constraints: id, userId, timestamps cannot be mutated via API
- Pagination-ready: invoices API returns totalCount and pageSize for future backend pagination
- Mock-first: localStorage-backed adapter with 300ms network delay; swappable for MongoDB in F014

---

## Core Entities

### 1. Subscription

Represents a user's current plan subscription status.

```typescript
// Zod Schema
const SubscriptionSchema = z.object({
  id: z.string().min(1, 'Subscription ID required'),
  userId: z.string().min(1, 'User ID required'),
  planId: z.string().min(1, 'Plan ID required'),
  planName: z.enum(['Free', 'Seasoned Adventurer', 'Master DM']),
  billingFrequency: z.enum(['monthly', 'annual']),
  renewalDate: z.coerce.date(),
  status: z.enum(['active', 'trial', 'paused', 'canceled']),
  trialDaysRemaining: z.number().min(0).nullable().optional(), // null if not on trial
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// TypeScript Type (inferred from schema)
type Subscription = z.infer<typeof SubscriptionSchema>;
```

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | string | non-empty | Unique subscription identifier |
| `userId` | string | non-empty | Foreign key to user |
| `planId` | string | non-empty | Foreign key to Plan |
| `planName` | enum | Free \| Seasoned Adventurer \| Master DM | Display name of current plan |
| `billingFrequency` | enum | monthly \| annual | Billing cycle |
| `renewalDate` | Date | ISO 8601 | When subscription renews (next charge date) |
| `status` | enum | active \| trial \| paused \| canceled | Current status |
| `trialDaysRemaining` | number \| null | ≥0 or null | Only populated if status='trial'; null otherwise |
| `createdAt` | Date | ISO 8601 | Subscription created timestamp |
| `updatedAt` | Date | ISO 8601 | Last modified timestamp |

**Sample Data**:

```json
{
  "id": "sub_abc123",
  "userId": "user-123",
  "planId": "plan_sa",
  "planName": "Seasoned Adventurer",
  "billingFrequency": "annual",
  "renewalDate": "2026-11-13T00:00:00Z",
  "status": "active",
  "trialDaysRemaining": null,
  "createdAt": "2025-11-01T12:00:00Z",
  "updatedAt": "2025-11-13T15:30:00Z"
}
```

**Validation Rules**:

- `planName` must match an available Plan tier (enforced via Plan reference)
- `renewalDate` must be in the future (for active subscriptions)
- `trialDaysRemaining` only valid when `status='trial'`
- `createdAt` ≤ `updatedAt` (enforced by adapter)

**Storage**:

- **Mock Adapter**: localStorage key = `subscription:${userId}`
- **F014 (MongoDB)**: Collection `subscriptions`, index on `userId` + `planId`

---

### 2. Plan

Represents an available subscription tier with features and usage limits.

```typescript
const PlanSchema = z.object({
  id: z.string().min(1, 'Plan ID required'),
  name: z.enum(['Free', 'Seasoned Adventurer', 'Master DM']),
  monthlyPrice: z.number().min(0),
  annualPrice: z.number().min(0),
  features: z.array(z.string()).min(1),
  usageLimits: z.record(z.string(), z.number()),
});

type Plan = z.infer<typeof PlanSchema>;
```

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | string | non-empty | Unique plan identifier |
| `name` | enum | Free \| Seasoned Adventurer \| Master DM | Plan tier name |
| `monthlyPrice` | number | ≥0 | Monthly subscription price in USD (0 for Free) |
| `annualPrice` | number | ≥0 | Annual subscription price in USD (0 for Free) |
| `features` | string[] | ≥1 item | List of feature descriptions for this tier |
| `usageLimits` | object | keys = metric names, values ≥0 | Feature usage limits (e.g., `{ "parties": 3, "encounters": 15 }`) |

**Sample Data**:

```json
{
  "id": "plan_free",
  "name": "Free",
  "monthlyPrice": 0,
  "annualPrice": 0,
  "features": [
    "Up to 1 party",
    "Up to 5 encounters",
    "Basic character management",
    "Limited combat tracking"
  ],
  "usageLimits": {
    "parties": 1,
    "encounters": 5,
    "characters": 10,
    "combatSessions": 3
  }
},
{
  "id": "plan_sa",
  "name": "Seasoned Adventurer",
  "monthlyPrice": 9.99,
  "annualPrice": 99.99,
  "features": [
    "Up to 5 parties",
    "Up to 50 encounters",
    "Advanced character management",
    "Full combat tracking",
    "Encounter builder"
  ],
  "usageLimits": {
    "parties": 5,
    "encounters": 50,
    "characters": 50,
    "combatSessions": 50
  }
},
{
  "id": "plan_md",
  "name": "Master DM",
  "monthlyPrice": 19.99,
  "annualPrice": 199.99,
  "features": [
    "Unlimited parties",
    "Unlimited encounters",
    "Advanced character management",
    "Full combat tracking",
    "Encounter builder",
    "Monster library",
    "Advanced reporting",
    "Priority support"
  ],
  "usageLimits": {
    "parties": 999999,
    "encounters": 999999,
    "characters": 999999,
    "combatSessions": 999999
  }
}
```

**Validation Rules**:

- `annualPrice` typically ≥ `monthlyPrice * 12` (discourage yearly billing without discount logic)
- `features` array must have at least 1 feature
- `usageLimits` keys must correspond to valid usage metric names

**Storage**:

- **Mock Adapter**: localStorage key = `plans` (shared; not per-user)
- **F014 (MongoDB)**: Collection `plans`, no user reference (global configuration)

---

### 3. UsageMetric

Represents a single usage category (parties, encounters, etc.) with current and max values.

```typescript
const UsageMetricSchema = z.object({
  id: z.string().min(1, 'Metric ID required'),
  userId: z.string().min(1, 'User ID required'),
  metricName: z.enum(['parties', 'encounters', 'characters', 'combatSessions']),
  currentUsage: z.number().min(0),
  maxAllowed: z.number().min(0),
  category: z.enum(['character', 'party', 'encounter']),
  updatedAt: z.coerce.date(),
});

type UsageMetric = z.infer<typeof UsageMetricSchema>;
```

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | string | non-empty | Unique metric identifier |
| `userId` | string | non-empty | Foreign key to user |
| `metricName` | enum | parties \| encounters \| characters \| combatSessions | Metric category |
| `currentUsage` | number | ≥0 | Current count of items |
| `maxAllowed` | number | ≥0 | Plan limit for this metric |
| `category` | enum | character \| party \| encounter | Grouping for UI |
| `updatedAt` | Date | ISO 8601 | Last count update |

**Sample Data**:

```json
[
  {
    "id": "metric_parties",
    "userId": "user-123",
    "metricName": "parties",
    "currentUsage": 2,
    "maxAllowed": 5,
    "category": "party",
    "updatedAt": "2025-11-13T10:00:00Z"
  },
  {
    "id": "metric_encounters",
    "userId": "user-123",
    "metricName": "encounters",
    "currentUsage": 12,
    "maxAllowed": 50,
    "category": "encounter",
    "updatedAt": "2025-11-13T10:00:00Z"
  },
  {
    "id": "metric_characters",
    "userId": "user-123",
    "metricName": "characters",
    "currentUsage": 8,
    "maxAllowed": 50,
    "category": "character",
    "updatedAt": "2025-11-13T10:00:00Z"
  }
]
```

**Validation Rules**:

- `currentUsage` ≤ `maxAllowed` (enforced by adapter; query counts from user's data)
- `maxAllowed` must match Plan's `usageLimits[metricName]`

**Storage**:

- **Mock Adapter**: localStorage key = `usage:${userId}` (array of metrics)
- **F014 (MongoDB)**: Derived from user's actual data (count queries on characters, parties, etc.)

**UI Rendering Rules** (in UsageMetrics component):

- If `maxAllowed` = 0 or 999999: display "Unlimited"
- If `currentUsage / maxAllowed` ≥ 0.8: warn state (amber color, ⚠ label)
- If `currentUsage >= maxAllowed`: error state (red, "Limit reached")
- Progress bar: `percentage = (currentUsage / maxAllowed) * 100` or 0 if maxAllowed = 0

---

### 4. Invoice

Represents a billing transaction in the user's history.

```typescript
const InvoiceSchema = z.object({
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

type Invoice = z.infer<typeof InvoiceSchema>;
```

**Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | string | non-empty | Unique invoice identifier |
| `userId` | string | non-empty | Foreign key to user |
| `date` | Date | ISO 8601 | Invoice date |
| `description` | string | non-empty | e.g., "Seasoned Adventurer - Annual Subscription" |
| `amount` | number | ≥0 | Total amount in specified currency |
| `currency` | string | 3-char ISO 4217 | Currency code (default USD) |
| `status` | enum | Paid \| Pending \| Failed | Payment status |
| `taxAmount` | number | ≥0, optional | Tax charged (e.g., sales tax) |
| `taxRate` | number | 0–1, optional | Tax rate as decimal (e.g., 0.08 for 8%) |
| `downloadUrl` | string | URL, optional | Link to PDF invoice (non-functional in F012) |

**Sample Data**:

```json
[
  {
    "id": "inv_001",
    "userId": "user-123",
    "date": "2025-10-13T00:00:00Z",
    "description": "Seasoned Adventurer - Annual Subscription",
    "amount": 99.99,
    "currency": "USD",
    "status": "Paid",
    "taxAmount": 7.50,
    "taxRate": 0.08,
    "downloadUrl": "https://billing.example.com/invoices/inv_001.pdf"
  },
  {
    "id": "inv_002",
    "userId": "user-123",
    "date": "2025-09-13T00:00:00Z",
    "description": "Seasoned Adventurer - Annual Subscription",
    "amount": 99.99,
    "currency": "USD",
    "status": "Paid",
    "taxAmount": 7.50,
    "taxRate": 0.08,
    "downloadUrl": "https://billing.example.com/invoices/inv_002.pdf"
  }
]
```

**Validation Rules**:

- `currency` must be valid ISO 4217 code (default USD)
- `taxAmount` ≤ `amount`
- `taxRate` between 0 and 1 (0% to 100%)
- `date` typically ≤ today (past or current invoice)

**Storage**:

- **Mock Adapter**: localStorage key = `billing:${userId}` (array of invoices)
- **F014 (MongoDB)**: Collection `invoices`, index on `userId` + `date`

---

### 5. Pagination Response

Schema for paginated list responses (used by billing history API).

```typescript
const PaginatedInvoicesSchema = z.object({
  invoices: z.array(InvoiceSchema),
  totalCount: z.number().min(0),
  pageSize: z.number().min(1),
  currentPage: z.number().min(1),
  hasNextPage: z.boolean().optional(),
});

type PaginatedInvoices = z.infer<typeof PaginatedInvoicesSchema>;
```

**Sample Response**:

```json
{
  "invoices": [
    { "id": "inv_001", "userId": "user-123", ... },
    { "id": "inv_002", "userId": "user-123", ... },
    ...
  ],
  "totalCount": 12,
  "pageSize": 10,
  "currentPage": 1,
  "hasNextPage": true
}
```

---

## Relationships & Dependencies

### Entity Diagram

```
User
  ↓
  ├─→ Subscription (1-1: user has one active subscription)
  │     ↓
  │     └─→ Plan (N-1: subscription references a plan)
  │
  ├─→ UsageMetrics (1-N: user has multiple usage metrics)
  │
  └─→ Invoice[] (1-N: user has multiple invoices)

Plan (global, not per-user; shared across users)
  └─→ usageLimits (defines max values for usage metrics)
```

### Key Constraints

1. **Subscription → Plan**: `subscription.planId` must match an existing `plan.id`
2. **UsageMetric → Plan**: `usageMetric.maxAllowed` must equal `plan.usageLimits[usageMetric.metricName]`
3. **Invoice → Subscription**: Implicitly linked via `subscription.renewalDate` and invoice history
4. **Immutability**: id, userId, timestamps cannot be mutated; only status, planId can change (upgrade/downgrade)

---

## API Contracts

### GET /api/subscription

**Request**:

```
GET /api/subscription
Headers: x-user-id: user-123 (mocked; F013 will use Clerk auth)
```

**Response (200)**:

```json
{
  "subscription": {
    "id": "sub_abc123",
    "userId": "user-123",
    "planId": "plan_sa",
    "planName": "Seasoned Adventurer",
    "billingFrequency": "annual",
    "renewalDate": "2026-11-13T00:00:00Z",
    "status": "active",
    "trialDaysRemaining": null,
    "createdAt": "2025-11-01T12:00:00Z",
    "updatedAt": "2025-11-13T15:30:00Z"
  },
  "usageMetrics": [
    { "id": "metric_parties", "userId": "user-123", "metricName": "parties", "currentUsage": 2, "maxAllowed": 5, "category": "party", "updatedAt": "2025-11-13T10:00:00Z" },
    { "id": "metric_encounters", "userId": "user-123", "metricName": "encounters", "currentUsage": 12, "maxAllowed": 50, "category": "encounter", "updatedAt": "2025-11-13T10:00:00Z" }
  ],
  "availablePlans": [
    { "id": "plan_free", "name": "Free", "monthlyPrice": 0, "annualPrice": 0, "features": [...], "usageLimits": {...} },
    { "id": "plan_sa", "name": "Seasoned Adventurer", "monthlyPrice": 9.99, "annualPrice": 99.99, "features": [...], "usageLimits": {...} },
    { "id": "plan_md", "name": "Master DM", "monthlyPrice": 19.99, "annualPrice": 199.99, "features": [...], "usageLimits": {...} }
  ]
}
```

**Error (500)**:

```json
{ "error": "Failed to fetch subscription" }
```

---

### GET /api/billing/history

**Request**:

```
GET /api/billing/history?page=1&pageSize=10
Headers: x-user-id: user-123
```

**Query Parameters**:

| Param | Type | Default | Range |
|-------|------|---------|-------|
| `page` | integer | 1 | ≥1 |
| `pageSize` | integer | 10 | 1–100 |

**Response (200)**:

```json
{
  "invoices": [
    { "id": "inv_001", "userId": "user-123", "date": "2025-10-13T00:00:00Z", "description": "Seasoned Adventurer - Annual Subscription", "amount": 99.99, "currency": "USD", "status": "Paid", "taxAmount": 7.50, "taxRate": 0.08, "downloadUrl": "..." },
    ...
  ],
  "totalCount": 12,
  "pageSize": 10,
  "currentPage": 1,
  "hasNextPage": true
}
```

**Error (400)**:

```json
{ "error": "Invalid page or pageSize" }
```

---

## Storage & Persistence Strategy

### Mock Adapter (F012)

**localStorage Keys**:

```
subscription:${userId}                      → Subscription object (JSON string)
usage:${userId}                            → UsageMetric[] (JSON string)
plans                                      → Plan[] (JSON string, shared)
billing:${userId}                          → Invoice[] (JSON string)
```

**Network Delay**: 300ms (simulated with `setTimeout`)

**Validation**: Zod schema validation on every read/write

**Recovery**: Corrupted data → console.error + clear storage + return defaults

### F014 (MongoDB) - Future

**Collections**:

- `subscriptions`: Indexed on `userId`, `planId`
- `plans`: Global collection (no user index)
- `invoices`: Indexed on `userId`, `date`
- (UsageMetrics derived from user's actual data counts; not stored separately)

**Migrations**: Adapter swap; no schema changes in F012

---

## Validation Rules Summary

### Subscription

- ✅ `planName` ∈ {Free, Seasoned Adventurer, Master DM}
- ✅ `billingFrequency` ∈ {monthly, annual}
- ✅ `renewalDate` is ISO date in future (for active subscriptions)
- ✅ `status` ∈ {active, trial, paused, canceled}
- ✅ `trialDaysRemaining` ≥0 if status='trial', else null
- ✅ `createdAt` ≤ `updatedAt`

### UsageMetric

- ✅ `metricName` ∈ {parties, encounters, characters, combatSessions}
- ✅ `currentUsage` ≥ 0
- ✅ `maxAllowed` ≥ 0
- ✅ `currentUsage` ≤ `maxAllowed` (business logic enforced)

### Invoice

- ✅ `date` is ISO date ≤ today
- ✅ `amount` ≥ 0
- ✅ `currency` is valid 3-char ISO 4217 code
- ✅ `status` ∈ {Paid, Pending, Failed}
- ✅ `taxAmount` (if present) ≤ `amount`
- ✅ `taxRate` (if present) ∈ [0, 1]

---

## Testing Strategy

### Schema Validation Tests

```typescript
// Example: Valid subscription passes
const validSub = { /* ... */ };
const result = SubscriptionSchema.safeParse(validSub);
expect(result.success).toBe(true);

// Example: Invalid status rejected
const invalidSub = { /* status: 'unknown' */ };
const result = SubscriptionSchema.safeParse(invalidSub);
expect(result.success).toBe(false);
expect(result.error.issues[0].message).toContain('status');
```

### Adapter Tests

```typescript
// Example: Subscription persists
const sub = await adapter.getSubscription('user-123');
expect(sub.planName).toBe('Seasoned Adventurer');

// Example: Corrupted data recovered
localStorage.setItem('subscription:user-456', '{invalid json}');
const recovered = await adapter.getSubscription('user-456');
expect(recovered).toBeDefined();
expect(localStorage.getItem('subscription:user-456')).toBeNull(); // cleared
```

### API Route Tests

```typescript
// Example: GET /api/subscription returns correct schema
const res = await fetch('/api/subscription', {
  headers: { 'x-user-id': 'user-123' }
});
const data = await res.json();
expect(data).toHaveProperty('subscription');
expect(data).toHaveProperty('usageMetrics');
expect(data).toHaveProperty('availablePlans');
```

---

## Summary

Feature 012 defines a clean, type-safe data model for subscription and billing with:

- **5 core entities**: Subscription, Plan, UsageMetric, Invoice, PaginatedResponse
- **Zod schemas**: Single source of truth for validation and TypeScript types
- **Mock-first adapter**: localStorage persistence with 300ms delay; swappable for F014
- **Two API routes**: `/api/subscription` and `/api/billing/history` with pagination
- **Strong validation**: Immutability constraints, enum-based status fields, numeric bounds

All schemas are **testable**, **composable**, and **ready for backend integration** in Feature 014.

---

**Document Generated**: 2025-11-13 | **Status**: Ready for Implementation
