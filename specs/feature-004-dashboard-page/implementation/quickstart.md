# Quickstart: Running Dashboard feature tests (Feature 004)

From the repository root, run unit tests and the E2E smoke test that cover the dashboard UI.

Unit (Jest) - run only dashboard unit tests:

```bash
npm run test -- tests/unit/components/dashboard --watchAll=false
```

E2E (Playwright) - run the dashboard e2e spec:

```bash
npm run test:e2e -- --grep "dashboard"
```

Notes:

- Tests assume the app runs with mock fixtures; the implementer should use test doubles or mocking helpers found in `tests/`.
