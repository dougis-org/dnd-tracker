# dnd-tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-21

## Active Technologies

- **TypeScript 5.9.2 (Next.js 16, React 19) + MongoDB Atlas (Mongoose 8.19.1), Zod validation, structured JSON logging, HMAC-SHA256 webhook signatures, soft-delete semantics, timestamp-based conflict resolution, TDD with Jest** (feature/014-mongodb-user-model) ✅ **COMPLETE**
- TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Zod (validation), Tailwind CSS, shadcn/ui, Mongoose (feature/011-item-catalog)
- TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Tailwind CSS, Mongoose, Zod (feature/008-encounter-builder)

## Project Structure

```text
src/
  app/
    api/
      internal/users/           # CRUD endpoints (Feature 014)
        route.ts                # POST (create)
        [userId]/route.ts       # GET/PATCH/DELETE
      webhooks/user-events/
        route.ts                # POST (webhook receiver)
  lib/
    db/
      connection.ts             # MongoDB connection helper
    models/
      user.ts                   # Mongoose schemas (User, UserEvent)
    schemas/
      webhook.schema.ts         # Zod validation schemas
tests/
  unit/
    models/
      user.unit.test.ts         # Model validation tests (42+ cases)
    logging.test.ts             # Logging format tests (30+ cases)
  integration/
    user.integration.test.ts    # Endpoint tests
    user.error-handling.test.ts # Error scenario tests (25+ cases)
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.9 (repo `package.json`), Next.js 16, React 19, Node runtime compatible with Next.js 16: Follow standard conventions

## Feature 014: MongoDB User Model & Webhook (COMPLETE)

### Implementation Summary

- ✅ MongoDB connection helper with serverless caching
- ✅ User model with soft-delete and immutable fields
- ✅ UserEvent model for audit trail
- ✅ Zod validation schemas
- ✅ Webhook receiver with HMAC-SHA256 validation
- ✅ CRUD endpoints (POST, GET, PATCH, DELETE)
- ✅ Fire-and-forget event processing
- ✅ Timestamp-based conflict resolution
- ✅ Structured JSON logging (INFO/WARN/ERROR)
- ✅ 130+ tests with 80%+ coverage

### Key Endpoints

- `POST /api/webhooks/user-events` - Webhook receiver (fire-and-forget)
- `POST /api/internal/users` - Create user
- `GET /api/internal/users/[userId]` - Get user (excludes soft-deleted)
- `PATCH /api/internal/users/[userId]` - Update user (displayName, metadata only)
- `DELETE /api/internal/users/[userId]` - Soft-delete user

### Configuration

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=dnd-tracker
WEBHOOK_SECRET=your-hmac-key              # Optional
WEBHOOK_MAX_PAYLOAD_SIZE=1048576          # 1MB default
WEBHOOK_TIMEOUT_MS=3000                   # 3s default
```

### Patterns & Standards

- **Soft-Delete**: Set `deletedAt` timestamp, exclude from default queries
- **Fire-and-Forget**: Return 200 immediately after event storage
- **Conflict Resolution**: Skip update if `event.timestamp ≤ current.updatedAt`
- **Logging**: Structured JSON with level/timestamp/message/context
- **Error Codes**: 400 (validation), 401 (signature), 404 (not found), 409 (duplicate), 413 (size), 500 (error)
- **Immutable Fields**: userId and email cannot change after creation

## Recent Changes

- **feature/014-mongodb-user-model**: MongoDB User model, Webhook receiver, CRUD endpoints, 80%+ coverage (COMPLETE ✅)
- feature/035-service-worker-setup: [in-progress]
- feature/012-subscription-billing: Added localStorage mock adapter, Zod schemas, paginated API routes
- feature/011-item-catalog: Added TypeScript + Zod + Tailwind + shadcn/ui

## Development Tooling

- **Always** use the start_process tool from Desktop commander to run system commands and view the output
- As the first step when running start_process, set the working directory properly (to the root directory of your repo)
- **Always** use the GitKraken MCP server for git activities and fall back to the GitHub MCP server if there is a missing tool
<!-- MANUAL ADDITIONS START -->

## Precommit Hook Enforcement (AI Agents—Critical)

**CRITICAL MANDATE FOR ALL AI AGENTS:**

The precommit hook is **NON-NEGOTIABLE** and **MUST NOT BE BYPASSED**. Failure to follow these rules will result in PR rejection and wasted effort.

### Precommit Checks (All Must Pass)

The Git pre-commit hook enforces:

1. **`npm run type-check`** — TypeScript type validation (catch type errors before commit)
2. **`npm run lint`** — ESLint code style & quality
3. **`npm run lint:markdown`** — Markdown lint
4. **`npm run build`** — Production build validation

If ANY check fails, the commit is **aborted immediately**.

### AI Agent Responsibilities

- **NEVER** attempt to bypass the precommit hook via `--no-verify` or similar
- **ALWAYS** fix the root cause of precommit failures before committing
- **ALWAYS** run the full precommit check sequence locally:

```bash
npm run type-check && npm run lint:fix && npm run lint:markdown:fix && npm run build
```

- If precommit still fails, investigate and fix the underlying issue
- **DO NOT** attempt workarounds, force commits, or commit with bypass flags
- If a check seems incorrect, file an issue instead of bypassing

### Local Development Workflow for AI Agents

1. **Make code changes**
2. **Run all precommit checks locally BEFORE attempting commit:**
   ```bash
   npm run type-check
   npm run lint:fix
   npm run lint:markdown:fix
   npm run build
   ```
3. **Only attempt commit after all checks pass**
4. **If commit is rejected by precommit hook:**
   - Read the error message carefully
   - Fix the issue
   - Re-run checks
   - Try commit again
5. **Push to branch and open PR**

### Why Precommit Bypass Is Never Acceptable

- Bypassing the hook masks real quality issues
- PR will fail CI/CD anyway, wasting time and resources
- Indicates the AI agent is not properly fixing problems
- Violates project quality standards
- Makes human review harder and less effective

### Commands AI Agents Should Use (in order)

```bash
# 1. Check TypeScript compilation
npm run type-check

# 2. Fix linting issues automatically
npm run lint:fix

# 3. Fix markdown issues automatically
npm run lint:markdown:fix

# 4. Verify build succeeds
npm run build

# 5. Run tests to verify correctness
npm run test:ci:parallel

# 6. Only after all above pass, attempt commit
git commit -m "feat: description"
```

## Tooling

- **Always** use the start_process tool from Desktop commander to run system commands and view the output
As the first step when running start_process, set the working directory properly (to the root directory of your repo)
- **Always** use the GitKraken MCP server for git activities and fall back to the GitHub MCP server if there is a missing tool

<!-- MANUAL ADDITIONS END -->
