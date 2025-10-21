# Feature Development Workflow Instructions

**For**: GitHub Copilot and AI-assisted development
**Primary Documentation**: `docs/Slash-Commands.md` and `docs/Feature-Roadmap.md`

## Overview

The D&D Tracker uses a structured feature development workflow with slash commands that integrate with the Feature Roadmap. This document provides GitHub Copilot with the context needed to assist with feature development.

## Feature Roadmap Location

**Primary Source**: `docs/Feature-Roadmap.md`

This file contains:
- All 20 planned features with priorities
- Completed features with PR references
- Features currently in progress (marked 🚧)
- Dependencies between features
- Progress tracking (X of 20 complete, Y%)

## Slash Commands Available

### Primary Commands (Maintained in `.claude/commands/`)

1. **`/next-feature`** - Start next planned feature
   - Full implementation: `.claude/commands/next-feature.md`
   - Quick reference: `.github/commands/next-feature.md`

2. **`/feature-complete`** - Mark feature as done after PR merge
   - Full implementation: `.claude/commands/feature-complete.md`
   - Quick reference: `.github/commands/feature-complete.md`

3. **`/specify`** - Create feature specification
4. **`/plan`** - Generate design artifacts
5. **`/tasks`** - Generate task list
6. **`/implement`** - Execute implementation
7. **`/constitution`** - View development standards

## Complete Workflow

```bash
# 1. Start next feature
/next-feature
# → Reads docs/Feature-Roadmap.md
# → Finds next available feature (not complete, not in progress)
# → Marks as "In Progress" in roadmap
# → Runs /specify automatically
# → Creates branch: 003-feature-name
# → Creates spec: specs/003-feature-name/spec.md

# 2. Generate design
/plan
# → Creates plan.md, research.md, data-model.md, contracts/, quickstart.md

# 3. Generate tasks
/tasks
# → Creates tasks.md with TDD approach

# 4. Execute implementation
/implement
# → Runs tasks with quality checks

# 5. Create PR and merge
gh pr create --title "Issue: #003 Feature Name" --body "CLOSES: #003"
# → Wait for CI and auto-merge

# 6. Mark complete
/feature-complete 003 165
# → Updates docs/Feature-Roadmap.md
# → Marks feature complete with PR reference
# → Updates progress tracking
```

## Key Files and Locations

### Documentation
- `docs/Feature-Roadmap.md` - Master feature list and progress
- `docs/Product-Requirements.md` - Complete PRD
- `docs/Slash-Commands.md` - Complete command documentation
- `CLAUDE.md` - Project-specific AI instructions

### Command Definitions
- `.claude/commands/*.md` - Primary command implementations (Claude Code)
- `.github/commands/*.md` - Quick references (GitHub Copilot)
- `.github/instructions/*.md` - Context instructions (GitHub Copilot)

### Specs (Per Feature)
```
specs/
├── 001-build-dnd-tracker/       # Foundation (complete)
├── 002-when-a-user/             # User system (complete)
├── 003-character-management/    # Next feature
│   ├── spec.md                  # From /specify
│   ├── plan.md                  # From /plan
│   ├── research.md              # From /plan
│   ├── data-model.md            # From /plan
│   ├── contracts/               # From /plan
│   ├── quickstart.md            # From /plan
│   └── tasks.md                 # From /tasks
```

## Parallel Development Support

Multiple developers/agents can work simultaneously:

**Feature Selection Logic**:
1. `/next-feature` checks roadmap for first feature that is:
   - NOT marked "Complete ✅"
   - NOT marked "In Progress 🚧"
   - HAS all dependencies complete
2. Immediately marks selected feature as "In Progress"
3. This prevents duplicate work

**Example**:
- Dev 1 runs `/next-feature` → Gets Feature 003, marks it "In Progress"
- Dev 2 runs `/next-feature` → Gets Feature 005, marks it "In Progress"
- Both can work in parallel without conflicts

## Constitutional Requirements

When assisting with code, enforce these standards:

### File Limits
- **Max 450 lines per file** (uncommented)
- **Max 50 lines per function**
- Extract utilities when approaching limits

### Testing Requirements
- **TDD approach**: Write tests before implementation
- **80%+ coverage** on touched code
- Tests must pass before PR

### Quality Checks
- Run after EVERY file edit:
  - `npm run lint:fix` (ESLint)
  - `npm run lint:markdown:fix` (Markdown)
  - `codacy-cli analyze [file]` (with pagination)

### Code Quality
- No code duplication - extract to utilities
- Descriptive variable names
- TypeScript strict mode
- Zod validation for all inputs

## Feature Structure

Each feature in the roadmap includes:

```markdown
### Feature XXX: Feature Name

**Priority**: P1/P2/P3
**Estimated Effort**: X weeks
**Description**: What the feature does

**User Value**: Why users need it

**Scope**: (bullet list)
- What's included in this feature

**Key Entities**: Data models needed

**API Endpoints**: (list)
- POST /api/endpoint - Description

**Dependencies**: Feature YYY (prerequisite features)
**Blocks**: Feature ZZZ (features waiting on this)
```

## When Assisting with Implementation

### Before Starting
1. Check `docs/Feature-Roadmap.md` to understand current feature
2. Read the feature's `specs/XXX/spec.md` for requirements
3. Review `specs/XXX/tasks.md` for current task
4. Check `specs/XXX/data-model.md` for schema details

### During Implementation
1. Follow TDD: Write tests first
2. Respect constitutional limits (450 lines, 50 per function)
3. Run quality checks after each file
4. Reference spec files for requirements
5. Follow patterns from completed features (001, 002)

### Code Patterns to Follow
- **Data Models**: See `src/lib/models/User.ts` (Feature 002)
- **Validations**: See `src/lib/validations/user.ts` (Feature 002)
- **API Routes**: See `src/app/api/users/[id]/profile/route.ts` (Feature 002)
- **Components**: See `src/components/profile/ProfileForm.tsx` (Feature 002)
- **Tests**: See `tests/unit/`, `tests/integration/`, `tests/e2e/`

## Technology Stack

- **Framework**: Next.js 15.5+ with App Router
- **Language**: TypeScript 5.9+ (strict mode)
- **Database**: MongoDB 8.0+ with Mongoose 8.5+ ODM
- **Auth**: Clerk 5.0+
- **UI**: shadcn/ui v3.2+ with Radix UI and Tailwind CSS 4.0+
- **State**: Zustand 4.5+ (client), TanStack Query v5.0+ (server)
- **Validation**: Zod 4+
- **Testing**: Jest 29.7+ (unit), Playwright 1.46+ (E2E)

## Common Queries

### "What feature should I work on next?"
→ Run `/next-feature` or read `docs/Feature-Roadmap.md`

### "What's the current feature status?"
→ Check `docs/Feature-Roadmap.md` progress section

### "How do I mark a feature complete?"
→ Run `/feature-complete [NUM] [PR]` after PR merges

### "What are the coding standards?"
→ See `CLAUDE.md` and `.claude/commands/constitution.md`

### "How do I find the spec for current feature?"
→ Look in `specs/[current-feature-number]/spec.md`

## Updating This Document

**Primary Locations** (update these):
- `.claude/commands/next-feature.md` - Full command implementation
- `.claude/commands/feature-complete.md` - Full command implementation
- `docs/Slash-Commands.md` - Complete documentation
- `docs/Feature-Roadmap.md` - Feature list and progress

**Reference Locations** (these point to primary):
- `.github/commands/*.md` - Quick references only
- `.github/instructions/*.md` - This file (context for Copilot)

---

**Last Updated**: 2025-10-21
**For Questions**: See `docs/Slash-Commands.md` or `.claude/commands/*.md`
