# Tasks: F001 — Project Setup & Design System

**Input**: Design documents from `/specs/001-project-setup-design-system/`
**Feature**: Project Setup & Design System
**Branch**: `001-project-setup-design-system`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js project: `src/`, `tests/` at repository root
- Configuration files at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Next.js structure

- [ ] T001 Initialize Next.js 16.0.1 project with TypeScript 5.9.2 at repository root
- [ ] T002 [P] Configure TypeScript strict mode in `tsconfig.json`
- [ ] T003 [P] Setup path aliases for `@/*` imports in `tsconfig.json` and `next.config.js`
- [ ] T004 [P] Create `.env.example` file with required environment variables
- [ ] T005 [P] Update `.gitignore` to exclude `.env.local` and Next.js build artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Install and configure Tailwind CSS 4.x per `tailwind.config.ts`
- [ ] T007 [P] Create global styles in `src/app/globals.css` with Tailwind directives
- [ ] T008 [P] Setup MongoDB connection utility in `src/lib/db/mongoose.ts`
- [ ] T009 [P] Create common TypeScript types in `src/types/common.ts`
- [ ] T010 [P] Create utility functions in `src/lib/utils.ts` (cn helper for class names)
- [ ] T011 Configure ESLint with Next.js rules using existing `.eslintrc.js`
- [ ] T012 [P] Configure Prettier using existing `.prettierrc`
- [ ] T013 [P] Verify markdownlint configuration in existing `.markdownlint.json`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Project Setup (Priority: P1) 🎯 MVP

**Goal**: Establish working Next.js application with linting and basic structure

**Independent Test**: Run `npm run dev` and verify app loads at http://localhost:3000, run `npm run lint` and `npm run lint:markdown` successfully

### Implementation for User Story 1

- [ ] T014 [P] [US1] Create root layout in `src/app/layout.tsx` with HTML structure
- [ ] T015 [P] [US1] Create landing page in `src/app/page.tsx` with placeholder content
- [ ] T016 [US1] Add npm scripts to `package.json`: `dev`, `build`, `start`, `lint`, `lint:fix`
- [ ] T017 [US1] Add npm scripts to `package.json`: `lint:markdown`, `lint:markdown:fix`, `type-check`
- [ ] T018 [US1] Create MainLayout component in `src/components/layouts/MainLayout.tsx`
- [ ] T019 [P] [US1] Create AuthLayout component in `src/components/layouts/AuthLayout.tsx`
- [ ] T020 [P] [US1] Create DashboardLayout component in `src/components/layouts/DashboardLayout.tsx`
- [ ] T021 [US1] Verify ESLint passes on all created files
- [ ] T022 [US1] Verify markdown linting passes on all .md files

**Checkpoint**: At this point, User Story 1 should be fully functional - `npm run dev` works and linting passes

---

## Phase 4: User Story 2 - Design System Integration (Priority: P2)

**Goal**: Install shadcn/ui components and implement theme toggle

**Independent Test**: View app in browser, toggle theme switch, verify dark/light mode changes correctly without errors

### Implementation for User Story 2

- [ ] T023 [US2] Initialize shadcn/ui with `npx shadcn@latest init` and configure `components.json`
- [ ] T024 [P] [US2] Install shadcn/ui button component in `src/components/ui/button.tsx`
- [ ] T025 [P] [US2] Install shadcn/ui card component in `src/components/ui/card.tsx`
- [ ] T026 [P] [US2] Install shadcn/ui input component in `src/components/ui/input.tsx`
- [ ] T027 [P] [US2] Install shadcn/ui dropdown-menu component in `src/components/ui/dropdown-menu.tsx`
- [ ] T028 [P] [US2] Install shadcn/ui dialog component in `src/components/ui/dialog.tsx`
- [ ] T029 [P] [US2] Install shadcn/ui toast component in `src/components/ui/toast.tsx`
- [ ] T030 [P] [US2] Install shadcn/ui select component in `src/components/ui/select.tsx`
- [ ] T031 [P] [US2] Install shadcn/ui separator component in `src/components/ui/separator.tsx`
- [ ] T032 [P] [US2] Install shadcn/ui switch component in `src/components/ui/switch.tsx`
- [ ] T033 [P] [US2] Install shadcn/ui tabs component in `src/components/ui/tabs.tsx`
- [ ] T034 [US2] Install next-themes package for theme management
- [ ] T035 [US2] Create ThemeProvider in `src/components/theme/theme-provider.tsx`
- [ ] T036 [US2] Add ThemeProvider to root layout in `src/app/layout.tsx`
- [ ] T037 [US2] Create ThemeToggle component in `src/components/theme/theme-toggle.tsx`
- [ ] T038 [US2] Add ThemeToggle to MainLayout component
- [ ] T039 [US2] Configure CSS variables for dark/light themes in `src/app/globals.css`
- [ ] T040 [US2] Test all shadcn/ui components render without errors
- [ ] T041 [US2] Test theme toggle switches between light and dark mode

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - app runs with working theme toggle and styled components

---

## Phase 5: User Story 3 - Testing Infrastructure (Priority: P3)

**Goal**: Setup Jest and Playwright testing frameworks with example tests

**Independent Test**: Run `npm run test:ci` successfully, run `npm run test:e2e` and verify landing page test passes

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before adding Jest/Playwright config**

- [ ] T042 [P] [US3] Create failing unit test for ThemeToggle in `tests/unit/components/theme-toggle.spec.tsx` (verify theme switch + localStorage persistence + CSS class changes)
- [ ] T043 [P] [US3] Create failing E2E test for landing page in `tests/e2e/landing.spec.ts`

### Implementation for User Story 3

- [ ] T044 [US3] Install Jest dependencies: `jest`, `@jest/globals`, `@types/jest`, `ts-jest`, `jest-environment-jsdom`
- [ ] T045 [US3] Install React Testing Library: `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [ ] T046 [US3] Create Jest configuration in `jest.config.js` with Next.js integration
- [ ] T047 [US3] Create Jest setup file in `jest.setup.js` with testing-library extensions
- [ ] T048 [US3] Add test scripts to `package.json`: `test`, `test:watch`, `test:coverage`, `test:ci`
- [ ] T049 [US3] Verify ThemeToggle unit test now passes
- [ ] T050 [US3] Install Playwright: `@playwright/test`
- [ ] T051 [US3] Run `npx playwright install` to install browsers
- [ ] T052 [US3] Create Playwright configuration in `playwright.config.ts`
- [ ] T053 [US3] Add E2E test scripts to `package.json`: `test:e2e`, `test:e2e:ui`
- [ ] T054 [US3] Verify landing page E2E test now passes
- [ ] T055 [US3] Create test helpers directory structure: `tests/helpers/`, `tests/fixtures/`
- [ ] T056 [US3] Run `npm run test:ci` and verify 80%+ coverage on touched code

**Checkpoint**: All user stories 1, 2, and 3 should now work - tests pass and verify functionality

---

## Phase 6: User Story 4 - Deployment Pipeline (Priority: P4)

**Goal**: Setup Fly.io deployment and CI/CD pipeline

**Independent Test**: Successfully deploy to Fly.io staging app, GitHub Actions CI passes on push

### Implementation for User Story 4

- [ ] T057 [US4] Create Fly.io configuration in `fly.toml` with production settings
- [ ] T058 [US4] Add Fly.io deployment script to `package.json`: `deploy`
- [ ] T059 [P] [US4] Create GitHub Actions workflow in `.github/workflows/test.yml` for CI
- [ ] T060 [P] [US4] Create GitHub Actions workflow in `.github/workflows/deploy.yml` for CD
- [ ] T061 [US4] Configure GitHub secrets for Fly.io deployment: `FLY_API_TOKEN`
- [ ] T062 [US4] Test CI workflow on feature branch push
- [ ] T063 [US4] Deploy to Fly.io staging app and verify application loads
- [ ] T064 [US4] Verify deployment includes all environment variables from `.env.example`

**Checkpoint**: All user stories complete - app deploys automatically on merge to main

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and validation

- [ ] T065 [P] Update `README.md` with setup instructions and dev commands
- [ ] T066 [P] Update `.env.example` with all required environment variables and descriptions
- [ ] T067 Validate all acceptance criteria from `spec.md` are met
- [ ] T068 Run through `quickstart.md` developer onboarding guide
- [ ] T069 [P] Generate test coverage report and verify 80%+ on new code
- [ ] T070 Run final lint check: `npm run lint && npm run lint:markdown && npm run type-check`
- [ ] T071 Verify all source files in `src/` are under 450 lines (uncommented code)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs working app structure)
- **User Story 3 (Phase 5)**: Can start after User Story 1 completes (needs components to test)
- **User Story 4 (Phase 6)**: Depends on User Story 1 (needs working app to deploy)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (needs app structure and layouts)
- **User Story 3 (P3)**: Depends on US1 and US2 (needs components to test, especially ThemeToggle)
- **User Story 4 (P4)**: Depends on US1 (needs working app), can be parallel with US2/US3

### Within Each User Story

#### User Story 1 (Core Setup)
- Root layout and page before layouts
- Layouts can be built in parallel
- npm scripts added incrementally
- Linting verification last

#### User Story 2 (Design System)
- shadcn/ui init before component installation
- All UI components can be installed in parallel (T024-T033)
- ThemeProvider before ThemeToggle
- Testing after all components installed

#### User Story 3 (Testing)
- Test files created first (should fail)
- Jest config before running Jest tests
- Playwright config before running E2E tests
- Verification that tests pass after config

#### User Story 4 (Deployment)
- Fly.io config independent
- GitHub Actions workflows can be parallel (T059, T060)
- CI workflow before CD workflow testing
- Deployment verification last

### Parallel Opportunities

**Phase 1 (Setup)**: Tasks T002-T005 can run in parallel

**Phase 2 (Foundational)**: Tasks T007-T010, T012-T013 can run in parallel

**User Story 1**: Tasks T014-T015, T019-T020 can run in parallel

**User Story 2**: 
- All shadcn/ui component installations (T024-T033) can run in parallel
- Testing tasks (T040-T041) can run in parallel

**User Story 3**:
- Initial test creation (T042-T043) can run in parallel
- Final verification (T054, T056) can run sequentially

**User Story 4**:
- GitHub Actions workflows (T059-T060) can run in parallel

**Polish Phase**: Documentation updates (T065-T066, T069) can run in parallel

---

## Parallel Example: User Story 2 (Design System)

```bash
# Launch all shadcn/ui component installations together:
Task T024: "Install button component"
Task T025: "Install card component"
Task T026: "Install input component"
Task T027: "Install dropdown-menu component"
Task T028: "Install dialog component"
Task T029: "Install toast component"
Task T030: "Install select component"
Task T031: "Install separator component"
Task T032: "Install switch component"
Task T033: "Install tabs component"

# Then continue with theme setup sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Core Project Setup)
4. **STOP and VALIDATE**: Run `npm run dev`, verify app loads, run linting
5. Commit and push for review

### Incremental Delivery

1. **Foundation**: Complete Setup + Foundational → Foundation ready
2. **MVP**: Add User Story 1 → Test (`npm run dev`, linting) → Commit (MVP!)
3. **Design**: Add User Story 2 → Test (theme toggle works) → Commit
4. **Testing**: Add User Story 3 → Test (tests pass) → Commit
5. **Deployment**: Add User Story 4 → Test (deploys successfully) → Commit
6. **Polish**: Complete Phase 7 → Final validation → Ready for PR

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (blocks others)
3. Once US1 done:
   - Developer A: User Story 2 (design system)
   - Developer B: User Story 3 (testing) - can work in parallel
   - Developer C: User Story 4 (deployment) - can work in parallel
4. Stories complete and integrate independently

**Recommended for single developer**: Complete sequentially in order US1 → US2 → US3 → US4

---

## Summary

**Total Tasks**: 71 tasks across 7 phases

**Task Breakdown by Phase**:
- Setup: 5 tasks
- Foundational: 8 tasks
- User Story 1 (Core Setup): 9 tasks
- User Story 2 (Design System): 19 tasks
- User Story 3 (Testing): 15 tasks
- User Story 4 (Deployment): 8 tasks
- Polish: 7 tasks

**Task Breakdown by User Story**:
- User Story 1 (P1): 9 tasks - Core project setup with layouts and linting
- User Story 2 (P2): 19 tasks - shadcn/ui integration and theme toggle
- User Story 3 (P3): 15 tasks - Jest and Playwright testing infrastructure
- User Story 4 (P4): 8 tasks - Fly.io deployment and GitHub Actions CI/CD

**Parallel Opportunities Identified**:
- Setup phase: 4 tasks can run in parallel
- Foundational phase: 6 tasks can run in parallel
- User Story 1: 3 tasks can run in parallel
- User Story 2: 10 tasks can run in parallel (shadcn/ui components)
- User Story 3: 2 tasks can run in parallel (initial tests)
- User Story 4: 2 tasks can run in parallel (GitHub workflows)
- Polish phase: 3 tasks can run in parallel

**Independent Test Criteria**:
- US1: `npm run dev` loads app, linting passes
- US2: Theme toggle switches modes without errors
- US3: `npm run test:ci` and `npm run test:e2e` pass
- US4: Deployment succeeds, app loads on Fly.io

**Suggested MVP Scope**: 
- Complete through User Story 1 for absolute minimum (working Next.js app)
- Recommended MVP: Complete through User Story 2 (includes design system and theme toggle)
- Full feature: Complete all 4 user stories

**Format Validation**: ✅ All tasks follow checklist format:
- [x] Checkbox present
- [x] Sequential task IDs (T001-T071)
- [x] [P] markers for parallelizable tasks
- [x] [Story] labels for user story tasks (US1-US4)
- [x] Descriptions include file paths
- [x] No sample/placeholder tasks remaining

---

## Notes

- All [P] tasks target different files with no dependencies
- [Story] labels (US1-US4) map tasks to specific user stories for traceability
- Each user story is independently testable after completion
- Tests for US3 should be written first and fail before implementation
- Commit after each user story completion or logical task group
- Stop at any checkpoint to validate story independently
- Environment variables needed: `MONGODB_URI`, `NEXT_PUBLIC_APP_URL` (see `.env.example`)
- All tasks aligned with `plan.md`, `spec.md`, and `research.md` requirements
