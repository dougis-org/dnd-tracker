# Implementation Plan: Feature 014 - MongoDB User Model & Webhook

**Branch**: `feature/014-mongodb-user-model` | **Date**: 2025-11-18 | **Spec**: [spec.md](spec.md)  
**Maintainer**: @doug

---

## Summary

Feature 014 adds persistent MongoDB-backed user data storage and a webhook receiver to ingest external user lifecycle events. This enables profile, permissions, and downstream integration features. The implementation is greenfield with full test coverage (TDD-first), proper error handling, and production-ready logging.

**Key Deliverables**:
- Two MongoDB collections: `users` (core records) and `user_events` (audit trail)
- Internal CRUD API endpoints for user management (`/api/internal/users/*`)
- Webhook receiver endpoint for external event ingestion (`/api/webhooks/user-events`)
- Complete test suite (unit + integration) with ≥80% coverage
- Migration steps for Atlas index creation
- Production-ready error handling, logging, and conflict resolution

---

## Technical Context

**Language/Version**: TypeScript 5.9.2 (Next.js 16, React 19)  
**Primary Dependencies**: Mongoose 8.19.1, Next.js 16.0+, Zod 3.23.8, Node.js 25.1.0+  
**Storage**: MongoDB Atlas (confirmed)  
**Testing**: Jest 30.2.0+ with @testcontainers/mongodb  
**Target Platform**: Next.js 16 full-stack (serverless-compatible)  
**Performance Goals**: Webhook latency ≤3s, payload max 1MB  
**Constraints**: Max file 450 lines, max function 50 lines, no code duplication, soft-delete only, timestamp-based conflict resolution  
**Scale**: Multi-tenant SaaS (1M+ users, no rate limiting)

---

## Constitution Check

✅ **PASS** — All requirements align with dnd-tracker Constitution (v1.0.0, 2025-11-08):

- ✅ **Quality & Ownership**: Code is testable, maintainable, clear; TDD enforced
- ✅ **Test-First (TDD)**: All new behavior covered by tests written before implementation
- ✅ **Simplicity & Composability**: Models, endpoints, and utilities are small, focused, reusable
- ✅ **Observability & Security**: Structured JSON logging at INFO/WARN/ERROR levels; signature validation; input validation via Zod
- ✅ **Versioning & Governance**: Changes documented in feature spec with rationale; no amendments to constitution required

**No violations detected.** Feature scope is appropriate; work can proceed immediately.

---

## Approach & Design Brief

### Architecture Layers

1. **Data Layer** (`src/lib/models/user.ts`)
   - Mongoose schemas and TypeScript interfaces for User and UserEvent
   - Dual indexes for uniqueness (userId, email) and query performance
   - Soft-delete semantic with default query filters

2. **Connection Layer** (`src/lib/db/connection.ts`)

- Reusable MongoDB connection helper function `connectToMongo()` with global caching
- Prevents connection storms in serverless environments
- Error propagation and development logging

3. **Validation Layer** (`src/lib/schemas/webhook.schema.ts`)
   - Zod schemas for request bodies (create, update, webhook events)
   - Type-safe TypeScript interfaces derived from schemas
   - Validation error reporting with field-level details

4. **API Layer** (`src/app/api/internal/users/*`, `/api/webhooks/user-events/`)
   - Internal CRUD endpoints (POST create, GET read, PATCH update, DELETE soft-delete)
   - Webhook receiver with signature validation (optional HMAC-SHA256)
   - Fire-and-forget event storage; timestamp-based conflict resolution
   - Proper HTTP status codes (201, 200, 204, 400, 401, 404, 409, 413, 500, 504)

5. **Test Layer** (`tests/integration/`, `tests/unit/`)
   - Integration tests for full CRUD + webhook flows using testcontainers
   - Unit tests for model validation, schema validation, and error scenarios
   - 80%+ coverage target on all new code

### Design Patterns

- **Connection Reuse**: Global cache for serverless environments (existing pattern in codebase)
- **Schema-First**: Mongoose schemas define contract; TypeScript interfaces ensure type safety
- **Fire-and-Forget Webhooks**: Immediate event storage, async processing (external system owns retries)
- **Soft-Delete Default**: All queries exclude deleted users by default; explicit flag to include
- **Timestamp Conflict Resolution**: Late-arriving updates detected and logged but not stored
- **Structured Logging**: INFO for success, WARN for validation/conflicts, ERROR for failures

### Key Files

| File | Purpose | Scope |
|------|---------|-------|
| `src/lib/db/connection.ts` | MongoDB connection helper | Reuse if exists, else create |
| `src/lib/models/user.ts` | User & UserEvent models | **CREATE** |
| `src/lib/schemas/webhook.schema.ts` | Zod validation schemas | **CREATE** |
| `src/app/api/internal/users/route.ts` | POST create, GET list | **CREATE** |
| `src/app/api/internal/users/[userId]/route.ts` | GET, PATCH, DELETE single user | **CREATE** |
| `src/app/api/webhooks/user-events/route.ts` | Webhook receiver | **CREATE** |
| `tests/integration/user.integration.test.ts` | Full CRUD + webhook flows | **CREATE** |
| `tests/unit/models/user.unit.test.ts` | Model validation & error cases | **CREATE** |
| `.env.example` | Environment variables | **UPDATE** |
| `.github/copilot-instructions.md` | Agent context | **UPDATE** |

---

## Step-by-Step Implementation Plan (TDD-First)

### Phase 1: Test Infrastructure & Models

**Goal**: Establish data models and test utilities; all tests fail initially

#### 1.1 Create Unit Tests for User Model

**File**: `tests/unit/models/user.unit.test.ts`

```typescript
describe('User Model', () => {
  it('should create a user with required fields', () => { /* test */ })
  it('should enforce userId uniqueness', () => { /* test */ })
  it('should enforce email uniqueness', () => { /* test */ })
  it('should default deletedAt to null', () => { /* test */ })
  it('should set createdAt and updatedAt on creation', () => { /* test */ })
  it('should prevent userId modification after creation', () => { /* test */ })
  it('should allow metadata to be any JSON object', () => { /* test */ })
})

describe('UserEvent Model', () => {
  it('should store webhook payload as-is', () => { /* test */ })
  it('should default status to stored', () => { /* test */ })
  it('should enforce eventType enum', () => { /* test */ })
})
```

**Expected Result**: All tests fail (models don't exist yet)

#### 1.2 Create User Models to Pass Tests

**File**: `src/lib/models/user.ts`

Implement Mongoose schemas and TypeScript interfaces from `data-model.md`. Focus on:

- User schema with unique constraints
- UserEvent schema with required fields
- Proper index definitions
- Safe model registration (try/catch to prevent re-registration in tests)

**Expected Result**: Unit tests pass; models are now available for integration tests

### Phase 2: Integration Tests & APIs

**Goal**: Write integration tests for CRUD endpoints and webhook; implement endpoints to pass tests

#### 2.1 Create Integration Tests for User CRUD

**File**: `tests/integration/user.integration.test.ts`

```typescript
describe('Internal User CRUD API', () => {
  describe('POST /api/internal/users', () => {
    it('should create a user with valid payload', () => { /* test */ })
    it('should return 201 and user object', () => { /* test */ })
    it('should reject invalid email format (400)', () => { /* test */ })
    it('should reject duplicate userId (409)', () => { /* test */ })
    it('should handle database errors (500)', () => { /* test */ })
  })

  describe('GET /api/internal/users/:userId', () => {
    it('should retrieve existing user', () => { /* test */ })
    it('should return 404 for non-existent user', () => { /* test */ })
    it('should exclude soft-deleted users', () => { /* test */ })
  })

  describe('PATCH /api/internal/users/:userId', () => {
    it('should update displayName and metadata', () => { /* test */ })
    it('should not allow email or userId modification', () => { /* test */ })
    it('should update updatedAt timestamp', () => { /* test */ })
  })

  describe('DELETE /api/internal/users/:userId', () => {
    it('should soft-delete a user', () => { /* test */ })
    it('should set deletedAt timestamp', () => { /* test */ })
    it('should return 204', () => { /* test */ })
  })
})
```

**Expected Result**: All tests fail (endpoints don't exist)

#### 2.2 Implement User CRUD Endpoints

**Files**: 

- `src/app/api/internal/users/route.ts` (POST, GET list)
- `src/app/api/internal/users/[userId]/route.ts` (GET, PATCH, DELETE)

Implement endpoints to pass tests:

- Use `connectToMongo()` to get MongoDB connection
- Validate requests with Zod schemas
- Return proper HTTP status codes
- Handle errors with structured responses

**Expected Result**: CRUD integration tests pass

#### 2.3 Create Integration Tests for Webhook

**File**: `tests/integration/user.integration.test.ts` (continued)

```typescript
describe('Webhook Receiver', () => {
  describe('POST /api/webhooks/user-events', () => {
    it('should store webhook event', () => { /* test */ })
    it('should create user on created event', () => { /* test */ })
    it('should update user on updated event', () => { /* test */ })
    it('should soft-delete user on deleted event', () => { /* test */ })
    it('should reject malformed payload (400)', () => { /* test */ })
    it('should reject invalid signature (401)', () => { /* test */ })
    it('should reject oversized payload (413)', () => { /* test */ })
    it('should skip late-arriving updates', () => { /* test */ })
    it('should log timestamp conflicts at WARN', () => { /* test */ })
    it('should return 200 for all event types', () => { /* test */ })
  })
})
```

**Expected Result**: All tests fail (webhook endpoint doesn't exist)

#### 2.4 Implement Webhook Endpoint

**File**: `src/app/api/webhooks/user-events/route.ts`

Implement webhook receiver to pass tests:
- Validate signature (optional, skip if `WEBHOOK_SECRET` not set)
- Validate payload with Zod
- Store event immediately in `user_events` collection
- Apply changes to `users` collection:
  - `created` event: insert new user
  - `updated` event: upsert if event timestamp > current updatedAt (else skip with WARN log)
  - `deleted` event: set deletedAt timestamp
- Return 200 with fire-and-forget semantics
- Handle validation, signature, payload size, and database errors with proper status codes

**Expected Result**: Webhook integration tests pass

### Phase 3: Validation & Schema Tests

**Goal**: Create and test Zod validation schemas

#### 3.1 Create Validation Tests

**File**: `tests/unit/schemas/webhook.schema.test.ts`

```typescript
describe('Webhook Event Schema', () => {
  it('should validate well-formed created event', () => { /* test */ })
  it('should reject missing eventType', () => { /* test */ })
  it('should enforce eventType enum', () => { /* test */ })
  it('should validate email format', () => { /* test */ })
  it('should lowercase email', () => { /* test */ })
  it('should allow optional fields', () => { /* test */ })
})
```

**Expected Result**: All tests fail (schema not implemented)

#### 3.2 Implement Zod Schemas

**File**: `src/lib/schemas/webhook.schema.ts`

Implement all schemas from `contracts.md`:
- `createUserSchema`
- `updateUserSchema`
- `webhookEventSchema`

Export types for use in API routes.

**Expected Result**: Schema validation tests pass

### Phase 4: Error Handling & Edge Cases

**Goal**: Test and implement comprehensive error handling

#### 4.1 Create Error Scenario Tests

**File**: `tests/integration/user.error-handling.test.ts`

```typescript
describe('Error Handling', () => {
  it('should return 409 on duplicate key error', () => { /* test */ })
  it('should return 400 on Zod validation error', () => { /* test */ })
  it('should return 401 on signature validation failure', () => { /* test */ })
  it('should return 413 on oversized payload', () => { /* test */ })
  it('should return 404 on missing user', () => { /* test */ })
  it('should log errors at ERROR level', () => { /* test */ })
  it('should not expose sensitive error details', () => { /* test */ })
})
```

**Expected Result**: All tests fail (error handling not implemented)

#### 4.2 Implement Error Handling

Update all API routes and webhook handler to:
- Catch and handle database errors (E11000 duplicate key, connection errors, etc.)
- Convert Zod validation errors to 400 responses with field-level details
- Validate signature and return 401 on failure
- Check payload size and return 413 if exceeded
- Log all errors at appropriate level (ERROR for system failures, WARN for validation)
- Return generic error messages (no internal details exposed)

**Expected Result**: Error handling tests pass

### Phase 5: Logging & Observability

**Goal**: Implement structured logging and verify output

#### 5.1 Create Logging Tests

**File**: `tests/unit/logging.test.ts`

```typescript
describe('Structured Logging', () => {
  it('should log successful user creation at INFO', () => { /* test */ })
  it('should log validation failure at WARN', () => { /* test */ })
  it('should log late-arriving update at WARN', () => { /* test */ })
  it('should log database errors at ERROR', () => { /* test */ })
  it('should include timestamp in logs', () => { /* test */ })
})
```

**Expected Result**: All tests fail (logging not structured yet)

#### 5.2 Add Structured Logging to All Endpoints

Update all API route handlers and webhook to include:
- INFO log: successful operations
- WARN log: validation failures, signature mismatches, late-arriving events
- ERROR log: system failures, DB errors

**Expected Result**: Logging tests pass

### Phase 6: Final Tests & Coverage

**Goal**: Run full test suite and verify 80%+ coverage

#### 6.1 Run All Tests

```bash
npm run test:ci -- --coverage
```

Verify:
- All tests pass (unit + integration)
- 80%+ coverage on all new files
- No TypeScript errors
- No ESLint errors

#### 6.2 Manual Testing

Test endpoints locally:

```bash
# Create user
curl -X POST http://localhost:3000/api/internal/users \
  -H "Content-Type: application/json" \
  -d '{ "userId": "test_1", "email": "test@example.com", "displayName": "Test" }'

# Webhook create event
curl -X POST http://localhost:3000/api/webhooks/user-events \
  -H "Content-Type: application/json" \
  -d '{ "eventType": "created", "timestamp": "2025-11-18T12:00:00Z", "user": { "userId": "user_1", "email": "user@example.com", "displayName": "User" } }'
```

#### 6.3 Verify MongoDB Indexes

Connect to MongoDB Atlas and run:

```javascript
db.users.getIndexes()
db.user_events.getIndexes()
```

Verify all indexes from `data-model.md` are present.

---

## Effort, Risks, and Mitigations

### Effort Estimate

| Phase | Component | Estimate | Notes |
|-------|-----------|----------|-------|
| 1 | Models & tests | 3–4 hours | Schema definitions, model tests |
| 2 | CRUD endpoints | 4–5 hours | POST, GET, PATCH, DELETE with error handling |
| 2 | Webhook endpoint | 3–4 hours | Signature validation, event processing, conflict resolution |
| 3 | Validation schemas | 1–2 hours | Zod schemas, type exports |
| 4 | Error handling | 2–3 hours | Comprehensive error scenarios, logging |
| 5 | Observability | 1–2 hours | Structured logging, test verification |
| 6 | Manual testing & docs | 2–3 hours | E2E verification, migration documentation |
| **Total** | | **16–23 hours** | Includes TDD, testing, documentation |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| MongoDB connection issues in CI | Medium | High | Use testcontainers; verify Atlas connectivity in PR |
| Concurrent event processing race conditions | Low | Medium | Timestamp-based conflict resolution; test with async events |
| Signature validation complexity | Low | Medium | Start with optional validation; test with known-good signatures |
| 80% test coverage hard to reach | Low | High | Write tests before implementation; use factories for test data |
| Schema immutability not enforced | Low | Low | Mongoose `immutable: true` enforces; add test to verify |
| Late-arriving events cause data corruption | Low | High | Timestamp comparison prevents upsert; events still stored for audit |

### Mitigations Applied

1. **TDD-First Approach**: All tests written before implementation; low risk of regressions
2. **Testcontainers**: Database tests isolated and reproducible; no external dependencies
3. **Type Safety**: TypeScript strict mode + Zod schemas ensure correctness
4. **Structured Logging**: All errors and conflicts logged for debugging
5. **Code Review**: All changes reviewed before merge; Codacy quality checks enforced

---

## File-Level Change List

### New Files to Create

```
src/
├── lib/
│   ├── db/
│   │   └── connection.ts          (reuse if exists; else create)
│   ├── models/
│   │   └── user.ts               (NEW)
│   └── schemas/
│       └── webhook.schema.ts      (NEW)
└── app/
    └── api/
        ├── internal/
        │   └── users/
        │       ├── route.ts       (NEW)
        │       └── [userId]/
        │           └── route.ts   (NEW)
        └── webhooks/
            └── user-events/
                └── route.ts       (NEW)

tests/
├── integration/
│   └── user.integration.test.ts   (NEW)
├── unit/
│   └── models/
│       └── user.unit.test.ts      (NEW)
│   └── schemas/
│       └── webhook.schema.test.ts (NEW)
│   └── logging.test.ts            (NEW)
└── unit/
    └── error-handling.test.ts     (NEW)
```

### Files to Update

```
.env.example                              (ADD MONGODB_URI, WEBHOOK_SECRET, etc.)
.github/copilot-instructions.md          (UPDATE agent context with Feature 014 tech stack)
```

### Migration Artifacts

```
docs/feature-014-mongodb-user-model.md   (ADD migration verification steps)
```

---

## Test Plan

### Unit Tests

| Component | Coverage | Strategy |
|-----------|----------|----------|
| User model | 100% | Validation, uniqueness, immutability, soft-delete |
| UserEvent model | 100% | Schema validation, status enum, payload handling |
| Zod schemas | 100% | Valid payloads, invalid payloads, edge cases |
| Helper functions | 100% | Signature validation, timestamp comparison |

### Integration Tests

| Scenario | Coverage | Strategy |
|----------|----------|----------|
| Create user (happy path) | 100% | Valid payload → 201 + user object |
| Create user (duplicate key) | 100% | Duplicate userId → 409 Conflict |
| Create user (invalid email) | 100% | Malformed email → 400 Bad Request |
| Get user | 100% | Existing user → 200 + data; non-existent → 404 |
| Update user | 100% | Partial update → 200; missing user → 404 |
| Delete user (soft-delete) | 100% | Delete → 204; excluded from default queries |
| Webhook created event | 100% | Event stored + user created → 200 |
| Webhook updated event | 100% | Event stored + user updated → 200 |
| Webhook updated event (late) | 100% | Late timestamp → event stored, user NOT updated, WARN logged |
| Webhook deleted event | 100% | Event stored + user soft-deleted → 200 |
| Webhook invalid signature | 100% | Bad signature → 401 Unauthorized |
| Webhook oversized payload | 100% | >1MB payload → 413 Payload Too Large |
| Webhook malformed JSON | 100% | Invalid JSON → 400 Bad Request |
| Error handling | 100% | DB errors → 500; validation → 400; etc. |

### E2E Tests (Manual)

- [ ] Create user via API
- [ ] Retrieve user via API
- [ ] Update user via API
- [ ] Delete user via API (verify soft-delete)
- [ ] Post webhook created event
- [ ] Post webhook updated event
- [ ] Post webhook deleted event
- [ ] Verify indexes exist in MongoDB
- [ ] Verify soft-deleted user excluded from queries
- [ ] Verify late-arriving event logged but not applied

### Coverage Target

- **Target**: 80%+ on all new files
- **Enforcement**: Codacy check in CI; block PR if coverage below target
- **Reporting**: Coverage report generated by `npm run test:ci`

---

## Rollout & Monitoring Plan

### Deployment Strategy

1. **Feature Flag** (optional): No feature flag required; user model enabled by default
2. **Migration**: Run Atlas index creation script before deploying code
3. **Rollout**: Standard CI/CD → GitHub → Fly.io

### Pre-Deployment Checklist

- [ ] All tests pass locally and in CI
- [ ] Codacy analysis shows no new issues
- [ ] Code coverage ≥80% for new files
- [ ] MongoDB indexes created in Atlas
- [ ] Environment variables set in Fly.io
- [ ] `WEBHOOK_SECRET` configured (if signature validation desired)

### Monitoring & Observability

**Metrics to Track**:
- Webhook endpoint latency (target ≤3s)
- Webhook event count (created, updated, deleted)
- Error rate (validation failures, DB errors, timeouts)
- Late-arriving event count

**Logs to Monitor**:
- ERROR logs: Database errors, system failures
- WARN logs: Signature validation failures, late-arriving events
- INFO logs: Successful operations (volume baseline)

**Alerts**:
- Webhook latency exceeds 5 seconds (P95)
- Error rate exceeds 5%
- Database connection failures

### Rollback Plan

- **Automated Rollback**: If Fly.io deployment fails, revert to previous version
- **Manual Rollback**: If issues detected post-deployment:
  1. Disable webhook receiver (return 503 Service Unavailable)
  2. Investigate errors in logs
  3. Fix and redeploy
  4. Resume webhook processing

### Decommissioning (if needed)

- Soft-deleted users remain in database indefinitely (operational policy)
- Event archive: Move old `user_events` to cold storage (future work)

---

## Handoff Package

### Documentation

1. **Feature Spec**: `specs/014-mongodb-user-model/spec.md` (requirements)
2. **Data Model**: `specs/014-mongodb-user-model/data-model.md` (schema, indexes, relationships)
3. **API Contracts**: `specs/014-mongodb-user-model/contracts.md` (endpoint specifications)
4. **Quickstart**: `specs/014-mongodb-user-model/quickstart.md` (implementation walkthrough)
5. **Research**: `specs/014-mongodb-user-model/research.md` (design decisions, patterns)
6. **This Plan**: `specs/014-mongodb-user-model/plan.md` (implementation steps, test strategy)

### Code Artifacts

- `src/lib/db/connection.ts` — Reusable MongoDB connection helper
- `src/lib/models/user.ts` — User and UserEvent Mongoose models
- `src/lib/schemas/webhook.schema.ts` — Zod validation schemas
- `src/app/api/internal/users/` — Internal CRUD endpoints
- `src/app/api/webhooks/user-events/` — Webhook receiver
- `tests/integration/user.integration.test.ts` — Full CRUD + webhook tests
- `tests/unit/` — Model, schema, and error handling tests

### Configuration

- `.env.example` — Updated with `MONGODB_URI`, `WEBHOOK_SECRET`, etc.
- `DEPLOYMENT.md` — Include MongoDB Atlas setup steps (if applicable)

### Verification Steps

1. Run all tests: `npm run test:ci`
2. Check coverage: `npm run test:ci -- --coverage`
3. Lint code: `npm run lint`
4. Build: `npm run build`
5. Type check: `npm run type-check`
6. Manual test each API endpoint
7. Verify MongoDB indexes

---

## Constitution Compliance Verification (Post-Implementation)

After implementation, verify:

- ✅ All tests passing (TDD requirement)
- ✅ 80%+ coverage on new files (quality requirement)
- ✅ No files exceed 450 lines (simplicity requirement)
- ✅ No functions exceed 50 lines (composability requirement)
- ✅ Structured logging at INFO/WARN/ERROR levels (observability requirement)
- ✅ Input validation and error handling (security requirement)
- ✅ TypeScript strict mode, no `any` types (type safety requirement)
- ✅ Code follows project conventions (ownership requirement)

---

## Next Steps

1. **Phase 1** (4–6 hrs): Create tests, implement User models
2. **Phase 2** (7–9 hrs): Implement CRUD endpoints and webhook
3. **Phase 3** (1–2 hrs): Finalize validation schemas
4. **Phase 4–5** (3–5 hrs): Error handling and logging
5. **Phase 6** (2–3 hrs): Manual testing, verification, documentation
6. **Merge**: All tests passing, coverage ≥80%, Codacy clean, ready for auto-merge

---

*Implementation plan finalized and ready for Phase 2 (Step-by-Step Implementation). All files documented, all test scenarios specified, all design decisions ratified. Proceed with confidence.*

**Estimated Total Duration**: 16–23 hours (including TDD, testing, docs, manual verification)
