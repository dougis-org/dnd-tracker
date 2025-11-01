# Branch & Commit Guidance (Shared)

Use this include for both planning and work prompts to keep conventions DRY.

## Branch Naming
Determine `<prefix>` from Jira issue type:
- Bug → `bugfix`
- Story / Feature / Task → `feature`
- Improvement / Chore / Maintenance → `chore`
- Spike / Investigation → `spike`
- Otherwise → `feature`

Format:
```
<prefix>/<JIRA_KEY>-short-kebab-summary
```
Rules:
- Lowercase, kebab-case summary (omit stop-words, truncate total length ≲ 60 chars)
- Reuse the SAME branch for plan + implementation
- If branch exists remotely only: `git fetch origin && git switch <branch>`
- If absent: `git switch -c <branch>`

## Signed Commits
All commits must be GPG/SSH signed:
```
git commit -S -m "<type>(<scope>): <JIRA_KEY> <imperative summary>"
```
Conventional commit types commonly used:
- `feat`: new end‑user or API capability
- `fix`: bug fix
- `chore`: infra / build / prompt / non-runtime change
- `refactor`: internal restructure (no behavior change)
- `docs`: documentation only
- `test`: test-only additions

Scope guidance:
- Use the smallest logical component (`cache`, `api`, `schema`, `prompt`, etc.)
- Omit scope if unclear or cross-cutting.

Summary style:
- Present tense imperative ("add X", "refactor Y")
- No trailing period; ≤ 72 chars

Examples:
```
feat(api): SPCS-214 add payload eviction endpoint
fix(cache): SPCS-219 prevent stale hit after TTL expiry
chore(prompt): SPCS-240 streamline work-ticket instructions
```

## Commit Hygiene
- One logical concern per commit (squash before PR if noisy)
- Never commit broken build or failing tests
- Prefer adding tests in SAME commit as new behavior

## Push & PR
```
git push -u origin <prefix>/<JIRA_KEY>-short-kebab-summary
```
Open PR referencing Jira ticket and plan file; include risk, rollout, test evidence.
