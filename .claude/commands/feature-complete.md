---
description: Mark a feature as complete in the roadmap after PR is merged.
---

# Feature Complete

Mark a feature as complete in the Feature Roadmap after its PR has been merged. **All contributors must follow CONTRIBUTING.md standards.**

## Usage

Provide the feature number and PR number:

- `/feature-complete 003 165` - Feature 003 completed via PR #165
- `/feature-complete 004` - Feature 004 completed (will prompt for PR number)

If no arguments provided, ask the user for both the feature number and PR number.

## Step 1: Get PR Details

1. Parse the feature number and PR number from arguments
2. Run: `gh pr view [PR_NUMBER] --json number,title,mergedAt,state`
3. Verify the PR is merged (state must be "MERGED")
4. If not merged, STOP and report: "PR #[NUMBER] is not merged yet. Complete and merge the PR first."
5. Extract the merge date from mergedAt field

## Step 2: Read Current Roadmap

1. Read `./docs/Feature-Roadmap.md`
2. Find Feature [NUMBER] section
3. Verify it exists and is marked "In Progress" or planned
4. Note the current feature number for progress calculation

## Step 3: Update Feature Section

Update the feature's section in the roadmap:

1. Change status to: `**Status**: Complete ✅ (Merged via PR #[NUMBER])`
2. Add completion date: `**Completed**: [MERGE_DATE]`
3. Move feature from "## Planned Features" to "## Completed Features" section
4. Preserve all other details (Description, Deliverables, Dependencies, etc.)

Example transformation:

```markdown
BEFORE:
### Feature 003: Character Management System
**Status**: 🚧 In Progress (Started 2025-10-22)
**Branch**: 003-character-management
**Priority**: P1 - Critical Path
...

AFTER (in Completed Features section):
### ✅ Feature 003: Character Management System
**Status**: Complete ✅ (Merged via PR #165)
**Completed**: 2025-10-25
**Spec Location**: `specs/003-character-management/`
**Priority**: P1 - Critical Path
...
```

## Step 4: Update Progress Tracking

Update the progress tracking section at the bottom of the roadmap:

1. Count completed features in "## Completed Features" section
2. Calculate percentage: (completed / 20 total features) × 100
3. Calculate current week based on timeline
4. Find next feature: first feature in "## Planned Features" not marked "In Progress"
5. Check phase completion: if all phase features are complete, mark phase complete

Update these lines:

```markdown
**Current Progress**: [X] of 20 features complete ([Y]%) - Week [Z] of 42
**Phase [N] Status**: ✅ Complete (if all phase features done) OR In Progress ([X] of [Y] features complete)
**Next Feature**: Feature [NEXT_NUM] - [NEXT_NAME] (Priority, description)
```

## Step 5: Update Development Phases Section

If this feature completes an entire phase:

1. Find the phase section (e.g., "### Phase 2: Entity Management")
2. Change status to: `**Timeline**: Weeks X-Y | **Status**: ✅ Complete (Completed [DATE])`
3. Add actual completion date if different from estimate

## Step 6: Save and Report

1. Save the updated Feature-Roadmap.md
2. Run `npm run lint:markdown:fix` to ensure formatting
3. Report completion with summary

Example report:

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

## Error Handling

- **Feature not found**: "Feature [NUMBER] not found in roadmap. Check the feature number."
- **PR not merged**: "PR #[NUMBER] is not merged yet. Merge the PR first."
- **PR not found**: "PR #[NUMBER] not found. Check the PR number."
- **Feature already complete**: "Feature [NUMBER] is already marked as complete."
- **No feature number**: Ask user: "Which feature number did you complete? (e.g., 003)"
- **No PR number**: Ask user: "Which PR number merged this feature?"

## Integration with /next-feature

This command works in tandem with `/next-feature`:

1. `/next-feature` marks feature as "In Progress" and runs `/speckit.specify`
2. Developer works through /plan, /tasks, /implement workflows
3. PR is created and merged
4. `/feature-complete [NUM] [PR]` marks feature "Complete" and updates progress

For other contribution standards, refer to CONTRIBUTING.md:

- Code organization and structure
- Testing & quality requirements
- TypeScript & component patterns
- Database & security practices
- Git & PR workflows

This creates a complete workflow for tracking features from start to finish in the roadmap.
