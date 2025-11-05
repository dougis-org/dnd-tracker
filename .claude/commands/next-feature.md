---
description: Pick the next feature from the roadmap and prepare the repository for specification.
---

## Overview

This command selects the next eligible feature marked "Planned" in `docs/Feature-Roadmap.md`, confirms with the user, changes its status to "In Progress", creates a single feature branch, and returns instructions to run `/speckit.specify`.

## PRECONDITIONS (MANDATORY)

1. **Prepare the working directory**:
   - Stash any uncommitted work on current branch: `git stash`
     - Only run the stash if you have unsaved work
   - Checkout main: `git checkout main`
   - Pull latest from remote: `git pull origin main`
   - This ensures agent is working with the latest roadmap

## EXECUTION WORKFLOW

1. **Read Feature Roadmap Table**:
   - Open `docs/Feature-Roadmap.md`
   - Scan the feature table from top to bottom
   - Identify rows where Status = "Planned"

2. **Check Dependencies** (CRITICAL):
   - For each "Planned" feature found, read its Dependencies column
   - Verify ALL listed dependencies have Status = "Complete" or "Shipped"
   - If any dependency is not complete, skip this feature and continue scanning
   - The first "Planned" feature with ALL dependencies satisfied is the candidate

3. **Present Feature for Confirmation**:
   - Extract from candidate row:
     - FEATURE_NUMBER (roadmap feature #)
     - Feature description/title
     - Generate BRANCH_NAME: `feature/[NUMBER]-[short-name]` (2-4 word hyphenated name)
   - Display to user:

     ```
     Selected next feature:
     
     Feature #[NUMBER]: [Title]
     Description: [feature description from roadmap]
     Branch: [BRANCH_NAME]
     Short Name: [short-name]
     
     Proceed? (yes/no)
     ```

   - Wait for user confirmation
   - If user says "no" or "wait", stop and ask what they prefer
   - If user says "yes" or "proceed", continue to step 4

4. **Update Roadmap Status** (CRITICAL - TWO PLACES):
   
   **PART A: Update the Feature Summary Table** (top of roadmap):
   - Find the row for Feature [NUMBER] in the "Feature Summary" table
   - Change the Status cell from "Planned" to "In Progress"
   - Keep all other columns unchanged
   
   **PART B: Update the Feature Detail Section** (body of roadmap):
   - Find the "### Feature [NUMBER]: [Title]" section matching the selected feature
   - Update the Status line: Change from "**Status**: Planned" to "**Status**: In Progress"
   - Add the Branch line: `**Branch**: [BRANCH_NAME]`
   - Add the Spec Location line: `**Spec Location**: specs/[FEATURE_NUMBER]-[short-name]/`
   
   **Example - Before**:
   ```
   ### Feature 003: Landing Page & Marketing Components
   
   **Depends on**: Feature 001, Feature 002
   **Duration**: Day 2
   ```
   
   **Example - After**:
   ```
   ### Feature 003: Landing Page & Marketing Components
   
   **Status**: In Progress
   **Branch**: feature/003-landing-page
   **Spec Location**: specs/003-landing-page/
   **Depends on**: Feature 001, Feature 002
   **Duration**: Day 2
   ```
   
   - Save `docs/Feature-Roadmap.md`
   - Stage and commit both changes: `git add docs/Feature-Roadmap.md && git commit -m "docs: mark feature #[NUMBER] as In Progress with branch [BRANCH_NAME]"`

5. **Push Roadmap Update** (MANDATORY):
   - Push to origin/main: `git push origin HEAD:main`
   - Verify push succeeded by running:
     ```bash
     git fetch origin main
     git show origin/main:docs/Feature-Roadmap.md | grep -n "In Progress" | grep "\[NUMBER\]" || true
     ```
   - If the update is NOT visible on `origin/main`, abort with: `ERROR: roadmap not pushed to origin/main; aborting.`

6. **Create Feature Branch** (MANDATORY RULES):
   - Branch name format: `feature/[NUMBER]-[short-name]`
   - Create and push: `git checkout -b [BRANCH_NAME] && git push -u origin [BRANCH_NAME]`
   - Do NOT create additional branches
   - If branch already exists on remote, abort: `ERROR: branch already exists on remote: [BRANCH_NAME]`

7. **Return Output**:
   - BRANCH_NAME: the created feature branch name
   - FEATURE_NUMBER: roadmap feature number
   - SHORT_NAME: the hyphenated short name used in branch
   - Next command to run: `/speckit.specify.md FEATURE_NUMBER=$FEATURE_NUMBER BRANCH_NAME=$BRANCH_NAME SHORT_NAME=$SHORT_NAME`

   - Display to user:

     ```
     Feature #[NUMBER]: [Title]
     Description: [feature description from roadmap]
     Branch: [BRANCH_NAME]
     Short Name: [SHORT_NAME]
     
     Please now run
     /speckit.specify FEATURE_NUMBER=[FEATURE_NUMBER] BRANCH_NAME=[BRANCH_NAME] SHORT_NAME=[SHORT_NAME]
     ```

