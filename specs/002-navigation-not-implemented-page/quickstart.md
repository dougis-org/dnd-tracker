# Quickstart: F002 - Navigation & Not Implemented Page

Steps to run locally and run tests for this feature:

1. Install dependencies

```bash
npm install
```

1. Start dev server

```bash
npm run dev
```

1. Run unit tests (Jest)

```bash
npm test -- tests/unit/components/navigation.test.tsx
```

1. Run Playwright smoke test (in CI use test:ci runner)

```bash
npm run test:ci -- --grep "navigation-smoke"
```

Notes:

- Tests should be written first (TDD). See `specs/002-navigation-not-implemented-page/research.md` for test cases and patterns.

```
