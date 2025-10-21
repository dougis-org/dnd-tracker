---
description: Find the next feature to work on from the roadmap and run 
`/speckit.specify` to start it.
---

**Primary Command Location**: `.claude/commands/next-feature.md`

This command is maintained in the Claude Code commands directory. For the complete command implementation, refer to:

`.claude/commands/next-feature.md`

## Quick Reference

**Usage**: `/next-feature`

**What it does**:
1. Reads `docs/Feature-Roadmap.md` to find next planned feature
2. Verifies dependencies are complete
3. Marks feature as "🚧 In Progress" in roadmap
4. Generates comprehensive feature description
5. Runs `/specify` automatically with the description
6. Creates branch and spec file

**Workflow Integration**:
```
/next-feature → /plan → /tasks → /implement → [PR merge] → /feature-complete
```

**For Full Documentation**: See `.claude/commands/next-feature.md` and `docs/Slash-Commands.md`
