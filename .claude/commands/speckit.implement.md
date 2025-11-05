---
description: Execute the implementation plan by processing and executing all tasks defined in tasks.md
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

1. Run `.specify/scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

2. **Check checklists status** (if FEATURE_DIR/checklists/ exists):
   - Scan all checklist files in the checklists/ directory
   - For each checklist, count:
     - Total items: All lines matching `- [ ]` or `- [X]` or `- [x]`
     - Completed items: Lines matching `- [X]` or `- [x]`
     - Incomplete items: Lines matching `- [ ]`
   - Create a status table:

     ```text
     | Checklist | Total | Completed | Incomplete | Status |
     |-----------|-------|-----------|------------|--------|
     | ux.md     | 12    | 12        | 0          | ✓ PASS |
     | test.md   | 8     | 5         | 3          | ✗ FAIL |
     | security.md | 6   | 6         | 0          | ✓ PASS |
     ```

   - Calculate overall status:
     - **PASS**: All checklists have 0 incomplete items
     - **FAIL**: One or more checklists have incomplete items

   - **If any checklist is incomplete**:
     - Display the table with incomplete item counts
     - **STOP** and ask: "Some checklists are incomplete. Do you want to proceed with implementation anyway? (yes/no)"
     - Wait for user response before continuing
     - If user says "no" or "wait" or "stop", halt execution
     - If user says "yes" or "proceed" or "continue", proceed to step 3

   - **If all checklists are complete**:
     - Display the table showing all checklists passed
     - Automatically proceed to step 3

3. Load and analyze the implementation context:
   - **REQUIRED**: Read tasks.md for the complete task list and execution plan
   - **REQUIRED**: Read plan.md for tech stack, architecture, and file structure
   - **REQUIRED**: Read `docs/Tech-Stack.md` for approved frameworks, libraries, and tooling expectations
   - **REQUIRED**: Review the increment entry in `docs/Feature-Roadmap.md` for governance checkpoints and evidence requirements
   - **IF EXISTS**: Read data-model.md for entities and relationships
   - **IF EXISTS**: Read contracts/ for API specifications and test requirements
   - **IF EXISTS**: Read research.md for technical decisions and constraints
   - **IF EXISTS**: Read quickstart.md for integration scenarios

4. **Project Setup Verification**:
   - **REQUIRED**: Create/verify ignore files based on actual project setup:

   **Detection & Creation Logic**:
   - Check if the following command succeeds to determine if the repository is a git repo (create/verify .gitignore if so):

     ```sh
     git rev-parse --git-dir 2>/dev/null
     ```

   - Check if Dockerfile* exists or Docker in plan.md → create/verify .dockerignore
   - Check if .eslintrc*or eslint.config.* exists → create/verify .eslintignore
   - Check if .prettierrc* exists → create/verify .prettierignore
   - Check if .npmrc or package.json exists → create/verify .npmignore (if publishing)
   - Check if terraform files (*.tf) exist → create/verify .terraformignore
   - Check if .helmignore needed (helm charts present) → create/verify .helmignore

   **If ignore file already exists**: Verify it contains essential patterns, append missing critical patterns only
   **If ignore file missing**: Create with full pattern set for detected technology

   **Common Patterns by Technology** (from plan.md tech stack):
   - **Node.js/JavaScript/TypeScript**: `node_modules/`, `dist/`, `build/`, `*.log`, `.env*`
   - **Python**: `__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `dist/`, `*.egg-info/`
   - **Java**: `target/`, `*.class`, `*.jar`, `.gradle/`, `build/`
   - **C#/.NET**: `bin/`, `obj/`, `*.user`, `*.suo`, `packages/`
   - **Go**: `*.exe`, `*.test`, `vendor/`, `*.out`
   - **Ruby**: `.bundle/`, `log/`, `tmp/`, `*.gem`, `vendor/bundle/`
   - **PHP**: `vendor/`, `*.log`, `*.cache`, `*.env`
   - **Rust**: `target/`, `debug/`, `release/`, `*.rs.bk`, `*.rlib`, `*.prof*`, `.idea/`, `*.log`, `.env*`
   - **Kotlin**: `build/`, `out/`, `.gradle/`, `.idea/`, `*.class`, `*.jar`, `*.iml`, `*.log`, `.env*`
   - **C++**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.so`, `*.a`, `*.exe`, `*.dll`, `.idea/`, `*.log`, `.env*`
   - **C**: `build/`, `bin/`, `obj/`, `out/`, `*.o`, `*.a`, `*.so`, `*.exe`, `Makefile`, `config.log`, `.idea/`, `*.log`, `.env*`
   - **Swift**: `.build/`, `DerivedData/`, `*.swiftpm/`, `Packages/`
   - **R**: `.Rproj.user/`, `.Rhistory`, `.RData`, `.Ruserdata`, `*.Rproj`, `packrat/`, `renv/`
   - **Universal**: `.DS_Store`, `Thumbs.db`, `*.tmp`, `*.swp`, `.vscode/`, `.idea/`

   **Tool-Specific Patterns**:
   - **Docker**: `node_modules/`, `.git/`, `Dockerfile*`, `.dockerignore`, `*.log*`, `.env*`, `coverage/`
   - **ESLint**: `node_modules/`, `dist/`, `build/`, `coverage/`, `*.min.js`
   - **Prettier**: `node_modules/`, `dist/`, `build/`, `coverage/`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
   - **Terraform**: `.terraform/`, `*.tfstate*`, `*.tfvars`, `.terraform.lock.hcl`
   - **Kubernetes/k8s**: `*.secret.yaml`, `secrets/`, `.kube/`, `kubeconfig*`, `*.key`, `*.crt`

5. Parse tasks.md structure and extract:
   - **Task phases**: Setup, Tests, Core, Integration, Polish
   - **Task dependencies**: Sequential vs parallel execution rules
   - **Task details**: ID, description, file paths, parallel markers [P]
   - **Execution flow**: Order and dependency requirements

6. Execute implementation following the task plan:
   - **Phase-by-phase execution**: Complete each phase before moving to the next
   - **Respect dependencies**: Run sequential tasks in order, parallel tasks [P] can run together  
   - **Follow TDD approach**: Execute test tasks before their corresponding implementation tasks
   - **File-based coordination**: Tasks affecting the same files must run sequentially
   - **Validation checkpoints**: Verify each phase completion before proceeding

7. Implementation execution rules:
   - **Setup first**: Initialize project structure, dependencies, configuration
   - **Tests before code**: If you need to write tests for contracts, entities, and integration scenarios
   - **Core development**: Implement models, services, CLI commands, endpoints
   - **Integration work**: Database connections, middleware, logging, external services
   - **Polish and validation**: Unit tests, performance optimization, documentation

8. Progress tracking and error handling:
   - Report progress after each completed task
   - Halt execution if any non-parallel task fails
   - For parallel tasks [P], continue with successful tasks, report failed ones
   - Provide clear error messages with context for debugging
   - Suggest next steps if implementation cannot proceed
   - **IMPORTANT** For completed tasks, make sure to mark the task off as [X] in the tasks file.
   - **REQUIRED ENFORCEMENT**: After completing any task (including fixing a comment, addressing a review thread, or finishing a subtask), the agent **must** stage the related file changes, create a focused commit, and push the commit to the remote branch. Recommended guidelines:
     - Commit message format: follow conventional commits (e.g., `feat(task): complete <TASK-ID> - short description` or `fix(task): address review <TASK-ID> - short desc`).
     - Use one logical task per commit where possible so review history is clear.
     - Commands to run (example):

       ```bash
       git add <files-touched>
       git commit -m "feat(task): complete TASK-123 - add validation for X"
       git push origin HEAD
       ```

     - If multiple related tasks are completed in a single operation, group them in a single commit but ensure the commit message documents all task IDs.
     - After pushing, update the tasks.md/checklist entries in the same commit or in a follow-up commit so the repo state is consistent.

9. Pre-PR Validation & Preparation:
   - Verify all required tasks are completed
   - Check that implemented features match the original specification
   - Validate that tests pass and coverage meets requirements
   - Confirm the implementation follows the technical plan and roadmap governance notes
   - Ensure `codacy_cli_analyze` has been run for every modified file (per `.github/instructions/codacy.instructions.md`)
   - Perform final checklist before submitting PR:
     - PR includes a clear, descriptive title and links the related issue(s)
     - New or updated tests have been added and instructions to run them are included in the PR body
     - Local checks pass: `npm run lint`, `npm run lint:markdown`, `npm run type-check`, `npm run test:ci` (as applicable)
     - Commit history is clean and follows conventional commits
     - The branch is rebased or merged with the latest `main` to avoid conflicts
     - All modified files have been pushed to the remote branch (see Step 8 enforcement)
     - `codacy_cli_analyze` was executed for modified files and any critical issues addressed
     - Any deferred work is documented in the PR body and has an explicit human confirmation comment (`@maintainer override-deferred-work: ...`) if present
     - Any security-sensitive or dependency changes include a note and, if dependencies were added, a trivy scan was requested (`codacy_cli_analyze --tool trivy`) and any findings addressed or documented
     - Documentation and `.env.example` updated if new environment variables are required
     - PR description contains a short checklist for reviewers summarizing the above

10. Pull Request Submission & Monitoring:
    - **Create and submit the PR** using GitHub CLI:
      ```bash
      gh pr create \
        --title "[TYPE]: [descriptive title matching conventional commits]" \
        --body "[PR description with requirements satisfied, testing notes, reviewer checklist, and 'Closes #XXXX']" \
        --head [feature-branch-name] \
        --base main
      ```
    - **CRITICAL**: Include `Closes #XXXX` in the PR body to auto-close the related GitHub issue when PR is merged
    - **Example**:
      ```bash
      gh pr create \
        --title "feat: add user authentication system" \
        --body "Implements user authentication system.

## Requirements Satisfied
- [req 1]
- [req 2]

## Testing
- All tests passing: ✓
- Coverage: 85%

## Closes
Closes #42" \
        --head feature/42-auth-system \
        --base main
      ```
    - **Monitor PR status**:
      - Wait for all automated checks to complete (CI, Codacy, status checks)
      - Address any failed checks immediately—fix issues and push updates
      - Do NOT consider the feature complete until all checks pass
      - Review feedback from reviewers and address concerns promptly
    - **Enable auto-merge** (if applicable to your workflow):
      - Only after ALL checks pass and NO review changes are requested
      - Use the `automation/ready-for-auto-merge` label OR enable auto-squash merge through GitHub UI
      - Ensure the PR merges successfully to `main`

11. **FINAL: Feature Completion**:
    - **The feature is NOT complete until the PR is MERGED into main**
    - Verify:
      - PR has been merged successfully to `main`
      - Branch can be safely deleted (will offer auto-cleanup)
      - Remote branch reflects the merged state
      - Related issue is automatically closed (GitHub issue linking) or manually closed if needed
    - **Post-merge checklist**:
      - Remove `in-progress` label from the GitHub issue if not auto-removed
      - Pull latest `main` locally to confirm merge: `git pull origin main`
      - Delete feature branch locally: `git branch -d [feature-branch-name]`
      - Verify all tasks in tasks.md are marked `[X]` as completed
    - **Report final status**: All requirements met, tests passing on `main`, feature live and deployable

Note: This command assumes a complete task breakdown exists in tasks.md. If tasks are incomplete or missing, suggest running `/speckit.tasks` first to regenerate the task list.
