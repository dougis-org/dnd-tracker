<!--
Sync Impact Report

- Version change: template -> 1.0.0
- Modified principles: (new) Quality & Ownership; Test-First (TDD); Simplicity & Composability; Observability & Security; Versioning & Governance
- Added sections: Additional Constraints; Development Workflow & Quality Gates
- Removed sections: none
- Templates reviewed: .specify/templates/plan-template.md ✅, .specify/templates/spec-template.md ✅, .specify/templates/tasks-template.md ✅
- Follow-up TODOs: RATIFICATION_DATE left as TODO; ensure maintainer @doug confirms ratification date and responsible approvers.
-->

# dnd-tracker Constitution

## Core Principles

### Quality & Ownership (NON-NEGOTIABLE)

All contributors MUST prioritize correctness, maintainability, and code clarity over speed. Code is considered incomplete until:

Rationale: The project enforces high engineering standards (see `CONTRIBUTING.md`) and relies on shared ownership to reduce regressions.

### Test-First (TDD) (NON-NEGOTIABLE)

Tests MUST be written before implementation for new behavior. The TDD cycle (Red → Green → Refactor) is required for feature work and bug fixes where tests are practical. Requirements:




Rationale: TDD yields safer refactors, clearer acceptance criteria, and measurable progress.

### Simplicity & Composability

Design decisions MUST prefer small, focused modules and components. Files SHOULD stay under 450 lines and functions under 50 lines. Code SHOULD be composition-friendly and avoid premature generalization.
Code MUST reuse existing helper libraries and utilities.



Rationale: Small, composable units reduce cognitive load, simplify testing, and enable parallel work.

### Observability & Security

All runtime-facing code MUST include structured logging, meaningful error messages, and, where applicable, telemetry hooks. Security controls MUST be applied consistently:




Rationale: Observability accelerates debugging; consistent security practices reduce production risk.

### Versioning & Governance

The constitution uses semantic versioning for governance changes. Changes to the constitution itself MUST follow this policy:


Amendments MUST be proposed via a documented PR that includes:




Rationale: Governance must be traceable, auditable, and reversible.

## Additional Constraints

This project follows the constraints and stack conventions listed in `CONTRIBUTING.md` and `docs/Tech-Stack.md`.


## Development Workflow & Quality Gates

The project's development workflow and quality gates are normative and supersede ad-hoc practices. Key gates that MUST be satisfied before merging:


Branching and PR expectations:


## Governance

Constitution amendments follow the Versioning & Governance rules above. The amendment procedure is:

1. Open a PR that updates `.specify/memory/constitution.md` with a clear rationale and a Sync Impact Report.
2. Include a migration/operational checklist if the change impacts runtime behavior, CI, or developer workflows.
3. Obtain at least one maintainer approval. The maintainer must comment with explicit approval (e.g., `@doug approve-governance-change`).
4. After merge, update `CONSTITUTION_VERSION` and `LAST_AMENDED_DATE` in the file and reference the change in release notes.

Compliance: All PRs that touch code or repo workflows MUST reference this constitution and demonstrate compliance in the PR checklist. Failure to comply may block review and merge.

**Version**: 1.0.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-08
