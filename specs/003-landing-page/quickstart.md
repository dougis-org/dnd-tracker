# Quickstart — Feature 003 (Landing Page)

To enable the landing page in development only, set the following environment variable in your local `.env.local` file (do not commit secrets):

```
NEXT_PUBLIC_FEATURE_LANDING=true
```

By default the app routing will load the landing page at `/` when `NEXT_PUBLIC_FEATURE_LANDING` is truthy in `process.env` and `NODE_ENV !== 'production'`.

If you need to temporarily disable the page, set the variable to `false` or remove it from `.env.local`.

How to run locally (dev):

1. Start dev server:

```bash
npm run dev
```

2. Open <http://localhost:3000/> to view the landing page in development.

Testing:

```bash
# run unit tests
npm run test

# run playwright e2e (headful)
npm run test:e2e
```

Notes:

- The landing page uses only mock data; no API is called.
- Mock data and test fixtures are available under:
  - `src/app/(landing)/data/` (local mock data used by the page)
  - `tests/fixtures/landing/` (unit/e2e fixtures used by tests)

Make sure fixtures and mock data remain consistent with `data-model.md` when writing tests or components.
