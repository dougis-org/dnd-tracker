# F001 — Plan

## Goals
- Provide minimal, testable scaffolding to allow other features to be implemented quickly.
- Install and configure design system and Storybook so designers/developers can preview UI components.

## Architecture decisions
- Next.js App Router (per roadmap tech targets)
- Tailwind CSS as the utility-first styling system
- shadcn/ui components as base component primitives
- Storybook for isolated component development (scaffolded with a minimal config)
- CI: use existing GitHub Actions for test/lint; Fly.io for deploy

## Sequence of work (TDD-aligned)
1. Add failing unit test for theme toggle (tests/unit/theme-toggle.spec.tsx)
2. Implement `ThemeToggle` component under `src/components/ui/ThemeToggle.tsx`
3. Add Storybook story `src/components/ui/ThemeToggle.stories.tsx`
4. Wire basic Tailwind base styles (`src/styles/globals.css` if missing)
5. Add Storybook config `.storybook/*`
6. Add CI steps if missing (use existing GH Actions templates)

## Quickstart
- Branch: `001-project-setup-design-system`
- Commands (local)
  - `npm install`
  - `npm run dev`
  - `npm run storybook`
  - `npm run test`

## Deliverables (smaller scope for day 1)
- `ThemeToggle` component + stories
- Storybook config and runnable story
- `spec.md` and this `plan.md`
- Roadmap updated to mark F001 in progress

## Notes
- Keep implementation minimal: focus on making tests pass and Storybook run.
- Defer full shadcn component installation to the implementation phase if it increases scope; Storybook + ThemeToggle are sufficient now to enable component development.
