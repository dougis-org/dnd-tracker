# research.md decisions

Decision: Per-user storage with optional org-scoped field

Rationale:

- The feature spec and session notes explicitly require per-user saved encounters for MVP. Adding an optional `org_id` (nullable) lets us upgrade to organization-level sharing without a breaking migration.
- This keeps the initial implementation simple while preserving future extensibility.

Alternatives considered:

- Shared-only storage (rejected): too broad for MVP and introduces permissioning complexity.
- Multi-tenant schema with separate collections (rejected): premature optimization and increases operational complexity.

Decision: Persistence adapter pattern (Mongoose + localStorage fallback)

Rationale:

- The repo already uses Mongoose and MongoDB in other features. Implementing a small persistence adapter lets UI-first development use localStorage for early testing and wire in Mongoose-based server adapters later.

Alternatives considered:

- Direct API-first approach (rejected for UI-first iteration): increases backend dependency and slows TDD for UI components.

Decision: API contract surface using REST endpoints under `/api/encounters`

Rationale:

- REST maps well to the CRUD nature of encounters and integrates cleanly with Next.js app-router API routes.
- Easier to write integration tests and mock adapters for TDD.

Alternatives considered:

- GraphQL (rejected for now): more flexible but adds complexity for the MVP.

Decision: Validation using Zod on both client and server

Rationale:

- Zod is an approved dependency for the repo and ensures consistent validation rules across client and server.

Open questions (resolved):

- Data sharing model: resolved to per-user with optional org_id field (see Decision above).

Security & Observability notes:

- All API routes must check authenticated user's id and enforce owner_id matching on mutation routes. Log structured events for create/update/delete operations.

Testing plan (summary):

- Unit tests for form validation and adapters
- Component tests for create/edit pages using Testing Library
- Integration tests for API endpoints (adapter mocks + DB integration tests)
- E2E Playwright flows for the user stories (create, import-from-party, edit)

# research.md

## Purpose

Resolve outstanding technical unknowns for Feature 008 (Encounter Builder) and document chosen approaches and alternatives.

## Unknowns found

- Data sharing model: should encounters and templates be per-user or organization-shared?  
- Backend API availability: Are REST endpoints for encounters present or do we need to add adapters?  
- Performance strategy for large encounters (100+ participants).

## Decisions

- Decision: Per-user storage for MVP (encounters and templates scoped to the user).  
  - Rationale: Least risky, aligns with current assumptions in spec and avoids permission model complexity.  
  - Alternatives considered: organization-level sharing (requires permissions & UI changes) — deferred to future slice.

- Decision: Use existing backend (MongoDB + Mongoose) via a new `encounters` adapter, with a localStorage fallback for UI-local testing and E2E stubs.  
  - Rationale: Repo already includes `mongoose` and backend patterns; adapter reduces scope risk.  
  - Alternatives: serverless persistence or remote API — requires backend infra work; choose adapter approach to enable parallel frontend work.

- Decision: Performance: client-side list virtualization for very large participant lists, but set immediate test target to 100 participants with progressive enhancement to virtualization if profiling shows issues.  
  - Rationale: Implement virtualization only if needed; keep initial implementation simpler.

## Research references / notes

- Repo `package.json` indicates Next.js + TypeScript + Mongoose: use those as the canonical stack.
- Testing stack: Jest + Playwright — align tests accordingly.

## Actionable outcomes

1. Implement encounters persistence adapter `src/lib/api/encounters.ts` that exposes create/list/get/update endpoints and abstracts storage (Mongoose vs localStorage).  
2. Implement UI components with TDD and component/integration tests.  
3. Add performance test fixture for 100 participants; add virtualization if necessary.
