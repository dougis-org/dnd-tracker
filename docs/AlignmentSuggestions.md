package docs

/*
Alignment Suggestions

Current Alignment Wins
- Roadmap phases now cite the relevant PRD sections and offline work lands before the MVP milestone, keeping scope and cadence synchronized.
- Technical design references both the PRD and `docs/Tech-Stack.md`, with collaboration services fleshed out for the paid collaborative mode deliverable.

Further Enhancements
- Create a lightweight matrix (e.g., in `docs/Feature-Roadmap.md` appendix) that maps each increment to individual PRD requirement IDs for quick traceability during governance reviews.
- Automate capture of stakeholder mock-review sign-offs (e.g., shared form or issue template) so acceptance criteria have an auditable artifact.
- Add explicit rollback and data-migration steps to the monetization epic to cover Stripe subscription edge cases before production cutover.

Governance Enablement
- Provide an AI-agent checklist artifact that each phase checkpoint can reference (required documents, telemetry snapshots, outstanding risks) to keep reviews consistent.

AI Command Prompt Improvements
- Update `/next-feature` prompt text to call increments explicitly, mention roadmap governance checkpoints, and remind agents to run `/speckit.analyze` before `/implement`.
- Extend `/feature-complete` prompt to highlight roadmap checkpoint handling and to require documenting governance results when a phase wraps.
- Amend `speckit.implement` prompt to reference `docs/Tech-Stack.md` for runtime decisions and to require Codacy CLI execution immediately after each file edit, matching the revised workflow instructions.
*/
