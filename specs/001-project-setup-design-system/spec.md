---
title: F001 — Project Setup & Design System
id: F001
branch: 001-project-setup-design-system
created: 2025-11-01
owner: @doug
---

## Summary

Set up the Next.js + TypeScript project and establish the design system and developer tooling so subsequent features can be implemented quickly and consistently.

## Definitions

- **Basic theme**: Light/dark CSS variable switching only (no custom color schemes or advanced theming)
- **Smoke test**: Automated test that verifies page loads without runtime errors
- **Basic Fly.io pipeline**: Automated test job + deploy job on merge to main (minimal CI/CD)

## Scope

- Next.js 16.0.1 with TypeScript 5.9.2
- Tailwind CSS 4.x config
- shadcn/ui components installed and basic theme (light/dark CSS variable switching only)
- ESLint + Prettier integration
- markdownlint config
- Dark/light theme toggle (UI only)
- Base layouts: `MainLayout`, `AuthLayout`, `DashboardLayout`
- Jest + Playwright test setup (smoke/e2e integration)
- Fly.io deployment pipeline (basic)
- CI commands and scripts required by tests and lints

## Acceptance Criteria (must be testable)

- [ ] `npm run dev` starts the app locally
- [ ] Dark/light theme toggle exists and switches theme (component test)
- [ ] shadcn/ui components render without runtime errors (smoke test)
- [ ] ESLint passes on repository (linting step)
- [ ] Markdown linting configured and `lint:markdown:fix` works
- [ ] Basic Playwright smoke test can load the landing page
- [ ] Fly.io deployment script present (deploy to a staging app)

## Deliverables

- Repo skeleton (Next.js app + TypeScript)
- `tailwind.config.ts` and base styles
- `src/components/ui/` with shadcn components wired
- Theme toggle component
- Layout files under `src/components/layouts/`
- Jest config + example test
- Playwright config + example e2e
- CI pipeline config (GitHub Actions or Fly.io steps)
- README additions for "dev" commands and environment setup

## Test Plan (TDD-first)

1. Add failing test: `tests/unit/theme-toggle.spec.tsx` (expect switch to change local storage / class)
2. Add Playwright smoke test: `tests/e2e/landing.spec.ts`
3. Implement minimal app pieces to make tests pass
4. Run `npm run test:ci` and fix issues until green

## Implementation notes

- Follow TypeScript strict rules.
- Keep files <450 lines.
- Use `shadcn/ui` best practice installation steps.
- Use environment variable file `.env.example` for Fly.io and Clerk placeholders (but do not commit secrets).

## Risks / Open Questions

- Choose GitHub Actions vs Fly.io native CI — initial implementation will include a minimal Fly.io deploy job and a GH Actions `test` job.
- Decide whether to scaffold Storybook now or later — initial acceptance doesn't require Storybook but smoke tests should be present.

## Links

- PRD: `docs/Product-Requirements.md`
- Tech stack: `docs/Tech-Stack.md`
- Roadmap: `docs/Feature-Roadmap.md`
