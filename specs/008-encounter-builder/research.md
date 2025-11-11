# Encounter Builder Research

## Purpose

Document the resolved unknowns and guiding technical decisions for Feature 008 (Encounter Builder).

## Key Unknowns Addressed

- Data sharing model for encounters and templates
- Backend availability for encounter persistence
- Performance strategy for large participant counts (≥100)

## Decisions & Rationale

### Per-user storage with optional org scope

- Store encounters per user for the MVP to minimize permission complexity.
- Include an optional `org_id` field (nullable) so organization sharing can be added later without a breaking migration.
- Rejected shared-only storage and multi-tenant collection splits because they add operational overhead before it is required.

### Persistence adapter pattern (Mongoose + localStorage)

- Reuse existing Mongoose/MongoDB stack for server persistence and expose a thin adapter in `src/lib/api/encounters.ts`.
- Provide a localStorage fallback so UI-first and E2E work can proceed before backend endpoints ship.
- Rejected a backend-first or serverless approach because it would slow TDD for UI components during the first slice.

### REST API surface under `/api/encounters`

- Aligns with Next.js App Router conventions and keeps CRUD semantics straightforward.
- Simplifies mocking and integration testing compared to GraphQL for this scope.
- GraphQL was deferred to avoid introducing additional complexity for the MVP.

### Validation with Zod (client & server)

- Use Zod schemas to enforce identical validation rules on both sides of the adapter.
- Ensures parity between form validation and API contract expectations.

### Security & Observability Notes

- Every mutation route must verify the authenticated user's ownership (`owner_id`) before updating data.
- Emit structured logs for create, update, and delete operations to support auditing.

## Testing Strategy Summary

- Unit tests for form validation, adapters, and helper utilities
- Component tests for create/edit pages using Testing Library
- Integration tests for API endpoints (adapter mocks plus optional in-memory MongoDB)
- Playwright E2E flows covering create, import-from-party, and edit user stories

## References

- `package.json` confirms the stack: Next.js 16.0.1, React 19.0.0, TypeScript 5.9.2, Mongoose 8.x, Zod 3.x.
- Testing tooling already in repo: Jest, Testing Library, Playwright, Testcontainers.

## Actionable Outcomes

1. Implement the encounters persistence adapter with swappable storage backends.
2. Build UI components with a strict TDD workflow, ensuring coverage for validation and persistence flows.
3. Add performance coverage for 100-participant encounters and expand to virtualization only if profiling indicates the need.
