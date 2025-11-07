---
title: Quickstart - Dashboard Page (Feature 004)
generated: 2025-11-05
---

This quickstart shows how to run the Dashboard UI locally with mock data for review and testing.

Prerequisites

- Node.js (matching project): see `docs/Tech-Stack.md` (Node 25.x)
- npm installed

Local dev (Next.js)

1. Install dependencies (from repo root):

```bash
npm ci
```

2. Start the dev server with mocked dashboard API:

```bash
# Run Next.js dev server (App Router)
npm run dev
```

3. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) and verify the Dashboard UI renders with mock data.

Testing

- Unit tests (Jest):

```bash
npm run test:ci -- --testPathPattern=src/components/dashboard
```

- Playwright smoke test (example):

```bash
npm run test:e2e -- --grep "dashboard-smoke"
```

Notes

- The Phase 1 implementation uses mock data embedded in the component story or via a mocked `/api/v1/dashboard` endpoint. When backend integration is performed, ensure the API matches `specs/feature-004-dashboard-page/contracts/dashboard.yml`.
