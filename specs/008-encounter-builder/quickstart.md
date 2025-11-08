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
