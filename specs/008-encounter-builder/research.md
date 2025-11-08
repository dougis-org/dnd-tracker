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
