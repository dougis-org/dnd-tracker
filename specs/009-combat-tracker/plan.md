# Implementation Plan: Feature 009 — Combat Tracker

**Branch**: `feature/009-combat-tracker` | **Date**: 2025-11-11 | **Spec**: `specs/009-combat-tracker/spec.md`  
**Input**: Feature specification from `specs/009-combat-tracker/spec.md`

**Maintainer**: @doug

**Note**: This plan is the implementer's guide for the UI-first MVP of the Combat Tracker feature. It prioritizes loading and displaying active combat sessions (US1), advancing turns (US2), and applying damage/healing (US3). Status effects (US4), lair action notifications (US5), and combat logging (US6) follow with descending priority. Follow the TDD-first workflow mandated by the project constitution: write failing tests first, implement, then refactor.

---

## Summary

Deliver a UI-first Combat Tracker page using mock adapters and localStorage for session state persistence. The feature provides GMs with a complete combat management interface: initiative order display, turn advancement, damage/healing application, status effect management, lair action notifications, and a combat log. The MVP prioritizes the core turn/HP mechanics (US1–US3) to enable active combat gameplay. Status effects and logging are secondary but included. All components follow composition principles (< 450 lines per file, < 50 lines per function), use React hooks with TypeScript strict mode, and target 80%+ test coverage.

---

## Technical Context

**Language/Version**: TypeScript 5.9.2 (repository `package.json`)  
**Primary Dependencies**: Next.js 16, React 19, Zod (validation), Tailwind CSS, Mongoose (present but backend out of scope for UI MVP)  
**Storage**: UI-first: localStorage for session state persistence (survives page reload). Backend persistence: planned Feature 036.  
**Testing**: Jest + Testing Library for unit/component tests; Playwright for E2E; axe-playwright for accessibility.  
**Target Platform**: Web (Next.js frontend, server-side rendering where applicable).  
**Project Type**: Web application (frontend-first feature in `src/app` / `src/components`).  
**Performance Goals**: UI responsiveness: turn advancement and damage application < 100ms perceived latency; initiative list handles 50+ participants smoothly (30+ FPS).  
**Constraints**: TDD-first, file/function size limits, keyboard-accessible, mobile-responsive (touch-friendly buttons ≥ 44×44 px).  
**Scale/Scope**: MVP targets single GM session management; persistence, sync, and collaboration deferred to Features 036–058.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Quality & Ownership (NON-NEGOTIABLE)

✅ **PASS**: Combat Tracker feature is structured as discrete, testable components:

- CombatTracker (main page container)
- InitiativeOrder (display + current turn highlight)
- HPTracker (numeric input + visual bar)
- StatusEffectsPanel (add/remove effects)
- CombatLog (timestamped action log)
- Lair Action Notification (conditional toast/banner)

Each component will have unit tests, integration tests, and E2E coverage before PR merge.

### Test-First (TDD) (NON-NEGOTIABLE)

✅ **PASS**: This plan requires all code changes to follow the TDD cycle (Red → Green → Refactor):

- Phase 1: Write failing unit tests for each component
- Phase 2: Implement components to pass tests
- Phase 3: Refactor, extract helpers, optimize

Test coverage target: 80%+ on touched code.

### Simplicity & Composability

✅ **PASS**: All components will be < 450 lines and functions < 50 lines. Composition pattern used: each component handles one concern (turn management, HP tracking, effects, logging).

### Observability & Security

✅ **PASS**:

- Error boundaries around CombatTracker to catch render errors
- localStorage access wrapped with try/catch for offline/quota errors
- Input validation via Zod schemas for damage/HP changes
- ARIA labels on all interactive elements (buttons, inputs, turn highlights)

### Versioning & Governance

✅ **PASS**: This plan complies with constitution v1.0.0 (ratified 2025-11-08). All PRs will reference this constitution in the checklist.

---

## Project Structure

### Documentation (this feature)

```text
specs/009-combat-tracker/
├── spec.md              # Feature specification (DONE)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (PENDING)
├── data-model.md        # Phase 1 output (PENDING)
├── quickstart.md        # Phase 1 output (PENDING)
├── contracts/           # Phase 1 output (PENDING)
│   └── combat-session.contract.ts  # TypeScript types for CombatSession
└── tasks.md             # Phase 2 output (from /speckit.tasks command)
```

### Source Code (repository root)

**Structure Decision**: Web application, frontend-only for this feature MVP.

**Feature components** live in existing layout:

```text
src/
├── app/
│   └── combat/
│       ├── layout.tsx                   # Combat page layout
│       ├── page.tsx                     # Main Combat Tracker page (entry point)
│       └── [sessionId]/
│           └── page.tsx                 # Combat session detail page (if needed)
│
├── components/
│   └── combat/
│       ├── CombatTracker.tsx            # Main container component
│       ├── InitiativeOrder.tsx          # Initiative list display
│       ├── HPTracker.tsx                # HP bar + numeric input
│       ├── StatusEffectsPanel.tsx       # Status effect management
│       ├── CombatLog.tsx                # Action log display
│       ├── LairActionNotification.tsx   # Lair action prompt (priority 20)
│       ├── index.ts                     # Component exports
│       └── __tests__/                   # Jest unit tests for each component
│           ├── CombatTracker.test.tsx
│           ├── InitiativeOrder.test.tsx
│           ├── HPTracker.test.tsx
│           ├── StatusEffectsPanel.test.tsx
│           ├── CombatLog.test.tsx
│           └── LairActionNotification.test.tsx
│
└── lib/
    ├── combat/
    │   ├── combatSessionAdapter.ts      # Mock/localStorage adapter
    │   ├── combatSessionStore.ts        # Client-side state management (Zustand or useState hooks)
    │   ├── combatHelpers.ts             # Utility functions (damage calc, turn advance, etc.)
    │   ├── undoRedoManager.ts           # Undo/redo state stack
    │   └── __tests__/
    │       ├── combatSessionAdapter.test.ts
    │       ├── combatHelpers.test.ts
    │       └── undoRedoManager.test.ts
    │
    └── schemas/
        └── combat.ts                    # Zod schemas for validation

tests/
├── e2e/
│   ├── combat-tracker.spec.ts           # E2E tests for US1–US6
│   └── fixtures/
│       └── combat-sessions.ts           # Mock session fixtures
│
└── integration/
    └── combat-tracker.integration.test.ts # Integration tests for adapter + components
```

**Rationale**: UI-first, no backend changes for MVP. Adapters allow seamless future migration to Feature 036 (backend API). localStorage provides persistence across page reloads.

---

## Complexity Tracking

> No constitution violations detected. All features fit within file/function size limits with proper composition.

| Area | Status | Notes |
|------|--------|-------|
| File size | ✅ Pass | All components designed to stay < 450 lines |
| Function size | ✅ Pass | All functions designed to stay < 50 lines |
| Code duplication | ✅ Pass | Extracted helpers (undoRedoManager, combatHelpers) prevent duplication |
| Type safety | ✅ Pass | Strict TypeScript, no `any` types |

---

## Phase 0: Research & Clarification Checklist

**Status**: Requires minor research on D&D 5e combat rules integration.

### Research Tasks

1. **Lair Action Initialization 20 Rule**
   - **Task**: Confirm D&D 5e lair action trigger (initiative 20 vs. custom threshold)
   - **Decision**: Use initiative 20 as the default trigger; make it configurable per-session (stored in CombatSession.lairActionInitiative, default 20)
   - **Impact**: 1–2 hours (notification logic + input for configuration)

2. **Status Effect Duration & Round Tracking**
   - **Task**: Define how duration decrements (at end of round or start of next turn?)
   - **Decision**: Duration decrements at the end of each round (after all participants act). Displayed as "X rounds remaining".
   - **Impact**: Affects CombatLog entry generation; timing of effect removal.

3. **Temporary HP Handling**
   - **Task**: Confirm logic: temporary HP absorbs damage first, excess applies to actual HP.
   - **Decision**: Yes, temp HP absorbs first. Zero out temp HP, then apply excess to actual HP. Display as separate UI element (e.g., tooltip).
   - **Impact**: HPTracker component logic; damage application helper.

4. **Undo/Redo Scope & Depth**
   - **Task**: Specify max undo depth (e.g., last 10 actions vs. unlimited).
   - **Decision**: Unlimited undo/redo depth for MVP (user can undo all the way to session start). State stack managed in memory; lost on page reload.
   - **Impact**: undoRedoManager implementation.

5. **Unconsciousness vs. Death Saves**
   - **Task**: Confirm if death save tracking is in MVP scope or deferred.
   - **Decision**: **Deferred**. MVP shows HP ≤ 0 → "Unconscious" label only (no death save tracking). Linked to post-MVP enhancement issue.
   - **Impact**: No change to current plan; use visual indicator only.

6. **Session Loading Error Handling**
   - **Task**: What happens if session fetch fails (offline, corrupted localStorage)?
   - **Decision**: Fallback to empty mock session with toast warning "Session unavailable; using mock data". User can create a new session or refresh page.
   - **Impact**: 1–2 hours for error boundary + fallback UI.

---

## Phase 1: Design & Data Model

### 1.1 Entity & Schema Definition

#### CombatSession

```typescript
// Core entity for a combat instance
interface CombatSession {
  id: string;                          // UUID or ObjectId
  encounterId?: string;                // Link to Encounter (optional for MVP)
  status: 'active' | 'paused' | 'ended';
  currentRoundNumber: number;          // >= 1
  currentTurnIndex: number;            // Index into participants[] array
  participants: Participant[];         // Length >= 1
  lairActionInitiative: number;        // Default 20, configurable
  createdAt: ISO8601 timestamp;
  updatedAt: ISO8601 timestamp;
  owner_id: string;                    // Authenticated user id
  org_id?: string;                     // Optional organization
}
```

#### Participant

```typescript
interface Participant {
  id: string;                          // UUID or locally-generated
  name: string;                        // Display name
  type: 'monster' | 'character' | 'npc';
  initiativeValue: number;             // >= 1, sorted descending
  maxHP: number;                       // >= 0
  currentHP: number;                   // >= 0 (can be negative for tracking overkill)
  temporaryHP: number;                 // >= 0
  acValue: number;                     // Armor class (for reference)
  statusEffects: StatusEffect[];       // Applied conditions
  metadata?: Record<string, unknown>;  // Notes, tags, source refs
}
```

#### StatusEffect

```typescript
interface StatusEffect {
  id: string;                          // UUID
  name: string;                        // e.g., "Prone", "Restrained", "Poisoned"
  durationInRounds: number | null;     // null = permanent; number = rounds remaining
  appliedAtRound: number;              // Round when applied (for tracking)
  description?: string;
  icon?: string;                       // Icon name or emoji
}
```

#### CombatLogEntry

```typescript
interface CombatLogEntry {
  id: string;
  timestamp: ISO8601 timestamp;
  roundNumber: number;
  turnIndex: number;
  actionType: 'damage' | 'heal' | 'effect_applied' | 'effect_removed' | 
             'initiative_set' | 'turn_advanced' | 'round_started' | 'round_ended';
  actor?: string;                      // Participant id (optional)
  target?: string;                     // Participant id (optional)
  details: Record<string, unknown>;    // Action-specific data (damage amount, effect name, etc.)
  description: string;                 // Human-readable summary
}
```

### 1.2 Zod Validation Schemas

**File**: `src/lib/schemas/combat.ts`

```typescript
import { z } from 'zod';

export const StatusEffectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  durationInRounds: z.number().int().positive().nullable(),
  appliedAtRound: z.number().int().nonnegative(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(200),
  type: z.enum(['monster', 'character', 'npc']),
  initiativeValue: z.number().int().positive(),
  maxHP: z.number().int().nonnegative(),
  currentHP: z.number().int(),
  temporaryHP: z.number().int().nonnegative(),
  acValue: z.number().int(),
  statusEffects: z.array(StatusEffectSchema),
  metadata: z.record(z.unknown()).optional(),
});

export const CombatSessionSchema = z.object({
  id: z.string(),
  encounterId: z.string().optional(),
  status: z.enum(['active', 'paused', 'ended']),
  currentRoundNumber: z.number().int().positive(),
  currentTurnIndex: z.number().int().nonnegative(),
  participants: z.array(ParticipantSchema).min(1),
  lairActionInitiative: z.number().int().positive().default(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  owner_id: z.string(),
  org_id: z.string().optional(),
});

export const DamageInputSchema = z.object({
  participantId: z.string(),
  amount: z.number().int(), // positive = damage, negative = healing
  targetType: z.enum(['currentHP', 'temporaryHP']).default('currentHP'),
});

export type CombatSession = z.infer<typeof CombatSessionSchema>;
export type Participant = z.infer<typeof ParticipantSchema>;
export type StatusEffect = z.infer<typeof StatusEffectSchema>;
```

### 1.3 API Contract

**File**: `specs/009-combat-tracker/contracts/combat-session.contract.ts`

This contract defines the shape of the CombatSession data exchanged between UI and backend (or mock). Includes request/response types for future backend integration (Feature 036).

```typescript
// Session retrieval
GET /api/combat-sessions/:sessionId
Response: { data: CombatSession, error?: string }

// Session update (future Feature 036)
PATCH /api/combat-sessions/:sessionId
Body: Partial<CombatSession> (e.g., { currentTurnIndex, participants })
Response: { data: CombatSession, error?: string }

// Combat log fetch
GET /api/combat-sessions/:sessionId/log?limit=20
Response: { data: CombatLogEntry[], error?: string }
```

For MVP, the adapter will use localStorage; no HTTP calls.

---

## Phase 2: Implementation Strategy (TDD-First Workflow)

### 2.1 Component Breakdown & Implementation Order

**Priority Order** (US priority + dependencies):

1. **InitiativeOrder** (US1)
   - Display participants in initiative order (highest first)
   - Highlight current turn participant
   - Test: List renders, sorting correct, current turn highlighted

2. **HPTracker** (US3)
   - Numeric HP display + input field for damage/healing
   - Apply damage with validation (no HP < 0 initial, temp HP absorbs first)
   - Test: Damage applied correctly, HP clamped, temp HP behavior

3. **CombatTracker** (main container, US1–US2)
   - Load session, display round/turn counter
   - "Next Turn" / "Previous Turn" buttons
   - Turn advancement logic with round increment
   - Integrate InitiativeOrder + HPTracker
   - Test: Session loads, turn advances, round increments, UI updates in-place

4. **StatusEffectsPanel** (US4)
   - Add effect (form/menu), view pills, remove effects
   - Duration countdown per round
   - Test: Effects added/removed, duration decrements

5. **LairActionNotification** (US5)
   - Detect initiative 20 turn, show banner
   - Dismiss on acknowledgment
   - Test: Banner shows at initiative 20, dismisses

6. **CombatLog** (US6)
   - Collapsible panel, timestamped entries
   - Filter by action type or participant (optional)
   - Test: Log populated, entries readable

### 2.2 Adapter & State Management

**combatSessionAdapter.ts**: Abstraction layer for session data.

- `loadSession(sessionId: string)`: Fetch from localStorage or API (mock)
- `saveSession(session: CombatSession)`: Persist to localStorage
- `updateParticipant(sessionId, participantId, updates)`: Partial update

**undoRedoManager.ts**: Stack-based undo/redo for actions.

- `pushState(action, newSession)`: Record action and new state
- `undo()`: Pop state from undo stack
- `redo()`: Pop state from redo stack
- `getHistory()`: Return undo/redo counts

**combatHelpers.ts**: Pure utility functions.

- `advanceTurn(session)`: Increment turn, round wrap logic
- `rewindTurn(session)`: Decrement turn, round wrap logic
- `applyDamage(participant, amount, tempHPFirst)`: Return updated participant
- `applyHealing(participant, amount)`: Return updated participant
- `decrementEffectDurations(participants, roundsToDecrement)`: Return updated array
- `sortParticipantsByInitiative(participants)`: Return sorted array

---

## Step-by-Step Implementation Plan (TDD-First)

### Phase A: Unit Tests & Helpers (Red → Green → Refactor)

1. **combatHelpers.test.ts**
   - Test `advanceTurn`, `rewindTurn`, round wrap-around
   - Test `applyDamage`, `applyHealing`, temp HP logic
   - Test `decrementEffectDurations`
   - Test `sortParticipantsByInitiative`

2. **undoRedoManager.test.ts**
   - Test `pushState`, `undo`, `redo` state transitions
   - Test undo/redo counts
   - Test empty stack edge cases

3. **combatSessionAdapter.test.ts**
   - Test localStorage read/write (mock localStorage)
   - Test error handling (quota exceeded, corrupted data)
   - Test session validation (reject invalid schema)

### Phase B: Component Tests (Red → Green → Refactor)

4. **InitiativeOrder.test.tsx**
   - Render with 5 participants, verify sort order
   - Verify current turn highlighting
   - Test click handlers (if any)

5. **HPTracker.test.tsx**
   - Render with participant HP data
   - Test damage input, value change, submit
   - Test temp HP absorption logic
   - Test HP clamping (no negative)

6. **CombatTracker.test.tsx** (integration)
   - Load session from adapter
   - Verify InitiativeOrder + HPTracker rendered
   - Test "Next Turn" button advances turn
   - Test round increment on turn wrap
   - Verify undo/redo buttons work

7. **StatusEffectsPanel.test.tsx**
   - Test effect add (form submission)
   - Test effect removal (button click)
   - Test duration display
   - Test effect list rendering

8. **LairActionNotification.test.tsx**
   - Test banner appears when initiative = 20
   - Test banner dismissal
   - Test banner not shown for other initiatives

9. **CombatLog.test.tsx**
   - Test log entries render
   - Test log visibility toggle (collapsible)
   - Test scrolling for many entries

### Phase C: E2E Tests (User Stories)

10. **combat-tracker.spec.ts** (Playwright)
    - **US1 Test**: Load combat page, verify session loads, see initiative order, current turn highlighted, round/turn displayed
    - **US2 Test**: Click "Next Turn", verify turn advances, UI updates in-place, round increments on wrap
    - **US3 Test**: Click damage input, enter value, verify HP updated, HP bar reflects change
    - **US4 Test**: Add status effect, see pill, remove it, verify removed
    - **US5 Test**: Initiative 20 turn, verify notification shows, dismiss it
    - **US6 Test**: Perform actions, verify log entries appear, collapse/expand log panel

### Phase D: Integration & Accessibility

11. **Accessibility Audit** (axe-playwright)
    - All buttons have accessible names
    - All inputs have labels or aria-label
    - Turn highlight uses color + text, not color alone
    - Mobile: buttons ≥ 44×44 px, no horizontal scroll

12. **Mobile Responsiveness** (Playwright)
    - Viewport 375px (iPhone SE)
    - Buttons clickable, inputs usable
    - Initiative list scrolls smoothly
    - No zoom required

13. **Error & Edge Cases**
    - Session not found → fallback UI
    - localStorage quota exceeded → error toast
    - Invalid session data → validation error + fallback
    - Large encounters (50+ participants) → performance test (30+ FPS)

---

## Effort, Risks, and Mitigations

### Effort Estimation

| Phase | Component | Est. Hours | Notes |
|-------|-----------|-----------|-------|
| Unit Tests | Helpers + Adapter | 8 | combatHelpers, undoRedoManager, adapter tests |
| Component Tests | 4 components | 12 | InitiativeOrder, HPTracker, StatusEffectsPanel, CombatLog |
| Main Container | CombatTracker (integration) | 6 | Turn logic, undo/redo, state sync |
| Notifications | LairActionNotification | 2 | Conditional render, dismiss |
| E2E Tests | User story coverage (US1–US6) | 8 | Playwright tests for each story |
| Accessibility & Mobile | Audit + responsive tweaks | 4 | ARIA labels, touch-friendly buttons |
| **Total** | | **40 hours** | Includes refactoring, bug fixes, Codacy cleanup |

### Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| localStorage quota exceeded (>5MB) | Medium | Implement error boundary + user alert. Defer old log entries if needed. |
| Performance with 50+ participants | Medium | Use React.memo for list items, virtualize list if needed (optional). Benchmark with Playwright. |
| Undo/redo memory leak | Low | Limit stack depth to 50 actions. Clear stack on session end. |
| Turn advancement off-by-one bugs | High | Exhaustive unit tests for turn/round wrap logic. E2E test with 2, 3, 5 participant scenarios. |
| Status effect duration tracking complexity | Medium | Clear unit tests for decrement logic. E2E test with multi-round scenario. |
| Mobile input usability | Low | Use `type="number"` input with mobile keyboard. Test on real device if possible. |

---

## File-Level Change List

### New Files (Feature 009)

```
src/app/combat/
├── layout.tsx                           # Page layout wrapper
├── page.tsx                             # Main entry point (CombatTracker container)

src/components/combat/
├── index.ts                             # Exports
├── CombatTracker.tsx                    # Main container
├── InitiativeOrder.tsx                  # Initiative display
├── HPTracker.tsx                        # HP management
├── StatusEffectsPanel.tsx               # Status effects
├── CombatLog.tsx                        # Action log
├── LairActionNotification.tsx           # Notification component
└── __tests__/
    ├── CombatTracker.test.tsx
    ├── InitiativeOrder.test.tsx
    ├── HPTracker.test.tsx
    ├── StatusEffectsPanel.test.tsx
    ├── CombatLog.test.tsx
    └── LairActionNotification.test.tsx

src/lib/combat/
├── combatSessionAdapter.ts              # Data layer
├── combatSessionStore.ts                # State hook (optional; can use useState)
├── combatHelpers.ts                     # Utilities
├── undoRedoManager.ts                   # Undo/redo logic
└── __tests__/
    ├── combatSessionAdapter.test.ts
    ├── combatHelpers.test.ts
    └── undoRedoManager.test.ts

src/lib/schemas/
└── combat.ts                            # Zod schemas

specs/009-combat-tracker/
├── research.md                          # Phase 0 research (completed)
├── data-model.md                        # This data model (Phase 1)
├── quickstart.md                        # Developer quickstart (Phase 1)
└── contracts/
    └── combat-session.contract.ts       # API contract

tests/e2e/
├── combat-tracker.spec.ts               # Playwright tests
└── fixtures/
    └── combat-sessions.ts               # Mock session fixtures

tests/integration/
└── combat-tracker.integration.test.ts   # Integration tests
```

### Modified Files

```
src/app/layout.tsx                       # Add combat route link (if needed)
docs/Feature-Roadmap.md                  # Mark Feature 009 as "In Progress" → "Complete"
```

---

## Test Plan

### Unit Test Coverage (Target: 80%+)

1. **combatHelpers.test.ts** (8 test suites)
   - Turn advancement: 3 participants, 5 participants, wrap-around
   - Damage application: normal, temp HP first, overkill
   - Effect duration: countdown, permanent effects
   - Sorting: by initiative value

2. **undoRedoManager.test.ts** (5 test suites)
   - Push/undo/redo cycle
   - Empty stack edge cases
   - History count accuracy

3. **combatSessionAdapter.test.ts** (4 test suites)
   - Save/load from localStorage
   - Validation on load
   - Error handling (quota, corruption)

4. **Component tests** (6 test suites × 2–3 tests each = 12–18 tests)
   - InitiativeOrder: render, sort, highlight
   - HPTracker: render, input, apply damage
   - StatusEffectsPanel: add, remove, display
   - LairActionNotification: show, hide
   - CombatLog: render, collapse
   - CombatTracker: integration

### Integration Test Coverage

- **combat-tracker.integration.test.ts**
  - Load session → render components → apply damage → verify state persisted
  - Multi-step undo/redo → verify state stack

### E2E Test Coverage (Playwright)

- **US1**: Load session, verify display
- **US2**: Turn advancement cycle
- **US3**: Damage → healing flow
- **US4**: Status effect lifecycle
- **US5**: Lair action notification
- **US6**: Combat log growth

### Accessibility & Performance Tests

- **axe-playwright**: No accessibility violations
- **Mobile**: Touch interactions work on 375px viewport
- **Performance**: 50-participant list renders < 1s, turn advance < 100ms

---

## Rollout & Monitoring Plan

### Development Workflow: Per-Component Codacy Scans

**Important**: While T077 (Phase 9) serves as the final integration audit, per-component Codacy scans should be run during development as each major component file is completed. This catches quality issues early and prevents rework.

**Recommended workflow during implementation**:

- After implementing `CombatTracker.tsx`: Run `codacy-cli analyze --file src/components/combat/CombatTracker.tsx`
- After implementing `InitiativeOrder.tsx`: Run `codacy-cli analyze --file src/components/combat/InitiativeOrder.tsx`
- After implementing each adapter (`combatSessionAdapter.ts`, etc.): Run Codacy on that file
- After implementing each utility (`combatHelpers.ts`, etc.): Run Codacy on that file

This is part of the standard developer workflow per `CONTRIBUTING.md` codacy.instructions.md. It is **not a separate task**, but rather a quality gate developers should apply proactively during implementation.

**T077 (Phase 9)** then serves as the final project-wide Codacy scan to catch any remaining issues before PR merge.

### Pre-Merge Checklist

- [ ] All unit tests pass locally (`npm test`)
- [ ] All E2E tests pass locally (`npm run test:e2e`)
- [ ] TypeScript strict mode passes (`npm run type-check`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Markdown linting passes (`npm run lint:markdown`)
- [ ] Test coverage ≥ 80% on touched code
- [ ] Codacy CLI analysis clean (no new quality issues)
- [ ] Build succeeds (`npm run build`)
- [ ] PR description includes resolved issues and manual test notes

### Post-Merge (Feature Flags & Monitoring)

1. **Feature Flag** (if applicable, Feature 057):
   - Deployed behind a feature flag to allow gradual rollout
   - Can be toggled off if critical issues found

2. **Error Monitoring**:
   - Watch for localStorage quota errors (publish error count to logs)
   - Monitor undo/redo stack memory usage (alert if > 50MB)

3. **Performance Metrics** (optional, Feature 046):
   - Track turn advancement latency (target < 100ms)
   - Track session load time (target < 500ms)

4. **User Feedback**:
   - Collect feedback from beta GMs (informal)
   - Log common pain points (e.g., mobile usability, status effect confusion)

### Kill-Switch Plan (If Critical Issue Found)

1. If session state corrupts: rollback feature branch, restore to previous commit
2. If performance degrades: disable virtualization (if added), reduce animation
3. If localStorage quota issues: clear old log entries on load, show user warning

### Future Integration Points (Features 036+)

- **Feature 036** (Backend API): Replace `combatSessionAdapter` implementation to use HTTP endpoints
- **Feature 037** (Initiative System): Add initiative rolling UI
- **Feature 046** (Advanced Logging): Enhance CombatLog with filtering, search, export
- **Feature 058** (Collaborative Combat): Add real-time sync via WebSocket

---

## Handoff Package

### Deliverables

1. **Working Feature**
   - Combat Tracker page loads with mock session data
   - Turn advancement, damage/healing application fully functional
   - Status effects, lair action notifications, combat log working
   - localStorage persistence survives page reload
   - Undo/redo functional and tested

2. **Test Suite**
   - 40+ unit tests (80%+ coverage)
   - 12+ integration tests
   - 6 E2E tests covering all user stories
   - All tests passing, CI clean

3. **Documentation**
   - `specs/009-combat-tracker/research.md` — Research findings and decisions
   - `specs/009-combat-tracker/data-model.md` — Entity definitions and Zod schemas
   - `specs/009-combat-tracker/quickstart.md` — Developer quickstart guide
   - `specs/009-combat-tracker/contracts/combat-session.contract.ts` — API contract for future integration
   - Inline code comments and JSDoc for complex logic

4. **Code Quality**
   - All files ≤ 450 lines
   - All functions ≤ 50 lines
   - No code duplication (DRY)
   - TypeScript strict mode
   - Codacy analysis clean
   - Accessibility: all ARIA labels present, keyboard navigation tested

5. **PR Ready**
   - Feature branch pushed to remote
   - Conventional commit title: `feat: add combat tracker page (F009)`
   - PR description includes related issue, manual test instructions, known limitations
   - All CI checks passing (linting, tests, build, Codacy)
   - Ready for code review and merge

### Known Limitations (Documented for Future Work)

1. **Death Saves**: Not implemented; basic unconsciousness only (HP ≤ 0 → label)
2. **Legendary Actions**: Out of scope; requires encounter data structure (Feature 037)
3. **Real-Time Sync**: No multiplayer; each GM has isolated session (Feature 058)
4. **Backend Persistence**: MVP uses localStorage; Feature 036 adds MongoDB persistence
5. **Offline Reconciliation**: Not implemented; Feature 032 adds offline support

---

## Next Steps (for Implementer)

1. **Phase 0**: Research findings (already completed above)
2. **Phase 1**: Generate `research.md`, `data-model.md`, `quickstart.md`, contracts
3. **Phase 1**: Update copilot-instructions.md (if needed, via agent context script)
4. **Phase 2**: Create feature branch, start with combatHelpers.test.ts (TDD-first)
5. **Phase 2**: Implement all unit tests → pass tests → refactor
6. **Phase B**: Implement components following TDD cycle
7. **Phase C**: E2E tests for all user stories
8. **Phase D**: Accessibility audit, mobile testing, edge case handling
9. **Phase D**: Codacy analysis, fix any quality issues
10. **Merge**: PR review, address feedback, merge to main

---

**Plan Status**: ✅ Complete  
**Generated**: 2025-11-11  
**Approval**: Awaiting implementer sign-off before Phase 2 execution
