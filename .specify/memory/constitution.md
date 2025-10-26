# dnd-tracker Engineering Constitution

This constitution establishes the non-negotiable principles that govern all work on the `dnd-tracker` repository. It must be read together with `CONTRIBUTING.md`, the authoritative procedural handbook for every contributor, and `AGENTS.md`, which binds AI agents to the same directives.

## Core Principles

### I. Alignment with Project Directives

All contributors, human and AI, follow the latest instructions in `CONTRIBUTING.md`. `AGENTS.md` simply reiterates this requirement for agents. When conflicts arise, `CONTRIBUTING.md` wins unless this constitution is explicitly amended.

### II. Test-Driven Development (Non-Negotiable)

Work proceeds Red → Green → Refactor. Tests are written first, implementation follows to satisfy them, and refactors only occur with tests passing. Exceptions require explicit maintainer approval documented in the relevant issue.

### III. Quality Gates and Tooling Compliance

No change is ready until the quality gates enumerated in `CONTRIBUTING.md` (lint, markdown lint, type check, tests, build, Codacy) pass both locally and in CI. Remote CI and Codacy verdicts are authoritative.

### IV. Security and Dependency Stewardship

Security expectations in `CONTRIBUTING.md` (Trivy scans on dependency work, secret handling, environment documentation) are mandatory. Contributors must not merge until security checks are clean.

### V. Maintainability Limits and DRY Enforcement

The file/function size limits and DRY expectations defined in `CONTRIBUTING.md` are enforced. New complexity or duplication introduced by a change must be refactored before review.

### VI. Project-Wide Ownership and Remediation

Contributors own the stability of the entire repository, not only their scoped task. If a change introduces or exposes regressions, test failures, security issues, or lint/type/build errors, those issues must be resolved (or the change rolled back) within the same effort before proceeding.

## Workflow Enforcement

Contributors must follow the workflow described in `CONTRIBUTING.md` (issue selection, TDD, quality gates, commits/PRs,
and documentation updates). Deviations require maintainer approval recorded in the related issue or PR.

## Governance

- This constitution supersedes ad-hoc practices. Any exception must be documented in the related issue and approved by maintainers.
- Updates to `CONTRIBUTING.md` or `AGENTS.md` automatically amend this constitution. Contributors must stay informed of changes and adjust workflows immediately.
- Amendments to this constitution require a documented proposal linked to a pull request that updates both this file and any referenced standards.

**Version**: 1.0.0 | **Ratified**: 2025-10-26 | **Last Amended**: 2025-10-26
