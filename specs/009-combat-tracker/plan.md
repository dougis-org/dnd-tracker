# Implementation Plan - Combat Tracker Page (Feature 009)

**Feature**: Combat Tracker Page (UI-First, Phase 1)  
**Branch**: `feature/009-combat-tracker`  
**Duration**: Day 2 (per roadmap)  
**Status**: Specification Complete; Ready for Implementation

## Summary

This feature implements the Combat Tracker page (/combat) as a UI-first feature using mock data. The page displays an active combat session with initiative order, turn tracking, HP management, status effects, and a combat log. This is a foundational UI component that will integrate with backend models in Phase 5 (Features 036–040).

### Key Goals

1. Deliver a fully functional, mobile-optimized combat tracker UI.
2. Establish component patterns and data structures for combat management.
3. Achieve 80%+ test coverage with unit, integration, and E2E tests.
4. Prepare the UI for backend integration (Feature 036+) with a clean adapter layer.

## Scope

### In Scope

- Combat Tracker page at `/app/combat/page.tsx`
- 5 core components: CombatTracker, InitiativeOrder, HPTracker, StatusEffectsPanel, CombatLog
- Mock adapter for loading/persisting session data (localStorage or in-memory)
- P1 user stories: Load session, advance turn, apply damage/healing
- P2 user stories: Status effects, lair action notification (if time permits)
- Full responsive design (mobile-first)
- Accessibility (WCAG 2.1 Level AA)
- 80%+ unit + integration test coverage
- E2E smoke tests for critical user flows

### Out of Scope

- Backend models (Feature 036)
- Initiative rolling/calculation (Feature 037)
- Real API integration (Feature 036+)
- Advanced features: undo/redo, detailed logging, collaborative mode

## Approach & Design Brief

### Architecture

```
CombatTracker (container)
├── InitiativeOrder (turn order display)
├── HPTracker (damage/healing for selected participant)
├── StatusEffectsPanel (add/remove conditions)
├── RoundTurnCounter (round & turn display)
└── CombatLog (collapsible action log)
```

### Data Flow

1. **Load**: `CombatTracker` loads session via `CombatSessionAdapter.getSession(sessionId)`.
2. **State**: Session data cached in component state; optimistic updates for user actions.
3. **Actions**: User actions (damage, heal, turn advance) trigger adapter methods, which update state and log actions.
4. **Sync**: Changes persisted to localStorage or backend (adapter-agnostic).

### Component Design

- **CombatTracker**: Main container; manages session state, logs, lair action notification.
- **InitiativeOrder**: Displays sorted initiative list; highlights current turn.
- **HPTracker**: Shows/updates HP for selected participant; quick damage buttons.
- **StatusEffectsPanel**: Add/remove/view status effects; pills with duration.
- **CombatLog**: Scrollable list of recent actions; collapsible.

### Styling

- Use Tailwind CSS 4.x and shadcn/ui components.
- Dark mode first (gaming tables are dark).
- High contrast for visibility.
- Responsive: mobile-first approach.

## Step-by-Step Implementation Plan (TDD-First)

### Phase 1: Failing Tests (Day 1)

1. **Setup test infrastructure**:
   - Create test files for all components.
   - Set up test fixtures (mock session data, mock adapter).
   - Configure jest & React Testing Library.

2. **Write failing tests** for User Story 1 (Load session):
   - `tests/unit/components/combat/CombatTracker.test.tsx`:
     - Should render without crashing
     - Should load session and display participants
   - `tests/unit/components/combat/InitiativeOrder.test.tsx`:
     - Should display participants sorted by initiative
     - Should highlight current turn
     - Should display round/turn counter
     - Should display status effect pills
   - Utility tests:
     - `tests/unit/lib/adapters/combat-session.adapter.test.ts`: adapter returns mock data

3. **Run tests to confirm they fail**:

   ```bash
   npm run test:ci:parallel
   ```

   Expected: All tests fail (components don't exist yet).

---

### Phase 2: Implementation (Day 1–2)

#### Step 1: Create Type Definitions & Adapter

**File**: `src/types/combat-session.ts`

```typescript
export interface CombatSession {
  id: string;
  encounterId: string;
  status: 'active' | 'paused' | 'ended';
  currentRoundNumber: number;
  currentTurnIndex: number;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  orgId?: string;
}

export interface Participant {
  id: string;
  name: string;
  displayName?: string;
  type: 'character' | 'monster' | 'npc';
  initiativeValue: number;
  maxHP: number;
  currentHP: number;
  temporaryHP: number;
  acValue: number;
  statusEffects: StatusEffect[];
  notes?: string;
  metadata?: {
    size?: string;
    alignment?: string;
    tags?: string[];
    iconUrl?: string;
  };
}

export interface StatusEffect {
  id: string;
  name: string;
  durationInRounds: number | null;
  appliedAtRound: number;
  category?: string;
  description?: string;
  iconUrl?: string;
}

export interface CombatLogEntry {
  id: string;
  timestamp: Date;
  roundNumber: number;
  turnIndex: number;
  actionType: 'damage' | 'heal' | 'effect_applied' | 'effect_removed' | 'initiative_set' | 'turn_advanced' | 'round_started' | 'session_started' | 'session_paused' | 'session_ended';
  actorId: string;
  targetId?: string;
  details: Record<string, unknown>;
  description: string;
}
```

**File**: `src/lib/adapters/combat-session.adapter.ts`

```typescript
import { CombatSession } from '@/types/combat-session';

interface CombatSessionAdapter {
  getSession(sessionId: string): Promise<CombatSession>;
  updateSession(sessionId: string, updates: Partial<CombatSession>): Promise<CombatSession>;
  applyDamage(sessionId: string, participantId: string, damage: number): Promise<void>;
  applyHealing(sessionId: string, participantId: string, healing: number): Promise<void>;
  addStatusEffect(sessionId: string, participantId: string, effect: StatusEffect): Promise<void>;
  removeStatusEffect(sessionId: string, participantId: string, effectId: string): Promise<void>;
  logAction(sessionId: string, logEntry: CombatLogEntry): Promise<void>;
  getLogEntries(sessionId: string, limit?: number): Promise<CombatLogEntry[]>;
}

// Mock implementation (localStorage or in-memory)
export const mockCombatSessionAdapter: CombatSessionAdapter = {
  async getSession(sessionId: string): Promise<CombatSession> {
    // Return mock session or load from localStorage
    return getMockSession(sessionId);
  },
  // ... other methods
};

function getMockSession(sessionId: string): CombatSession {
  // Return mock CombatSession (see data-model.md)
  return {
    id: sessionId,
    encounterId: 'encounter-001',
    status: 'active',
    currentRoundNumber: 3,
    currentTurnIndex: 1,
    participants: [
      // ... 6 mock participants
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'user-001',
  };
}
```

#### Step 2: Create Components (Basic Structure)

**File**: `src/components/combat/CombatTracker.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { CombatSession } from '@/types/combat-session';
import { mockCombatSessionAdapter } from '@/lib/adapters/combat-session.adapter';
import { InitiativeOrder } from './InitiativeOrder';
import { HPTracker } from './HPTracker';
import { StatusEffectsPanel } from './StatusEffectsPanel';
import { CombatLog } from './CombatLog';

interface CombatTrackerProps {
  sessionId: string;
}

export function CombatTracker({ sessionId }: CombatTrackerProps) {
  const [session, setSession] = useState<CombatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await mockCombatSessionAdapter.getSession(sessionId);
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load session'));
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>No session found</div>;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Round/Turn Counter */}
      <div className="text-center text-2xl font-bold">
        Round {session.currentRoundNumber}, Turn {session.currentTurnIndex + 1}/{session.participants.length}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Initiative Order */}
        <div className="md:col-span-2">
          <InitiativeOrder
            participants={session.participants}
            currentTurnIndex={session.currentTurnIndex}
            onNextTurn={() => {
              // Implement turn advancement
            }}
          />
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4">
          {/* HP Tracker & Status Effects for selected participant */}
          {session.participants[session.currentTurnIndex] && (
            <>
              <HPTracker
                participant={session.participants[session.currentTurnIndex]}
                onDamageApplied={(damage) => {
                  // Implement damage application
                }}
              />
              <StatusEffectsPanel
                participant={session.participants[session.currentTurnIndex]}
                onEffectAdded={(effect) => {
                  // Implement effect addition
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Combat Log */}
      <CombatLog entries={[]} onCollapse={() => {}} />
    </div>
  );
}
```

**File**: `src/components/combat/InitiativeOrder.tsx`

```typescript
import { Participant } from '@/types/combat-session';

interface InitiativeOrderProps {
  participants: Participant[];
  currentTurnIndex: number;
  onNextTurn?: () => void;
}

export function InitiativeOrder({
  participants,
  currentTurnIndex,
  onNextTurn,
}: InitiativeOrderProps) {
  // Sort by initiative (highest first)
  const sorted = [...participants].sort((a, b) => b.initiativeValue - a.initiativeValue);

  return (
    <div className="flex flex-col gap-2 border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Initiative Order</h2>
      {sorted.map((participant, idx) => (
        <div
          key={participant.id}
          className={`p-3 rounded border ${
            idx === currentTurnIndex ? 'bg-blue-100 border-blue-500' : 'bg-gray-100'
          }`}
        >
          <div className="flex justify-between">
            <span className="font-semibold">{participant.name}</span>
            <span className="text-sm">{participant.initiativeValue}</span>
          </div>
          <div className="text-sm">{participant.currentHP}/{participant.maxHP} HP</div>
          {participant.statusEffects.length > 0 && (
            <div className="flex gap-1 mt-2">
              {participant.statusEffects.map((effect) => (
                <span key={effect.id} className="bg-red-200 px-2 py-1 rounded text-xs">
                  {effect.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
      <button onClick={onNextTurn} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Next Turn
      </button>
    </div>
  );
}
```

**Files**: Similar structure for `HPTracker.tsx`, `StatusEffectsPanel.tsx`, `CombatLog.tsx`.

#### Step 3: Create Page Component

**File**: `src/app/combat/page.tsx`

```typescript
'use client';

import { CombatTracker } from '@/components/combat/CombatTracker';

export default function CombatPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Combat Tracker</h1>
      <CombatTracker sessionId="session-001" />
    </div>
  );
}
```

#### Step 4: Run Tests & Iterate

1. Run tests:

   ```bash
   npm run test:ci:parallel
   ```

2. Fix failing tests by implementing components.

3. Run lint & type-check:

   ```bash
   npm run type-check
   npm run lint
   ```

4. Commit progress:

   ```bash
   npm run test:ci:parallel && npm run build
   git add . && git commit -m "feat: combat tracker component structure"
   ```

---

### Phase 3: Complete Features (Day 2)

1. **Implement User Story 2 (Advance Turn)**:
   - Add `onNextTurn()` and `onPreviousTurn()` logic.
   - Update `currentTurnIndex` state.
   - Increment round when last participant's turn ends.

2. **Implement User Story 3 (Damage/Healing)**:
   - Add HP input to `HPTracker`.
   - Validate HP changes (0 to maxHP).
   - Update participant HP state.
   - Log action to combat log.

3. **Implement User Story 4 (Status Effects)** (if time permits):
   - Add status effect modal/dropdown.
   - Add effect to participant.
   - Decrement duration at round end.
   - Remove effect button.

4. **Implement User Story 5 (Lair Action Notification)** (if time permits):
   - Detect when current turn reaches initiative 20.
   - Show notification banner.
   - Dismiss on acknowledge.

5. **Polish & Mobile Optimization**:
   - Ensure responsive layout (mobile-first).
   - Dark mode support.
   - Touch-friendly button sizes (44×44 px min).
   - Accessibility (ARIA labels, keyboard nav).

---

### Phase 4: Testing & Quality (Day 2)

1. **Write remaining tests**:
   - User interaction tests (click Next Turn, enter damage, etc.).
   - Edge cases (zero HP, initiative ties, large encounters).

2. **Achieve 80%+ coverage**:

   ```bash
   npm run test:coverage
   ```

3. **E2E smoke tests**:

   ```bash
   npm run test:e2e
   ```

4. **Accessibility audit**:
   - Check keyboard navigation.
   - Check ARIA labels.
   - Check color contrast.

5. **Performance checks**:
   - Ensure 50+ participants don't cause lag.
   - Use React DevTools Profiler.

---

## Effort, Risks, and Mitigations

### Effort Estimate

- **Phase 1 (Tests)**: 2–3 hours
- **Phase 2 (Implementation)**: 4–5 hours
- **Phase 3 (Features)**: 3–4 hours
- **Phase 4 (Testing & Polish)**: 2–3 hours
- **Total**: 11–15 hours (within Day 2 timeframe)

### Risks

1. **Mock data complexity**: Status effects, temporary HP, unconsciousness logic may be underestimated.
   - **Mitigation**: Use simplified mock data; focus on core HP tracking first.

2. **Responsive design challenges**: Mobile layout at 375px may require redesign.
   - **Mitigation**: Test on physical device early; use Tailwind responsive utilities.

3. **Performance with large encounters (50+ participants)**: Virtual scrolling may be needed.
   - **Mitigation**: Implement basic scrolling first; add virtual scrolling if needed.

4. **Lair action notification timing**: Detecting initiative 20 across turn advances may be tricky.
   - **Mitigation**: Keep logic simple; show notification whenever currentTurnIndex points to a participant with initiative >= 20.

### Mitigations

- Pair with designer/stakeholder for UI review after Phase 2.
- Run local performance tests with 50 participants before finalizing.
- Use Playwright for E2E testing; catch regression early.
- Keep PR lean; merge early and often to avoid merge conflicts.

---

## File-Level Change List

### New Files

- `src/types/combat-session.ts` – Type definitions
- `src/types/status-effect.ts` – Status effect types (if separate)
- `src/lib/adapters/combat-session.adapter.ts` – Mock adapter
- `src/components/combat/CombatTracker.tsx` – Main container
- `src/components/combat/InitiativeOrder.tsx` – Initiative list
- `src/components/combat/HPTracker.tsx` – HP management
- `src/components/combat/StatusEffectsPanel.tsx` – Status effect UI
- `src/components/combat/RoundTurnCounter.tsx` – Round/turn display (optional)
- `src/components/combat/CombatLog.tsx` – Action log
- `src/components/combat/LairActionNotification.tsx` – Notification (optional)
- `src/app/combat/page.tsx` – Combat tracker page
- `tests/unit/components/combat/*.test.tsx` – Component tests
- `tests/integration/combat/*.test.tsx` – Integration tests
- `tests/e2e/combat.spec.ts` – E2E tests
- `tests/fixtures/mock-combat-session.ts` – Mock data
- `tests/test-helpers/combat-helpers.ts` – Shared test utilities

### Modified Files

- `.env.example` (if new env vars needed)
- `src/app/layout.tsx` (if navigation needs Combat link)
- `tsconfig.json` (if path aliases added)

---

## Test Plan

### Unit Tests (Target: 80%+ coverage)

**CombatTracker**:

- Loads session on mount
- Displays all participants
- Handles loading/error states
- Calls adapter methods on user action

**InitiativeOrder**:

- Sorts participants by initiative (descending)
- Highlights current turn participant
- Displays HP and status effects
- Calls `onNextTurn()` when button clicked

**HPTracker**:

- Displays current and max HP
- Validates damage/healing input (positive, reasonable bounds)
- Prevents HP exceeding max or going below 0
- Shows unconscious/dead state at HP ≤ 0
- Calls callback on damage/healing applied

**StatusEffectsPanel**:

- Displays status effects as pills
- Shows duration if applicable
- Opens effect menu on add button click
- Removes effect on X button click
- Calls callbacks appropriately

**CombatLog**:

- Displays recent entries
- Scrolls to show older entries
- Collapses/expands on button click
- Optionally filters by action type

### Integration Tests

**Combat Flow**:

- Load session → Verify state
- Advance turn → Verify turn index increments, round increments at end of cycle
- Apply damage → Verify HP updates, log entry created
- Apply healing → Verify HP increases (capped at max)
- Add status effect → Verify effect displays, duration ticks down at round end

### E2E Tests

**User Stories 1–5** as Playwright tests:

- Navigate to `/combat`
- Load a session
- Advance turn (repeat to end of round)
- Apply damage to a participant
- Add a status effect
- Verify lair action notification (if applicable)

---

## Rollout & Monitoring Plan

### Rollout Strategy

1. **Week 1 (Phase 1)**: Feature branch; request design review.
2. **Week 1 (Phase 2–3)**: Feature complete; open PR.
3. **Week 1 (Phase 4)**: PR review, address feedback.
4. **Week 2**: Merge to main (assuming Phase 5 integration still in progress).

### Monitoring

- **Local testing**: Ensure 80%+ coverage, all tests pass, no TypeScript errors.
- **CI**: GitHub Actions runs lint, build, tests on PR.
- **Codacy**: Code quality checks; ensure no new issues introduced.
- **Stakeholder review**: Design/UX feedback before merge.

### Kill Switch / Rollback

- Feature is UI-only (no backend changes); easy to toggle via route guards if needed.
- If issues discovered post-merge, revert PR or add `disabled` feature flag.

---

## Handoff Package

### Artifacts

- ✅ Specification: `specs/009-combat-tracker/spec.md`
- ✅ Data Model: `specs/009-combat-tracker/data-model.md`
- ✅ Research: `specs/009-combat-tracker/research.md`
- ✅ Quick Start: `specs/009-combat-tracker/quickstart.md`
- ✅ Component Contracts: `specs/009-combat-tracker/contracts/component-api.md`
- ✅ Implementation Plan (this file)

### Code Artifacts

- Combat Tracker page and components (src/app/combat/, src/components/combat/)
- Mock adapter for session data (src/lib/adapters/)
- Type definitions (src/types/)
- Test suite (tests/unit/, tests/integration/, tests/e2e/)

### Documentation

- Inline code comments explaining logic.
- JSDoc for public functions/components.
- README or guide for extending components.

### Next Phase

- **Feature 036**: Implement CombatSession model & API.
- **Feature 037**: Implement Initiative rolling system.
- **Feature 038**: Integrate Combat Tracker UI with backend models.

---

## Dependencies & Prerequisites

- ✅ Feature 001 (Design System): Tailwind, shadcn/ui available.
- ✅ Feature 002 (Navigation): Navigation structure established.
- ⏳ Feature 036 (CombatSession Model): Needed for Phase 5 integration; not blocking this feature.
- ⏳ Feature 037 (Initiative System): Needed for Phase 5; not blocking this feature.

---

## Quality Checklist

Before opening PR:

- [ ] All tests pass: `npm run test:ci:parallel`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Lint passes: `npm run lint`
- [ ] Markdown lint passes: `npm run lint:markdown`
- [ ] Build succeeds: `npm run build`
- [ ] Coverage ≥ 80%: `npm run test:coverage`
- [ ] No new Codacy issues
- [ ] Mobile view tested (375px, 768px, 1024px)
- [ ] Dark mode tested
- [ ] Accessibility tested (keyboard, screen reader, color contrast)
- [ ] PR description includes feature spec link and testing notes

---

**Ready for implementation. Proceed with Phase 1 (Failing Tests).**
