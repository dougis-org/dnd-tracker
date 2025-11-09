# Issue decomposition & implementation plan — Feature 007 (Monster / NPC Management)

Generated: 2025-11-08
Maintainer: @doug

## Summary

This document proposes a scope decomposition for Feature 007 (Monster / NPC Management) into smaller, independently deliverable vertical slices. It maps the existing user stories (from `specs/007-monster-management/spec.md`) into work slices, shows dependencies, and lists recommended new issue titles and sequencing. No GitHub issues will be created until you confirm.

## Assumptions & Open Questions

- Based on the spec and research, the feature is frontend-first and will use mock adapters/localStorage for MVP.
- Authentication, backend persistence, and permission discovery are out-of-scope for this feature and handled in follow-ups (Feature 013/014 for auth and Feature 023/024 for API contracts).
- We assume you want incremental, testable slices that can be reviewed and merged independently.

## Acceptance Criteria (normalized & testable)

- AC-001 (MVP): `/monsters` list is accessible and shows mock data (at least one monster).
- AC-002 (MVP): Viewing `/monsters/:id` shows required stat-block fields.
- AC-003 (MVP): Selecting a monster from the library in an encounter stub adds it to the participant list.
- AC-004 (follow-up): Creating/editing a monster persists in mock adapter and is visible in the list and detail views.

## Scope Decomposition Assessment (Should we split?)

Yes — the feature cleanly decomposes into vertical slices that are:

- Independently testable (list/detail vs create/edit vs search).
- Incrementally valuable (list/detail delivers core combat workflow).
- Lower risk when isolated (mock adapters + types first).

## Proposed Work Breakdown (vertical slices)

Table: proposed slices, rationale, dependencies, rough effort (relative), and acceptance test mapping.

| Slice ID | Title (proposed issue) | Rationale / Value | Depends on | Effort (S/M/L) | Maps to AC |
|---|---|---:|---|---:|---|
| S1 | monsters: MVP — list + detail + encounter pick | Core value: lets DM reuse monsters in combat (enables primary workflow). Testable with mock data. | none (only setup) | M | AC-001, AC-002, AC-003 |
| S2 | monsters: create & edit (form + persistence to mock adapter) | Allows homebrew and editing; needed soon after S1 to enable authorship flows. | S1 | M | AC-004 |
| S3 | monsters: filter & search UX + performance | Improves discoverability; independent and parallel after S1 mocks exist. | S1 | S | AC-002 (search subset), SC-002 |
| S4 | monsters: templates library & instantiate from templates | Implements template/global behavior per research (Hybrid model). | S1, S2 | L | FR-006, FR-009 |
| S5 | monsters: scope (global/campaign/public) UX & public-flow confirmations | Implements scope & public ownership behavior. Needs coordination with permissions story (013/014) for production, but can be mocked in UI. | S2, S4 | L | FR-009, FR-010 |
| S6 | monsters: accessibility & polish + E2E tests | Cross-cutting, final QA and a11y fixes; small but required before release. | S1–S5 | S | SC-005 |

Notes on ordering: S1 → (S2 and S3 can run in parallel after S1) → S4 → S5 → S6.

## Sequencing & Dependencies (visual)

- Phase A (Setup): types, mock adapter, basic components (T001–T008 in `tasks.md`) — prerequisite for all slices.
- Phase B (MVP): S1 (monsters list + detail + encounter pick).
- Phase C (Feature expansion, parallel): S2 (create/edit) and S3 (filter/search) — both require Phase A and S1's UX patterns but can be worked in parallel by separate teams.
- Phase D (Templates & scope): S4 then S5 (templates, then scope/public flow). S5 depends on confirmation and needs permissions contract for final implementation — for now treat as UI mock plus a migration utility placeholder.
- Phase E (QA & release): S6 (a11y, E2E, performance tuning).

## Work Breakdown with mapping to existing tasks.md IDs

- Phase A (Setup): tasks T001–T008 (types, mock adapter, component skeletons, pages shells)
- S1 (MVP): tasks T009–T012 (list, detail, encounter picker, list-detail tests)
- S2 (Create/Edit): tasks T013–T016 (form, edit page, integration test, local persistence)
- S3 (Filter/Search): tasks T017–T019 (filters, logic, unit & e2e tests)
- S4/S5: not fully expanded in tasks.md — recommend follow-up tasks to implement templates and scope metadata, migration utility, and UI confirmations.

## Proposed new issue titles (suggested names)

1. monsters: MVP — list & detail (S1) — includes encounter pick stub
2. monsters: create & edit form + local persistence (S2)
3. monsters: filter & search (S3)
4. monsters: templates library (S4)
5. monsters: scope & publish flow (S5) — UI mock + migration util
6. monsters: accessibility, E2E and performance polish (S6)

## Estimated effort & owner guidance (rough)

- S1: 3–5 dev days (one frontend dev) — includes components, list/detail pages, encounter picker stub, and unit tests.
- S2: 3–6 dev days — form, edit, local persistence, integration test.
- S3: 1–3 dev days — UI filters, search hook, unit tests, e2e scenario.
- S4: 3–7 dev days — templates UI, template persistence, instantiate flow.
- S5: 2–5 dev days — UI confirmations, migration util; backend contract required for finalization.
- S6: 1–3 dev days — accessibility fixes, playwright e2e, final polish.

## Risk assessment & mitigations

- Risk: Backend contracts and auth are unfinished (013/014, 023/024). Mitigation: implement a thin adapter layer and keep mock adapter compatible with future API DTOs.
- Risk: Scope/permissions complexity for Public ownership. Mitigation: implement UI-only mock and add feature flags to gate real-public flows until backend/permissions are ready.

## File-level change list (high-level)

- `src/types/monster.ts` — type interfaces
- `src/lib/mocks/monsterAdapter.ts` — mock CRUD + localStorage persistence
- `src/lib/mocks/sampleMonsters.ts` — sample dataset
- `src/lib/services/monsterService.ts` — wrapper for adapter
- `src/components/MonsterCard.tsx`, `src/components/MonsterStatBlock.tsx`, `src/components/MonsterForm.tsx`
- `src/app/monsters/*` — page routes (list, detail, new, edit)
- `tests/unit/...` and `tests/integration/...`, `tests/e2e/...` — per-slice tests

## Next steps / action choices (pick one)

1. Confirm and CREATE sub-issues with the suggested titles and dependency links. I will create the GitHub issues and a working branch for the first slice (if you confirm, provide issue/branch naming preference).
2. Tweak the decomposition (change scope, merge slices, or change priority) and then proceed with creating issues. Suggest changes here.
3. Do not create issues yet — use this plan as guidance and I will proceed to implement selected tasks directly in code (create files and PRs).

## Notes & traceability

- This plan is derived from `specs/007-monster-management/spec.md`, `specs/007-monster-management/research.md`, and the generated `specs/007-monster-management/tasks.md`.
- I did NOT create any GitHub issues yet. Confirm which slices to promote to issues and I will create them and link back to this plan.

— End of decomposition proposal —
