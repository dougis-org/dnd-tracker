# Feature 003 — Landing Page & Marketing Components

Status: In Progress
Branch: feature/003-landing-page
Spec Location: `specs/003-landing-page/`

## Summary

Create a responsive landing page for the product with hero, feature showcase, interactive demo (mock), pricing table, testimonials, and CTA elements. This is a UI-first deliverable with mock data; no backend wiring required.

## Acceptance Criteria

- Landing page is served at `/` when feature is enabled in dev
- Hero, feature showcase, interactive demo, pricing table, testimonials, and CTA sections present
- Mobile responsive across common breakpoints
- SEO meta tags present in page head
- Unit and E2E tests covering component rendering and responsiveness

**Notes (clarifications):**

- Breakpoints (minimum): mobile (375px), small tablet (768px), desktop (1024px). Acceptance tests should validate these viewports.
- SEO: At minimum include `title`, `meta name="description"`, a canonical link, Open Graph tags (`og:title`, `og:description`), and `twitter:card`. Tests should verify presence and values of these tags.
- Feature flag: The landing page should be enabled in development only via an explicit dev-only feature toggle or configuration. Document how to enable/disable in `quickstart.md` or `plan.md`.

Additional acceptance clarifications (explicit rules):

- Runtime rule for feature flag: The landing page must only render when both conditions are met: `NODE_ENV !== 'production'` AND `NEXT_PUBLIC_FEATURE_LANDING === 'true'` (string match). The implementation should read the client-exposed `NEXT_PUBLIC_FEATURE_LANDING` variable and the server `NODE_ENV` for server-side guarding where applicable.

- Interactive demo acceptance: The `InteractiveDemo` component is a UI-only mock. Acceptance requires:

  - No network calls (tests must confirm no XHR/fetch during demo interactions).
  - At least two interactive controls (e.g., toggle, button) that update local UI state.
  - Keyboard operability (tab focus and activation via Enter/Space) for all interactive controls.
  - Accessible labels/aria attributes for each control.

- Accessibility (axe) policy for E2E: Playwright axe checks should fail the run on `critical` violations. `serious/high` violations should be reported as failing the CI job if they affect primary flows, but may be recorded as TODOs if a documented exception is present in the spec with maintainer signoff.

## Governance

- This feature follows the project constitution and quality gates defined in `.specify/memory/constitution.md` (TDD, Codacy checks, and branching rules). Ensure the Constitution Check in the implementation plan is satisfied before proceeding.

## Out of Scope

- Production analytics, payments, or external integrations
