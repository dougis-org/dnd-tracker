---
description: "Task list for Feature 009 - Combat Tracker Page"
---

# Tasks: Feature 009 — Combat Tracker Page

**Input**: Design documents from `specs/009-combat-tracker/`  
**Spec Version**: Draft (2025-11-11)  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅

**Maintainer**: @doug  
**Constitution**: All tasks comply with `.specify/memory/constitution.md`. After editing, run Codacy analysis per repository rules.

**Tech Stack**: TypeScript 5.9.2, Next.js 16, React 19, Tailwind CSS, Zod, Jest, Playwright  
**Target Coverage**: 80%+ on touched code  
**Storage**: localStorage (MVP) → Feature 036 adds backend persistence

---

## Format: `[ID] [P?] [Story] Description (file path)`

- **[P]**: Parallelizable (different files, no dependencies)
- **[Story]**: User story label (US1–US6) for traceability
- **File paths**: Exact locations in src/, tests/, or specs/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create feature directory structure and component exports in `src/components/combat/index.ts`
- [ ] T002 [P] Initialize Zod schemas for CombatSession, Participant, StatusEffect, CombatLogEntry in `src/lib/schemas/combat.ts`
- [ ] T003 [P] Create mock session fixtures for testing in `tests/fixtures/combat-sessions.ts`
- [ ] T004 [P] Setup Tailwind CSS utility classes for combat UI (status effect colors, HP bar styling) in `tailwind.config.ts` (extend palette if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement combatSessionAdapter for localStorage persistence in `src/lib/combat/combatSessionAdapter.ts` (loadSession, saveSession, updateParticipant methods)
- [ ] T006 [P] Implement combatHelpers utility functions in `src/lib/combat/combatHelpers.ts` (advanceTurn, rewindTurn, applyDamage, applyHealing, decrementEffectDurations, sortParticipantsByInitiative)
- [ ] T007 [P] Implement undoRedoManager state stack for undo/redo functionality in `src/lib/combat/undoRedoManager.ts` (pushState, undo, redo, getHistory methods)
- [ ] T008 Create base error boundary wrapper component in `src/components/combat/ErrorBoundary.tsx` for CombatTracker error handling
- [ ] T009 [P] Create unit tests for combatSessionAdapter in `src/lib/combat/__tests__/combatSessionAdapter.test.ts`
- [ ] T010 [P] Create unit tests for combatHelpers in `src/lib/combat/__tests__/combatHelpers.test.ts`
- [ ] T011 [P] Create unit tests for undoRedoManager in `src/lib/combat/__tests__/undoRedoManager.test.ts`

**Checkpoint**: Foundation ready - all user story implementation can now proceed in parallel

---

## Phase 3: User Story 1 — Load Active Combat Session & Display State (Priority: P1)

**Goal**: GM can load a combat session and see all participants in initiative order with current turn, round/turn counter, and status effects displayed accurately.

**Independent Test**: User navigates to `/combat`, sees initiative order (sorted by initiative), current turn highlighted, round/turn counter displayed, and all status effects visible. Session state matches data.

### Tests for User Story 1

- [ ] T012 [P] [US1] Create component test for InitiativeOrder render in `src/components/combat/__tests__/InitiativeOrder.test.tsx` (verify list renders, sort correct, current turn highlighted)
- [ ] T013 [P] [US1] Create integration test for CombatTracker session load in `tests/integration/combat-tracker.integration.test.ts` (verify session loads from adapter, components render correctly)
- [ ] T014 [P] [US1] Create E2E test for US1 user flow in `tests/e2e/combat-tracker.spec.ts` (navigate to /combat, verify UI displays)

### Implementation for User Story 1

- [ ] T015 [US1] Create CombatTracker main container component in `src/components/combat/CombatTracker.tsx` (session loading, state management, undo/redo buttons, layout structure; **include ARIA labels for undo/redo buttons and main container role**)
- [ ] T016 [US1] Implement InitiativeOrder component in `src/components/combat/InitiativeOrder.tsx` (display sorted list, highlight current turn, participant HP/name/type; **include ARIA live region for turn highlight changes, semantic markup for list, aria-current for active turn**)
- [ ] T017 [P] [US1] Create round/turn counter UI subcomponent in `src/components/combat/RoundTurnCounter.tsx` (display format: "Round X, Turn Y/Z"; **include aria-label for round/turn status**)
- [ ] T018 [P] [US1] Create participant status effects display subcomponent in `src/components/combat/ParticipantStatusBadges.tsx` (render StatusEffect pills with duration; **include aria-label for each effect pill with effect name and remaining duration**)
- [ ] T019 [US1] Create combat page layout wrapper in `src/app/combat/layout.tsx` (page structure, error boundary)
- [ ] T020 [US1] Create combat page entry point in `src/app/combat/page.tsx` (route handler, CombatTracker instantiation)
- [ ] T021 [US1] Add TypeScript types for internal component state in `src/types/combat.ts` (optional if not in schemas already)

**Checkpoint**: User Story 1 fully functional and independently testable. GMs can load and view session state.

---

## Phase 4: User Story 2 — Advance Turn and Round (Priority: P1)

**Goal**: GM can click "Next Turn" to advance to next participant's turn or end round. Turn advancement is instant with visual confirmation. Optional: "Previous Turn" button to rewind.

**Independent Test**: User clicks "Next Turn" button; next participant becomes current. When advancing from last participant, round increments, first participant becomes current. UI updates in-place without reload.

### Tests for User Story 2

- [ ] T022 [P] [US2] Create component test for turn advancement logic in `src/components/combat/__tests__/CombatTracker.test.tsx` (verify next/previous turn advance correctly, round increments, wrap-around)
- [ ] T023 [P] [US2] Create unit test for advanceTurn/rewindTurn helpers in `src/lib/combat/__tests__/combatHelpers.test.ts` (edge cases: 2, 3, 5 participants, round wrap)
- [ ] T024 [US2] Create E2E test for US2 turn advancement flow in `tests/e2e/combat-tracker.spec.ts` (click Next Turn multiple times, verify round increments)

### Implementation for User Story 2

- [ ] T025 [US2] Add "Next Turn" and "Previous Turn" button UI to CombatTracker in `src/components/combat/CombatTracker.tsx` (handlers for turn advancement)
- [ ] T026 [P] [US2] Create TurnControlButtons subcomponent in `src/components/combat/TurnControlButtons.tsx` (Next/Previous buttons, disabled states)
- [ ] T027 [US2] Integrate turn advancement state update in CombatTracker (call advanceTurn helper, update session, save to localStorage, trigger re-render)
- [ ] T028 [US2] Add visual feedback for turn advancement (highlight animation or color change on InitiativeOrder current turn participant)

**Checkpoint**: User Story 1 & 2 complete. GMs can load session and advance turns with automatic round incrementing.

---

## Phase 5: User Story 3 — Apply Damage/Healing (Priority: P1)

**Goal**: GM can quickly apply damage or healing to any participant. HP updates immediately with visual feedback. Temp HP absorbs damage first.

**Independent Test**: User selects participant, enters damage amount, HP updates immediately and correctly. Temp HP depletes first. HP bar (if present) reflects change. Healing cannot exceed max HP.

### Tests for User Story 3

- [ ] T029 [P] [US3] Create component test for HPTracker in `src/components/combat/__tests__/HPTracker.test.tsx` (damage input, value submission, HP validation, temp HP logic)
- [ ] T030 [P] [US3] Create unit test for applyDamage/applyHealing helpers in `src/lib/combat/__tests__/combatHelpers.test.ts` (temp HP absorption, overkill, healing cap)
- [ ] T031 [US3] Create E2E test for US3 damage/healing flow in `tests/e2e/combat-tracker.spec.ts` (apply damage, verify HP updates, apply healing)

### Implementation for User Story 3

- [ ] T032 [US3] Implement HPTracker component in `src/components/combat/HPTracker.tsx` (numeric HP display, input field for damage/healing, apply button; **includes styling for unconscious/dead state per FR-009: HP ≤ 0 shows "Unconscious" label, visual graying; include aria-label for HP input, aria-live region for HP changes**)
- [ ] T033 [P] [US3] Create HPBar visual subcomponent in `src/components/combat/HPBar.tsx` (percentage width bar, color coding: green/yellow/red based on HP%; **include role="progressbar", aria-valuemin/max/now for screen readers**)
- [ ] T034 [US3] Integrate HPTracker into InitiativeOrder participant list items (display HP input next to each participant)
- [ ] T035 [US3] Add damage/healing input validation and error handling in HPTracker (prevent invalid input, show errors)
- [ ] T036 [US3] Implement Zod validation for DamageInput in `src/lib/schemas/combat.ts` and validate in damage application flow

**Checkpoint**: User Stories 1, 2, & 3 complete. Core combat mechanics functional: load session, advance turns, apply damage/healing.

---

## Phase 6: User Story 4 — Manage Status Effects (Priority: P2)

**Goal**: GM can add, view, and remove status effects on participants. Effects display as pills with duration countdown (in rounds). Duration decrements at end of each round.

**Independent Test**: User clicks to add effect, selects effect from menu, sets duration, sees effect pill on participant. Clicking X removes effect. Duration displays (e.g., "Prone (2 rounds remaining)") and decrements after turn wrap.

### Tests for User Story 4

- [ ] T037 [P] [US4] Create component test for StatusEffectsPanel in `src/components/combat/__tests__/StatusEffectsPanel.test.tsx` (add effect form, effect list render, remove button)
- [ ] T038 [P] [US4] Create unit test for effect duration decrement logic in `src/lib/combat/__tests__/combatHelpers.test.ts` (decrementEffectDurations, permanent effects, removal on zero)
- [ ] T039 [US4] Create E2E test for US4 status effect lifecycle in `tests/e2e/combat-tracker.spec.ts` (add effect, verify display, remove effect)

### Implementation for User Story 4

- [ ] T040 [US4] Implement StatusEffectsPanel component in `src/components/combat/StatusEffectsPanel.tsx` (add effect form/menu, effect pill list, remove handlers)
- [ ] T041 [P] [US4] Create StatusEffectMenu subcomponent in `src/components/combat/StatusEffectMenu.tsx` (dropdown/buttons for standard D&D 5e effects)
- [ ] T042 [P] [US4] Create StatusEffectPill subcomponent in `src/components/combat/StatusEffectPill.tsx` (display effect name, duration, remove button)
- [ ] T043 [US4] Integrate StatusEffectsPanel into participant detail/context (modal, sidebar, or inline buttons per participant)
- [ ] T044 [US4] Add round-end logic to decrement status effect durations in CombatTracker (call decrementEffectDurations on turn wrap, remove expired effects)
- [ ] T045 [US4] Add Zod validation for StatusEffectInput in `src/lib/schemas/combat.ts`

**Checkpoint**: User Story 4 complete. Status effects can be applied and managed with automatic duration tracking.

---

## Phase 7: User Story 5 — Lair Action Notification (Priority: P2)

**Goal**: When current turn reaches initiative 20, a prominent notification appears prompting GM to trigger lair actions. Notification dismisses after acknowledgment.

**Independent Test**: Current turn reaches participant with initiative 20; notification banner/toast appears with "Lair Actions Available". Clicking button acknowledges/dismisses. Turn advances, notification gone. Next cycle to initiative 20, notification reappears.

### Tests for User Story 5

- [ ] T046 [P] [US5] Create component test for LairActionNotification in `src/components/combat/__tests__/LairActionNotification.test.tsx` (render when initiative=20, hide for others, dismiss functionality)
- [ ] T047 [US5] Create E2E test for US5 lair action notification in `tests/e2e/combat-tracker.spec.ts` (initiative 20 turn, verify notification, dismiss, verify gone)

### Implementation for User Story 5

- [ ] T048 [US5] Implement LairActionNotification component in `src/components/combat/LairActionNotification.tsx` (conditional banner/toast, dismiss button, accessibility; **include role="alert", aria-live="assertive" for notification, aria-label for dismiss button, aria-pressed state tracking**)
- [ ] T049 [US5] Add lair action detection logic in CombatTracker (check if current participant initiative === lairActionInitiative)
- [ ] T050 [US5] Integrate LairActionNotification into CombatTracker layout (display at top, toast, or modal based on design)
- [ ] T051 [US5] Add tracking state to avoid re-showing notification on same turn (dismissed flag, reset on turn advance)

**Checkpoint**: User Story 5 complete. Lair action notifications working.

---

## Phase 8: User Story 6 — View Combat Log (Priority: P3)

**Goal**: GM can view a collapsible combat log panel displaying timestamped entries of recent actions (damage, heals, effects, turns). Log can be scrolled to see older entries.

**Independent Test**: Combat log panel visible (or expand button if collapsed), shows recent actions with timestamps. Actions appear as new damage/effects are applied. Scrolling reveals older entries (last 10–20+). Collapse/expand works.

### Tests for User Story 6

- [ ] T052 [P] [US6] Create component test for CombatLog in `src/components/combat/__tests__/CombatLog.test.tsx` (render entries, scroll, collapse/expand toggle)
- [ ] T053 [US6] Create E2E test for US6 combat log in `tests/e2e/combat-tracker.spec.ts` (perform actions, verify log entries, collapse/expand)

### Implementation for User Story 6

- [ ] T054 [US6] Implement CombatLog component in `src/components/combat/CombatLog.tsx` (collapsible panel, log entry list, scroll container; **include aria-label for collapse/expand button, aria-expanded state, role="region" for log container, aria-live="polite" for new entries**)
- [ ] T055 [P] [US6] Create CombatLogEntry subcomponent in `src/components/combat/CombatLogEntry.tsx` (display timestamp, action type, description, details; **include semantic markup for log entries, aria-label with full entry summary for screen readers**)
- [ ] T056 [US6] Add log entry generation in CombatTracker helpers (create CombatLogEntry on damage, heal, effect add/remove, turn advance)
- [ ] T057 [US6] Integrate CombatLog into CombatTracker layout (sidebar or bottom panel, toggleable visibility)
- [ ] T058 [P] [US6] Create CombatLogEntry type and builder functions in `src/lib/combat/combatLogHelpers.ts` (generate readable descriptions per action type)

**Checkpoint**: User Story 6 complete. Combat log functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, accessibility, performance, edge cases

### Accessibility & Mobile

- [ ] T059 [P] Add ARIA labels to all interactive elements (buttons, inputs, turn highlights) per WCAG 2.1 Level AA in all combat components
- [ ] T060 [P] Verify keyboard navigation works for all controls (Tab, Enter, Space, Arrow keys) in CombatTracker
- [ ] T061 [P] Test mobile responsiveness on 375px viewport (iPhone SE) - ensure no horizontal scroll, buttons ≥ 44×44 px
- [ ] T062 Audit with axe-playwright for accessibility violations in `tests/e2e/accessibility.spec.ts`

### Performance & Edge Cases

- [ ] T063 [P] Test performance with 50+ participants (verify smooth scrolling, 30+ FPS, turn advance < 100ms)
- [ ] T064 [P] Handle localStorage quota exceeded errors with user-friendly toast + fallback in combatSessionAdapter
- [ ] T065 [P] Test initiative tie scenarios (same initiative value) - verify deterministic ordering, UI clarity
- [ ] T066 [P] Test negative HP and unconscious state display (HP ≤ 0 shows "Unconscious" label, visual graying)
- [ ] T067 [P] Test max HP capping for healing (cannot exceed max) and temp HP behavior

### Undo/Redo & State Persistence

- [ ] T068 [P] Test undo/redo state stack (undo damage, undo turn advance, redo actions) - verify states restore correctly
- [ ] T069 [P] Test localStorage persistence (reload page, verify session state intact: round, turn, HP, effects all correct)
- [ ] T070 Test undo/redo with status effect duration changes (undo effect add, redo it, verify duration resets correctly)

### Error Handling & Edge Cases

- [ ] T071 [P] Test session not found (invalid sessionId) - show fallback empty mock session with warning toast
- [ ] T072 [P] Test corrupted localStorage data - validate with Zod, show error, fallback to mock
- [ ] T073 [P] Test empty participant list edge case (should not load; show error if encountered)

### Documentation & Code Quality

- [ ] T074 Create README/quickstart for combat feature in `specs/009-combat-tracker/quickstart.md` (setup, usage examples, testing)
- [ ] T075 [P] Add inline JSDoc comments to complex logic in combatHelpers, undoRedoManager
- [ ] T076 [P] Update main project README if combat feature is exposed in top-level navigation
- [ ] T077 Verify Codacy analysis passes (no new issues, 80%+ coverage, file/function size limits) - run `npm run codacy` for all edited files

### Final Validation

- [ ] T078 [P] Run full test suite locally: `npm test` (all unit + integration tests pass)
- [ ] T079 [P] Run E2E tests locally: `npm run test:e2e` (all Playwright tests pass)
- [ ] T080 Run TypeScript check: `npm run type-check` (no type errors)
- [ ] T081 [P] Run ESLint: `npm run lint` (no linting errors)
- [ ] T082 [P] Run build: `npm run build` (build succeeds, no warnings)
- [ ] T083 Verify 80%+ test coverage on touched code (check coverage report in coverage/)

---

## Phase 10: Handoff & Documentation

**Purpose**: Prepare feature for code review and merge

- [ ] T084 Create PR description with resolved issues, manual test instructions, and known limitations
- [ ] T085 Verify all CI checks pass on PR (linting, tests, Codacy, build)
- [ ] T086 Update `docs/Feature-Roadmap.md` to mark Feature 009 as "Complete"
- [ ] T087 Document any post-MVP enhancements needed in linked GitHub issue(s)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓ (no dependencies, can start immediately)

Phase 2 (Foundational)
    ↓ depends on Phase 1
    ↓ BLOCKS all user stories

Phase 3, 4, 5 (User Stories 1–3)
    ↓ depend on Phase 2
    ↓ CAN RUN IN PARALLEL (different files, no cross-story blocking)
    ↓ OR SEQUENTIAL (P1 → P2 → P3 priority order)

Phase 6, 7, 8 (User Stories 4–6)
    ↓ depend on Phase 2
    ↓ MAY DEPEND on earlier stories for integration (but independently testable)
    ↓ CAN RUN IN PARALLEL if different stories

Phase 9 (Polish)
    ↓ depends on all desired user stories being complete

Phase 10 (Handoff)
    ↓ depends on Phase 9 completion and all CI checks passing
```

### User Story Dependencies

| Story | Priority | Blocker | Notes |
|-------|----------|---------|-------|
| US1 (Load session) | P1 | Phase 2 | Core foundation; no story dependencies |
| US2 (Turn advancement) | P1 | Phase 2, US1 | Integrates with InitiativeOrder but independently testable |
| US3 (Damage/healing) | P1 | Phase 2, US1 | Uses Participant HP but independently testable |
| US4 (Status effects) | P2 | Phase 2, US1 | Builds on participant display; independent of US2/US3 |
| US5 (Lair notification) | P2 | Phase 2, US2 | Depends on turn tracking (US2) for initiative 20 detection |
| US6 (Combat log) | P3 | Phase 2, US1–US3 | Logs actions from all stories; can be last |

### Parallel Opportunities

#### Setup Phase (T001–T004)

All marked [P] can run in parallel:

- T002 (Zod schemas)
- T003 (Fixtures)
- T004 (Tailwind utilities)

#### Foundational Phase (T005–T011)

All marked [P] can run in parallel:

- T006 (combatHelpers)
- T007 (undoRedoManager)
- T009 (adapter tests)
- T010 (helpers tests)
- T011 (undoRedoManager tests)

#### User Story 1 (T012–T021)

Tests marked [P] can run in parallel:

- T012 (InitiativeOrder test)
- T013 (Integration test)
- T014 (E2E test)

Status components marked [P] can run in parallel:

- T017 (RoundTurnCounter)
- T018 (ParticipantStatusBadges)

#### User Story 2 (T022–T028)

After US1 complete, work can happen in parallel:

- T022, T023 (tests for turn logic)
- T025, T026 (buttons and controls)

#### User Story 3 (T029–T036)

After Phase 2 complete:

- T029, T030 (tests)
- T032, T033 (HPTracker + HPBar components)

#### User Stories 4, 5, 6

Each can start after Phase 2, but:

- US4 independent of US5/US6
- US5 requires US2 complete (turn tracking)
- US6 can run after US1 is complete

#### Polish Phase (T059–T077)

Most marked [P]:

- T059–T062 (Accessibility tasks)
- T063–T067 (Performance/edge case tests)
- T068–T073 (Error handling tests)
- T074–T076 (Documentation)

---

## Parallel Example: Efficient 2-Developer Team

**Developer A**: User Story 1

- Complete Phase 1 + Phase 2 together (4 days)
- Then focus on US1 (T015–T021): 3 days
- Then assist with testing

**Developer B**: User Story 2 (after Phase 2 done)

- Start US2 (T022–T028): 3 days, in parallel with Dev A's US1
- Then move to US3

Then:

- Dev A takes US4
- Dev B takes US5
- US6 fits in Polish phase with reduced effort

---

## Implementation Strategy

### MVP First (Recommended)

Deliver core gameplay loop (US1–US3) for immediate value:

1. ✅ Phase 1: Setup (1 day)
2. ✅ Phase 2: Foundational (2 days)
3. ✅ Phase 3–5: US1–US3 (6 days)
4. 🚀 **DEMO US1–US3** at day 9
5. ⏸ Phase 6–8: US4–US6 (3 days)
6. ✅ Phase 9–10: Polish + handoff (2 days)

**Total MVP: 9 days** (1 developer)

### Full Feature

Add status effects, lair actions, and logging:

1. Follow phases 1–10 in order
2. Allow parallel work in phases 3–8 if staffed
3. **Total with 1 developer: ~15 days**
4. **Total with 2 developers: ~10–11 days** (parallelization savings)

### Stop Points for Validation

- **After Phase 2**: Foundation ready to test (adapter, helpers, error boundary)
- **After US1**: Can load and view session state
- **After US2**: Can advance turns, increment rounds
- **After US3**: Can apply damage/healing (MVP core loop)
- **After US4**: Can manage status effects
- **After US5**: Lair action notifications working
- **After US6**: Full feature complete (user story 6)
- **After Phase 9**: Feature polished, all tests passing, Codacy clean
- **After Phase 10**: Ready for code review and merge

---

## File Summary

### New Files (17 total)

**Components** (7):

- `src/components/combat/CombatTracker.tsx`
- `src/components/combat/InitiativeOrder.tsx`
- `src/components/combat/HPTracker.tsx`
- `src/components/combat/StatusEffectsPanel.tsx`
- `src/components/combat/CombatLog.tsx`
- `src/components/combat/LairActionNotification.tsx`
- `src/components/combat/index.ts`

**Component Subcomponents** (7):

- `src/components/combat/RoundTurnCounter.tsx`
- `src/components/combat/ParticipantStatusBadges.tsx`
- `src/components/combat/TurnControlButtons.tsx`
- `src/components/combat/HPBar.tsx`
- `src/components/combat/StatusEffectMenu.tsx`
- `src/components/combat/StatusEffectPill.tsx`
- `src/components/combat/CombatLogEntry.tsx`

**Libraries & Utilities** (5):

- `src/lib/combat/combatSessionAdapter.ts`
- `src/lib/combat/combatHelpers.ts`
- `src/lib/combat/undoRedoManager.ts`
- `src/lib/combat/combatLogHelpers.ts`
- `src/lib/schemas/combat.ts`

**App Routes** (2):

- `src/app/combat/layout.tsx`
- `src/app/combat/page.tsx`

**Tests** (16):

- `src/components/combat/__tests__/CombatTracker.test.tsx`
- `src/components/combat/__tests__/InitiativeOrder.test.tsx`
- `src/components/combat/__tests__/HPTracker.test.tsx`
- `src/components/combat/__tests__/StatusEffectsPanel.test.tsx`
- `src/components/combat/__tests__/CombatLog.test.tsx`
- `src/components/combat/__tests__/LairActionNotification.test.tsx`
- `src/lib/combat/__tests__/combatSessionAdapter.test.ts`
- `src/lib/combat/__tests__/combatHelpers.test.ts`
- `src/lib/combat/__tests__/undoRedoManager.test.ts`
- `tests/integration/combat-tracker.integration.test.ts`
- `tests/e2e/combat-tracker.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `tests/fixtures/combat-sessions.ts`
- `tests/fixtures/combat-sessions.ts` (shared)

**Documentation** (1):

- `specs/009-combat-tracker/quickstart.md`

### Modified Files (1)

- `docs/Feature-Roadmap.md` (mark Feature 009 complete)

---

## Success Criteria Checklist

### Before Merge

- [ ] All tests pass: `npm test` ✅
- [ ] E2E tests pass: `npm run test:e2e` ✅
- [ ] Type check passes: `npm run type-check` ✅
- [ ] Linting clean: `npm run lint` ✅
- [ ] Build succeeds: `npm run build` ✅
- [ ] Coverage ≥ 80%: `npm run coverage` ✅
- [ ] Codacy clean: No new quality issues ✅
- [ ] All components < 450 lines ✅
- [ ] All functions < 50 lines ✅
- [ ] No TypeScript `any` types ✅
- [ ] Accessibility audit passes (axe-playwright) ✅
- [ ] Mobile responsive (375px, no horizontal scroll) ✅
- [ ] localStorage persistence verified ✅

### Post-Merge Monitoring

- Watch for localStorage quota errors
- Monitor turn advancement latency (target < 100ms)
- Collect user feedback on mobile usability
- Track session load times (target < 500ms)

---

## Known Limitations & Future Work

### Out of Scope (Feature 009 MVP)

- ❌ Death save tracking (HP ≤ 0 only shows "Unconscious" label)
- ❌ Backend persistence (Feature 036)
- ❌ Initiative rolling (Feature 037)
- ❌ Real-time multiplayer sync (Feature 058)
- ❌ Advanced logging/filtering (Feature 046)
- ❌ Legendary actions (requires encounter data)
- ❌ Offline reconciliation (Feature 032)

### Post-MVP Enhancements

- [ ] Death save tracking (3 successes vs. 3 failures per D&D 5e rules)
- [ ] Backend API integration (Feature 036)
- [ ] Cross-session persistence and listing
- [ ] Initiative rolling from character/monster stats
- [ ] Real-time collaborative combat (Feature 058)
- [ ] Combat log export (PDF/JSON)
- [ ] Performance optimizations (virtualization for 100+ participants)

---

## Notes

- [P] tasks = parallelizable, can run independently
- [Story] label = traceability to user story (US1–US6)
- Each user story is independently testable and completable
- Verify tests **fail** before implementation
- Commit after logical groups
- **Stop at checkpoints** to validate independently
- localStorage quota ~5MB; log entries kept client-side only (MVP)
- future Feature 036 will add backend persistence and sync

---

**Tasks Status**: ✅ Draft (2025-11-11)  
**Ready for**: Implementation phase (Phase 1 can start immediately)  
**Approval**: Awaiting team sign-off before work begins
