# quickstart.md

How to run and test the Encounter Builder feature locally (UI-first)

1. Start the dev server

```bash
npm run dev
```

2. Open the app and navigate to `/encounters` (or the route that will host the Encounters list)

3. Run unit and component tests while developing

```bash
npm test
```

4. Implementations & adapters

- During UI-first development, use the localStorage adapter to persist temporary encounters. The persistence adapter should implement the same interface as the server adapter so tests can swap implementations.

5. API Contract

- See `specs/008-encounter-builder/contracts/encounters.openapi.yml` for the minimal REST contract. Implement server routes under `src/app/api/encounters/*` when ready.

Notes

- Follow the project's TDD workflow: write failing tests first, implement minimal code to pass tests, then refactor and run lint/type checks.
- After creating or editing source files, run Codacy analysis as required by the repository governance.

# Quickstart — Encounter Builder (developer)

1. Checkout feature branch (local):

   ```bash
   git checkout feature/008-encounter-builder
   npm install
   npm run dev
   ```

2. Run unit tests for new components:

   ```bash
   npm run test -- src/components/encounters
   ```

3. Run E2E scenario (Playwright):

   ```bash
   npm run test:e2e -- tests/e2e/encounters.spec.ts
   ```

4. Development notes:

- Persistence adapter `src/lib/api/encounters.ts` should be implemented to satisfy the OpenAPI contract in `specs/008-encounter-builder/contracts/encounters.yaml`.  
- For local development, implement a localStorage fallback to enable UI development before backend endpoints are available.
