# Tasks — Feature 003: Landing Page & Marketing Components

Feature: Landing Page & Marketing Components
Spec: /home/doug/ai-dev-2/dnd-tracker/specs/003-landing-page/spec.md
Plan: /home/doug/ai-dev-2/dnd-tracker/specs/003-landing-page/plan.md

All file paths below are absolute and refer to files inside this repository.

## Phase 1 — Setup

- [X] T001 Add feature flag example to environment file at `/home/doug/ai-dev-2/dnd-tracker/.env.example` (add `NEXT_PUBLIC_FEATURE_LANDING=true` and a short comment explaining dev-only usage). Note: this toggle is intended for local and development builds (NODE_ENV !== production) — if you want staging exposure, document approval in `quickstart.md` (T024).
- [X] T002 [P] Create landing mock data directory and example JSON fixtures at `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/data/features.json`, `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/data/testimonials.json`, `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/data/pricing.json` (create files with the shapes from `/home/doug/ai-dev-2/dnd-tracker/specs/003-landing-page/data-model.md`).
- [X] T003 [P] Create unit & e2e fixtures directory and seed fixture files at `/home/doug/ai-dev-2/dnd-tracker/tests/fixtures/landing/features.json`, `/home/doug/ai-dev-2/dnd-tracker/tests/fixtures/landing/testimonials.json`, `/home/doug/ai-dev-2/dnd-tracker/tests/fixtures/landing/pricing.json` (use same shapes as Step T002).

## Phase 2 — Foundational (blocking prerequisites)

- [X] T004 Modify root app page to conditionally render landing page in development when `NEXT_PUBLIC_FEATURE_LANDING` is truthy at `/home/doug/ai-dev-2/dnd-tracker/src/app/page.tsx` (guard only active when NODE_ENV !== production).
- [X] T005 Add a small `LandingLayout` component for the landing page at `/home/doug/ai-dev-2/dnd-tracker/src/components/layouts/LandingLayout.tsx` (wraps header/footer and provides consistent spacing).
- [X] T006 Create an `SeoTags` server component at `/home/doug/ai-dev-2/dnd-tracker/src/components/SeoTags.tsx` that renders `title`, `meta[name="description"]`, canonical link, `og:*` and `twitter:card` using props.
  - Note: Implement `SeoTags` as a Next.js Server Component so meta tags are rendered on the server for static/SSR pages and available to E2E tests.

## Phase 3 — User Stories (priority order)

### User Story US1 (P1) — Core landing shell, hero, feature showcase, CTA, SEO & responsiveness

Story goal: Provide an accessible, responsive hero, feature showcase and CTA that present the product value at `/` in development.

Independent test criteria: Components render with provided mock data, SEO tags present in head, layout adapts at viewports: 375px, 768px, 1024px.

- [X] T007 [P] [US1] Create `Hero` component at `/home/doug/ai-dev-2/dnd-tracker/src/components/landing/Hero.tsx` (accepts props for headline, subhead, CTAs and image).
- [X] T008 [P] [US1] Create `FeatureCard` component at `/home/doug/ai-dev-2/dnd-tracker/src/components/landing/FeatureCard.tsx` (title, description, icon).
- [X] T009 [P] [US1] Create `CallToAction` small component at `/home/doug/ai-dev-2/dnd-tracker/src/components/landing/CallToAction.tsx` (primary and secondary CTA buttons).

  **TDD enforcement — write failing unit tests first (blocking before implementation of each component)**

  - [X] T007a [US1] Add a failing unit test for `Hero` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/hero.test.tsx` that asserts expected props and minimal render (test must fail initially).
    - blocks: T007
  - [X] T008a [US1] Add a failing unit test for `FeatureCard` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/featurecard.test.tsx` that asserts expected content/ARIA (test must fail initially).
    - blocks: T008
  - [X] T009a [US1] Add a failing unit test for `CallToAction` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/cta.test.tsx` that asserts button presence and accessible names (test must fail initially).
    - blocks: T009

- [X] T010 [US1] Implement landing page composition at `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/page.tsx` that imports components (`Hero`, `FeatureCard`, `CallToAction`) and `SeoTags` and reads mock data from `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/data/*.json`.
- [X] T011 [P] [US1] Complete unit tests for `Hero` and `FeatureCard` (render, snapshot, ARIA) at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/hero.test.tsx` and `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/featurecard.test.tsx`.
- [X] T012 [US1] Ensure `SeoTags` is used by landing page and implement default values at `/home/doug/ai-dev-2/dnd-tracker/src/components/SeoTags.tsx` (validate props and server component usage).

### User Story US2 (P2) — Interactive demo (mock), pricing table, testimonials

Story goal: Add interactive demo mock, pricing tiers and testimonials section with mock data and unit tests.

Independent test criteria: Each component renders data from fixtures and can be tested in isolation (unit tests). Data files live in `/src/app/(landing)/data` and `/tests/fixtures/landing`.

- [X] T013 [P] [US2] Create `InteractiveDemo` component at `/home/doug/ai-dev-2/dnd-tracker/src/components/landing/InteractiveDemo.tsx` (mock UI-only demo, no backend calls).
- [X] T014 [P] [US2] Create `PricingTable` component at `/home/doug/ai-dev-2/dnd-tracker/src/components/landing/PricingTable.tsx` (reads pricing tiers from mock data).
- [X] T015 [P] [US2] Create `Testimonials` component at `/home/doug/ai-dev-2/dnd-tracker/src/components/landing/Testimonials.tsx` (carousel or stacked list reading from mock data).

  **TDD enforcement — write failing unit tests first for US2 components**

  - [X] T013a [US2] Add a failing unit test for `InteractiveDemo` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/interactive.test.tsx` (test must fail initially).
    - blocks: T013
  - [X] T014a [US2] Add a failing unit test for `PricingTable` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/pricing.test.tsx` (test must fail initially).
    - blocks: T014
  - [X] T015a [US2] Add a failing unit test for `Testimonials` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/testimonials.test.tsx` (test must fail initially).
    - blocks: T015

- [X] T016 [US2] Wire demo/pricing/testimonials into `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/page.tsx` and ensure layout/responsive rules hold.
- [X] T017 [P] [US2] Add/complete unit tests for `InteractiveDemo`, `PricingTable`, and `Testimonials` at `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/interactive.test.tsx`, `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/pricing.test.tsx`, `/home/doug/ai-dev-2/dnd-tracker/tests/unit/components/landing/testimonials.test.tsx`.

### User Story US3 (P1) — End-to-end rendering, responsiveness and accessibility checks

Story goal: Verify the landing page renders correctly across breakpoints, includes required SEO tags, and passes basic accessibility smoke tests.

Independent test criteria: Playwright tests that load `/` in dev mode with `NEXT_PUBLIC_FEATURE_LANDING=true` and assert presence of sections + SEO tags and run a basic axe check.

- [ ] T018 [US3] Add Playwright E2E test for landing page at `/home/doug/ai-dev-2/dnd-tracker/tests/e2e/landing.spec.ts` that asserts: hero, feature showcase, pricing, testimonials, CTA render and that `title` + `meta[name="description"]` + canonical + `og:title` exist.
- [ ] T019 [US3] Add Playwright viewport tests in `/home/doug/ai-dev-2/dnd-tracker/tests/e2e/landing.spec.ts` for viewports 375x812, 768x1024, 1024x768 (or equivalent) and assert layout adjustments.
- [ ] T020 [US3] Add basic accessibility smoke test using axe in Playwright at `/home/doug/ai-dev-2/dnd-tracker/tests/e2e/landing.a11y.spec.ts` (fail on critical violations).

  **E2E TDD — add failing E2E skeleton early**

  - [ ] T018a [US3] Add skeleton Playwright E2E tests that assert presence of main sections and required meta tags; these should be written early and fail until components are implemented.

## Final Phase — Polish & Cross-cutting concerns

- [ ] T021 Run lint, format, and type checks on modified files; file list references: `/home/doug/ai-dev-2/dnd-tracker/src/app/page.tsx`, `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/page.tsx`, files under `/home/doug/ai-dev-2/dnd-tracker/src/components/landing`, and tests; ensure `npm run lint:fix` and `npm run type-check` succeed.
- [ ] T022 Run unit test suite and E2E locally and ensure passing: `npm run test` and `npm run test:e2e` (update tests if needed).
- [ ] T023 Run Codacy analysis on edited files per repo rules (for each edited file run Codacy CLI analyze): `/home/doug/ai-dev-2/dnd-tracker/src/app/page.tsx`, `/home/doug/ai-dev-2/dnd-tracker/src/app/(landing)/page.tsx`, and all new component files (follow repo `.github/instructions/codacy.instructions.md`).
  - Acceptance: Resolve any *Critical* Codacy findings (or document an approved exception) before merging the feature branch. If new dependencies are added, run the Trivy scan as required by repository rules and fix any critical vulnerabilities before merging.
- [ ] T024 Update `/home/doug/ai-dev-2/dnd-tracker/specs/003-landing-page/quickstart.md` with any final developer notes (how to toggle feature, run tests, known limitations).

- [ ] T025 Measure and enforce coverage for touched code: run `npm run test:ci -- --coverage` and ensure at least 80% coverage on files changed. Document exceptions if threshold cannot be met.
- [ ] T026 Define Playwright axe policy enforcement: fail CI on `critical` violations; document exception flow for `serious/high` violations with maintainer signoff (record in `spec.generated.md` or `research.md`).

## Dependencies & Story Completion Order (dependency graph)

Ordered completion (top → bottom). Tasks in earlier phases block later tasks where noted.

1. Phase 1 (T001 → T003) — env + data fixtures
2. Phase 2 (T004 → T006) — root guard, layout, SeoTags
3. US1 (T007 → T012) — core components + landing page
4. US2 (T013 → T017) — secondary components (demo/pricing/testimonials) and wiring
5. US3 (T018 → T020) — E2E + accessibility validation
6. Final (T021 → T024) — lint/tests/codacy/quickstart

Notes on parallelism:

- Tasks marked with [P] are safe to work on in parallel (different files/components, no ordering dependency).
- Example parallel groups:
  - (T007, T008, T009, T013, T014, T015, T003) — component authoring & fixtures
  - (T011, T017) — unit test implementation for components

## Parallel execution examples (per story)

- US1 parallel example:
  - Dev A: implement `Hero` and `FeatureCard` components (T007, T008)
  - Dev B: implement `CallToAction` and `SeoTags` (T009, T012)
  - Dev C: add unit tests for Hero/FeatureCard fixtures (T011)

- US2 parallel example:
  - Dev A: implement `PricingTable` and its unit tests (T014, T017)
  - Dev B: implement `Testimonials` and its unit tests (T015, T017)
  - Dev C: implement `InteractiveDemo` (T013)

## Implementation strategy (MVP first, incremental delivery)

- MVP scope: deliver a working landing page with Hero, Feature showcase, CTA, SEO tags, and responsive layout (complete US1). This is the minimum shippable feature to validate acceptance criteria.
- Incremental next steps: add pricing/testimonials/interactive demo (US2), then implement full E2E and accessibility tests (US3).
- TDD notes: write unit tests for each component before implementing the component (see T007a/T008a/T009a and T013a/T014a/T015a). Write failing Playwright E2E tests early (T018a) and use them to validate acceptance criteria.

## Summary report

- Generated tasks file: /home/doug/ai-dev-2/dnd-tracker/specs/003-landing-page/tasks.md
- Total tasks (original + TDD tasks): summary updated by reviewers as tasks are completed
- Tasks per user story:
  - US1: core tasks T007–T012 (+ T007a/T008a/T009a for TDD)
  - US2: T013–T017 (+ T013a/T014a/T015a for TDD)
  - US3: T018–T020 (+ T018a for E2E skeleton)
  - Setup & Foundational: T001–T006
  - Final/Polish: T021–T024
- Parallel opportunities identified: many component and test tasks marked with [P]; see "Notes on parallelism" above
- Independent test criteria: Listed per story under the story heading (rendering, SEO presence, viewport checks, data-binding)
- Suggested MVP scope: US1 only (hero, features, CTA, SEO, responsive) — complete T007–T012
- Format validation: All tasks follow the required checklist format: each line starts with `- [ ]` or `- [P]`, includes a Task ID, and references absolute file paths where applicable.
