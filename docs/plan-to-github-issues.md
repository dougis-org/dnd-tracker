# Plan to convert Roadmap phases into GitHub issues

This document explains how to take a phase from `docs/Feature-Roadmap.md`, create the GitHub issues for that phase's features, add human links (roadmap ↔ issues), and establish formal GitHub relationships (sub-issues and blocking/dependency edges) so both humans and the API see the canonical structure.

## Goals

- Provide a reproducible, automatable recipe that an agent or maintainer can follow to:
  - Create phase parent issues and feature issues using consistent templates.
  - Add human-readable backlinks (child -> parent and parent checklists) in `docs/Feature-Roadmap.md` and in issue bodies.
  - Create machine-recognized relationships via GitHub GraphQL:
    - `addSubIssue` to mark a child as belonging to a parent issue.
    - `addBlockedBy` to represent dependencies (A blocked by B).
  - Validate the relationships and iterate across all repository issues to reflect declared `Depends on:` text.

## Prerequisites

- `gh` (GitHub CLI) installed and authenticated with an account that has write or admin rights to the repo.
- `jq` installed (used in examples to process JSON).
- A checked-out repository (examples assume `/home/doug/dev/dnd-tracker`).

## Permissions

- The GraphQL mutations require a token with sufficient repo privileges. Use `gh auth login` to configure the active account.

## High-level workflow (per phase)

1. Read the phase section in `docs/Feature-Roadmap.md` and collect the feature keys (e.g., F013) and titles.

2. Ensure the Phase parent issue exists (create it if missing) using a standard Phase template.

3. For each feature in the phase, create a feature issue using the feature template. Include a human-readable line in the feature body that references the parent (e.g. `Parent phase: #336`).

4. Append a human-friendly checklist of the created children to the Phase parent body (this is retained for readability).

5. Create machine-recognized relationships:

   - Call `addSubIssue` to create parent->child links for each feature.

   - Parse the feature issue body for `Depends on:` lines and create `addBlockedBy` edges for declared dependencies.

6. Validate by querying `subIssues` and `blockedBy`/`blocking` nodes via GraphQL.

## Templates

Phase parent issue (example)

Title

Phase N: Short phase title (Week X)

Body

Summary:

- Short paragraph describing the phase goals.

Included features (high level): Fxxx–Fyyy

Roadmap reference: `docs/Feature-Roadmap.md` (Phase N section)

Acceptance criteria:

- Itemized acceptance criteria for the phase.

Depends on: #PREVIOUS_PHASE_NUMBER (replace with actual issue number)  — optional

Feature issue (example)

Title

F###: Short feature title (e.g. F013: Clerk Integration & Auth Flow)

Body

Summary:

Short summary that explains scope and intent.

Roadmap: `docs/Feature-Roadmap.md#feature-###-slugified-title`
Parent phase: #PHASE_ISSUE_NUMBER (replace with actual parent issue number)
Depends on: free text list of features or numbers (e.g. "Depends on: Feature 001, Feature 004" or "Depends on: #123")

Acceptance criteria:

- Itemized acceptance criteria for the feature.

Labels

- Phase parent: `milestone` (or your repo's canonical milestone label). Optionally add `phase`.
- Feature issues: `feature` + area labels (`frontend`, `backend`, `Database`, etc.).
- Always list existing repo labels first and reuse them. Do not create duplicates.

## Commands and examples (concrete)

1. Ensure the Phase parent issue exists (example):

```bash
# search for an existing phase parent
gh issue list --repo dougis-org/dnd-tracker --search '"Phase 2: Authentication & User Management"' --limit 10

# create if missing
gh issue create --repo dougis-org/dnd-tracker \
  --title "Phase 2: Authentication & User Management (Week 2)" \
  --body $'Summary:\n- Implement auth and user management...\n\nRoadmap reference: docs/Feature-Roadmap.md (Phase 2 section)\n' \
  --label "milestone"
```

2. Create a feature issue (example):

```bash
gh issue create --repo dougis-org/dnd-tracker \
  --title "F013: Clerk Integration & Auth Flow" \
  --body $'Summary:\nClerk authentication setup: sign-in/sign-up pages...\n\nRoadmap: docs/Feature-Roadmap.md#feature-013-clerk-integration--auth-flow\nParent phase: #336 (Phase 2)\nDepends on: Feature 001\n\nAcceptance criteria:\n- User can sign up and sign in\n' \
  --label "feature,backend,frontend"
```

3. Append a human checklist to the Phase parent body:

```bash
gh issue edit 336 --add-body $'- [ ] #367 — F013: Clerk Integration & Auth Flow'
```

4. Resolve node IDs for GraphQL calls (PARENT and CHILD IDs):

```bash
gh api repos/dougis-org/dnd-tracker/issues/336 | jq -r '.node_id'
gh api repos/dougis-org/dnd-tracker/issues/367 | jq -r '.node_id'
```

5. Create parent->child links with `addSubIssue` (batched example):

```bash
gh api graphql -f query='mutation AddSubs {\
  a: addSubIssue(input:{issueId:"<PARENT_NODE_ID>", subIssueId:"<CHILD1_NODE_ID>"}) { clientMutationId } \
  b: addSubIssue(input:{issueId:"<PARENT_NODE_ID>", subIssueId:"<CHILD2_NODE_ID>"}) { clientMutationId } \
} '
```

6. Create dependency links with `addBlockedBy` (example):

```bash
gh api graphql -f query='mutation AddBlocked {\
  a: addBlockedBy(input:{issueId:"<DEPENDENT_NODE_ID>", blockingIssueId:"<DEPENDENCY_NODE_ID>"}) { clientMutationId }\
} '
```

## Parsing `Depends on:` and automating dependency creation

Acceptable textual forms to recognize and normalize:

- `Depends on: Feature 001` (map via F-key to issue)
- `Depends on: Feature 001, Feature 004` (multiple items)
- `Depends on: #123` (explicit issue number)
- Mixed forms — prefer explicit `#NNN` if present; otherwise map `F###` keys.

Suggested automation outline

1. Build a JSON map of created features (key -> issue number -> node id). Example call to create the map:

```bash
gh issue list --repo dougis-org/dnd-tracker --limit 500 --json number,title,id | \
  jq -r '.[] | select(.title|test("^F[0-9]{3}:")) | {key:(.title|capture("(?<k>F[0-9]{3}):").k), number:.number, node:.id}'
```

2. Scan all open issues for `Depends on:` lines, extract tokens, normalize to node ids and call `addBlockedBy` for each dependency.

3. Log each successful mutation to an audit file; retry transient failures.

Example pseudo-workflow snippet (bash outline):

```bash
# NOTE: real implementation should guard for quoting, spacing, retries and rate limits
# 1) build the feature-key -> node map (JSON), save to features.json
# 2) iterate issues with 'Depends on:' and call addBlockedBy for each resolved dependency
```

## Validation and verification

- Query a parent issue for its `subIssues` nodes and verify numbers/titles are present.

```bash
gh api graphql -f query='{ repository(owner:"dougis-org", name:"dnd-tracker") { issue(number:336) { number title subIssues(first:50) { nodes { number title } } } } }' | jq
```

- Query a dependent issue for `blockedBy` and `blocking` nodes to verify dependency edges:

```bash
gh api graphql -f query='{ repository(owner:"dougis-org", name:"dnd-tracker") { issue(number:370) { number title blockedBy(first:10) { nodes { number title } } blocking(first:10) { nodes { number title } } } } }' | jq
```

## Idempotency and rollback

- The API ignores duplicate edges in most cases, but your automation should:
  - Check whether an edge already exists (optional optimization) before calling a mutation.
  - Keep an audit log of mutations so you can revert via `removeSubIssue` or `removeBlockedBy` if needed.
# Plan to convert Roadmap phases into GitHub issues

Purpose

This document prescribes the steps to turn a phase in `docs/Feature-Roadmap.md` into GitHub work items: create feature issues, add human-facing links, and create formal GitHub relationships so the API/UI reflect the real project dependencies and structure.

Goals

- Provide a reproducible recipe to create phase parent issues and feature child issues.
- Add human-friendly backlinks in the roadmap and issues.
- Create machine-recognized relationships via GraphQL (`addSubIssue` and `addBlockedBy`).
- Validate and iterate a full pass across repo dependencies.

Prerequisites

- `gh` (GitHub CLI) installed and authenticated with an account that has write/admin repo permissions.
- `jq` installed (optional but used in examples).
- Local repo checkout (examples assume `/home/doug/dev/dnd-tracker`).

Permissions

- Ensure the authenticated token has permissions to read and mutate issues. Use `gh auth login`.

High-level workflow (per phase)

1. Read the phase section in `docs/Feature-Roadmap.md` and list the feature keys and titles.

2. Ensure the Phase parent issue exists (create it if missing) using a Phase template.

3. Create feature issues for that phase using the feature template. Each feature issue body should include a `Parent phase: #NNN` line.

4. Append a parent checklist in the Phase issue body (human-readable list of `#NNN` child links).

5. Create machine-recognized links:

   - `addSubIssue` for parent->child membership.

   - `addBlockedBy` for declared `Depends on:` relationships.

6. Validate `subIssues` and `blockedBy`/`blocking` nodes via GraphQL.

Templates

Phase parent issue (example)

Title: Phase N: Short phase title (Week X)

Body (example):

Summary:

- Short paragraph describing the phase goals.

Included features (high level): Fxxx–Fyyy

Roadmap reference: `docs/Feature-Roadmap.md` (Phase N section)

Acceptance criteria:

- Itemized acceptance criteria.

Depends on: #PREVIOUS_PHASE_NUMBER  (replace with actual issue number) — optional

Feature issue (example)

Title: F###: Short feature title (e.g. F013: Clerk Integration & Auth Flow)

Body (example):

Summary:

Short summary describing scope.

Roadmap: `docs/Feature-Roadmap.md#feature-###-slugified-title`
Parent phase: #PHASE_ISSUE_NUMBER  (replace with actual parent issue number)
Depends on: free-text list (e.g. `Depends on: Feature 001, Feature 004` or `Depends on: #123`)

Acceptance criteria:

- Itemized acceptance criteria for the feature.

Labels

- Phase parent: `milestone` (optionally `phase`).
- Feature issues: `feature` + area labels (e.g., `frontend`, `backend`, `Database`).
- Always reuse existing repo labels where possible.

Concrete commands (examples)

1. Ensure Phase parent exists (search / create):

```bash
gh issue list --repo dougis-org/dnd-tracker --search '"Phase 2: Authentication & User Management"' --limit 10

gh issue create --repo dougis-org/dnd-tracker \
  --title "Phase 2: Authentication & User Management (Week 2)" \
  --body $'Summary:\n- Implement auth and user management...\n\nRoadmap reference: docs/Feature-Roadmap.md (Phase 2 section)\n' \
  --label "milestone"
```

2. Create a feature issue (example):

```bash
gh issue create --repo dougis-org/dnd-tracker \
  --title "F013: Clerk Integration & Auth Flow" \
  --body $'Summary:\nClerk authentication setup: sign-in/sign-up pages...\n\nRoadmap: docs/Feature-Roadmap.md#feature-013-clerk-integration--auth-flow\nParent phase: #336 (Phase 2)\nDepends on: Feature 001\n\nAcceptance criteria:\n- User can sign up and sign in\n' \
  --label "feature,backend,frontend"
```

3. Append a human checklist to the parent issue:

```bash
gh issue edit 336 --add-body $'- [ ] #367 — F013: Clerk Integration & Auth Flow'
```

4. Resolve node IDs for GraphQL mutations:

```bash
gh api repos/dougis-org/dnd-tracker/issues/336 | jq -r '.node_id'
gh api repos/dougis-org/dnd-tracker/issues/367 | jq -r '.node_id'
```

5. Batch create parent->child relationships with `addSubIssue`:

```bash
gh api graphql -f query='mutation AddSubs {\
  a: addSubIssue(input:{issueId:"<PARENT_NODE_ID>", subIssueId:"<CHILD1_NODE_ID>"}) { clientMutationId } \
  b: addSubIssue(input:{issueId:"<PARENT_NODE_ID>", subIssueId:"<CHILD2_NODE_ID>"}) { clientMutationId } \
} '
```

6. Create dependency edges with `addBlockedBy`:

```bash
gh api graphql -f query='mutation AddBlocked {\
  a: addBlockedBy(input:{issueId:"<DEPENDENT_NODE_ID>", blockingIssueId:"<DEPENDENCY_NODE_ID>"}) { clientMutationId }\
} '
```

Parsing `Depends on:` lines (automation guidance)

Recognize forms:

- `Depends on: Feature 001`
- `Depends on: Feature 001, Feature 004`
- `Depends on: #123`

Automation outline:

1. Build a feature key -> issue number -> node id map by scanning issue titles for `^F\d{3}:`.

2. For each issue with a `Depends on:` line, extract tokens and resolve to node ids.

3. Call `addBlockedBy` to create dependency edges for each resolved token.

4. Log results into an audit file and retry transient errors.

Validation

- Query a parent for `subIssues` to confirm children are linked.

```bash
gh api graphql -f query='{ repository(owner:"dougis-org", name:"dnd-tracker") { issue(number:336) { subIssues(first:50) { nodes { number title } } } } }' | jq
```

- Query an issue for `blockedBy`:

```bash
gh api graphql -f query='{ repository(owner:"dougis-org", name:"dnd-tracker") { issue(number:370) { blockedBy(first:10) { nodes { number title } } } } }' | jq
```

Idempotency & rollback

- Optionally check whether an edge exists before creating it.
- Keep an audit log to revert via `removeSubIssue` or `removeBlockedBy` if needed.

Error handling & rate limits

- Inspect GraphQL `errors` and retry with backoff on transient failures.
- Keep batch sizes reasonable and monitor rate limits.

Full-pass dependency iteration

1. Build a global feature mapping (save to JSON).
2. Scan every open issue for `Depends on:` and resolve tokens to node ids.
3. Batch `addBlockedBy` calls and write results to an audit file.
4. Run verification queries and report any mismatches.

Safety notes

- Do not commit tokens or secrets. Use `gh auth login` and rely on the CLI credential store.
- Log all automated mutations and outputs for audit.

Appendix: GraphQL examples

- `addSubIssue` (parent -> child):

```graphql
mutation AddSubs {
  a: addSubIssue(input:{issueId:"<PARENT_NODE_ID>", subIssueId:"<CHILD_NODE_ID>"}) { clientMutationId }
}
```

- `addBlockedBy` (dependent blocked by dependency):

```graphql
mutation AddBlocked {
  addBlockedBy(input:{issueId:"<DEPENDENT_NODE_ID>", blockingIssueId:"<DEPENDENCY_NODE_ID>"}) { clientMutationId }
}
```

Next steps

- I can add an idempotent automation script under `scripts/` that implements the mapping, parsing and GraphQL calls (with retries and logging), or run a full pass to create missing edges.

Generated on: 2025-11-03

- If you plan to re-run the automation in a fresh chat/agent session, place the produced `feature->issue` mapping JSON into repo `scripts/` (or a state file) so a new session can pick up and continue without re-parsing titles.

Security & safety notes
- Do not commit authentication tokens to the repository.
- Use `gh auth login` and rely on the CLI's credential store during automated runs.
- Restrict mutation batches to reasonable sizes and monitor action logs while running the first few times.

Appendix: Useful GraphQL mutation examples

- addSubIssue (create parent → child link):

```graphql
mutation AddSubs {
  a: addSubIssue(input:{issueId:"<PARENT_NODE_ID>", subIssueId:"<CHILD_NODE_ID>"}) { clientMutationId }
}
```

- addBlockedBy (create dependency):

```graphql
mutation AddBlocked {
  addBlockedBy(input:{issueId:"<DEPENDENT_NODE_ID>", blockingIssueId:"<DEPENDENCY_NODE_ID>"}) { clientMutationId }
}
```

Ending notes
- This document is intentionally prescriptive so an agent can read it and act: it includes the templates, commands (gh + GraphQL), validation steps, and automation guidance.
- If you want, I can now:
  - Add an automation script to `scripts/` that implements the steps above (idempotent, logs results), or
  - Run a full pass to ensure every `Depends on:` in existing open issues is reflected as `addBlockedBy` edges.

---
Generated on: 2025-11-03
