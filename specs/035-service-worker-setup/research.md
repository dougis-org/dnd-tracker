# Research: Service Worker Setup Decisions

Path: `/specs/035-service-worker-setup`

This document consolidates research and final decisions for the Service Worker feature. All open "NEEDS CLARIFICATION" items from the feature spec were resolved during planning and are recorded below.

## Decision: Caching Strategy

- Decision: Hybrid strategy — cache-first for static assets (app shell, icons, CSS, JS bundles) and network-first for mutable API endpoints.
- Rationale: Cache-first gives best perceived performance for static assets; network-first prevents stale mutable data for game state and user-specific endpoints.
- Alternatives considered: fully network-first (worse perceived performance), full offline-first sync engine (out of scope for this feature).

## Decision: Precache Scope

- Decision: Precache app shell only: root HTML, main JS bundles, main CSS, and core images (logo, primary icons).
- Rationale: Minimizes install-time cache size and reduces risk of caching user-specific content inadvertently.
- Alternatives: Larger precache including secondary assets — rejected due to size cap and complexity.

## Decision: Offline Queue Storage

- Decision: Use `IndexedDB` for `OfflineQueueEntry` persistence; provide an IndexedDB wrapper to handle serialization and encryption of sensitive fields.
- Rationale: IndexedDB is durable and supports structured objects and larger payloads compared to localStorage.
- Alternatives: localStorage (insufficient size and blocking), Background Sync API (not relied upon — feature requires immediate retry on reconnect).

## Decision: Cache Eviction and Size Cap

- Decision: LRU-ish eviction plus a hard size cap of 50 MB for service-worker-managed caches. Implement approximate LRU via last-access timestamps; evict oldest/least-recently-used entries when cap exceeded.
- Rationale: Controls storage growth and provides predictable behavior on quota pressure.
- Alternatives: Time-based TTL only — insufficient for large uncontrolled asset sets.

## Decision: API Response TTL and Network Strategy

- Decision: Short TTL (5 minutes) for network-first endpoints; use network-first with fallback to cache when network unavailable. Apply validation headers where feasible.
- Rationale: Keeps mutable game data fresh while allowing offline fallback.

## Decision: Controlled Update Flow

- Decision: New service worker installs in the background and waits to activate until either (a) user refreshes, (b) user confirms via an "Update available" banner, or (c) a safe window (24 hours) expires — whichever comes first.
- Rationale: Balances seamless updates with predictable user experience and avoids mid-session activation surprises.

## Decision: Offline Indicator & UX

- Decision: Non-blocking offline banner shown within 2s of network loss; includes `Retry` control and shows sync progress when queued operations are processing.
- Rationale: Provides clear feedback without blocking users.

## Decision: Sensitive Data Policy

- Decision: Never cache auth tokens, PII, private inventories, or session secrets in public caches. Sensitive fields in queued entries will be encrypted (Web Crypto AES-GCM) before being persisted.
- Rationale: Minimize risk of data exposure and comply with security principles.

## Decision: Logging & Observability

- Decision: Service worker will emit structured debug logs to an `OfflineEventLog` persisted locally; include lifecycle events (install, activate, fetch errors), but avoid shipping verbose logs to production by default.
- Rationale: Facilitates local debugging in QA and developer environments.

## Decision: Offline Queue Retry Policy

- Decision: Exponential backoff up to 5 attempts, then surface a failure to the user via UI with a manual retry option.

## Summary

All clarifications listed in the feature spec were addressed during planning and the above decisions are the baseline for Phase 1 design artifacts (data model, contracts, quickstart). If you want any decision revisited or elevated to a separate design spike, tell me which one and I'll open a focused research task.
