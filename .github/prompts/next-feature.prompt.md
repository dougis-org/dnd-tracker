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
1. Reads `docs/Feature-Roadmap.md` to find the next eligible increment (skips ✅ and 🚧 entries and enforces dependencies)
2. Marks the increment as "🚧 In Progress" directly in the roadmap and reminds the agent to commit the change so other contributors see it
3. Generates a comprehensive increment brief tied back to the PRD and governance notes
4. Runs `/speckit.specify` automatically with the increment description to create `specs/NNN-slug/spec.md`
5. Creates (or checks out) the working branch and reminds the agent to consult `docs/Tech-Stack.md`
6. Emits follow-up guidance to run `/speckit.plan`, `/speckit.tasks`, `/speckit.analyze`, and to watch for roadmap governance checkpoints before `/speckit.implement`

**Workflow Integration**:
```
/next-feature → /speckit.plan → /speckit.tasks → /speckit.analyze → /speckit.implement → [PR merge] → /feature-complete (+ roadmap governance checkpoint when required)
```

**For Full Documentation**: See `.claude/commands/next-feature.md` and `docs/Slash-Commands.md`
