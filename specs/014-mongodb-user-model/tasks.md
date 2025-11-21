# Tasks: Feature 014 — MongoDB User Model & Webhook

Feature: MongoDB-backed User model, Webhook receiver, and internal CRUD endpoints.

**Total Tasks**: 23 | **Parallelizable**: T001, T003, T006, T017-T020, T023  
**Suggested MVP**: T002-T010, T012 (US1 + minimal webhook storage)

---

## Phase 1: Setup & Infrastructure

- [X] T001 [P] Set up .env.local with MONGODB_URI, MONGODB_DB, WEBHOOK_SECRET: `.env.local`
- [ ] T002 Verify MongoDB Atlas connectivity and credentials: N/A (manual verification)
- [X] T003 [P] Update .env.example with new environment variables: `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T004 Create base MongoDB connection helper (connectToMongo): `src/lib/db/connection.ts`
- [X] T005 Create User and UserEvent Mongoose models: `src/lib/models/user.ts`
- [X] T006 [P] Create Zod validation schemas (webhook, create, update): `src/lib/schemas/webhook.schema.ts`

---

## Phase 3: User Story 1 (P1) - Core Data Model & Unit Tests

- [X] T007 Write unit tests for User model validation (schema, uniqueness, immutability): `tests/unit/models/user.unit.test.ts`
- [X] T008 Implement User model to pass T007 tests: `src/lib/models/user.ts`
- [X] T009 Write unit tests for UserEvent model: `tests/unit/models/user.unit.test.ts`

---

## Phase 3: User Story 2 (P2) - Webhook Receiver & Event Persistence

- [X] T010 Write integration tests for webhook receiver (all event types, signature validation): `tests/integration/user.integration.test.ts`
- [X] T011 Implement POST /api/webhooks/user-events endpoint: `src/app/api/webhooks/user-events/route.ts`
- [X] T012 Implement timestamp-based conflict resolution and soft-delete logic: `src/app/api/webhooks/user-events/route.ts`
- [X] T013 Add structured logging to webhook endpoint (INFO/WARN/ERROR): `src/app/api/webhooks/user-events/route.ts`

---

## Phase 3: User Story 3 (P3) - Internal CRUD Endpoints

- [X] T014 Write integration tests for POST /api/internal/users (create, duplicate, validation): `tests/integration/user.integration.test.ts`
- [X] T015 Implement POST /api/internal/users and GET /api/internal/users/:userId: `src/app/api/internal/users/route.ts`
- [X] T016 Implement PATCH and DELETE /api/internal/users/:userId: `src/app/api/internal/users/[userId]/route.ts`

---

## Phase 4: Error Handling & Validation

- [X] T017 [P] Write error handling tests (400, 401, 404, 409, 413, 500): `tests/integration/user.error-handling.test.ts`
- [X] T018 Implement comprehensive error handling in all endpoints: `src/app/api/internal/users/route.ts`, `src/app/api/internal/users/[userId]/route.ts`, `src/app/api/webhooks/user-events/route.ts`
- [X] T019 [P] Add payload size validation and timeout handling: `src/app/api/webhooks/user-events/route.ts`

---

## Phase 5: Observability & Testing

- [X] T020 [P] Write structured logging tests (INFO/WARN/ERROR): `tests/unit/logging.test.ts`
- [ ] T021 Run full test suite and verify 80%+ coverage: `npm run test:ci -- --coverage`
- [ ] T022 Perform manual testing of all endpoints (create, read, update, delete, webhook): N/A (manual)

---

## Phase 6: Polish & Documentation

- [ ] T023 [P] Create migration documentation and verification steps: `docs/feature-014-mongodb-user-model.md`
- [ ] T024 Update copilot instructions with Feature 014 tech stack: `.github/copilot-instructions.md`
- [ ] T025 Verify MongoDB indexes created in Atlas: N/A (manual verification)

---

## Dependencies & Execution Order

**Sequential Critical Path**:
1. T001, T003, T006 (parallel setup)
2. T002 (verification)
3. T004 (connection helper, required by all)
4. T005 (models, required by tests)
5. T007-T009 (US1 tests, then implementation)
6. T010-T013 (US2 webhook)
7. T014-T016 (US3 CRUD endpoints)
8. T017-T022 (error handling, logging, tests)
9. T023-T025 (documentation, verification)

**Parallelizable Groups**:
- **Group 1** (Setup): T001, T003 (env files)
- **Group 2** (Schemas & Connection): T004, T006 (can run after T002)
- **Group 4** (Validation & Logging): T017, T020 (test-first)
- **Group 5** (Documentation): T023, T024 (parallel)

---

## Execution Notes

- **TDD-First**: Tests written before implementation (T007, T010, T014, T017, T020)
- **MVP Path**: Complete T001-T016 for core functionality (User model, CRUD, webhook)
- **Full Path**: All 25 tasks for production-ready feature with 80% coverage
- **Commits**: Group related tasks (e.g., T005+T008 as one commit: "feat(models): implement User and UserEvent schemas")
- **CI Validation**: After each phase, run `npm run test:ci && npm run lint && npm run type-check`

---

## Testing Strategy

| Task | Test File | Test Count | Coverage Target |
|------|-----------|-----------|-----------------|
| T007-T009 | `tests/unit/models/user.unit.test.ts` | 8 tests | 100% model validation |
| T010-T013 | `tests/integration/user.integration.test.ts` | 12 tests | 100% webhook scenarios |
| T014-T016 | `tests/integration/user.integration.test.ts` | 10 tests | 100% CRUD endpoints |
| T017-T019 | `tests/integration/user.error-handling.test.ts` | 7 tests | 100% error scenarios |
| T020 | `tests/unit/logging.test.ts` | 5 tests | 100% logging formats |
| **Total** | — | **42 tests** | **80%+ code coverage** |

---

*Checklist format: [ ] = not started, [X] = completed*
