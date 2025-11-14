# Tasks for Service Worker Setup (Feature 035)

Feature: Service Worker Setup
Feature folder: `specs/035-service-worker-setup`
Plan reference: `specs/035-service-worker-setup/plan.md`
Branching: Each milestone gets its own branch as described in the plan (e.g. `feature/035-service-worker-setup/precache-registration`).

---

## Phase 1 — Setup (project initialization)

- [ ] T001 Create feature branch `feature/035-service-worker-setup/precache-registration` from `main` and record branch intent in `specs/035-service-worker-setup/plan.md`
- [ ] T002 Update `specs/035-service-worker-setup/plan.md` to reference this `tasks.md` and cross-link the sub-issue list (issue #451..#455) — file: `specs/035-service-worker-setup/plan.md`
- [ ] T003 Add an initial `specs/035-service-worker-setup/research.md` stub (if missing) and record decisions: `IndexedDB` queue, LRU eviction, 50 MB cap — file: `specs/035-service-worker-setup/research.md`
- [ ] T004 Add `specs/035-service-worker-setup/data-model.md` stub with `OfflineQueueEntry` and `OfflineEventLog` schemas — file: `specs/035-service-worker-setup/data-model.md`
- [ ] T005 Add `specs/035-service-worker-setup/quickstart.md` stub with manual QA steps for offline testing — file: `specs/035-service-worker-setup/quickstart.md`

## Phase 2 — Foundational (blocking prerequisites)

- [ ] T006 [P] Create `public/sw.js` placeholder with minimal install/activate/fetch handlers and comments — file: `public/sw.js`
- [ ] T007 Create registration helper `src/lib/sw/register.ts` that registers the SW and exports lifecycle hooks (install, activate, update events) — file: `src/lib/sw/register.ts`
- [ ] T008 Create IndexedDB wrapper `src/lib/offline/indexeddb.ts` with open/get/put/delete utilities (use idb or light wrapper) — file: `src/lib/offline/indexeddb.ts`
- [ ] T009 Create Offline Queue API `src/lib/offline/queue.ts` with enqueue/dequeue/list/retry methods and IndexedDB persistence (FIFO, retryCount) — file: `src/lib/offline/queue.ts`
- [ ] T010 Create a small `src/lib/offline/cache-evictor.ts` that provides size tracking and approximate LRU eviction helpers (used by SW) — file: `src/lib/offline/cache-evictor.ts`
- [ ] T011 [P] Add unit test scaffolding for service worker helpers under `tests/unit/sw/` — file: `tests/unit/sw/register.test.ts`
- [ ] T012 Add a `specs/035-service-worker-setup/tasks.md` entry (this file) committed to the feature branch — file: `specs/035-service-worker-setup/tasks.md`

## Phase 3 — User Story Phases (priority order)

### User Story 1 — App Shell Offline Load (Priority: P1)

Independent Test: Disable network and verify app shell loads, `navigator.serviceWorker.controller` present, and assets served from cache.

- [ ] T013 [US1] Generate precache manifest `specs/035-service-worker-setup/precache-manifest.json` listing app shell hashed assets (for use in build) — file: `specs/035-service-worker-setup/precache-manifest.json`
- [ ] T014 [US1] Implement install/activate handlers in `public/sw.js` to precache the app shell from the manifest and claim clients — file: `public/sw.js`
- [ ] T015 [US1] Implement registration logic in `src/lib/sw/register.ts` to register `public/sw.js`, wait for `activated` state, and expose `onUpdate` and `onReady` callbacks — file: `src/lib/sw/register.ts`
- [ ] T016 [US1] Add unit tests for `register.ts` covering registration flow and update notifications — file: `tests/unit/sw/register.test.ts`
- [ ] T017 [US1] Add an integration Playwright test to assert `navigator.serviceWorker.controller` after page load and that app shell assets are served from cache when offline — file: `tests/e2e/sw/app-shell-offline.spec.ts`
- [ ] T018 [P] [US1] Add a small example precache bundle entry to the build config or `public/` for QA to use — file: `public/precache-example.txt`

### User Story 2 — Offline Indicator & Graceful UI (Priority: P2)

Independent Test: Simulate offline/online transitions and assert banner appears within 2s.

- [ ] T019 [US2] Create `src/components/OfflineBanner/OfflineBanner.tsx` component (UI + retry button + compact sync progress) — file: `src/components/OfflineBanner/OfflineBanner.tsx`
- [ ] T020 [US2] Add styles and small storybook (if project uses it) or a test harness page `src/app/offline-demo/page.tsx` to manually test banner behavior — file: `src/app/offline-demo/page.tsx`
- [ ] T021 [US2] Wire banner to service worker lifecycle via `src/lib/sw/register.ts` (postMessage handlers) and to `src/lib/offline/queue.ts` for sync status display — file: `src/components/OfflineBanner/OfflineBanner.tsx`
- [ ] T022 [US2] Add unit tests for banner behavior (appear/disappear on offline/online) — file: `tests/unit/components/offline-banner.test.tsx`
- [ ] T023 [P] [US2] Add Playwright test to simulate offline/online and verify banner timing, retry flow, and sync summary UI — file: `tests/e2e/sw/offline-banner.spec.ts`

### User Story 3 — Runtime Caching & Performance (Priority: P3)

Independent Test: Verify key static assets are served from cache on repeat visits and page load time improves.

- [ ] T024 [US3] Implement runtime caching strategies in `public/sw.js` (cache-first for static assets, network-first for mutable endpoints) and integrate `cache-evictor` — file: `public/sw.js`
- [ ] T025 [US3] Add runtime cache naming strategy and versioning helpers in `src/lib/sw/strategies.ts` — file: `src/lib/sw/strategies.ts`
- [ ] T026 [US3] Add unit tests that simulate fetch events and validate caching/eviction decisions — file: `tests/unit/sw/runtime-cache.test.ts`
- [ ] T027 [P] [US3] Add a Playwright performance check that measures first vs repeat load times for key routes (baseline and repeat) — file: `tests/e2e/sw/perf-repeat-load.spec.ts`

## Phase 4 — Offline Queue & Sync (blocking for queued-op UX acceptance)

(This maps to the plan's sub-issue #453 and is foundational for FR-010 / SC-005.)

- [ ] T028 Create API endpoint contract `specs/035-service-worker-setup/contracts/sync-offline-ops.yml` describing `POST /sync/offline-ops` payload and responses — file: `specs/035-service-worker-setup/contracts/sync-offline-ops.yml`
- [ ] T029 [P] Implement `src/lib/offline/queue.ts` queue consumer that attempts immediate retries on reconnect with exponential backoff and persists entries to IndexedDB — file: `src/lib/offline/queue.ts`
- [ ] T030 [P] Implement encryption helpers `src/lib/offline/encryption.ts` (Web Crypto AES-GCM wrapper) for sensitive fields in queued payloads — file: `src/lib/offline/encryption.ts`
- [ ] T031 Add unit tests for queue persistence, retry/backoff, and encryption — file: `tests/unit/offline/queue.test.ts`
- [ ] T032 Add an integration test that enqueues operations while offline, toggles connectivity, and verifies server receipts (or stubbed endpoint) — file: `tests/integration/offline/queue-integration.test.ts`

## Final Phase — Polish & Cross-Cutting Concerns

- [ ] T033 Update `specs/035-service-worker-setup/quickstart.md` with manual QA steps and the Playwright commands for CI — file: `specs/035-service-worker-setup/quickstart.md`
- [ ] T034 Add Codacy run note and fix any issues per repository policy after creating PRs — file: `specs/035-service-worker-setup/plan.md`
- [ ] T035 Add E2E CI job or annotate existing Playwright job to include service worker tests (CI config) — file: `.github/workflows/e2e.yml`
- [ ] T036 Add documentation comment blocks and code examples in `src/lib/sw/register.ts` and `public/sw.js` for maintainers — files: `src/lib/sw/register.ts`, `public/sw.js`
- [ ] T037 [P] Run accessibility checks on `OfflineBanner` and fix issues reported in `tests/e2e/sw/offline-banner.spec.ts` — files: `src/components/OfflineBanner/OfflineBanner.tsx`, `tests/e2e/sw/offline-banner.spec.ts`
- [ ] T038 Create PR checklist template snippet with the required items (ACs, tests added, Codacy run) and add to `specs/035-service-worker-setup/plan.md` — file: `specs/035-service-worker-setup/plan.md`

---

## Dependencies & Story Order

- Phase 1 -> Phase 2 -> Phase 3 (US1 -> US2 -> US3) -> Phase 4 -> Final
- Sub-issues recommended by the plan can be implemented independently when they target separate file sets, but follow the branch naming convention per sub-issue.

## Parallel Execution Examples

- Team A: Implement `public/sw.js` precache + runtime handlers (`T006`, `T014`, `T024`) in `feature/035-service-worker-setup/precache-registration`.
- Team B: Implement `src/lib/offline/queue.ts` and `indexeddb.ts` (`T008`, `T009`, `T029`) in `feature/035-service-worker-setup/offline-queue-indexeddb`.
- Team C: Implement `OfflineBanner` and UI wiring (`T019`, `T021`) in `feature/035-service-worker-setup/offline-banner-update-flow`.

Each of the above branches should target `main` and create a focused PR that references the appropriate sub-issue number from the plan (e.g., #451, #452, #453, #454, #455).

## Validation Checklist (formatting)

- All tasks use the checklist format `- [ ] T### [P]? [US#]? Description with file path`.
- Tasks are grouped by phase and user story as required.

---

## Summary

- Total tasks: 38
- Tasks per story: US1: 6 tasks (T013-T018), US2: 5 tasks (T019-T023), US3: 4 tasks (T024-T027)
- Foundational & queue tasks: 12 tasks (T006-T012, T028-T032)
- Parallel opportunities: listed in "Parallel Execution Examples"
- Suggested MVP scope: Ship Phase 1 + Foundational + User Story 1 (T001-T018)
