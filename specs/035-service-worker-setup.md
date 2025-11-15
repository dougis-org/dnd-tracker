# Feature Specification: Service Worker Setup

**Feature Branch**: `feature/035-service-worker-setup`
**Created**: 2025-11-13
**Status**: Draft
**Input**: User description: "setting up the service workers for the app"

**Maintainer**: @doug
**Canonical components (UI)**: GlobalNav, OfflineBanner
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Shell Offline Load (Priority: P1)

As a returning user, when I lose network connectivity and reload the app, I can still load the core app shell and navigate to previously cached pages so I can continue interacting with the UI and view cached content.

Why this priority: Provides immediate user value for offline resilience and enables other offline features (combat persistence, local saves).

Independent Test: Disable network in browser devtools, navigate to the app root, verify app shell loads and primary navigation is functional. Verify console shows service worker active and responses served from cache.

Acceptance Scenarios:

1. Given the user previously visited the app, When they lose network and reload, Then the app shell (header, navigation, main layout) loads from cache within 2s and primary routes render a saved/placeholder state.
2. Given a cached asset is requested, When offline, Then the asset is served from the service worker cache and no network request occurs.

---

### User Story 2 - Offline Indicator & Graceful UI (Priority: P2)

As a user, when my connection is lost or intermittent, I see a clear, non-blocking banner indicating offline state and offered actions (retry/background sync status), so I understand the current connectivity and can continue working.

Why this priority: UX clarity prevents confusion; offline banner reduces accidental data loss and sets expectations.

Independent Test: Simulate offline/online transitions and assert the offline banner appears within 2s of disconnect and hides after reconnect.

Acceptance Scenarios:

1. Given network disconnect, When detection triggers, Then an offline banner is visible with a short message and a retry button.
2. Given queued offline operations exist, When online returns, Then the banner shows sync progress and success/failure summary.

---

### User Story 3 - Runtime Caching & Performance (Priority: P3)

As a user on unreliable networks, I expect frequently-used static assets (icons, CSS, core JS) to load quickly from cache on subsequent visits, improving perceived performance.

Why this priority: Improves perceived performance for repeat users and reduces network usage.

Independent Test: On first load, record network timings; on second load (with normal or throttled network), assert that key assets are returned from cache and page load time improves.

Acceptance Scenarios:

1. Given a returning user, When they revisit the app, Then common static assets are served from cache and main page render time is reduced by a measurable amount.

---

### Edge Cases

- What happens when the cache storage quota is reached? The service worker should evict least-recently-used cache entries and surface an error in debug logs; UX should indicate degraded offline capability.
- How does the app handle service worker update during an active session? New service worker should be installed in the background and only activate after the user refreshes or we perform a controlled update flow.
- Browser without service worker support should gracefully degrade: show a short message that offline capabilities are limited, but core functionality remains available when online.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST register a service worker during application startup in supported browsers.
- **FR-002**: System MUST precache an app shell (HTML shell, core JS bundles, main CSS, key images) during install so the app shell is available offline.
- **FR-003**: System MUST implement runtime caching strategies for third-party assets and API responses with clear eviction policies.
- **FR-004**: System MUST surface an offline indicator/banner within 2 seconds of network disconnect.
- **FR-005**: System MUST provide a retry/manual-sync control for queued offline actions.
- **FR-006**: System SHALL use a hybrid caching strategy: cache‑first for static assets (icons, CSS, JS bundles) and network‑first for frequently changing API endpoints; the service worker should apply appropriate short TTLs and validation for API responses to avoid long-lived stale data.
- **FR-007**: System MUST support a controlled update flow where new service worker waits to activate until user confirms refresh or after a safe window.
- **FR-008**: System MUST log service worker lifecycle events to local debug logs for diagnosis (install, activate, fetch failures, sync results).
- **FR-009**: System MUST avoid caching sensitive user data (personal data, tokens) in the public cache.
- **FR-010**: System SHALL implement a minimal offline queue and attempt immediate retries on reconnect (without relying on the Background Sync API). Queued entries should persist in IndexedDB/localStorage and support manual retry controls in the UI.

### Key Entities *(include if feature involves data)*

- **ServiceWorkerRegistration**: Contains registration metadata, scope, and state (installing, installed, activating, activated, redundant).
- **PrecacheManifest**: List of assets and their hashed URLs included in install-time cache. Precache scope is limited to the app shell (root HTML, main JS bundles, CSS, and core images such as logo).
- **RuntimeCache**: Named caches used for runtime caching (e.g., `assets-v1`, `api-runtime-v1`). Includes eviction policy metadata.
- **OfflineQueueEntry**: Representation of queued user actions while offline (operation type, payload, timestamp, retry count) persisted locally until reconnection.
- **OfflineEventLog**: Local log entries for lifecycle and sync events for diagnostics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Service worker registers and reaches `activated` state in supported browsers for at least 95% of new page loads (measured in QA environment).
- **SC-002**: App shell loads and main navigation is interactive within 2 seconds on subsequent page loads when offline (measured in throttled network simulation).
- **SC-003**: At least 90% of static assets (JS/CSS/images) requested on repeat visits are served from cache after a successful install in QA tests.
- **SC-004**: Offline banner appears within 2 seconds of offline detection in simulated tests.
- **SC-005**: Queued offline operations are retried automatically on reconnect and cleared within 30s for 90% of cases in integration tests when immediate retries are possible; manual retry controls exist for failures.
- **SC-006**: No sensitive user information is stored in service worker caches (verified by code review and automated scan).

## Assumptions

- App is served over HTTPS in production, satisfying service worker origin requirements.
- Browsers used by target users include modern Chromium-based and Firefox browsers with service worker support; older browsers will degrade gracefully.
- Offline persistence of large application state (combat sessions, indexedDB) is handled by follow-on features (Feature 036: IndexedDB Setup); this feature focuses on registration, caching, runtime strategies, and UX for connectivity state.
- CI environment will allow registration testing using a headful browser environment or Playwright with service worker support.

## Non-Goals

- This feature will not implement a full offline-first data sync engine or conflict resolution (deferred to Feature 037/038/039).
- This feature will not persist large mutable game state to IndexedDB — that is the responsibility of Feature 036.

## Implementation Notes (for planning only)

- Implementation should avoid leaking these implementation details into this spec; the above notes are only for the engineering planning phase.

## Resolved Clarifications

- **Caching Strategy**: Hybrid — cache‑first for static assets; network‑first for API endpoints (per Q1 = A).
- **Precache Scope**: App shell only — root HTML, main JS bundles, main CSS, and core images (per Q2 = A).
- **Background Sync / Offline Queue**: Minimal offline queue with immediate retry on reconnect (no Background Sync API) and manual retry control in UI (per Q3 = C).

## References

- `docs/Tech-Stack.md` (caching guidance)
- `docs/Feature-Roadmap.md` (feature mapping)
- .specify/templates/spec-template.md

---

## Spec Ready For Planning: SUCCESS
