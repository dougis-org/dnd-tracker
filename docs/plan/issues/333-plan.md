<!-- codacy:ignore start -->
# 333 – Navigation Menu Refinement & Help Route

## 1. Summary

- Reconcile navigation data and UI to match the requested two-column desktop layout (left cluster vs right cluster) while keeping the routing skeleton from `specs/002-navigation-not-implemented-page/spec.md`.
- Add a Help destination across navigation, routing (`src/app/help/page.tsx`), and contracts so stakeholders can surface documentation gaps quickly.
- Ensure mobile hamburger ordering mirrors the specified priority stack while preserving accessibility and test coverage already defined for F002.

## 2. Assumptions

- Help route follows existing NotImplemented pattern (`src/components/NotImplementedPage.tsx`) with the same messaging as other placeholder pages.
- "User" text label substitutes for the future avatar/name in `src/components/navigation/GlobalNav.tsx`; auth integrations arrive later with Clerk.
- Desktop grouping only changes visual layout; URL structure and breadcrumbs continue to rely on `ROUTE_DEFINITIONS`.
- No new design tokens or shadcn components are required; tailwind utilities suffice.
- Pricing remains a first-level item (not nested) across desktop and mobile menus.

## 3. Acceptance Criteria (Normalized & Testable)

- AC1: Desktop GlobalNav renders left-aligned group (`Dashboard`, `Collections` with nested links, `Combat`) and right-aligned group (`User`, `Pricing`, `Help`) as specified.
- AC2: Collections submenu exposes ordered child links for Characters → Parties → Encounters → Monsters → Items on desktop and mobile.
- AC3: Mobile hamburger menu lists top-level entries in order: Dashboard, Collections, Combat, User, Pricing, Help; expansions show the same nested children as desktop.
- AC4: `/help` Next.js route exists, returns NotImplemented content, and navigation surfaces expose it alongside Pricing; OpenAPI placeholder entry is maintained only if the roadmap continues to track static pages there.
- AC5: Updated Jest and Playwright coverage prove AC1–AC4, including accessibility-related expectations (focus, aria labels) from existing spec tests.

## 4. Approach & Design Brief

- Data Model: extend `NAVIGATION_ITEMS` into grouped collections (`PRIMARY_NAV_LEFT`, `PRIMARY_NAV_RIGHT`) or add an `alignment` property; keep a single TypeScript definition to prevent duplicate route metadata.
- Desktop UI: refactor `GlobalNav.tsx` to render two flex containers (left/right) with consistent spacing and keyboard navigation, maintaining skip link targets in `src/app/layout.tsx` and labeling the right-side trigger as "User" until Clerk integration lands.
- Dropdown Behavior: reuse existing submenu primitives; ensure Collections and the User menu share accessible disclosure patterns while aligning arrow icons to new layout.
- Mobile Menu: adjust `GlobalNav.mobile.tsx` to read the new grouped data but flatten into the supplied order (Dashboard, Collections, Combat, User, Pricing, Help) to avoid duplicating constants.
- Routing: scaffold `src/app/help/page.tsx` using NotImplemented page and register in `ROUTE_DEFINITIONS` for breadcrumbs.
- Contracts: update `specs/002-navigation-not-implemented-page/contracts/openapi.yml` with a `/help` placeholder entry only if static marketing routes remain tracked there; otherwise note the omission in the PR.
- Work Breakdown: single slice covering data, UI, routing, and tests—no sub-issues required because all work targets the shared navigation subsystem.

## 5. Step-by-Step Implementation Plan (TDD-first)

1. Update/extend unit tests for `NAVIGATION_ITEMS` consumers (likely new test file under `tests/unit/lib/navigation.spec.ts` or existing layout/nav specs) to capture alignment/grouping expectations → watch them fail.
2. Expand `GlobalNav` desktop tests (`tests/unit/components/navigation/GlobalNav.spec.tsx` if present; otherwise `layout.spec.tsx`) to assert left/right grouping, submenu ordering, and Help link visibility → red.
3. Update mobile navigation unit tests to assert item order and nested children after reconfiguration → red.
4. Add `/help` routing tests (app layout or dedicated route test) to guarantee NotImplemented rendering and breadcrumb inclusion → red.
5. Implement TypeScript changes in `src/lib/navigation.ts` to represent grouped data and include Help route metadata; adapt breadcrumb helpers as needed.
6. Refactor `GlobalNav.tsx` to render the new structure, ensuring ARIA attributes remain correct; adjust styling in `src/components/navigation/GlobalNav.tsx` and `GlobalNav.mobile.tsx`.
7. Add `/help/page.tsx` under `src/app/help/` returning NotImplemented; ensure `src/app/layout.tsx` imports still work without duplication.
8. Update docs and contracts: add `/help` to OpenAPI only if we continue documenting static pages there; otherwise record the rationale in the PR and align written docs (`specs/.../spec.md`) with the new menu.
9. Run linting (`npm run lint`, `npm run lint:markdown:fix`) and targeted tests (`npm run test -- navigation`, `npm run test:ci:parallel` as needed); update tests until green.
10. Review tasks in `specs/002-navigation-not-implemented-page/tasks.md` and mark relevant items complete; capture evidence screenshots if required by roadmap governance.

## 6. Effort, Risks, and Mitigations

- Effort: ~1 workday including TDD updates.
- Risk: Breaking existing keyboard navigation; Mitigation—reuse existing focus management utilities and expand tests with `userEvent.tab()` flows.
- Risk: Breadcrumb regression due to new Help route; Mitigation—add regression test for `/help`.
- Risk: Styling divergence in mobile menu; Mitigation—smoke test via Playwright viewport scenarios.

## 7. File-Level Change List

- `src/lib/navigation.ts` – restructure navigation constants, insert Help route metadata.
- `src/components/navigation/GlobalNav.tsx` – render grouped layout, update submenu bindings, include Help.
- `src/components/navigation/GlobalNav.mobile.tsx` – adjust ordering logic for hamburger menu.
- `src/app/layout.tsx` and `src/app/help/page.tsx` – wire Help route and ensure layout references.
- `specs/002-navigation-not-implemented-page/contracts/openapi.yml` – add `/help` placeholder.
- Unit/E2E tests under `tests/unit/...` and `tests/e2e/...` – enforce AC coverage.
- Documentation updates (`specs/.../spec.md`, `docs/Feature-Roadmap.md` if route list enumerates Help).

## 8. Test Plan

- Jest unit tests for navigation components and breadcrumb utilities.
- React Testing Library scenarios covering desktop and mobile menu ordering (use viewport mocks or responsive utilities).
- Playwright smoke test verifying Help link visible and clickable in mobile mode.
- Snapshot or DOM structure assertions to ensure left/right grouping persists.

## 9. Rollout & Monitoring Plan

- Manual QA: open `/help`, confirm NotImplemented page renders and breadcrumbs include Help.
- Verify responsive layout at `lg` and `sm` breakpoints.
- Monitor console warnings/errors during `npm run dev` to ensure no ARIA regressions.
- Post-merge: rely on existing CI (lint, tests) to guard regressions; no runtime telemetry yet.
- Rollback: if issues arise, revert navigation constants and Help route commits (isolated changes make rollback low risk).

## 10. Handoff Package

- Evidence: link updated unit/e2e test results plus screenshots of desktop/mobile nav in PR description.
- Documentation: include summary of navigation grouping rationale referencing this plan and `specs/002-navigation-not-implemented-page/spec.md`.
- Next Steps: once Help content is designed, create follow-up issue for real copy and support integrations.
- Quality Gate Confirmation: AC/Test mapping validated (AC1–AC4 covered by unit/e2e tests, AC5 by aggregated suite); dependency order is sequential and acyclic; rollback noted above; no decomposition required.
<!-- codacy:ignore end -->
