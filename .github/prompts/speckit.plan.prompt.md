---
description: Execute the implementation planning workflow using the plan template to generate design artifacts.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. **Setup**: Run `.specify/scripts/bash/setup-plan.sh --json` from repo root and parse JSON for FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Load context**: Read FEATURE_SPEC, `docs/Tech-Stack.md`, governance notes in `docs/Feature-Roadmap.md`, design docs in `docs/design/` (api-design.md, database-design.md, technical-design.md), and `.specify/memory/constitution.md`. Load IMPL_PLAN template (already copied).

3. **Execute plan workflow**: Follow IMPL_PLAN template to fill Technical Context, Constitution Check, evaluate gates (ERROR if violations unjustified), capture roadmap governance expectations and evidence requirements, then execute Phase 0 and Phase 1.

4. **Stop and report**: Report branch, IMPL_PLAN path, and generated artifacts after Phase 1 completion.

## Phases

### Phase 0: Research

1. **Extract unknowns** from Technical Context:
   - Each "NEEDS CLARIFICATION" → research task
   - Each dependency → best practices task
   - Each integration → patterns task

2. **Generate research tasks** for all unknowns and technology choices:
   ```
   For each unknown: "Research {unknown} for {context}"
   For each technology: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md`:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives: [what else evaluated]

4. **Verify**: All NEEDS CLARIFICATION resolved before proceeding to Phase 1

### Phase 1: Design & Contracts

1. **Extract entities** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from requirements:
   - Each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output schema to `/contracts/`

3. **Update agent context**:
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Adds new technology from current plan only
   - Preserves manual additions between markers

4. **Generate outputs**: data-model.md, /contracts/*, quickstart.md, agent context update

## Key rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
