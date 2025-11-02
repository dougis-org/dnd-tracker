# dnd-tracker Constitution
<!--
Sync Impact Report
- Version change: none → 1.0.0
- Modified principles: (new document) → added:

  - Test-First (TDD) (NON-NEGOTIABLE)
  - Quality Gates & Codacy Compliance
  - Branching, PRs & Automation Controls
  - Size, Complexity & Duplication Limits
  - Security, Secrets & Observability
- Added sections: Governance, Development Workflow (filled from CONTRIBUTING.md)
- Removed sections: none
- Templates requiring updates:

  - .specify/templates/plan-template.md ⚠ pending
  - .specify/templates/spec-template.md ⚠ pending
  - .specify/templates/tasks-template.md ⚠ pending
  - .specify/templates/commands/*.md ⚠ pending
- Follow-up TODOs:

  - Verify and apply template syncs listed above after constitution changes are accepted.
  - Confirm maintainers for amendment approval (if different from repository owners).
-->

## Core Principles

### Test-First (TDD) (NON-NEGOTIABLE)

TDD is mandatory: write failing tests that express the desired behavior before implementing code. Tests define acceptance criteria and must be present in the PR that implements the feature. See `CONTRIBUTING.md` → "Development Process (TDD Required)" and `TESTING.md` for detailed test location, tooling, and coverage expectations.

### Quality Gates & Codacy Compliance

All edits must satisfy the project's quality gates: type-check, ESLint, markdown lint, build, and test-suite passes. Remote Codacy and CI checks are authoritative — fix issues they report before merge. See `CONTRIBUTING.md` → "Pre-PR Checklist" and the Codacy guidance in the repository.

### Branching, PRs & Automation Controls

Follow the repository's branching and PR rules: create a `feature/<issue>-<short>` branch from `main`, add `in-progress` label when working, include tests and a clear PR description, and enable auto-merge only when all checks and reviews pass. Automation labels and validation workflows are defined in `CONTRIBUTING.md` (see "Issue Selection & Branching", "Pull Request Creation", and "Automation labels & ready-for-auto-merge workflow").

### Size, Complexity & Duplication Limits

Enforce file/function size and duplication limits: max 450 lines per file, max 50 lines per function, and extract shared logic into `src/lib/` or test utilities. Use Codacy/ESLint to detect complexity and duplication and refactor before PR. See `CONTRIBUTING.md` → "File & Function Size" and "Reducing Complexity & Duplication".

### Security, Secrets & Observability

Protect secrets and validate inputs. Keep secrets out of source control; document required env vars in `.env.example`. After adding dependencies run the Trivy scan as required. Instrument code with structured logs and ensure observability where applicable. See `CONTRIBUTING.md` → "Database & Security" and "Deployment Requirements".

## Additional Constraints

The authoritative, detailed constraints for technology, deployment, and security live in these repository documents — do not duplicate them here. Use the links below as normative references:

- `CONTRIBUTING.md` — coding standards, deployment notes, and CI/security rules
- `docs/Tech-Stack.md` or `docs/README.md` — runtime and stack guidance (where present)

If a future constitution amendment adds a new constraint, update templates and automation that depend on it (see the Sync Impact Report above).

## Development Workflow & Review

The canonical workflow and review process are defined in `CONTRIBUTING.md`. This constitution delegates the operational details to that document and summarizes the non-negotiable expectations:

- TDD first (see `TESTING.md`)
- Run local checks after edits: `npm run lint:fix`, `npm run lint:markdown:fix`, `npm run type-check`, `npm run test:ci`
- PRs must include tests, pass CI, and include the related issue
- Automation labels (e.g., `automation/ready-for-auto-merge`) must only be applied after human confirmation and workflow validation (see `CONTRIBUTING.md`).

For step-by-step procedures, follow `CONTRIBUTING.md` and the referenced scripts/CI configurations in this repository.

## Governance

This constitution is the project-level policy for engineering behavior, agent conduct, and quality gates. It delegates normative detail to `CONTRIBUTING.md` and `AGENTS.md` but records the amendment and approval rules below.

Amendment procedure (how to change this constitution):

1. Propose changes as a PR that edits `.specify/memory/constitution.md`. Include a Sync Impact Report (see top) documenting changes, templates affected, and any deferred items.
2. The PR must include tests/automation or checklist updates required by the change (e.g., template updates, CI adjustments) and must pass the same quality gates as code changes.
3. At least one maintainer review is required and all CI/Codacy checks must pass. For agent-proposed edits, include `AGENTS.md` references showing adherence to agent obligations.
4. A maintainer may approve and merge once checks and review threads are resolved. Major governance changes (removals or incompatible redefinitions) SHOULD include an explicit maintainer consensus comment in the PR body.

- Versioning policy:

- Use semantic versioning for the constitution file: MAJOR.MINOR.PATCH

  - MAJOR: incompatible governance or principle removals

  - MINOR: new principle/section or material expansion

  - PATCH: wording, formatting, or clarifications
- Bump the version in the file and in the Sync Impact Report when merging.

Compliance & enforcement:

- Automated CI and Codacy scans are authoritative; failures block merges.
- Agents must follow `AGENTS.md` and `CONTRIBUTING.md` before performing edits.

**Version**: 1.0.0 | **Ratified**: 2025-11-02 | **Last Amended**: 2025-11-02
