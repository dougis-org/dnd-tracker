---
description: Mark a feature as complete in the roadmap after PR is merged.
---

**Primary Command Location**: `.claude/commands/feature-complete.md`

This command is maintained in the Claude Code commands directory. For the complete command implementation, refer to:

`.claude/commands/feature-complete.md`

## Quick Reference

**Usage**: `/feature-complete 003 165` (feature number, PR number)

**What it does**:
1. Verifies PR is merged using `gh pr view`
2. Extracts merge date from PR
3. Updates `docs/Feature-Roadmap.md`:
   - Marks feature as "Complete ✅"
   - Moves to "Completed Features" section
   - Updates progress tracking
   - Updates phase completion status
4. Reports summary and next steps

**Workflow Integration**:
```
[PR merged] → /feature-complete [NUM] [PR] → /next-feature (for next one)
```

**For Full Documentation**: See `.claude/commands/feature-complete.md` and `docs/Slash-Commands.md`
