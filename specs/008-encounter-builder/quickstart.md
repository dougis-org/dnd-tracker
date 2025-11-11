# Quickstart — Encounter Builder

This guide explains how to run, test, and develop the Encounter Builder feature locally.

## 1. Setup & Start the Dev Server

```bash
git checkout feature/008-encounter-builder
npm install
npm run dev
```

Open the app and navigate to `/encounters` (or the route that will host the encounters list).

## 2. Run Tests

- **All unit/component tests**

  ```bash
  npm test
  ```

- **Focused encounter component tests**

  ```bash
  npm run test -- src/components/encounters
  ```

- **Playwright E2E scenario**

  ```bash
  npm run test:e2e -- tests/e2e/encounters.spec.ts
  ```

## 3. Implementations & Adapters

- Use the persistence adapter in `src/lib/api/encounters.ts`, which supports both the MongoDB-backed implementation and a localStorage fallback for UI-first development.
- Keep the adapter interface consistent so tests can swap between storage modes.
- For local development before server routes exist, rely on the localStorage path to unblock UI work.

## 4. API Contract

- Follow the canonical OpenAPI contract at `specs/008-encounter-builder/contracts/encounters.yaml` when implementing API routes under `src/app/api/encounters/*`.

## 5. Workflow Notes

- Follow the project's TDD workflow: write failing tests first, implement the minimal code to pass, then refactor.
- After editing source files, run Codacy analysis as required by the repository governance.
