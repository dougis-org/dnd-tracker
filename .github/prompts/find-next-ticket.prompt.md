---
description: Determine the single next GitHub issue that can safely be started (critical-path first). Returns ONLY the issue number or, if none are startable, an explanation of blockers.
---

# find-next-issue Prompt

Goal: Identify exactly one GitHub issue (number only) in the dnd-tracker repository that is the next logical item to pick up, prioritizing the production critical path, with zero side effects (read-only). If no item is startable, output a concise blocker explanation instead of a number.

## Output Contract (STRICT)

- If a startable issue exists: OUTPUT ONLY the issue number (e.g., `#42`) and NOTHING else (no backticks, no prose).
- If none are startable: output a short human explanation listing the earliest blocked issue and its blocking predecessors (numbers + statuses). Do NOT fabricate numbers.
- Never modify GitHub issues, add comments, or change statuses without explicit user approval.

## Priority Model

1. Critical Path (must protect production launch date). Ordered by issue labels and milestones:
   Track issues labeled with `critical-path` and `milestone:1`, `milestone:2`, etc.
2. Parallel / Supporting Track (only if ENTIRE critical path remaining work is currently blocked):
   Track issues labeled with `nice-to-have` or without priority labels.

Rationale: Advance production path first; if all critical-path candidates are blocked (waiting on code review merge or predecessor completion), harvest available parallel value.

## Read-Only Data Acquisition

Use GitHub MCP search (GraphQL queries) ONLY. Never assume statuses—always fetch.

Fetch candidates:
GraphQL query to fetch open issues in dnd-tracker:

- Repository: dougis-org/dnd-tracker
- State: OPEN
- Filter by labels: critical-path, milestone labels

Fetch individual issues (fields): number, title, state, assignees, labels, bodyText (for linked issues).

## Dependency Derivation

Treat GitHub issue links (if documented in issue body or via linked PRs) as blocking relationships:

- If issue A "blocks" issue B, then B requires A to be closed before starting.
  If no explicit link exists, infer dependency from issue milestones and labels (same milestone = potential dependency chain).

## Status Rules

A predecessor is considered satisfied ONLY if state == CLOSED. (Do NOT treat OPEN with pending PR as done.) Conservative rule prevents premature parallel starts.

Eligible (startable) issue criteria:

- Issue state exactly "OPEN"
- All explicit + implicit predecessors satisfied (state = CLOSED)
- Issue is not assigned (or user explicitly wants it)

## Selection Algorithm

1. Build ordered evaluation list from issues labeled with `critical-path`, sorted by milestone, then by creation date.
2. For each issue number in that list:
   a. Retrieve its issue object; if missing (not found), skip but record a warning.
   b. Collect predecessor set:
   - Check issue body for explicit links to blocking issues.
   - If in same milestone as another issue, check dependencies.
     c. Fetch each predecessor's state.
     d. If ANY predecessor missing or not CLOSED → this issue is blocked → record (issue, blocking set) for potential explanation.
     e. Else if issue state == OPEN → mark as ready candidate; STOP scan and output number.
3. If no ready candidate found among critical path, evaluate whether ALL unresolved critical-path items were blocked; if yes, continue scanning remaining issues with same procedure.
4. If no OPEN candidate exists, proceed directly to explanation.
5. Construct explanation:
   - Choose the earliest OPEN issue in evaluation order that is blocked.
   - List its blocking predecessors (numbers + their states) when applicable.
   - Output concise sentence (no markdown formatting).

## Tie-Breakers

If multiple ready issues appear simultaneously: choose the one with the smallest issue number. If no other differentiator, prefer issues with more detailed descriptions.

## Validation & Safety

- Never modify or close GitHub issues.
- Do not assume statuses; if a needed issue fetch fails, treat that predecessor as blocking and provide explanation.
- If GitHub API unavailable: output explanation: "No selection; GitHub unavailable (reason)." (No number.)

## Examples

Scenario A: Issue #1 closed; Issue #2 open → Return `#2`.
Scenario B: Issue #1 open; Issue #2 open but blocked by #1 → Return `#1`.
Scenario C: All critical-path issues blocked; Issue #10 open with all its dependencies closed → Return `#10`.
Scenario D: Issue #5 open; no other startable issues → Return `#5`.

## Execution Steps (Implementation Guidance)

1. Query GitHub for open issues in dnd-tracker repository with `critical-path` label.
2. Fetch their details and dependencies.
3. Build a priority queue sorted by milestone and issue number.
4. Apply algorithm; short-circuit on first startable issue number.
5. Emit output per contract.

## Final Output Enforcement

Before emitting: validate output string.

- If string matches `^#\d+$` format → OK.
- Else explanation path is assumed.

Return ONLY the final output string.
