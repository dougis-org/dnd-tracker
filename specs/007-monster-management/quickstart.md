# quickstart.md

How to run the Monster UI feature locally (mock adapter) and run tests.

Prerequisites

- Node >= 18 recommended (use project's Node version that works with Next.js 16)
- npm install (project root)

Run dev server (repo root)

```bash
npm install
npm run dev
```

Feature-local mock adapter

1. The feature uses a small mock adapter under `src/lib/mocks/monsterAdapter.ts` (implementations vary). For now, run the dev server; the UI will use in-repo mock fixtures under `specs/007-monster-management/fixtures` if present.

Tests (TDD flow)

Unit tests (watch mode):

```bash
npm test
```

CI-style test run with coverage:

```bash
npm run test:ci
```

E2E (Playwright):

```bash
npm run test:e2e
```

Developer notes

- Follow TDD: write failing tests under `tests/unit` or `tests/integration` before implementation.  
- Add Zod schemas in `src/lib/validation/monsterSchema.ts` and reference them from forms and component tests.  
- If you create or edit files under `specs/007-monster-management`, run Codacy analysis per repository rules.
