# research.md — Monster / NPC Management (Phase 0)

## Decisions (resolved)

- Decision: Library scope → Hybrid (Q1: C)
  - Templates/global defaults are stored at the user/global level.
  - Instantiated Monsters are campaign-scoped by default, with optional migration to Global or Public as an explicit action.
  - Public items transfer ownership to the system account (`ownerId = "system"`) and become read-only for non-admin users. Original creator is preserved in `creditedTo` metadata.

- Decision: Stack & approach
  - Use the existing frontend stack: Next.js 16 + React 19 + TypeScript 5.9 (matches repository `package.json`).
  - Implement the UI first using mock adapters and existing API stubs. Provide a thin adapter layer so the same components can switch to real backend endpoints when available.

- Decision: Data flow
  - Keep the UI-side model small and serializable (TypeScript interfaces). Persist mock data to localStorage for dev flows and tests.
  - When the backend is available, the adapter will translate client models to API DTOs.

- Decision: Permission model (MVP)
  - Scopes: `global` | `campaign` | `public`.
  - `public` entries: ownerId -> `system`, `isPublic: true`, `publicAt: timestamp`, `creditedTo: <originalCreator>`.
  - Admins: retain manage/edit rights for `public` entries. Non-admins: read-only.
  - Full RBAC/audit rules to be defined in follow-up API/permissions story (Feature 023/024).

## Rationale

- Hybrid scope provides maximum flexibility for reuse (templates) and campaign-specific customization while keeping the MVP scope manageable.
- UI-first with mock adapters enables front-end progress before API stabilization and supports TDD (component tests + integration tests with mocked adapters).

## Alternatives considered

- Option A: Global-only libraries — simpler but reduces per-campaign customization.
- Option B: Campaign-only libraries — better organization per campaign but increases friction for reuse.
- Option C (chosen): Hybrid — keeps templates global and instances campaign-scoped. Slightly more complex but offers most value.

## Integration & migration notes

- When backend contract is created, adapter functions should be implemented to perform CRUD operations against `/api/monsters` endpoints.
- Provide a migration utility to re-scope a Monster from `campaign` -> `global` when the user requests it; for `campaign` -> `public` require additional confirmation and an audit entry (createdBy preserved in `creditedTo`).

## Open research tasks (for Phase 0 closure)

- Confirm the exact API shapes for Monster templates vs Monster instances in the backend API story (Feature 023/024).
- Confirm admin permission roles and discovery mechanism in the auth story (Feature 013/014).

---
Generated: 2025-11-08
Maintainer: @doug
