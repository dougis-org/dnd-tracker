---
description: Pick the next feature from the roadmap and prepare the repository for specification.
---

## Overview

This command selects the next feature marked "Planned" in `docs/Feature-Roadmap.md`, changes its status to "In Progress", creates a single feature branch, and returns instructions for the human or automation to run `/speckit.specify`.

## PRECONDITIONS (MANDATORY)

1. The agent must be operating in the repository root.
2. All local changes must be committed or stashed before running this command.
3. The agent **must** push the updated `docs/Feature-Roadmap.md` to `origin/main` immediately after updating the status to "In Progress" and verify that the push is visible on the remote before doing anything else.

   Verification commands (agent must run programmatically):

```bash
# ensure latest remote main
git fetch origin main
# display remote roadmap
git show origin/main:docs/Feature-Roadmap.md | sed -n '1,200p'
# verify the selected feature line contains "In Progress" and the branch name
git show origin/main:docs/Feature-Roadmap.md | grep -n "In Progress" || true
```

If the roadmap update is not visible on `origin/main`, abort with `ERROR: roadmap not pushed to origin/main; aborting.`

## BRANCH CREATION RULES (MANDATORY)

1. Create exactly one branch named `feature/[NUMBER]-[short-name]` where [NUMBER] is the roadmap feature number and [short-name] is a concise 2-4 word hyphenated short name.
2. Push this branch to `origin` and set it as the working branch for subsequent spec and planning actions.
3. Do NOT create or push any additional branches.

## OUTPUT

Return:

- BRANCH_NAME: name of the created branch
- FEATURE_NUMBER: roadmap feature number
- SHORT_NAME: generated short name (2-4 words)
- SPEC_TRIGGER: the automation command to call next, e.g. `.claude/commands/speckit.specify.md FEATURE_NUMBER=$FEATURE_NUMBER BRANCH_NAME=$BRANCH_NAME SHORT_NAME=$SHORT_NAME`


## FAILURE MODES

- If the roadmap push is not visible on `origin/main`, abort and do not create any branches.
- If a branch with the intended BRANCH_NAME already exists on the remote, abort and surface an error: `ERROR: branch already exists on remote: <BRANCH_NAME>`

## NEXT STEPS

After successfully creating and pushing the single feature branch, the agent should automatically run the first planning command by executing the logic from .claude/commands/speckit.specify.md using the parameters created for SPEC_TRIGGER.

No implementation steps should be taken however.
