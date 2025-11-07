# Research — Landing Page & Marketing Components

## Decision

- Implementation approach: UI-first Next.js app-router page at `/` using existing `shadcn/ui` components and Tailwind CSS (already present in project). No backend API required; all data will be mock/static JSON under `src/app/(landing)/data` for component rendering and tests.

## Rationale

- Project already uses Next.js + Tailwind + shadcn/ui (see `docs/Tech-Stack.md`). Reusing existing components keeps consistency and minimizes new dependencies.
- Mock data avoids backend work (spec explicitly says UI-first). This enables rapid iteration and testable UI components.

## Alternatives Considered

- Build a lightweight API route to serve testimonials/pricing. Rejected because the spec marks backend wiring out of scope and tests can use fixtures.
- Use a separate static site generator. Rejected to keep the app within the Next.js monorepo for routing and shared layout components.

## Research Tasks (open items resolved)

1. Research breakpoints and test viewports for Playwright (mobile 375, tablet 768, desktop 1024) — Decision: use Playwright's viewport option in E2E tests and include assertions for layout sections.
2. Research SEO tags required — Decision: include `title`, `meta name="description"`, canonical link, `og:title`, `og:description`, `twitter:card`. Implement in server components using Next.js Head APIs.
3. Feature flag approach — Decision: add a dev-only feature toggle driven by `NEXT_PUBLIC_FEATURE_LANDING` in `.env.local` and guard the `/` route with the toggle in development. Document in `quickstart.md`.
4. Testing approach — Decision: TDD required: create unit tests (Jest + React Testing Library) for each component and Playwright E2E tests for rendering and responsive breakpoints.
5. Accessibility checks — Decision: include basic a11y smoke tests with Playwright and axe where practical.

## Outcome / Next Steps

- Phase 1: create `data-model.md`, contracts placeholder, landing page layout and components, tests (unit + E2E), and quickstart instructions to enable the feature flag.
