# Slash Commands for D&D Tracker Development

This document describes the custom slash commands available for managing the D&D Tracker development workflow with the spec kit approach.

## Overview

The D&D Tracker project uses a structured development workflow with slash commands that integrate with the Feature Roadmap. These commands help manage features from initial specification through completion.

## Feature Workflow Commands

### `/next-feature` - Start Next Feature

**Purpose**: Automatically find and start the next planned feature from the roadmap.

**Usage**:

```
/next-feature
```

**What it does**:

1. Reads `docs/Feature-Roadmap.md` to find the next feature
2. Selects the first feature that is:
   - Not marked as complete (✅)
   - Not marked as "In Progress" (🚧)
   - Has all dependencies satisfied
3. Updates the roadmap to mark the feature as "In Progress"
4. Generates a comprehensive feature description
5. Automatically runs `/specify` with the feature description
6. Creates a new branch and spec file

**Output**:

```
✅ Started Feature 003: Character Management System
- Branch: 003-character-management
- Spec file: specs/003-character-management/spec.md
- Roadmap updated with 'In Progress' status
- Ready for /plan command
```

**Next Steps After /next-feature**:

1. Run `/plan` to generate design artifacts
2. Run `/tasks` to generate implementation tasks
3. Run `/implement` to execute the feature
4. Create PR and merge when complete
5. Run `/feature-complete` to update roadmap

**Parallel Workstreams**: This command supports multiple developers/agents working simultaneously by checking for "In Progress" status before selecting a feature.

---

### `/feature-complete` - Mark Feature as Complete

**Purpose**: Update the roadmap when a feature PR is merged.

**Usage**:

```
/feature-complete 003 165
```

Where:

- `003` = Feature number
- `165` = PR number that merged the feature

**What it does**:

1. Verifies the PR is actually merged using `gh pr view`
2. Extracts merge date and PR details
3. Updates the feature in Feature-Roadmap.md:
   - Changes status to "Complete ✅ (Merged via PR #165)"
   - Adds completion date
   - Moves feature to "Completed Features" section
4. Updates progress tracking:
   - Increments completed feature count
   - Recalculates percentage complete
   - Updates "Next Feature" pointer
   - Checks if phase is complete
5. Runs markdown linting
6. Reports summary

**Output**:

```
✅ Feature 003 marked as complete!

Updated Feature-Roadmap.md:
- Feature 003: Character Management System → Complete ✅
- Merged via PR #165 on 2025-10-25
- Moved to Completed Features section
- Progress: 3 of 20 features complete (15%)
- Phase 2 Status: In Progress (1 of 4 features complete)
- Next Feature: Feature 004 - Party Management

Recommended next steps:
1. Run /next-feature to start Feature 004
2. Or continue with another feature from Phase 2
```

**Error Handling**:

- PR not merged: "PR #165 is not merged yet. Merge the PR first."
- Feature not found: "Feature 003 not found in roadmap."
- Already complete: "Feature 003 is already marked as complete."

---

## Spec Kit Commands

These are the core spec kit commands that work with `/next-feature`:

### `/specify` - Create Feature Specification

**Purpose**: Generate spec.md from a feature description.

**Usage**:

```
/specify [feature description]
```

Usually called automatically by `/next-feature`, but can be run manually.

**Output**: Creates `specs/[feature-number]/spec.md` with user scenarios, requirements, and entities.

---

### `/plan` - Generate Design Artifacts

**Purpose**: Create implementation plan and design documents.

**Usage**:

```
/plan
```

**Prerequisite**: Must have a spec.md file in current feature directory.

**Output**: Creates:

- `plan.md` - Implementation plan
- `research.md` - Technical research
- `data-model.md` - Database schemas
- `contracts/` - API contracts
- `quickstart.md` - Integration test scenarios

---

### `/tasks` - Generate Task List

**Purpose**: Create dependency-ordered task list with TDD approach.

**Usage**:

```
/tasks
```

**Prerequisite**: Must have plan.md and design artifacts.

**Output**: Creates `tasks.md` with numbered, ordered tasks following constitutional principles.

---

### `/implement` - Execute Implementation

**Purpose**: Execute the task list with quality checks.

**Usage**:

```
/implement
```

**Prerequisite**: Must have tasks.md.

**What it does**: Executes tasks in order with:

- TDD approach (tests first)
- Quality checks after each file
- Codacy scans
- ESLint and markdown linting
- Test execution

---

### `/constitution` - View/Update Constitution

**Purpose**: Review or update project constitution.

**Usage**:

```
/constitution
```

Shows the project's development standards and principles.

---

## Complete Feature Development Workflow

Here's the complete workflow from start to finish:

```bash
# 1. Start next feature (automated)
/next-feature
# → Roadmap updated to "In Progress"
# → Branch created: 003-character-management
# → Spec created: specs/003-character-management/spec.md

# 2. Generate design artifacts
/plan
# → Creates plan.md, research.md, data-model.md, contracts/, quickstart.md

# 3. Generate tasks
/tasks
# → Creates tasks.md with TDD approach

# 4. Execute implementation
/implement
# → Runs through all tasks with quality checks

# 5. Create and merge PR
gh pr create --title "Issue: #003 Character Management System" --body "CLOSES: #003"
# → Wait for CI checks and auto-merge

# 6. Mark feature complete
/feature-complete 003 165
# → Roadmap updated to "Complete ✅"
# → Progress tracking updated
# → Ready for next feature
```

## Parallel Development Example

Multiple developers or AI agents can work simultaneously:

**Developer 1**:

```bash
/next-feature
# Gets: Feature 003 - Character Management
# Roadmap marked: Feature 003 - In Progress
```

**Developer 2** (at the same time):

```bash
/next-feature
# Gets: Feature 005 - Monster Library (skips 003 since it's In Progress)
# Roadmap marked: Feature 005 - In Progress
```

**Developer 1** (finishes first):

```bash
/feature-complete 003 165
# Roadmap: Feature 003 → Complete ✅
# Progress: 3/20 complete (15%)
```

**Developer 2** (finishes later):

```bash
/feature-complete 005 167
# Roadmap: Feature 005 → Complete ✅
# Progress: 4/20 complete (20%)
```

## Best Practices

1. **Always use /next-feature**: Don't manually create specs - let the command select the right feature
2. **Check dependencies**: The command verifies dependencies automatically
3. **Update roadmap promptly**: Run `/feature-complete` as soon as PR merges
4. **Follow the workflow**: Use the commands in order: next-feature → plan → tasks → implement → feature-complete
5. **Don't skip steps**: Each command builds on the previous one's output

## Files Modified by Commands

### `/next-feature`

- **Reads**: `docs/Feature-Roadmap.md`
- **Writes**: `docs/Feature-Roadmap.md` (updates feature status to "In Progress")
- **Creates**: New branch, `specs/[number]/spec.md`

### `/feature-complete`

- **Reads**: `docs/Feature-Roadmap.md`, GitHub PR data
- **Writes**: `docs/Feature-Roadmap.md` (moves feature to completed, updates progress)

### `/specify`

- **Reads**: `.specify/templates/spec-template.md`
- **Writes**: `specs/[number]/spec.md`

### `/plan`

- **Reads**: `specs/[number]/spec.md`
- **Writes**: `plan.md`, `research.md`, `data-model.md`, `contracts/*.yaml`, `quickstart.md`

### `/tasks`

- **Reads**: All plan artifacts
- **Writes**: `tasks.md`

### `/implement`

- **Reads**: `tasks.md`
- **Writes**: Source files, tests, various implementation artifacts

## Troubleshooting

**"Cannot start Feature X yet. Must complete Feature Y first."**

- Solution: Check the roadmap to see which features are dependencies
- Complete the blocking features first, or choose a different feature

**"Feature X is already being worked on."**

- Solution: Choose a different feature with `/next-feature` again
- Or coordinate with the developer working on that feature

**"PR #165 is not merged yet."**

- Solution: Wait for CI checks to pass and PR to auto-merge
- Or manually merge the PR if needed

**"Feature not found in roadmap."**

- Solution: Check the feature number matches the roadmap
- Verify `docs/Feature-Roadmap.md` exists and is up to date

---

**Last Updated**: 2025-10-21
**Maintained By**: Development team
**Related Docs**: `docs/Feature-Roadmap.md`, `.claude/commands/*.md`
