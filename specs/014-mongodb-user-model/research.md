# Research: Feature 014 - MongoDB User Model & Webhook

**Date**: 2025-11-18 | **Researcher**: AI Agent

## Overview

This document resolves all technical clarifications required for Feature 014 implementation. It provides the technology choices, patterns, and design decisions that guide the implementation plan.

---

## Technical Context Resolutions

### Language & Version

**Decision**: TypeScript 5.9.2 (Next.js 16, React 19)  
**Rationale**: Consistent with project standards as defined in `docs/Tech-Stack.md`. All backend API routes and models must use TypeScript strict mode with 100% type coverage.  
**Source**: `/package.json`, `/docs/Tech-Stack.md`

### Primary Dependencies

**Decision**:

- Mongoose 8.19.1+ (MongoDB ODM)
- Next.js 16.0+ API routes
- Zod 3.23.8 (validation)
- Node.js 25.1.0+ runtime

**Rationale**:

- Mongoose is already in project dependencies for data modeling (see `/src/lib/models/encounter.ts` as pattern).
- Next.js API routes used for all internal and webhook endpoints (pattern in `/src/app/api/subscription/route.ts`).
- Zod matches existing validation pattern (already used in project schemas).

**Source**: `/package.json`, existing patterns in `/src/lib/models/`, `/src/app/api/`

### Storage

**Decision**: MongoDB Atlas (confirmed in spec clarifications Q1)  
**Connection Pattern**:

- Use `src/lib/db/connection.ts` (existing MongoDB connection helper per codebase search results)
- Connection reuse via global cache to avoid serverless connection storms
- Environment variables: `MONGODB_URI`, `MONGODB_DB`

**Rationale**: Spec confirms Atlas is used. Existing codebase has connection helper pattern that reuses client across invocations (critical for serverless).  
**Source**: Feature spec Section "Assumptions"

### Testing Strategy

**Decision**:

- Unit tests: Jest 30.2.0+ with `@testcontainers/mongodb` for isolated model testing
- Integration tests: Jest with testcontainers for full CRUD + webhook flows
- Approach: Test-Driven Development (TDD) required per constitution

**Rationale**:

- Project already uses Jest + testcontainers (see `/tests/test-helpers/mongo-testcontainers.ts`).
- TDD mandatory per `CONTRIBUTING.md` "Development Process" section.
- Target 80%+ coverage on touched code.

**Source**: `/TESTING.md`, `/CONTRIBUTING.md`, `/tests/test-helpers/`

### Target Platform

**Decision**: Next.js 16 full-stack (Node.js serverless or traditional server)  
**Rationale**: API routes are server-only; webhook is server-side only; no client-side exposure.  
**Source**: Feature spec Non-goals section

### Performance Goals

**Decision**:

- Webhook POST latency: ≤ 3 seconds (per spec)
- Payload size limit: 1MB max (per spec)
- No rate limiting (per spec clarification Q5)

**Rationale**: Spec explicitly defines these in "Non-Functional Requirements" section.

### Constraints

**Decision**:

- Max function size: 50 lines per `CONTRIBUTING.md`
- Max file size: 450 lines (uncommented) per `CONTRIBUTING.md`
- Soft-delete only strategy (no hard deletes) per spec clarification Q1
- Timestamp-based conflict resolution for concurrent updates (per spec clarification Q3)
- Structured JSON logging at INFO/WARN/ERROR levels per spec clarification Q4

**Rationale**: These are project-wide standards. Soft-delete and timestamp resolution are spec requirements.

### Scale/Scope

**Decision**:

- Phase 1: User model + internal CRUD endpoints + webhook receiver (this feature)
- Scope: Single feature work on dnd-tracker backend
- Data volume: Not specified; assume typical multi-tenant SaaS scale (1M+ users)

**Rationale**: Feature spec defines clear, bounded scope in "Scope" section.

---

## Design Pattern Decisions

### Database Connection Pattern

**Decision**: Reuse existing `connectToMongo()` helper with global cache
**Implementation Approach**:

1. Located in `src/lib/db/connection.ts` (confirmed via codebase search)
2. Provides singleton connection for serverless environments
3. Handles retry logic and error propagation

**Rationale**: Existing pattern already in place; reusing prevents connection storms in serverless (critical for AWS Lambda, Vercel Functions).  
**Reference**: Encounter model in `/src/lib/models/encounter.ts` uses similar pattern

### Mongoose Model Definition

**Decision**:

- Define `User` and `UserEvent` models in `src/lib/models/user.ts`
- Follow Encounter model pattern: inline schema definition, export both interfaces and models
- Use timestamps with custom names: `createdAt`, `updatedAt` (not MongoDB defaults)

**Rationale**:

- Consistent with existing model pattern in codebase (`/src/lib/models/encounter.ts`).
- Type safety with TypeScript interfaces alongside schema.
- Custom timestamp names match spec and existing convention.

**Example Pattern** (from existing encounter model):

```typescript
export interface UserDoc extends Document {
  userId: string
  email: string
  // ... fields
}
const UserSchema = new Schema<UserDoc>({ ... })
let UserModel: mongoose.Model<UserDoc>
try {
  UserModel = mongoose.model<UserDoc>('User')
} catch {
  UserModel = mongoose.model<UserDoc>('User', UserSchema)
}
export default UserModel
```

### Webhook Processing Pattern

**Decision**:

- Webhook endpoint: `POST /api/webhooks/user-events`
- Fire-and-forget event storage (store event immediately, process async if needed)
- Synchronous upsert for created/updated events
- Signature validation: Optional (skip if `WEBHOOK_SECRET` not set)

**Rationale**:

- Spec clarification Q2: "Store events immediately (fire-and-forget); failures return 500; external system retries"
- Endpoint follows REST convention for webhooks
- Optional signature validation simplifies local development

### API Response Pattern

**Decision**: Follow Next.js API route conventions:

- Success: `NextResponse.json(data, { status: 200 })`
- Errors: `NextResponse.json({ error: message }, { status: XXX })`
- Use proper HTTP status codes (201 created, 404 not found, 409 conflict, 413 too large, 504 timeout, etc.)

**Rationale**: Consistent with existing API routes in `/src/app/api/subscription/route.ts`.

### Validation Strategy

**Decision**:

- Input validation: Zod schemas for request bodies
- Schema validation: Mongoose schema-level validation
- Export both Zod and Mongoose schemas for flexibility

**Rationale**: Existing pattern (see `/src/lib/schemas/userSchema.ts` for Zod, `/src/lib/models/encounter.ts` for Mongoose).

### Logging Strategy

**Decision**:

- Use `console.log()`, `console.warn()`, `console.error()` with structured format
- INFO: All successful webhook requests, successful CRUD operations
- WARN: Validation failures, signature mismatches, constraint violations
- ERROR: System failures (DB errors, connection issues, parsing errors)
- Optional future: Integrate Winston or Pino for production logging

**Rationale**: Spec clarification Q4 requires structured JSON logging at these levels. Start simple with console, can upgrade later.

### Soft-Delete Implementation

**Decision**:

- Add `deletedAt?: Date | null` field to User schema
- Default query filter: `{ deletedAt: { $eq: null } }` (exclude soft-deleted)
- Provide `includeDeleted` option in query functions for admin operations

**Rationale**: Spec clarification Q1 specifies soft-delete only with default exclusion.

### Timestamp Conflict Resolution

**Decision**:

- All webhooks carry a `timestamp` field (event creation time)
- When processing `updated` or `deleted` events:
  - Compare incoming `timestamp` with current document `updatedAt`
  - If incoming `timestamp` ≤ current `updatedAt`, skip upsert but store event
  - Log at WARN level for late-arriving events

**Rationale**: Spec clarification Q3 requires this strategy to handle out-of-order events in distributed systems.

---

## Architecture Overview

### Layers

1. **Models** (`src/lib/models/user.ts`): Mongoose schemas and TypeScript interfaces
2. **API Routes** (`src/app/api/internal/users/` and `src/app/api/webhooks/user-events/`): HTTP handlers
3. **Utilities** (`src/lib/db/connection.ts`): Database connection management
4. **Validation** (`src/lib/schemas/`): Zod schemas for request validation
5. **Tests** (`tests/integration/user.test.ts`, `tests/unit/models/user.test.ts`): TDD test suite

### Key Files to Create

- `src/lib/db/connection.ts` — Database connection helper (if not already present)
- `src/lib/models/user.ts` — User and UserEvent Mongoose models
- `src/lib/schemas/webhook.schema.ts` — Webhook event Zod validation
- `src/app/api/internal/users/route.ts` — Internal CRUD endpoints (GET list, POST create)
- `src/app/api/internal/users/[userId]/route.ts` — Single user CRUD (GET, PATCH, DELETE)
- `src/app/api/webhooks/user-events/route.ts` — Webhook receiver
- `tests/integration/user.integration.test.ts` — Full CRUD + webhook tests
- `tests/unit/models/user.unit.test.ts` — Model validation tests
- `specs/014-mongodb-user-model/data-model.md` — Data model details
- `specs/014-mongodb-user-model/quickstart.md` — Quickstart guide

---

## Assumptions Validated

| Assumption | Validated | Evidence |
|-----------|-----------|----------|
| MongoDB Atlas used | ✅ Yes | Spec clarification Q1; tech stack doc |
| Mongoose for ODM | ✅ Yes | `/package.json`; `/src/lib/models/encounter.ts` |
| Clerk auth already integrated | ✅ Yes | `/package.json`; `/src/lib/auth/middleware.ts` |
| TDD required | ✅ Yes | `CONTRIBUTING.md` "Development Process" |
| Zod for validation | ✅ Yes | `/package.json`; `/src/lib/schemas/userSchema.ts` |
| TypeScript strict mode | ✅ Yes | `/tsconfig.json`; `CONTRIBUTING.md` |
| API routes via Next.js | ✅ Yes | `/src/app/api/` structure |

---

## Next Steps

All technical context is resolved. Proceeding to Phase 1 design:

1. Generate detailed `data-model.md` with schema definitions
2. Generate API contracts in `contracts/` directory
3. Generate `quickstart.md` with usage examples
4. Update agent context file (`.github/copilot-instructions.md`)

No blocking clarifications remain. Implementation can proceed with high confidence.
