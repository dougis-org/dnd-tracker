# Implementation Plan: User Dashboard with Real Data

**Branch**: `feature/016-user-dashboard-real-data`  
**Date**: 2025-11-29  
**Spec**: Feature 016 Specification

## Summary

Connect the existing dashboard UI (Feature 004) to real user data from MongoDB (Feature 014). Display authenticated user's subscription tier, real-time usage metrics (parties, characters, encounters), personalized welcome message, and empty states.

## Technical Context

**Language/Version**: TypeScript 5.9.2 (Node 25.1.0)  
**Primary Dependencies**: Next.js 16, React 19, Mongoose 8.19.1, Zod  
**Storage**: MongoDB Atlas  
**Testing**: Jest + Playwright (TDD required)  
**Performance Goals**: Dashboard loads <2 seconds (SC-001)  
**Constraints**: 100% accurate usage metrics, secure user data isolation  

## Phase 0: Research - Key Findings

1. **Tier Limit Calculation**: Use subscription model tier definitions (5 tiers: free_adventurer, seasoned_adventurer, expert_dungeon_master, master_of_dungeons, guild_master)
2. **Real-Time Usage Aggregation**: Query resource counts at page load (no cache) to meet SC-010
3. **Cache Enforcement**: API response header `Cache-Control: no-store, no-cache, must-revalidate` and SWR client `revalidateOnFocus: false`
4. **User Display Name**: Use displayName if set, else email fallback
5. **Empty State**: Trigger when all resource counts = 0
6. **Error Handling**: Graceful fallback with error banner + retry (max 3 attempts per FR-009)
7. **Visual Indicators**: Progress bars with color states (green <80%, yellow 80-100%, red ≥100%)
8. **Collection Existence**: Return 0 if collections don't exist

## Phase 1: Design - Data Model

### DashboardData (computed, not stored)

```typescript
{
  user: {
    id: string;           // userId from Clerk
    email: string;
    displayName: string;  // or email fallback
    tier: SubscriptionTier;
  },
  usage: {
    parties: number;
    characters: number;
    encounters: number;
  },
  limits: {
    parties: number;
    characters: number;
    encounters: number;
  },
  percentages: {
    parties: number;
    characters: number;
    encounters: number;
  },
  isEmpty: boolean;
  createdAt: ISO8601;
}
```

## Phase 2: Implementation Strategy

### MVP-First Delivery

1. **Phase 1-2**: Setup & Foundational (types, utils, API)
2. **Phase 3**: User Story P1 (core dashboard) — MVP complete
3. **Phase 4**: User Story P2 (error handling, production-ready)
4. **Phase 5**: Polish (code quality, docs)

### Parallel Execution

- **Component Development**: T012-T015 parallelizable after T010 defines contract
- **Unit Tests**: T016-T019 parallelizable
- **E2E Tests**: T025-T027 parallelizable after Phase 4 complete

## Success Criteria

- SC-001: Dashboard loads within 2 seconds
- SC-002: All metrics 100% accurate
- SC-003: All 5 tiers tested
- SC-004: Progress bar colors correct
- SC-005: Friendly error messages
- SC-006: Empty state logic correct
- SC-007: Soft-deleted resources excluded
- SC-008: API response <300ms (99%)
- SC-009: Mobile-responsive + WCAG 2.1 AA
- SC-010: Fresh data on each load (no cache)

## File Paths Reference

### Source Code

```
src/
├── types/
│   ├── subscription.ts (NEW — T006)
│   └── dashboard.ts (NEW — T007)
├── lib/
│   └── dashboardApi.ts (NEW — T008)
├── app/api/v1/dashboard/
│   └── usage/route.ts (NEW — T009)
└── components/Dashboard/ (NEW)
    ├── Dashboard.tsx (NEW — T010)
    ├── DashboardContent.tsx (NEW — T011)
    ├── TierInfo.tsx (NEW — T012)
    ├── UsageMetrics.tsx (NEW — T013)
    ├── QuickActions.tsx (NEW — T014)
    ├── EmptyState.tsx (NEW — T015)
    └── ErrorState.tsx (NEW — T021)
```

### Test Files

```
tests/
├── unit/dashboard/
│   └── api.test.ts (NEW — T016)
├── unit/components/
│   ├── UsageMetrics.test.tsx (NEW — T017)
│   ├── TierInfo.test.tsx (NEW — T018)
│   └── EmptyState.test.tsx (NEW — T019)
├── integration/
│   ├── dashboard.integration.test.ts (NEW — T020)
│   ├── emptyState.integration.test.ts (NEW — T023)
│   └── errorHandling.integration.test.ts (NEW — T024)
└── e2e/
    ├── dashboard.e2e.test.ts (NEW — T025)
    ├── emptyState.e2e.test.ts (NEW — T026)
    └── quickActions.e2e.test.ts (NEW — T027)

