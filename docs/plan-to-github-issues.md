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
