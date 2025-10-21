---
description: Mark a feature as complete in the roadmap after PR is merged.
---

You are marking a feature as complete in the Feature Roadmap after its PR has been merged. Follow these steps:

## Usage

The user will provide the feature number and PR number:
- `/feature-complete 003 165` - Feature 003 completed via PR #165
- `/feature-complete 004` - Feature 004 completed (will prompt for PR number)

If no arguments provided, ask the user for the feature number and PR number.

## Step 1: Get PR Details

1. Parse the feature number and PR number from the command arguments
2. Use `gh pr view [PR_NUMBER] --json number,title,mergedAt,state` to get PR details
3. Verify the PR is actually merged (state must be "MERGED")
4. If not merged, STOP and report: "PR #[NUMBER] is not merged yet. Complete and merge the PR first."
5. Extract the merge date from the mergedAt field

## Step 2: Read Current Roadmap

1. Read `/home/doug/ai-dev-1/dnd-tracker/docs/Feature-Roadmap.md`
2. Find the feature section for Feature [NUMBER]
3. Verify it exists and is currently marked as "In Progress" or planned
4. Note the current feature number for progress calculation

## Step 3: Update Feature Section

Update the feature's section in the roadmap:

1. Change the status line from "In Progress" or planned to:
   `**Status**: Complete ✅ (Merged via PR #[NUMBER])`

2. Add completion date (using the PR merge date):
   `**Completed**: [MERGE_DATE from PR]`

3. Move the feature from "## Planned Features" section to "## Completed Features" section

4. Preserve all other details (Description, Deliverables, Dependencies, etc.)

Example transformation:
```markdown
BEFORE:
### Feature 003: Character Management System
**Status**: 🚧 In Progress (Started 2025-10-22)
**Branch**: 003-character-management
**Priority**: P1 - Critical Path
...

AFTER (moved to Completed Features section):
### ✅ Feature 003: Character Management System
**Status**: Complete ✅ (Merged via PR #165)
**Completed**: 2025-10-25
**Spec Location**: `specs/003-character-management/`
**Priority**: P1 - Critical Path
...
```

## Step 4: Update Progress Tracking

Update the progress tracking section at the bottom of the roadmap:

1. **Count completed features**: Count all features in "## Completed Features" section
2. **Calculate percentage**: (completed / 20 total features) * 100
3. **Calculate current week**: Based on timeline (each feature has estimated weeks)
4. **Find next feature**: The first feature in "## Planned Features" that's not "In Progress"
5. **Check phase completion**: If all features in a phase are complete, mark phase as complete

Update these lines:
```markdown
**Current Progress**: [X] of 20 features complete ([Y]%) - Week [Z] of 42
**Phase [N] Status**: ✅ Complete (if all phase features done) OR In Progress ([X] of [Y] features complete)
**Next Feature**: Feature [NEXT_NUM] - [NEXT_NAME] (Priority, description)
```

## Step 5: Update Development Phases Section

If this feature completes an entire phase:

1. Find the phase section (e.g., "### Phase 2: Entity Management")
2. Change the status line to:
   `**Timeline**: Weeks X-Y | **Status**: ✅ Complete (Completed [DATE])`
3. Add actual completion date if different from estimate

## Step 6: Save and Report

1. Save the updated Feature-Roadmap.md
2. Run `npm run lint:markdown:fix` to ensure formatting
3. Report completion with summary

## Example Report

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

## Step 7: Optional - Create Completion Summary

If the user wants a summary, create a brief completion report:

```markdown
# Feature 003 Completion Summary

**Completed**: 2025-10-25
**PR**: #165
**Total Time**: [Calculate from start date to merge date]
**Tests**: [Get from PR description or test results]
**Files Changed**: [From gh pr view --json files]

## What Was Delivered
[List the key deliverables from the feature scope]

## Impact
- Users can now [describe user-facing impact]
- Unblocks: Feature 004, Feature 005
- Phase 2 Progress: 25% complete
```

## Error Handling

- **Feature not found**: "Feature [NUMBER] not found in roadmap. Check the feature number."
- **PR not merged**: "PR #[NUMBER] is not merged yet. Merge the PR first."
- **PR not found**: "PR #[NUMBER] not found. Check the PR number."
- **Feature already complete**: "Feature [NUMBER] is already marked as complete."
- **No feature number provided**: Ask user: "Which feature number did you complete? (e.g., 003)"
- **No PR number provided**: Ask user: "Which PR number merged this feature?"

## Integration with /next-feature

This command works in tandem with `/next-feature`:

1. `/next-feature` → Marks feature as "In Progress" and runs `/specify`
2. [Developer works through /plan, /tasks, /implement]
3. [PR created and merged]
4. `/feature-complete [NUM] [PR]` → Marks feature as "Complete" and updates progress

This creates a complete workflow for tracking features from start to finish in the roadmap.
