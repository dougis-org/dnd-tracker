<!--
Auto-generated spec for Feature 014: MongoDB User Model & Webhook
Created by speckit.specify flow on 2025-11-18
-->
# Feature 014: MongoDB User Model & Webhook

## Summary

Provide a persistent MongoDB-backed `User` model and a webhook receiver to ingest external user lifecycle events. This feature enables persistent user data storage, event-driven updates, and a foundation for profile, permissions, and downstream integrations.

## Scope

- Implement MongoDB models for `User` and `UserEvent`.
- Add internal CRUD API endpoints for user records (server-side only).
- Add a webhook receiver endpoint at `/api/webhooks/user-events` that accepts event posts, validates them, stores events, and applies relevant changes to `users`.
- Provide migration steps to create collections and indexes in Atlas.

Non-goals:

- Full auth integration (Clerk already implemented separately).
- Public UI changes or feature flags (user model is enabled by default).

## Actors

- Backend developer / maintainer
- External systems that POST webhook events (auth provider, analytics)
- CI / DevOps for Atlas provisioning and index creation

## User Stories

1. As a backend developer, I can persist user records in MongoDB so profile and permissions features can read real data.
2. As an integration owner, I can POST user lifecycle events to our webhook and have them processed and stored.
3. As an operator, I can run migration steps to create required collections and indexes in Atlas.

## Functional Requirements (Testable)

FR-001: The system must persist a `User` document with fields: `userId` (string, unique), `email` (string, unique), `displayName` (string), `createdAt` (ISO8601), `updatedAt` (ISO8601), `metadata` (object).

FR-002: The system must expose internal API endpoints for CRUD operations on `User` (create/read/update/delete). Each endpoint must validate input and return appropriate HTTP status codes.

FR-003: The webhook endpoint `/api/webhooks/user-events` must accept POST requests containing JSON with at least: `eventType` (one of `created|updated|deleted`), `user` (object with `userId` and other fields), and `timestamp`.

FR-004: The webhook must validate a HMAC-SHA256 signature provided in the `X-Webhook-Signature` header using `WEBHOOK_SECRET`. The runtime behavior is:

- If `WEBHOOK_SECRET` is set: incoming requests MUST include a valid `X-Webhook-Signature`; otherwise the service MUST return HTTP `401 Unauthorized`.
- If `WEBHOOK_SECRET` is unset: the service MUST emit a startup-time WARN (or ERROR depending on environment) indicating the missing secret and risk; runtime signature validation is effectively disabled until the secret is provided.

FR-005: The webhook must persist received events to a `user_events` collection with the raw payload, event type, source, and received timestamp.

FR-006: For `created` and `updated` events, the webhook must upsert the `User` document using the supplied payload. For `deleted` events, the webhook must soft-delete by setting `deletedAt` timestamp. Queries must exclude soft-deleted users by default.

FR-007: When processing `updated` and `deleted` events, use timestamp-based conflict resolution: skip upsert if incoming event timestamp ≤ current document `updatedAt`.

FR-008: The system must enforce uniqueness on `email` and `userId` at the database level and return errors on constraint violations (HTTP `409 Conflict` for client-facing APIs).

FR-009: Provide a `connectToMongo()` helper that reuses a MongoDB client across serverless invocations to avoid connection storms. (Name standardized across spec/plan/tasks.)

FR-010: Provide migration steps (script or documented `mongo` / Atlas UI steps) to create the `users` and `user_events` collections and define indexes: unique index on `email`, unique index on `userId`, and an index on `updatedAt`.

## Success Criteria (Measurable & Verifiable)

- SC-1: 100% of unit tests for model validation pass.
- SC-2: Integration tests exercise create→read→update→delete flows with an in-memory or test Atlas instance and pass in CI.
- SC-3: Webhook processing tests demonstrate signature validation, event persistence, and upsert behavior for `created`/`updated` events.
- SC-4: Migration steps successfully create required collections and indexes in a fresh Atlas project (documented verification steps included).

## Migration Steps (Operations)

1. Connect to Atlas (project) with admin privileges.
2. Create database `dnd-tracker` (or use existing env-provided DB name).
3. Create `users` collection.
4. Create `user_events` collection.
5. Create indexes:
   - `users`: `{ userId: 1 }` unique
   - `users`: `{ email: 1 }` unique
   - `users`: `{ updatedAt: -1 }` (non-unique)
   - `user_events`: `{ receivedAt: -1 }`
6. Verify indexes in Atlas UI or via `db.getCollection('users').getIndexes()`.

Include an optional script `scripts/migrations/create-user-indexes.js` as part of follow-up work if automated migrations are desired.

## Key Entities & Data Model (example)

User (users)

- `userId`: string, primary unique id (from auth provider)
- `email`: string, unique
- `displayName`: string
- `metadata`: object — opaque JSON object for arbitrary metadata. Recommendation: limit metadata to 64KB and avoid nested binary blobs. Validation: allow any JSON object but enforce a max serialized size (configurable) in the Zod schema.
- `createdAt`: date
- `updatedAt`: date
- `deletedAt`: date|null

UserEvent (user_events)

- `eventId`: generated id
- `eventType`: string
- `payload`: object (raw)
- `source`: string
- `receivedAt`: date

## API Endpoints (internal, server-side only)

- `POST /api/internal/users` — create user (returns 201)
- `GET /api/internal/users/:userId` — get user (returns 200/404)
- `PATCH /api/internal/users/:userId` — update user (returns 200/404)
- `DELETE /api/internal/users/:userId` — delete user (returns 204)
- `POST /api/webhooks/user-events` — webhook receiver (returns 200 on success)

## Config & Environment Variables

- `MONGODB_URI` — Mongo Atlas connection string, stored in `.env.local` for development.
- `MONGODB_DB` — optional DB name (default `dnd-tracker`).
- `WEBHOOK_SECRET` — HMAC secret for webhook signature validation (optional; if unset, signature validation is disabled).
- `WEBHOOK_MAX_PAYLOAD_SIZE` — Maximum webhook payload size in bytes (default: 1MB = 1048576).
- `WEBHOOK_TIMEOUT_MS` — Webhook processing timeout in milliseconds (default: 3000ms).

## Non-Functional Requirements

- **Webhook Response Latency:** Target ≤ 3 seconds for webhook POST processing.
- **Webhook Payload Size:** Maximum acceptable payload size: 1MB.
- **Event Retention:** `user_events` collection retained indefinitely (archival is operational policy, not code).
- **Soft-Delete Query Filtering:** All user queries must exclude documents where `deletedAt` is not null, unless explicitly querying deleted records.
- **Logging Strategy:** Structured JSON logging (INFO for all webhook requests, WARN for validation failures, ERROR for system failures).
- **Webhook Failure Handling:** On processing failure (DB error, validation error), return HTTP 500; external system responsible for retry.

## Testing & Validation

- Unit tests for model validation and helper functions.
- Integration tests using an in-memory Mongo or a test Atlas instance for CRUD and webhook processing.
- Migration verification checklist (index existence, constraints enforcement).

## Assumptions

- MongoDB Atlas is used (confirmed). Connection string will be added to `.env.local`.
- Webhook events set: `created`, `updated`, `deleted` (confirmed).
- Feature is greenfield, but migrations are required to create collections/indexes (confirmed).
- Clerk integration already present; user model will work alongside Clerk (no feature flag required).

## Clarifications

### Session 2025-11-18

- Q1: Soft-delete strategy → A: Soft-delete only (set `deletedAt` timestamp, exclude from queries by default)
- Q2: Webhook retry & failure handling → A: Store events immediately (fire-and-forget); failures return 500; external system retries
- Q3: Concurrent update conflict resolution → A: Timestamp-based ordering (skip upsert if incoming event timestamp ≤ current `updatedAt`)
- Q4: Logging & observability → A: Structured JSON logging; INFO for requests, WARN for validation failures, ERROR for system failures
- Q5: Webhook timeout & resource limits → A (modified): Max 1MB payload, 3s latency target, no rate-limiting, indefinite retention

## Open Questions (resolved)

- Q1: Atlas selected — answered (Atlas).
- Q2: Event types — accepted suggested set (created, updated, deleted).
- Q3: Greenfield with migrations — confirmed; migration steps added.

## Edge Cases & Error Handling

- **Signature Validation Failure:** Return HTTP 401 (Unauthorized). Log at WARN level.
- **Malformed Payload:** Return HTTP 400 (Bad Request). Log at WARN level; do not store event.
- **Concurrent Updates:** Use timestamp comparison: if incoming `timestamp` ≤ current `updatedAt`, skip upsert but still store event in `user_events`.
- **Payload Size Exceeded:** Return HTTP 413 (Payload Too Large) if request body > 1MB.
- **Processing Timeout:** If webhook processing exceeds 3 seconds, return HTTP 504 (Gateway Timeout).
- **Database Uniqueness Violation:** Return HTTP 409 (Conflict) with descriptive error message.
- **Soft-Deleted User Queries:** All reads exclude `{ deletedAt: { $ne: null } }` by default; admin operations may include deleted records.

## Acceptance Tests (high level)

AT-1: Create a user via internal API; assert user exists in `users` and `user_events` contains a `created` entry.
AT-2: Post a signed webhook `updated` event; assert user document is updated and `user_events` contains the event.
AT-3: Post a malformed webhook or invalid signature; assert API returns 401 or 400 and no event is stored.
AT-4: Soft-delete: POST `deleted` webhook event; verify user has `deletedAt` set and is excluded from standard queries.
AT-5: Timestamp conflict: POST `updated` event with older timestamp than current `updatedAt`; verify upsert is skipped but event is stored.
AT-6: Payload size limit: POST webhook with >1MB payload; verify API returns 413.
AT-7: Logging: Verify structured JSON logs at INFO, WARN, ERROR levels appear in output for successful and failed requests.
AT-8: Latency: Process webhook in ≤3 seconds for typical payload; measure and document baseline.

## Documentation

- Add `docs/feature-014-mongodb-user-model.md` with endpoint examples and migration verification commands.

## Next Steps

1. Implement data models and `connectToMongo()` helper (F014.1).
2. Implement internal CRUD endpoints and tests (F014.2).
3. Implement webhook endpoint and event processor (F014.3).

---
*Spec generated programmatically. If you want me to create the migration script or scaffold code now, reply confirming and I'll proceed.*
