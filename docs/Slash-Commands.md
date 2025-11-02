# Slash Commands for D&D Tracker Delivery

This guide documents the slash-command workflow that orchestrates delivery against the 60 one-to-two-day increments defined in `docs/Feature-Roadmap.md`. The roadmap remains the source of truth for sequencing and governance checkpoints; the Product Requirements Document (`docs/Product-Requirements.md`) defines scope, and `docs/Tech-Stack.md` owns version targets. Use this document whenever you need to move the project forward.

## Delivery Flow at a Glance

1. **Find the next increment** with `/next-feature`.
2. **Generate design collateral** with `/speckit.specify`, `/speckit.plan`, and `/speckit.tasks` (automatically chained or sequenced from `/next-feature`).
3. **Validate requirements quality** with `/speckit.checklist` as needed.
4. **Analyze spec-plan-task alignment** with `/speckit.analyze` before implementation.
5. **Execute implementation** with `/speckit.implement`, running quality gates (lint, Codacy CLI per edited file, tests).
6. **Merge via PR** following CONTRIBUTING guidelines.
7. **Update the roadmap** with `/feature-complete`.
8. **Run governance checkpoints** whenever the roadmap calls out `Governance Checkpoint (AI Agent)` for the completed phase.

Each increment references a roadmap phase; when all increments in a phase are complete, the roadmap will direct an AI agent to perform the governance checklist before beginning the next phase.

## Command Reference

### `/next-feature` — Start the Next Increment

**Purpose**: Claim the next roadmap increment that is neither complete (✅) nor in progress (🚧), respecting dependencies.

**Usage**: `/next-feature`

**Workflow**:

1. Parses `docs/Feature-Roadmap.md` for the first eligible increment (e.g., `Increment 021: Character Edit Form`), confirming prerequisite increments and governance checklist states.
2. Marks the increment as 🚧 in the roadmap and prompts the agent to commit the update so others see the in-progress status.
3. Creates or reuses the feature directory `specs/NNN-slug/`.
4. Runs `/speckit.specify` automatically, producing `spec.md` populated with roadmap context, PRD linkage, and acceptance criteria.
5. Creates (or checks out) the working branch named `NNN-slug` and reminds the agent to review `docs/Tech-Stack.md` for current versions/tooling.
6. Emits next-step guidance: run `/speckit.plan`, `/speckit.tasks`, `/speckit.analyze`, `/speckit.implement`, and watch for phase governance checkpoints before implementation.

**Outputs**:

- Roadmap status update (🚧)
- `specs/NNN-slug/spec.md`
- Git branch `NNN-slug`
- Console reminder covering Tech-Stack review and governance steps

### `/speckit.specify` — Produce the Specification

**Purpose**: Convert the roadmap increment into a full specification aligned with the PRD.

**Usage**: `/speckit.specify [optional additional context]`

**Outputs**:

- `specs/NNN-slug/spec.md` containing user stories, functional and non-functional requirements, PRD references, success criteria, and governance notes.

**Notes**: `/next-feature` runs this automatically; re-run manually if you need to refresh the spec after roadmap edits.

### `/speckit.plan` — Generate Design Artifacts

**Purpose**: Elaborate the implementation strategy before task breakdown.

**Usage**: `/speckit.plan`

**Outputs** (under the current feature directory):

- `plan.md` (architecture decisions, sequencing)
- `research.md` (open questions, references)
- `data-model.md`
- `contracts/*.yaml` (API/schema contracts)
- `quickstart.md` (integration/E2E walkthrough)

### `/speckit.tasks` — Produce Ordered Tasks

**Purpose**: Translate the plan into dependency-aware tasks with TDD framing.

**Usage**: `/speckit.tasks`

**Outputs**:

- `tasks.md` listing ordered tasks with IDs, dependencies, and quality gates.

### `/speckit.checklist` — Requirements Quality Checklist (Optional but Recommended)

**Purpose**: Validate requirements quality for high-risk domains (UX, API, security) before implementation.

**Usage**: `/speckit.checklist [focus (e.g., "UX requirements clarity")]`

**Outputs**:

- `specs/NNN-slug/checklists/<focus>.md`

**When to use**:

- Before `/speckit.implement` on critical increments
- During governance checkpoints to ensure requirements remain testable

### `/speckit.analyze` — Cross-Artifact Consistency Review

**Purpose**: Ensure `spec.md`, `plan.md`, and `tasks.md` remain aligned and constitution-compliant prior to implementation.

**Usage**: `/speckit.analyze`

**Outputs**:

- Console report highlighting gaps, inconsistencies, or constitution violations. (Read-only; no file edits.)

**Run**: After `/speckit.tasks` and before `/speckit.implement` for every increment.

### `/speckit.implement` — Execute Tasks with Quality Gates

**Purpose**: Drive implementation using the task list, enforcing TDD and quality requirements.

**Usage**: `/speckit.implement`

**What it should do**:

1. Execute each task sequentially, respecting dependencies and any governance notes captured in the roadmap increment.
2. Reference `docs/Tech-Stack.md` and `plan.md` whenever tooling or version decisions are needed.
3. For every modified file, run `codacy_cli_analyze` with the file path (per `.github/instructions/codacy.instructions.md`).
4. Run linting (`npm run lint`, `npm run lint:markdown`) and the project test suites as required.
5. Capture notes on blockers or scope adjustments for roadmap updates and governance evidence.

### `/feature-complete` — Close Out an Increment

**Purpose**: Mark the increment as complete once its PR merges.

**Usage**: `/feature-complete NNN <PR_NUMBER>`

**Workflow**:

1. Validates the PR is merged and that any increment-level governance checklist items are satisfied (or records remaining actions).
2. Updates `docs/Feature-Roadmap.md`:
   - Marks increment ✅ and annotates with PR number and merge date.
   - Moves the increment into the "Completed" section if applicable.
   - Recomputes progress metrics.
3. Prompts for any governance actions triggered by roadmap checkpoints.

**Outputs**: Updated roadmap with completion details.

### Additional Utility Commands

| Command | Purpose | Typical Timing |
|---------|---------|----------------|
| `/constitution` | Review project constitution and coding standards | Before major refactors or new contributors join |
| `/clarify` | Collect clarifying Q&A about current work item | Before `/speckit.specify` when requirements are vague |
| `/plan-ticket` / `/work-ticket` | Alternate workflows for ad-hoc issues | Use only when roadmap instructs |

## Governance Checkpoints

Roadmap phases now include explicit `Governance Checkpoint (AI Agent)` entries. When you complete the set of increments that precede a checkpoint:

1. Prepare evidence: merged PR links, test results, Codacy summaries, updated documentation.
2. Run `/speckit.analyze` (or rerun if already issued) to capture the latest cross-artifact report.
3. Use `/speckit.checklist` to produce a governance checklist tailored to the checkpoint focus (e.g., offline readiness, monetization).
4. Record the outcome directly in the roadmap checkpoint note (edit the checkpoint bullet with results, follow-up actions, and date).
5. Only proceed to the next phase after the checkpoint note reflects completion and any blocking actions have owners.

## Integration with Source Documents

- **Roadmap**: `docs/Feature-Roadmap.md` (phases, increments, checkpoints)
- **Scope**: `docs/Product-Requirements.md`
- **Technology**: `docs/Tech-Stack.md`
- **Constitution**: `CLAUDE.md` and `.specify/memory/constitution.md`
- **Quality Automation**: `.github/instructions/codacy.instructions.md`

Always consult the roadmap before running `/next-feature` to confirm phase readiness and dependencies, and update the roadmap immediately after `/feature-complete` or governance reviews.

## Frequently Asked Questions

**How do I know which increment to work on?**
Run `/next-feature`. It will skip increments marked 🚧 or ✅ and respect dependency lists embedded in the roadmap.

**When do I create a PR?**
After `/speckit.implement` completes and all quality gates pass, follow CONTRIBUTING.md to create a PR from the feature branch. Include roadmap increment ID and checklist results.

**What if `/next-feature` can’t find an eligible increment?**

- Check whether a governance checkpoint needs completion.
- Verify dependencies of upcoming increments are satisfied.
- If all increments are complete, consult the product owner for roadmap updates.

**What should I do if roadmap content changes mid-feature?**
Re-run `/speckit.specify` to refresh the spec, then `/speckit.plan` and `/speckit.tasks` if scope adjustments are significant. Capture changes in the roadmap notes section.

**Who maintains these commands?**

- Implementation lives in `.claude/commands/*.md`.
- Quick references live in `.github/commands/*.md`.
- This doc is the canonical usage guide (update it whenever workflows evolve).

---
**Last Updated**: 2025-11-01
**Maintained By**: Development Team
