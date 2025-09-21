<!--
SYNC IMPACT REPORT:
Version: 1.0.0 (Initial ratification)
Modified principles: N/A (initial creation)
Added sections: All sections (initial creation)
Removed sections: N/A
Templates requiring updates:
- ✅ .specify/templates/plan-template.md (to be validated)
- ✅ .specify/templates/spec-template.md (to be validated)
- ✅ .specify/templates/tasks-template.md (to be validated)
- ✅ .specify/templates/commands/*.md (to be validated)
Follow-up TODOs: None
-->

# DND Tracker Constitution

## Core Principles

### I. Quality Over Speed
All code must prioritize thoughtful design, maintainability, and correctness over rapid delivery. Every contribution must be fully functional with all tests passing before merging. Contributors are responsible for the quality and correctness of their work—never assume issues are someone else's problem.

### II. Test-First Development (NON-NEGOTIABLE)
Test-Driven Development is mandatory. Tests must be written before implementation code. The Red-Green-Refactor cycle must be strictly enforced: Write failing tests → Implement to pass → Refactor for quality.

### III. Remote Authority
Remote CI checks and Codacy analysis results are authoritative over local results. All remote findings must be addressed, including pre-existing issues discovered during development.

### IV. Complexity Reduction
Maintain low complexity through strict limits: maximum 450 lines per file (uncommented), maximum 50 lines per function. Eliminate code duplication using shared utilities and helpers. Follow DRY principles consistently.

### V. Security & Standards
Never commit sensitive data; use environment variables for secrets. Validate and sanitize all input. Follow TypeScript strict mode with proper type definitions. Maintain 80%+ test coverage on touched code.

## Development Workflow

All development must follow the standardized workflow: issue selection by priority, feature branch creation, TDD implementation, comprehensive quality checks, and PR auto-merge. Branch protection ensures all changes go through proper review and validation.

## Quality Gates

Before any PR creation, the following must pass: TypeScript compilation, ESLint without errors, all tests, successful build, and full Codacy security scan. Quality checks must be run after every file edit to maintain standards.

## Governance

This constitution supersedes all other development practices and guidelines. All PRs and code reviews must verify compliance with these principles. Complexity and architectural decisions must be justified against these standards.

**Version**: 1.0.0 | **Ratified**: 2025-09-20 | **Last Amended**: 2025-09-20