---
description: Execute an approved implementation plan for a GitHub issue.
---

**Goal:** Implement the plan produced by `plan-ticket` with TDD, quality gates, and GitHub + branch hygiene.

> This prompt assumes a plan file already exists. If not, run `plan-ticket`.

## Inputs

Required:

- **GitHub issue number:** {{ISSUE_NUMBER}}

Optional:

- **Plan file:** `docs/plan/issues/{{ISSUE_NUMBER}}-plan.md` (default)
- **Repo root:** current workspace

---

## Mode Guard

Confirm:

- Issue exists and is open in dougis-org/dnd-tracker
- User intent is implementation (not replanning)
- Plan file exists at correct path
- If no plan found, halt and direct user to run `plan-ticket` first

---

## Phase 0: Parameters + Plan Load

0.1 Fetch GitHub issue via GitHub MCP; validate issue number format (numeric) and status (open).
0.2 Load plan; parse sections; fail fast if missing.
0.3 Summarize (Sections 1, 3, 5) for confirmation.
0.4 Add GitHub comment marking "Implementation in progress"; include timestamp & plan file reference.

---

## Phase 1: Branch & Environment Setup

1.1 Ensure clean workspace (`git status` empty) and synced to main:

- `git checkout main && git pull --ff-only`
  1.2 Switch to feature branch (created during planning):
- `git switch <prefix>/#{{ISSUE_NUMBER}}-short-kebab-summary`
  1.3 Confirm branch name matches plan (Section 10 Handoff Package).

(See `includes/branch-commit-guidance.md` for naming & commit rules.)

---

## Phase 2: TDD (RED)

2.1 Unit tests (nominal + boundary + error)
2.2 Integration tests (containers/mocks)
2.3 Contract/API tests (OpenAPI variants & error codes)
2.4 Regression tests (historical bugs)
2.5 Ensure new tests FAIL (prove validity)

---

## Phase 3: Implement (GREEN)

3.1 Domain / DTOs
3.2 Service interfaces + impls
3.3 Data layer (repos, indexes)
3.4 Controllers / API (validation, auth)
3.5 Config / env vars (+ validation)
3.6 Migrations (backward compatible)
3.7 Feature flag wiring (default OFF)
3.8 Iterate `npm test` until GREEN
3.9 Refactor (no behavior change)

---

## Phase 4: Docs & Artifacts

4.1 Update README / module docs
4.2 Update CHANGELOG
4.3 Update runbooks / dashboards / alerts
4.4 If schema changed:

- Update schema artifacts + init scripts
- Update `docs/api/openapi.yaml` & documentation
- Run schema validation checks → PASS

---

## Phase 5: Quality Gates

| Gate           | Command / Action                   | Pass                |
| -------------- | ---------------------------------- | ------------------- |
| Build & Unit   | `npm test`                         | All green           |
| Integration    | Integration test suite (if exists) | Green               |
| Contract/API   | Contract suite                     | All validate        |
| Lint/Style     | Repo tooling (`npm run lint`)      | No blocking issues  |
| Schema Drift   | Validation checks                  | No drift            |
| Security/Input | Review validation & logging        | Safe, no secrets    |
| Feature Flags  | Confirm default OFF or justified   | Documented          |
| Coverage       | Compare baseline                   | No unjustified drop |

Failures → fix root cause (never dilute tests).

---

## Phase 6: Acceptance Verification

6.1 Load ACs (Section 3)
6.2 Map each AC → tests (unit/integration/contract)
6.3 Negative & error path spot checks
6.4 Document deviations (justify or request plan update)

---

## Phase 7: Commit & PR

7.1 `git add .`
7.2 `git commit -S -m "feat(<scope>): #{{ISSUE_NUMBER}} <concise summary>"` (use `fix|chore|refactor|docs|test` as appropriate)
7.3 `git push -u origin <prefix>/#{{ISSUE_NUMBER}}-short-kebab-summary`
7.4 Open PR (template) including: issue #, plan link, summary, risk (plan §6), rollout (plan §9), test evidence, flag usage
7.5 Request reviewers
7.6 Comment PR link in GitHub issue & add "ready-for-review" label if applicable

---

## Phase 8: Handoff Summary (Output)

- Files changed (count + key paths)
- New tests by category
- Flags introduced
- Outstanding risks / mitigations
- Next steps (review → merge → deploy)

---

## Error Matrix

| Issue                  | Action                                 |
| ---------------------- | -------------------------------------- |
| Missing plan section   | STOP; request fix                      |
| All tests pass in RED  | Strengthen tests                       |
| Build fail             | Fix latest change / revert then retest |
| Schema validation fail | Update artifacts → rerun validation    |
| Ambiguous instruction  | Batch clarifying question              |

Escalate after 2 failed remediation attempts.

---

## Verification Checklist

- [ ] GitHub issue comment added with progress
- [ ] All new tests added & GREEN
- [ ] Schema artifacts & validation (if schema)
- [ ] Feature flag(s) documented (default OFF)
- [ ] Signed conventional commit(s)
- [ ] PR open & reviewers requested
- [ ] Each AC satisfied or deviation documented
- [ ] Handoff summary produced

## Success Criteria

PR open, tests green, ACs verified, GitHub issue updated, handoff summary delivered.

## Working Rules

- Strict TDD (RED → GREEN → Refactor)
- No scope creep beyond plan
- Reuse existing patterns; cite reused modules
- CONTRIBUTING.md overrides plan
- No production logic without tests
- New behavior behind feature flag unless trivial & low risk

---

## References

- Shared guidance: `.github/prompts/includes/branch-commit-guidance.md`
- Plan schema (optional validation aid): `.github/prompts/includes/plan-file-structure.schema.json`
