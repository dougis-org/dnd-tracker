---
description: Find the next feature to work on from the roadmap and run /specify to start it.
---

You are starting the next feature in the D&D Tracker development roadmap. Follow these steps:

## Step 1: Find the Next Feature

1. Read `/home/doug/ai-dev-1/dnd-tracker/docs/Feature-Roadmap.md`
2. Locate the first feature under "## Planned Features (Priority Order)" that is NOT marked as complete (✅) and NOT marked as "In Progress"
3. Extract the following details from that feature:
   - Feature number (e.g., "003")
   - Feature name (e.g., "Character Management System")
   - Description (the full description paragraph)
   - User Value (the paragraph explaining value to users)
   - Scope (the bulleted list of what's included)
   - Key Entities (the data models needed)
   - API Endpoints (the list of endpoints)
   - Dependencies (what must be complete first)

## Step 2: Verify Dependencies

1. Check that all listed dependencies are marked as ✅ Complete in the roadmap
2. If dependencies are NOT complete, STOP and warn the user which features must be finished first
3. Only proceed if all dependencies are satisfied

## Step 3: Update Roadmap - Mark as In Progress

Before running /specify, update the Feature-Roadmap.md to mark this feature as "In Progress":

1. Find the feature section in Feature-Roadmap.md
2. Change the status line to: `**Status**: 🚧 In Progress (Started [TODAY'S DATE])`
3. Add a line: `**Branch**: [branch-name-from-step-4]`
4. Save the updated roadmap

This prevents other parallel workstreams from starting the same feature.

## Step 4: Generate Feature Description

Create a comprehensive feature description in natural language that includes:

```
Feature [NUMBER]: [NAME]

[DESCRIPTION]

User Value:
[USER VALUE paragraph]

What to build:
[Convert SCOPE bullets into natural language sentences]

Data needed:
[Convert KEY ENTITIES into descriptions]

API endpoints required:
[List the endpoints with brief descriptions]

Dependencies:
[List the completed features this builds upon]

Technical context:
- This is a Next.js 15.5+ full-stack application
- Using TypeScript 5.9+, MongoDB 8.0+, Mongoose ODM
- Authentication via Clerk 5.0+
- UI with shadcn/ui components
- Testing with Jest + Playwright
- Following TDD approach with spec kit process
- All files must be under 450 lines, functions under 50 lines
- 80%+ test coverage required
```

## Step 5: Run /specify

Run the `/specify` command with the feature description you generated above. The complete natural language description should be passed as the argument.

**IMPORTANT**: Execute `/specify` immediately - do NOT ask the user if they want to proceed. The user ran `/next-feature` to start the next feature, so proceed automatically.

## Step 6: Report Completion

After /specify completes, report:

"✅ Started Feature [NUMBER]: [NAME]
- Branch: [branch-name]
- Spec file: [spec-file-path]
- Roadmap updated with 'In Progress' status
- Ready for /plan command

Next steps:
1. Run /plan to generate design artifacts
2. Run /tasks to generate implementation tasks
3. Run /implement to execute the feature
4. When complete, run /feature-complete to update the roadmap"

## Roadmap Update on Feature Completion

**IMPORTANT**: When a feature is fully complete (all tasks done, PR merged), update the roadmap:

1. Find the feature in Feature-Roadmap.md
2. Change status to: `**Status**: Complete ✅ (Merged via PR #[NUMBER])`
3. Add completion date: `**Completed**: [MERGE DATE]`
4. Update the "Current Progress" section at the bottom:
   - Increment the completed feature count
   - Update the percentage
   - Update "Next Feature" to point to the next planned feature
5. If this completes a Phase, update the Phase status to "✅ Complete"

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

- If no planned features remain: Report "All features in the roadmap are complete! 🎉"
- If dependencies not met: Report "Cannot start Feature [NUMBER] yet. Must complete [dependency list] first."
- If roadmap file not found: Report "Feature-Roadmap.md not found. Please create the roadmap first."
- If feature already "In Progress": Report "Feature [NUMBER] is already being worked on. Please choose a different feature or complete the current one first."

## Supporting Parallel Workstreams

This command supports multiple developers or AI agents working in parallel by:

1. **Checking for "In Progress" status** - Only selects features not yet started
2. **Updating roadmap immediately** - Marks feature as "In Progress" before starting work
3. **Clear completion tracking** - Provides /feature-complete process to update roadmap when done

This prevents duplication and allows multiple features to be developed concurrently.
