# Feature Delivery Workflow Instructions

**Audience**: GitHub Copilot & AI-assisted agents
**Authoritative References**: `docs/Feature-Roadmap.md`, `docs/Product-Requirements.md`, `docs/Slash-Commands.md`, `docs/Tech-Stack.md`

## Core Principles

- The **roadmap** defines sequencing across 60 increments grouped into phases with governance checkpoints.
- The **PRD** defines what must be delivered; the roadmap defines when and in what slice it happens.
- The **Tech Stack** document manages version expectations—do not hard-code versions elsewhere.
- Governance checkpoints occur at the end of each major phase; the roadmap includes instructions titled `Governance Checkpoint (AI Agent)` that must be satisfied before proceeding.

## End-to-End Increment Flow

```text
/next-feature → /plan → /tasks → /speckit.analyze → /implement → PR merge → /feature-complete → Governance checkpoint (if indicated)
```

### 1. `/next-feature`
- Reads `docs/Feature-Roadmap.md` to select the next increment not marked ✅ or 🚧 and with dependencies met.
- Marks the increment as 🚧, creates/updates `specs/NNN-slug/`, and runs `/specify` to generate `spec.md`.
- Switches to branch `NNN-slug` (create if necessary) and reports next steps.

### 2. `/plan`
- Produces `plan.md`, `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` inside the feature directory.
- Must align decisions with `docs/Tech-Stack.md` (never override versions locally).

### 3. `/tasks`
- Generates ordered tasks with IDs and dependencies in `tasks.md`.
- Every task must map back to requirements in `spec.md`.

### 4. `/speckit.analyze`
- Required before implementation.
- Performs read-only consistency analysis across `spec.md`, `plan.md`, `tasks.md`, and the constitution.
- Resolve CRITICAL/HIGH findings before running `/implement`.

### 5. `/implement`
- Executes tasks sequentially with TDD emphasis.
- After each file edit, immediately run `codacy_cli_analyze` for that file (per `codacy.instructions.md`).
- Run project linting (`npm run lint`, `npm run lint:markdown`) and test suites as tasks require.

### 6. Pull Request
- Follow `CONTRIBUTING.md` for branch naming, commit messaging, and PR templates.
- Reference the increment ID (e.g., `Increment 034`) and include checklist/governance evidence.

### 7. `/feature-complete`
- Usage: `/feature-complete NNN <PR_NUMBER>` after PR merges.
- Marks increment ✅, records PR number, merge date, and updates roadmap progress metrics.
- Triggers a reminder if a governance checkpoint is due for the completed phase.

### 8. Governance Checkpoints
- The roadmap includes explicit bullets titled `Governance Checkpoint (AI Agent)` following the increments for a phase.
- To satisfy a checkpoint:
  1. Re-run `/speckit.analyze` for the most recent increment outputs.
  2. Create or update a requirements-quality checklist via `/speckit.checklist` that targets the checkpoint focus (e.g., offline readiness, monetization compliance).
  3. Summarize outcomes (findings, actions, owners, dates) directly in the checkpoint note inside the roadmap.
  4. Do not start the next phase until the checkpoint note reflects completion and all follow-up work is accounted for.

## Key Directories & Files

| Path | Purpose |
|------|---------|
| `docs/Feature-Roadmap.md` | Phase sequencing, increment deliverables, governance notes |
| `docs/Product-Requirements.md` | Business goals & success metrics |
| `docs/Tech-Stack.md` | Version governance & tooling |
| `docs/Slash-Commands.md` | Command usage & workflow details |
| `specs/NNN-slug/` | Spec, plan, tasks, checklists for the active increment |
| `.github/instructions/codacy.instructions.md` | Codacy CLI usage requirements |
| `.specify/memory/constitution.md` | Non-negotiable engineering standards |

## Quality & Safeguards

- **File/Function Limits**: Obey constitution caps (450 lines per file, 50 lines per function). Extract utilities proactively.
- **Testing**: Maintain ≥80% coverage on touched code. Add unit, integration, and E2E tests per roadmap acceptance criteria.
- **Linting & Formatting**: Always run lint commands before committing.
- **Codacy CLI**: Invocations are mandatory immediately after editing each file; capture and resolve reported issues before proceeding.
- **Documentation**: Update specs, roadmap notes, and checklists as scope evolves. Link to supporting evidence in PRs.

## Parallel Work

- `/next-feature` handles concurrency by locking increments with 🚧 status. Never manually edit roadmap statuses.
- Coordinate across phases: governance checkpoints may block subsequent `/next-feature` runs even if other increments remain.

## Troubleshooting

- **No eligible increment found**: Complete pending governance checkpoint or dependencies; review roadmap notes.
- **Codacy CLI errors**: Resolve missing credentials or contact maintainers before bypassing.
- **Stack changes**: Propose updates in `docs/Tech-Stack.md`; do not edit stack versions elsewhere.

---
**Last Updated**: 2025-11-01
