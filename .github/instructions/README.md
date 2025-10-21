# GitHub Copilot Instructions Directory

This directory contains instructions and context for GitHub Copilot to assist with D&D Tracker development.

## File Organization

### Instructions (Context Files)
- **`feature-workflow.instructions.md`** - Complete feature development workflow
- **`codacy.instructions.md`** - Code quality and Codacy integration
- **`next-issue.instructions.md`** - Issue selection workflow

### Commands Directory (`.github/commands/`)
Quick reference files that point to primary command implementations in `.claude/commands/`:

- **`next-feature.md`** → `.claude/commands/next-feature.md`
- **`feature-complete.md`** → `.claude/commands/feature-complete.md`

## Primary vs Reference Locations

### Primary Locations (Source of Truth)
Update these when commands or workflows change:

- `.claude/commands/*.md` - Full command implementations
- `docs/Slash-Commands.md` - Complete user documentation
- `docs/Feature-Roadmap.md` - Feature list and progress tracking

### Reference Locations (Point to Primary)
These files reference the primary locations to avoid duplication:

- `.github/commands/*.md` - Quick references for GitHub Copilot
- `.github/instructions/*.md` - Context and workflow guides for Copilot

## How GitHub Copilot Uses These Files

GitHub Copilot automatically reads:
1. `.github/instructions/*.md` - To understand project context and workflows
2. `.github/commands/*.md` - To provide command suggestions and help

When assisting with code, Copilot will:
- Follow the feature workflow defined in `feature-workflow.instructions.md`
- Reference the roadmap in `docs/Feature-Roadmap.md`
- Apply constitutional standards from `CLAUDE.md`
- Use patterns from completed features in `specs/001-*/` and `specs/002-*/`

## For Human Developers

**To find command documentation**:
1. Quick reference: `.github/commands/[command].md`
2. Full implementation: `.claude/commands/[command].md`
3. Complete guide: `docs/Slash-Commands.md`

**To understand workflow**:
1. Read: `docs/Slash-Commands.md`
2. Check: `docs/Feature-Roadmap.md` for current status
3. Review: `.github/instructions/feature-workflow.instructions.md` for details

## Updating Instructions

When updating workflows or commands:

1. **Update primary location first**:
   - `.claude/commands/[command].md` (for command changes)
   - `docs/Slash-Commands.md` (for documentation)
   - `docs/Feature-Roadmap.md` (for features/progress)

2. **Update references if needed**:
   - `.github/commands/[command].md` (quick reference only)
   - `.github/instructions/*.md` (if workflow changed)

This ensures changes are made once and referenced everywhere.

---

**Last Updated**: 2025-10-21
**Maintained By**: Development team
