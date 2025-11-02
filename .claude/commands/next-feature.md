---
description: Find the next feature to work on from the roadmap and initiate feature specification
---

# Next Feature

Start the next feature from the D&D Tracker roadmap. **All contributors must follow CONTRIBUTING.md standards.**

## Step 0: Sync with Remote

1. Switch to main branch: `git checkout main`
2. Pull latest changes: `git pull origin main`
3. This ensures all agents are working from the same roadmap file and prevents conflicts

## Step 1: Find the Next Feature

1. Read `./docs/Feature-Roadmap.md` and parse the `## Feature Summary` table.
2. Iterate through the table to find the first feature with a `Status` of "Planned".
3. For the candidate feature, check its `Dependencies` column.
4. Verify that every dependency listed has a `Status` of "Complete" in the table.
5. If dependencies are not met, report the blocking features and stop.
6. If dependencies are met, this is the next feature. Extract its `Feature #` and `Description`.
7. Use the `Link` from the table to jump to the full feature section and extract detailed information.

## Step 2: Update Roadmap - Mark as In Progress

Update `Feature-Roadmap.md` before proceeding:

1. In the `## Feature Summary` table, find the row for the selected feature and update its `Status` to "In Progress".
2. In the main body of the document, find the detailed section for the feature.
3. Change its status to: `**Status**: 🚧 In Progress (Started [TODAY'S DATE])`
4. Add: `**Branch**: [branch-name-from-step-3]`
5. Save the roadmap.

This prevents parallel workstreams from starting the same feature.

## Step 3: Commit and Push Roadmap Update

1. Stage the updated file: `git add docs/Feature-Roadmap.md`
2. Commit with conventional message: `git commit -m "docs: mark feature [NUMBER] as in progress"`
3. Push to main: `git push origin main`
4. This ensures all agents immediately see that the feature is being worked on and don't start duplicate work

## Step 4: Generate Feature Description

Create a feature description including:

```
Feature [NUMBER]: [NAME]

[DESCRIPTION]

User Value:
[USER VALUE]

What to build:
[Convert SCOPE bullets and acceptance criteria into natural language]

Data needed:
[Key data models/entities]

API endpoints required:
[List endpoints with descriptions]

Dependencies:
[Completed features this builds upon]
```

Refer to CONTRIBUTING.md for:

- Code organization standards
- Testing & quality requirements (80%+ coverage, max 450 lines/file, max 50 lines/function)
- TypeScript & component standards
- Database & security best practices
- Git & PR workflow

## Step 5: Execute /speckit.specify

Run `/speckit.specify` with the feature description. The user ran `/next-feature` to start, so proceed automatically.

## Step 6: Report Completion

After /speckit.specify completes, report:

```
✅ Started Feature [NUMBER]: [NAME]
- Branch: [branch-name]
- Spec file: [spec-file-path]
- Roadmap updated with 'In Progress' status
- Ready for /speckit.plan command (remember to review docs/Tech-Stack.md and roadmap governance notes)

Next steps:
1. Run /speckit.plan to generate design artifacts (review docs/Tech-Stack.md for framework versions before making decisions)
2. Run /speckit.tasks to generate implementation tasks
3. Run /speckit.analyze to validate spec/plan/tasks alignment and governance notes
4. Run /speckit.implement to execute the feature with quality gates
5. When the PR merges, run /feature-complete to update the roadmap and governance checkpoint status
```

## Roadmap Update on Feature Completion

When a feature is fully complete (all tasks done, PR merged), update the roadmap:

1. Find the feature in Feature-Roadmap.md
2. Change status to: `**Status**: Complete ✅ (Merged via PR #[NUMBER])`
3. Add completion date: `**Completed**: [MERGE DATE]`
4. Update the "Current Progress" section:
   - Increment the completed feature count
   - Update the percentage
   - Update "Next Feature" to point to the next planned feature
5. If this completes a Phase, update Phase status to "✅ Complete"

Example update:

```markdown
### ✅ Feature 003: Character Management System

**Status**: Complete ✅ (Merged via PR #165)
**Completed**: 2025-10-25
**Spec Location**: `specs/003-character-management/`
...

---

**Current Progress**: 3 of 20 features complete (15%) - Week 6 of 42
**Phase 2 Status**: In Progress (1 of 4 features complete)
**Next Feature**: Feature 004 - Party Management (P1, Critical Path)
```

## Error Handling

- If no planned features remain: "All features in the roadmap are complete! 🎉"
- If dependencies not met: "Cannot start Feature [NUMBER] yet. Must complete [dependency list] first."
- If roadmap file not found: "Feature-Roadmap.md not found. Please create the roadmap first."
- If a feature is found but its dependencies are not met, continue checking the rest of the table for another available feature. If none are found, report the first blocker.
- If feature already "In Progress": "Feature [NUMBER] is already being worked on. Please choose a different feature or complete the current one first."

## Parallel Workstream Support

This command supports concurrent development by:

1. Checking for "In Progress" status—only selects features not yet started
2. Updating the roadmap immediately—marks feature as "In Progress" before starting work
3. Providing clear completion tracking via `/feature-complete` to update roadmap when done

This prevents duplication and enables multiple features to be developed concurrently.
