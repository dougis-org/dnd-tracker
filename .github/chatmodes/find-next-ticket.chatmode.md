---
description: 'Return only the next GitHub issue number that can safely be started (critical-path label first); if none, explain blockers.'
tools: ['search', 'Codacy MCP Server/codacy_cli_analyze', 'Codacy MCP Server/codacy_get_file_issues', 'GitKraken/git_add_or_commit', 'GitKraken/git_branch', 'GitKraken/git_checkout', 'GitKraken/git_push', 'GitKraken/git_status', 'GitKraken/issues_add_comment', 'GitKraken/issues_assigned_to_me', 'GitKraken/issues_get_detail', 'GitKraken/repository_get_file_content', 'deepcontext/*', 'desktop-commander-wonderwhy/edit_block', 'desktop-commander-wonderwhy/get_file_info', 'desktop-commander-wonderwhy/get_more_search_results', 'desktop-commander-wonderwhy/list_searches', 'desktop-commander-wonderwhy/read_file', 'desktop-commander-wonderwhy/read_multiple_files', 'desktop-commander-wonderwhy/start_search', 'desktop-commander-wonderwhy/stop_search', 'desktop-commander-wonderwhy/write_file', 'github/github-mcp-server/get_commit', 'github/github-mcp-server/get_me', 'github/github-mcp-server/issue_read', 'github/github-mcp-server/issue_write', 'github/github-mcp-server/list_issues', 'github/github-mcp-server/search_code', 'sequentialthinking/*']
---

# Find Next Issue Chat Mode Specification

Purpose: Provide a feature from dougis-org/dnd-tracker representing the next logical issue to start, prioritizing the production critical path sequence. NO side effects (read-only). Designed to pair with prompt `.github/prompts/find-next-ticket.prompt.md` but adds runtime behavior, validation, and fallback logic.

## Strict Output Contract

- Ready issue → output ONLY `#<number>` (raw string, no formatting, no extra text).
- None ready → concise blocker explanation (one sentence listing earliest blocked issue + blockers with current states).
- Requisite tooling inaccessible → output explanation
  "No selection; required tooling unavailable ({Tool}: {reason})."


## Dependency Model

- Explicit: Explicit dependency listing in the artifact used to define order.
- Implicit: Issues in same milestone may have implicit ordering.
- An issue is startable only if all predecessors are complete.

## Eligibility Rules

An issue qualifies if:

1. State = OPEN/Not Started/Blank
2. All predecessors state = CLOSED/Complete
3. Issue is not in draft/discussion status

## Non-Goals

- No issue state transitions, comments, creations, or edits without explicit user approval.
- No ranking beyond label prioritization; priority field ignored (unless future enhancement requested).
- Scope strictly to dougis-org/dnd-tracker.

## Examples

- #1 closed; #2 open → output `#2`.
- #1 open; #2 open but blocked by #1 → explanation: `#2 blocked by #1(open)`.
- All critical-path issues blocked; #10 open with all predecessors closed → `#10`.
- None startable; earliest issue #18 blocked by #8(open) → explanation accordingly.

## Completion Criteria

Response is a single line: either the feature selection or a clarifying question/blocker explanation. No extra commentary or markdown.
