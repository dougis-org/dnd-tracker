# Data Model: Service Worker Feature

Path: `/specs/035-service-worker-setup`

This document lists the primary data entities used by the service worker and related client-side persistence.

## ServiceWorkerRegistration

- Purpose: Track registration metadata and lifecycle state on the client for diagnostics and UX flows.
- Fields:
  - `id` (string): client-generated identifier (optional)
  - `scope` (string): registration scope (e.g., `/`)
  - `state` (string enum): `installing` | `installed` | `activating` | `activated` | `redundant`
  - `installedAt` (ISO8601 datetime)
  - `updatedAt` (ISO8601 datetime)

## PrecacheManifest

- Purpose: Represents the app-shell asset list cached at install time.
- Fields:
  - `assets` (array of objects): each with `{ url: string, revision: string }`
  - `generatedAt` (ISO8601 datetime)

## RuntimeCache

- Purpose: Named runtime caches for assets and API responses.
- Fields:
  - `name` (string): e.g., `assets-v1`, `api-runtime-v1`
  - `maxSizeBytes` (number): configured cap (e.g., 50 *1024* 1024)
  - `evictionPolicy` (string): `lru` (approximate) | `ttl`
  - `lastAccessed` (map of url -> ISO8601 timestamp) — used for LRU approximation

## OfflineQueueEntry

- Purpose: Represents a queued user action when offline.
- Storage: persisted in `IndexedDB` (primary) with optional encryption of sensitive fields.
- Fields:
  - `id` (string): UUID
  - `operation` (string): e.g., `PATCH /api/character/123`, or a normalized operation name
  - `payload` (object): operation payload (size-limited)
  - `createdAt` (ISO8601 datetime)
  - `attempts` (number)
  - `lastAttemptAt` (ISO8601 datetime | null)
  - `status` (string enum): `queued` | `in-progress` | `failed` | `succeeded`
  - `meta` (object): optional metadata (headers, correlation id)

Validation:

- Payload size limit: configurable; default 256 KB. Reject or chunk larger payloads.
- Encryption: Fields marked as sensitive must be encrypted with Web Crypto before storage.

## OfflineEventLog

- Purpose: Local structured log entries for service worker lifecycle and sync events (diagnostics).
- Storage: `IndexedDB` or `localStorage` in dev mode; persisted only for debugging and sampled in production.
- Fields:
  - `id` (string)
  - `level` (string): `debug` | `info` | `warn` | `error`
  - `eventType` (string)
  - `payload` (object)
  - `createdAt` (ISO8601 datetime)
