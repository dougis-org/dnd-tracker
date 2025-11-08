# Contributing to dnd-tracker

Welcome! This project follows strict engineering, workflow, and coding standards to ensure high quality, maintainability,
and security. All contributors—including any AI agents **must** follow these unified instructions.

- Github organization is dougis-org
- repository name is dnd-tracker

---

## Core Principles

- Quality over speed: thoughtful, reasoned, and maintainable code is required.
- All code must be fully functional, with all tests passing before merging.
- You are responsible for the quality and correctness of your work—never assume issues are someone else’s problem.
- Remote CI and Codacy checks are authoritative over local results.

---

## Workflow Overview

### 1. Issue Selection & Branching

- Select issues by priority (P1 > P2, Phase1 > Phase2, lower# first).
  - Examine the docs/execution-plan.md to find the next open issue, if none found, review all open issues in GitHub
- Do not start work on issues labeled `in-progress` or `effort:human`.
- Add the `in-progress` label when starting.
- Create a feature branch from `main` using descriptive, kebab-case naming and including the issue number:  
  `feature/123-task-description` or `feature/123-component-name`.
- Push the branch immediately.

### 2. Development Process (TDD Required)

- Determine if the scope of the issue is appropriate, if the issue can be broken into smaller deliverables
  create sub issues for those deliverables and iterate over their delivery (following the standards below)
- Write failing tests before implementing code (Test-Driven Development).
  - Follow the guidelines in [TESTING.md](TESTING.md)
- Implement code to pass tests; extract duplicated test code to utilities.
- Follow all coding, security, and documentation standards below.
- After every file edit, run:
  - `npm run lint:fix`
  - `npm run lint:markdown:fix` (for markdown files)
- Commit and push after local checks pass.

### 3. Pre-PR Checklist

Before creating a PR, ensure:

- [ ] All TypeScript errors are resolved (`npm run type-check`)
- [ ] ESLint passes without errors (`npm run lint`)
- [ ] Markdownlint passes without errors (`npm run lint:markdown:fix`)
- [ ] All tests pass (`npm run test:ci:parallel`)
- [ ] Build completes successfully (`npm run build`)
- [ ] All new dependencies are installed and scanned (see Security below)
- [ ] Environment variables are documented in `.env.example`
- [ ] Code follows all project conventions and best practices

### 4. Pull Request Creation

- AI Agents should use the tools outlined in [PR Instructions](.github/instructions/pr.instructions.md)
- Humans can choose whatever tooling works best for them
- Use conventional commit format for PR titles (e.g., `feat: add user authentication system`).
- Include the related GitHub issue in the PR description.
- Use the provided [PR description template](#pull-request-description-template)

#### Pull Request Flow

1. Open the PR with the details outlined above
2. Wait 90 seconds for the AI agents to review the PR
   1. If after 90 seconds you still do not see review comments from both Gemini and GitHub Copilot, wait another 90 seconds
3. Address ALL comments made by the AI agents, if you are not fixing an issue raised, that **MUST** be confirmed with the repository owner, all items in your PR are in scope
   1. If any items are deferred as out of scope, a GitHub issue **MUST** be opened to track the work needed
4. Review the results of all checks on the PR
   1. The build **MUST** pass
   2. All tests **MUST** pass
   3. All linting checks **MUST** pass
5. Address any items causing failing checks, this includes the Codacy quality scans for
   1. Complexity added
   2. Code duplication
   3. Test Coverage
   4. Any discovered Code Issues
6. Once all of those items are complete and addressed, enable auto merge on the PR
7. **NEVER** force merge without repository owner approval

### 5. Post-PR Merge Process

- Update task status and remove `in-progress` label after merge.
- Prune local branches after merge.
- Report that the feature is complete and the PR is merged

---

## Coding Standards

### TypeScript & Code Organization

- Use strict mode; no `any` types without justification.
- Provide proper type definitions for all functions and components.
- Use interfaces for complex objects.
- Organize code as follows:
  - `src/app/` – Next.js app router pages and layouts
  - `src/components/` – Reusable React components
  - `src/lib/` – Utility functions and configurations
  - `src/models/` – Database models and schemas
  - `src/types/` – TypeScript type definitions
  - `src/hooks/` – Custom React hooks

### Component & API Standards

- Use functional components with hooks.
- Implement error boundaries where needed.
- Follow shadcn/ui patterns for UI components.
- Ensure accessibility (ARIA, keyboard navigation).
- API routes:
  - Use Zod for request validation.
  - Provide proper TypeScript types for request/response.
  - Implement error handling with correct HTTP status codes.
  - Follow RESTful conventions.
- Use ES6 (and later) features and syntax.

### Database & Security

- Use Mongoose for MongoDB.
- Implement schema validation and appropriate indexes.
- Handle connection errors gracefully.
- Never commit sensitive data; use environment variables.
- Validate and sanitize all input.
- Follow authentication best practices.

### File & Function Size

- Max 450 lines per file (uncommented).
- Max 50 lines per function.
- No code duplication—use helpers/utilities (DRY).
- 80%+ test coverage on touched code.
- Use descriptive variable names and keep complexity low.

---

## Reducing Complexity & Duplication

To maintain code quality and keep the codebase maintainable, all contributors must actively reduce complexity and duplication. Follow these steps:

### 1. Extract Shared Logic

- Move repeated code (validation, form setup, test utilities) into shared helper functions or modules.
- For tests, use a `test-utils.ts` file for common setup, mocks, and data factories.
- For API routes, extract authentication, error handling, and database logic into reusable middleware or utility functions.

### 2. Parameterize Tests

- Use test parameterization (e.g., `it.each` in Jest) to avoid copy-pasting similar test cases.
- Prefer factories for generating test data over duplicating objects.

### 3. Component Composition

- Break large components into smaller, focused subcomponents.
- Reuse UI primitives (form fields, validation messages) across steps and forms.

### 4. DRY Up API Handlers

- If multiple API routes share similar CRUD logic, use generic handlers or base classes.
- Centralize Zod schemas and validation logic for reuse in both frontend and backend.

### 5. Refactor Regularly

- When adding new features or tests, always look for opportunities to refactor and remove duplication.
- If you see similar code in multiple places, extract it to a shared location.

### 6. Review Before PR

- Check for code duplication and high complexity before submitting a PR.
- Use tools like Codacy and ESLint to identify and address duplication and complexity issues.

**Example:**

- If you have similar test setup in multiple files, move it to `src/app/api/characters/_utils/test-utils.ts` and import it where needed.
- For repeated form validation logic, create a `form-helpers.ts` in `src/lib/` and reuse across components.

---

## Testing & Quality Checks

- All code must pass:
  - `npm run test:ci`
  - `npm run build`
  - `npm run lint:fix`
  - `npm run lint:markdown:fix`
  - `npm run type-check`
- After any dependency install, run a security scan:
  - `codacy_cli_analyze --tool trivy`
- Before PR, run a full Codacy scan:
  - `codacy_cli_analyze .`
- Fix all issues found by remote Codacy or CI, even pre-existing ones.

---

## Documentation

- Update `README.md` for significant changes.
- Document new environment variables in `.env.example`.
- Use JSDoc for complex functions.
- Update API documentation for new endpoints.
- Update `docs/Execution-Plan.md` if the issue is listed.

---

## Git Commit Standards

- Use conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`, `docs:`).
- Make atomic commits—one logical change per commit.
- Write descriptive commit messages explaining the "why".
- Keep commits focused and avoid mixing unrelated changes.

---

## Pull Request Description Template

Include in every PR:

```markdown
### Summary

Brief description of what this PR accomplishes

### Requirements Satisfied

List the specific requirements/tasks this addresses

### Key Changes

- Bullet point list of major changes
- Include new files created
- Include modified functionality

### Testing

- [ ] Build passes
- [ ] TypeScript compilation successful
- [ ] ESLint passes
- [ ] Manual testing completed (if applicable)

### Dependencies

List any new dependencies added and why they were needed

### Issue

Closes **Issue**
```

---

## Branch Protection & Auto-merge

- Never commit directly to `main`.
- All changes must go through PR review and auto-merge.
- All status checks must pass before merge (build, lint, tests, coverage, no merge conflicts).
- Test coverage must not decrease; maintain at least 80% project coverage.

---

## Sub-Issues & Task Integration

- For complex issues, break into sub-issues and complete each using the full workflow.
- Reference specific requirements satisfied in PR descriptions.
- Update task status to `completed` only after PR auto-merges and the issue closes.

---

## Deployment Requirements

Refer to [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment instructions, including:

- Fly.io deployment setup
- Environment variables and secrets configuration
- Docker build considerations
- Troubleshooting deployment issues

---

## Tools

- Codacy CLI: `/usr/local/bin/codacy-cli`
- Use MCP server for remote Codacy access when possible.
- Use Context7 for latest library standards.

---

## Automation labels & ready-for-auto-merge workflow

This project supports a controlled automation workflow for AI agents and maintainers. These labels and the validation action ensure that no agent forcibly merges to `main` and that PRs are only marked ready for auto-merge when reviews and checks are satisfied.

Labels

- `automation/auto-merge-request` — A request signal an AI agent can add at any time to indicate it would like the PR to be auto-merged when checks pass. This label does NOT mean the PR is ready.
- `automation/ready-for-auto-merge` — A strict readiness signal. Only add when all conditions below are satisfied. Agents may add this label, but it will be validated by a workflow and removed if checks fail.

Process (agent + maintainer expectations)

1. Cut the PR and include tests and a clear description.
2. Wait 90 seconds to allow humans and automation to comment.
3. Address all review threads and comments. If a comment requires deferring work, create a linked issue and document the deferred work in the PR body. The deferred work requires an explicit human confirmation comment in the PR before the PR can be considered ready.
4. After any push to the branch, wait 90 seconds and re-check for new comments or failing checks. Iterate until all review threads are resolved and any deferred work has human confirmation.
5. Ensure all required CI/status checks report `success` and all check runs complete successfully.
6. Only then may the `automation/ready-for-auto-merge` label be added. A GitHub Action will validate review threads, checks, and deferred-work confirmations. If validation fails the action will remove the label and comment explaining why.

Human override

- Only a human maintainer may perform a manual or early merge. To explicitly approve deferred work use the exact comment format:

  `@maintainer override-deferred-work: I confirm deferred work is acceptable. Reason: <short justification> — <maintainer-username>`

Notes

- The validation action checks review *threads* (unresolved threads), combined status, and check runs. It provides a final confirmation comment when validation succeeds. The action does not merge PRs — merging is performed only by GitHub auto-merge (when configured) or a human.

---

By following these unified instructions, all contributors—including GitHub Copilot—will ensure consistent, high-quality, and secure code that meets the project's standards and workflow requirements.
