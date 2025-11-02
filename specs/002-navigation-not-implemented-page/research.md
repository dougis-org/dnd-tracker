```markdown
# Research: F002 — Navigation & Not Implemented Page

## Unknowns / NEEDS CLARIFICATION (extracted from plan)

1. Constitution gating: the constitution file is a template — what governance items must be explicitly enforced for this feature? (tests, approval gates)
2. Exact route-to-label mapping: roadmapped routes exist, but human-readable labels and any exceptions must be confirmed (e.g., `combat/:sessionId` label)
3. Breadcrumb UX for very long segments: truncation behavior and tooltip expectations

## Research Tasks & Findings

### 1) Constitution gating (decision)
- Decision: For Phase 1, require Test-First rule enforcement: unit tests + one Playwright smoke test must pass in CI for merge. Document this as a proposed constitution amendment in the plan and request ratification.
- Rationale: Keeps parity with project standards (TDD-first) and avoids incomplete UI merges.
- Alternatives considered: Allow exceptions for purely documentation changes. Rejected because navigation touches UI and tests are fast to add.

### 2) Route-to-label mapping
- Decision: Use canonical labels derived from the roadmap with minor humanization: `/characters` → "Characters", `/characters/:id` → "Character", `/dashboard` → "Dashboard".
- Rationale: Matches product expectations and keeps breadcrumbs concise.
- Implementation note: Provide a `routeMeta` table in `src/lib/navigation.ts` mapping path patterns to titles; fallback to capitalized segment.

### 3) Breadcrumb truncation
- Decision: Truncate long segments at ~24 chars with tooltip showing full text. Use CSS ellipsis + title attribute for tooltip. For accessibility, ensure tooltip content is available to screen readers (aria-describedby).
- Rationale: Preserves readable UI on small screens while retaining full path information.

## Accessibility Patterns (research)

- Mobile menu: use button with `aria-controls` and `aria-expanded`. Use focus trap when menu is open to keep keyboard focus inside.
- Desktop menu: keyboard navigation with roving tabindex or roving focus management; `aria-haspopup` and `aria-expanded` on parent menu items when children present.
- Breadcrumbs: links for parent segments and `aria-current="page"` for current segment.

## Testing & Automation

- Unit tests: Jest + React Testing Library for component rendering and keyboard interactions.
- Playwright: smoke test that toggles mobile viewport, opens hamburger menu, navigates to `/dashboard`, and asserts `NotImplementedPage` visible.

## Decisions (consolidated)

- Use Next.js (App Router) + TypeScript + shadcn/ui for UI components.
- Use a route metadata table to supply labels and breadcrumb titles.
- Implement accessible mobile & desktop navigation patterns per WAI-ARIA guidance.
- Add a short ratification note for constitution amendments and attach to PR.

```
