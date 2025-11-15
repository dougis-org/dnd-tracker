# Implementation Plan: Service Worker Setup (Feature 035)

## 1. Summary

Implement service worker registration, app-shell precaching, runtime caching strategies, an IndexedDB-backed offline queue, and a non-blocking offline UX. Deliverables: service worker script (`sw.js`), client registration helpers, IndexedDB queue utilities, offline banner UI, tests (unit + integration), and documentation (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`).

**Branch Strategy**: Feature work is decomposed into milestone branches (see sub-issues #451-#455):

- **Current Branch**: `feature/035-precache-registration` (Issue #451: SW App Shell Precache & Registration)
- **Remaining Milestones**:
  - `feature/035-runtime-caching` (Issue #452)
  - `feature/035-offline-queue` (Issue #453)
  - `feature/035-offline-banner` (Issue #454)
  - `feature/035-playwright-tests` (Issue #455)

  **Status:** Sub-issue #451 (PR #456) has been merged to `main` on 2025-11-15 by @dougis. Proceed with the remaining milestones in priority order (runtime caching → offline queue → offline banner → tests & CI).

## 2. Assumptions & Open Questions

- Assumptions:
  - App is served over HTTPS in production.
  - Target browsers support Service Workers (Chromium + Firefox primarily).
  - Large state persistence (advanced conflict resolution) is out of scope.

- Open Questions (none unresolved): All clarifications recorded in `research.md`.

**Implementation Tracking**: See [`tasks.md`](./tasks.md) for the complete task breakdown and execution plan. Sub-issues #451-#455 map to the milestone branches listed above.

## 3. Acceptance Criteria (Normalized & Testable)

- FR-001..FR-010 from the spec are the authoritative acceptance criteria. Key testable items:
  - SW registers and reaches `activated` on first load in QA (95% success) (SC-001).
  - App shell loads offline within 2s for returning users (SC-002).
  - Offline banner appears within 2s of disconnect (SC-004).
  - Queued operations persist to IndexedDB and are retried on reconnect (SC-005).

## 4. Approach & Design Brief

- Architecture:
  - Client-side service worker (`/public/sw.js`) and client helper (`src/lib/sw/register.ts`).
  - IndexedDB utility under `src/lib/offline/` for queue and event logging.
  - UI components: `OfflineBanner` (re-uses `components/OfflineBanner` pattern).

- Key design choices (from `research.md`): hybrid caching (cache-first for static, network-first for mutable), IndexedDB storage for queue, LRU-like eviction with 50 MB cap, controlled update flow (user confirm or 24h safe window), encrypt sensitive fields with Web Crypto.

- Work Breakdown (recommended sub-issues):
  1. "SW: App Shell Precache & Registration" — implement install/activate precache, register SW, smoke tests. (Prereq for others)
  - GitHub issue: <https://github.com/dougis-org/dnd-tracker/issues/451>
  2. "SW: Runtime Caching & Eviction" — implement runtime cache strategies, size cap, LRU eviction, tests.
  - GitHub issue: <https://github.com/dougis-org/dnd-tracker/issues/452>
  3. "Offline Queue: IndexedDB & Retry" — implement queue persistence, retry/backoff, batching to `/sync/offline-ops`.
  - GitHub issue: <https://github.com/dougis-org/dnd-tracker/issues/453>
  4. "UI: Offline Banner & Update Flow" — offline banner component, update-available UX, messages.
  - GitHub issue: <https://github.com/dougis-org/dnd-tracker/issues/454>
  5. "Tests & CI: Playwright SW lifecycle" — E2E tests validating offline behavior in CI.
  - GitHub issue: <https://github.com/dougis-org/dnd-tracker/issues/455>

**Branching & PR Workflow (required)**

- Each sub-issue MUST be implemented in its own feature branch and submitted as a dedicated Pull Request (PR). This keeps changes focused, reviewable, and traceable to a single acceptance criterion set.

- Branch naming convention (recommended):
  - Base branch: `main`
  - Feature branches: `feature/035-service-worker-setup/<short-slug>`
    - Examples:
      - `feature/035-service-worker-setup/precache-registration` (issue #451)
      - `feature/035-service-worker-setup/runtime-caching-eviction` (issue #452)
      - `feature/035-service-worker-setup/offline-queue-indexeddb` (issue #453)
      - `feature/035-service-worker-setup/offline-banner-update-flow` (issue #454)
      - `feature/035-service-worker-setup/playwright-sw-tests` (issue #455)

- PR requirements (each PR):
  - Title: start with the issue number and short title, e.g. `#451 SW: App Shell Precache & Registration`.
  - Body: link to this plan (`specs/035-service-worker-setup/plan.md`) and the originating issue (e.g., `#451`).
  - Checklist: include the issue Acceptance Criteria and a short testing checklist (unit, integration, Playwright where applicable).
  - Tests: include unit tests and any integration/E2E tests needed to validate the acceptance criteria. PRs that add runtime behavior must include test coverage for that behavior.
  - Codacy: After creating the PR, run the Codacy analysis required by repository policy and address any issues raised by the analysis before requesting final review.
  - Labels: add `feature` and an appropriate priority label (`P1`/`P2`/`P3`) to the PR.
  - Reviewers: request at least one maintainer review and one functional reviewer for UX-critical changes.

- Merge policy: follow repository `CONTRIBUTING.md` rules — PRs must be green on CI, pass linting, and have approvals before merge. Prefer small, reviewable commits and avoid unrelated changes in the same PR.

These rules are enforced to keep the feature modular and to allow parallel work across the team while preserving traceability to the plan and acceptance criteria.

  Rationale: Decomposing by vertical slices allows parallel work and early value (ship SW registration + precache first). Do you want me to create these sub-issues and link them? (I will not create them without confirmation.)

## 5. Step-by-Step Implementation Plan (TDD-first)

Phase A — SW Registration & Precache

  1. Write failing unit tests for registration helper behavior.
  2. Implement `src/lib/sw/register.ts` and `public/sw.js` precache install handler.
  3. Add integration Playwright test to assert `navigator.serviceWorker.controller` after load.

Phase B — Runtime Caching

  1. Add tests for runtime cache-first and network-first behaviors (unit+integration). Mock fetch where possible.
  2. Implement cache handling and eviction policy.

Phase C — Offline Queue

  1. Write unit tests for `OfflineQueue` API (enqueue, dequeue, persist, retry/backoff).
  2. Implement IndexedDB wrapper and encryption helpers.
  3. Wire queue consumer into SW `sync` or `online` event.

Phase D — UI & Update Flow

  1. Write component tests for `OfflineBanner` timing and controls.
  2. Implement client message handlers (postMessage) to show update banner and offline status.

Phase E — E2E & Hardening

  1. Add Playwright scenarios for offline reload, queue processing on reconnect, and update activation.
  2. Run accessibility checks and performance assertions in CI.

## 6. Effort, Risks, and Mitigations

- Estimated effort: 3–5 developer-days total. If decomposed into slices, each slice ~0.5–2 days.
- Risks:
  - Browser compatibility edge cases (mitigation: polyfills and graceful degrade paths).
  - Storage quota and eviction correctness (mitigation: conservative defaults, QA on low-storage devices).
  - Sensitive data handling (mitigation: encryption, code review checklist item).

## 7. File-Level Change List

- Files added under `specs/035-service-worker-setup/`:
  - `research.md` (this run)
  - `data-model.md` (this run)
  - `contracts/openapi-service-worker.yml` (this run)
  - `quickstart.md` (this run)
- Repo files to create/update in implementation:
  - `public/sw.js` (service worker script)
  - `src/lib/sw/register.ts` (registration helper)
  - `src/lib/offline/indexeddb.ts` (indexedDB wrapper)
  - `src/lib/offline/queue.ts` (queue implementation)
  - `src/components/OfflineBanner/*` (UI)
  - Tests: `tests/e2e/sw.*`, `tests/unit/offline.*`
  - `.github/copilot-instructions.md` (updated by agent-context script)

## 8. Test Plan

- Unit tests for registration helper, queue API, encryption utilities.
- Integration tests mocking fetch to assert caching behavior.
- Playwright E2E tests for offline reload, offline banner timing, and queue processing on reconnect.
- Performance measurement: measure offline load time for app shell under throttled network.

## 9. Rollout & Monitoring Plan

- Feature gate: launch behind a client-side feature flag if desired.
- Rollout: can be enabled progressively; SW behavior is client-side and safe to roll out via JS bundle updates.
- Monitoring: local `OfflineEventLog` persisted for QA; optional telemetry events for install/activate/update (respecting privacy).

## 10. Handoff Package

- Artifacts in this spec folder:
  - `research.md`, `data-model.md`, `contracts/openapi-service-worker.yml`, `quickstart.md`.
- Implementation checklist (see File-Level Change List) and required tests.

---

If you'd like, I can now:

- create the proposed sub-issues and link them to this plan, or
- scaffold the initial `sw.js` + `register.ts` and add unit tests (I recommend starting with precache + registration first).

# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Maintainer**: @doug

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

### Post-ratification checklist

- [ ] Confirm `.specify/memory/constitution.md` is referenced in the feature spec
- [ ] Run Codacy analysis on any edited files (per repo rules)
- [ ] Update templates if constitution wording changes

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
