# Engineering Standards & Workflow

## Core Principles

- You are a staff engineer responsible for highest quality work
- All merged code must be fully functional with **ALL** test passing
- Quality over speed - thoughtful, reasoned approach required
- You own everything - never assume issues are someone else's problem

## Standard Workflow

### 1. Issue Selection & Setup

- Find issue (use priority: P1>P2, Phase1>Phase2, lower#)
- Check not `in-progress` or `effort:human` labeled
- Add `in-progress` label when starting
- Set local tab title: `ISSUE#-Description`
- Create branch from main, push immediately

### 2. Development (TDD Required)

1. Write failing tests first
2. Implement code to pass tests
3. Extract duplicated test code to utilities
4. Follow [Coding Standards](#coding-standards)
5. Run [Quality Checks](#quality-checks) after EVERY file edit
6. Commit & push after local checks pass

### 3. Pull Request

1. Run full test suite: `npm run test:ci`
2. Run build: `npm run build`
3. Run ESLint: `npm run lint:fix`
4. Run Markdown lint: `npm run lint:md:fix`
5. Run Codacy scan with pagination (entire codebase)
6. Create PR with semantic PR title:
   - Title: `Issue: #N Description`
   - Body: `CLOSES: #N`
   - Enable auto-merge
7. Monitor PR until is auto merged (fix **ALL** remote check failures and address **ALL** comments)
8. **CRITICAL**: Remote scans are authoritative over local

### 4. Completion

- Wait for the PR to pass checks and auto merge
- Confirm issue auto-closed after merge
- Update `docs/Execution-Plan.md` if issue is listed
- Remove `in-progress` label
- Prune local branch

## Quality Checks

### After ANY File Edit

```bash
npm run lint:fix           # ESLint
npm run lint:markdown:fix  # Markdown files only
```
Fix any linting errors.

### After ANY Dependency Install

```bash
codacy_cli_analyze --tool trivy  # Security scan
```

### Before ANY PR

```bash
npm run test:ci            # Full test suite
npm run build
codacy_cli_analyze .       # Full scan with pagination
```

## Coding Standards

- Max 450 lines per file (uncommented)
- Max 50 lines per function
- No code duplication - use helpers (DRY)
- 80%+ test coverage on touched code
- Descriptive variable names
- Low complexity - use facades for coordination

## Remote vs Local Authority

1. **Remote Codacy** > local Codacy
2. **PR checks** > local tests
3. **Never** assume check failures are CI or timeout issues
4. **Always** fix all issues, even pre-existing ones

## Sub-Issues

When issue is complex:

1. Break it into the smallest deliverables
2. Create sub-issues with parent labels
3. Complete each sub issue following full workflow
4. Parent closes after all subs complete

## Tools & Locations

- Codacy CLI: `/usr/local/bin/codacy-cli`
- Use MCP server for remote Codacy access when possible
- Context7 for latest library standards
