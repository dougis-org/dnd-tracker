# dnd-tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-08

## Active Technologies
- TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Zod (validation), Tailwind CSS, shadcn/ui, Mongoose (present in repo but backend work out of scope for frontend MVP) (feature/011-item-catalog)
- UI-first: mock adapters (in-memory/localStorage). Backend persistence: planned for follow-up Feature 030 (Item Model & API with MongoDB / Mongoose). (feature/011-item-catalog)
- TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Tailwind CSS, Mongoose, Zod (feature/008-encounter-builder)
- **TypeScript 5.9.2 (Next.js 16, React 19) + MongoDB Atlas (Mongoose 8.19.1), Zod validation, structured JSON logging, HMAC-SHA256 webhook signatures, soft-delete semantics, timestamp-based conflict resolution, TDD with Jest + testcontainers** (feature/014-mongodb-user-model)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9 (repo `package.json`), Next.js 16, React 19, Node runtime compatible with Next.js 16: Follow standard conventions

## Recent Changes
- **feature/014-mongodb-user-model**: Added MongoDB Atlas (Mongoose 8.19.1), internal CRUD API routes (/api/internal/users/*), webhook receiver (/api/webhooks/user-events), soft-delete semantics, timestamp-based conflict resolution, HMAC-SHA256 signature validation, structured JSON logging (INFO/WARN/ERROR), TDD-first test suite (unit + integration), 80%+ coverage requirement
- feature/035-service-worker-setup: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- feature/012-subscription-billing: Added localStorage mock adapter, Zod schemas, paginated API routes, and comprehensive component/API tests
- feature/011-item-catalog: Added TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Zod (validation), Tailwind CSS, shadcn/ui, Mongoose (present in repo but backend work out of scope for frontend MVP)
- 007-monster-management: Added TypeScript 5.9 (repository `package.json`), Next.js 16, React 19, Node runtime compatible with Next.js 16, Zod (validation), Tailwind CSS, Mongoose (present in repo but backend work out of scope for frontend MVP), UI-first: mock adapters (in-memory/localStorage), Backend persistence: planned for follow-up (MongoDB / Mongoose indicated by repo deps), Testing: Jest + Testing Library, Playwright for E2E, design tokens / UI primitives already present (shadcn patterns)
TypeScript 5.9.2 (Next.js 16, React 19): Follow standard conventions

<!-- MANUAL ADDITIONS START -->
## Tooling

- **Always** use the start_process tool from Desktop commander to run system commands and view the output
As the first step when running start_process, set the working directory properly (to the root directory of your repo)
- **Always** use the GitKraken MCP server for git activities and fall back to the GitHub MCP server if there is a missing tool

<!-- MANUAL ADDITIONS END -->
