---
description: Mark a feature as complete in the roadmap after PR is merged.
---

**Primary Command Location**: `.claude/commands/feature-complete.md`

This command is maintained in the Claude Code commands directory. For the complete command implementation, refer to:

`.claude/commands/feature-complete.md`

## Quick Reference

**Usage**: `/feature-complete 003 165` (feature number, PR number)

**What it does**:
1. Verifies the PR is merged using `gh pr view` and cross-checks that the roadmap increment has no open governance checklist items
2. Extracts the merge date from the PR for status history
3. Updates `docs/Feature-Roadmap.md`:
   - Marks the increment as "Complete ✅" and records the merge date
   - Moves the entry into the "Completed Features" section while preserving any governance notes
   - Refreshes progress tracking and phase completion roll-ups
   - Confirms downstream dependencies can now be unblocked
4. Reports the summary, highlights any follow-on governance actions, and reminds the agent to queue `/next-feature`

**Workflow Integration**:
```
[PR merged + governance checkpoint passed] → /feature-complete [NUM] [PR] → /next-feature (for next one)
```

**For Full Documentation**: See `.claude/commands/feature-complete.md` and `docs/Slash-Commands.md`
