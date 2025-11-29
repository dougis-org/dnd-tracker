# dnd-tracker Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-08

## Active Technologies
- TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Zod (validation), Tailwind CSS, shadcn/ui, Mongoose (present in repo but backend work out of scope for frontend MVP) (feature/011-item-catalog)
- UI-first: mock adapters (in-memory/localStorage). Backend persistence: planned for follow-up Feature 030 (Item Model & API with MongoDB / Mongoose). (feature/011-item-catalog)

- TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Tailwind CSS, Mongoose, Zod (feature/008-encounter-builder)

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
- feature/035-service-worker-setup: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- feature/012-subscription-billing: Added localStorage mock adapter, Zod schemas, paginated API routes, and comprehensive component/API tests
- feature/011-item-catalog: Added TypeScript 5.9.2 (Next.js 16, React 19) + Next.js 16, React 19, Zod (validation), Tailwind CSS, shadcn/ui, Mongoose (present in repo but backend work out of scope for frontend MVP)
- 007-monster-management: Added TypeScript 5.9 (repository `package.json`), Next.js 16, React 19, Node runtime compatible with Next.js 16, Zod (validation), Tailwind CSS, Mongoose (present in repo but backend work out of scope for frontend MVP), UI-first: mock adapters (in-memory/localStorage), Backend persistence: planned for follow-up (MongoDB / Mongoose indicated by repo deps), Testing: Jest + Testing Library, Playwright for E2E, design tokens / UI primitives already present (shadcn patterns)
TypeScript 5.9.2 (Next.js 16, React 19): Follow standard conventions

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
