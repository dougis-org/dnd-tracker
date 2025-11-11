# Combat Tracker — Developer Quickstart

**Date**: 2025-11-11  
**Feature**: Feature 009 — Combat Tracker  
**Target**: Developers implementing this feature  
**Status**: ✅ Complete

---

## Overview

This quickstart guide provides developers with everything needed to implement the Combat Tracker feature. It covers:

- Project structure & file organization
- Key dependencies & setup
- Component API reference (props, event handlers)
- Helper function examples
- Testing strategy & examples
- Common workflows & patterns
- Debugging tips

---

## Table of Contents

1. [File Structure](#file-structure)
2. [Key Dependencies](#key-dependencies)
3. [Component Architecture](#component-architecture)
4. [Helper Functions & Utilities](#helper-functions--utilities)
5. [State Management](#state-management)
6. [Testing Patterns](#testing-patterns)
7. [Common Workflows](#common-workflows)
8. [Debugging & Troubleshooting](#debugging--troubleshooting)

---

## File Structure

```
src/
├── app/combat/
│   ├── layout.tsx                    # Page wrapper layout
│   └── page.tsx                      # Main entry point (renders CombatTracker)
│
├── components/combat/
│   ├── index.ts                      # Exports all components
│   ├── CombatTracker.tsx             # Main container (orchestrates state + components)
│   ├── InitiativeOrder.tsx           # Displays initiative list
│   ├── HPTracker.tsx                 # HP input & display
│   ├── StatusEffectsPanel.tsx        # Status effect management
│   ├── CombatLog.tsx                 # Action log display
│   ├── LairActionNotification.tsx    # Initiative 20 notification
│   └── __tests__/
│       ├── CombatTracker.test.tsx
│       ├── InitiativeOrder.test.tsx
│       ├── HPTracker.test.tsx
│       ├── StatusEffectsPanel.test.tsx
│       ├── CombatLog.test.tsx
│       └── LairActionNotification.test.tsx
│
└── lib/combat/
    ├── combatSessionAdapter.ts       # Data persistence layer
    ├── combatSessionStore.ts         # (optional) Custom hook for state
    ├── combatHelpers.ts              # Pure utility functions
    ├── undoRedoManager.ts            # Undo/redo state stack
    └── __tests__/
        ├── combatSessionAdapter.test.ts
        ├── combatHelpers.test.ts
        └── undoRedoManager.test.ts

src/lib/schemas/
└── combat.ts                         # Zod validation schemas

specs/009-combat-tracker/
├── spec.md                           # Feature requirements
├── research.md                       # Research findings & decisions
├── data-model.md                     # Entity definitions
├── quickstart.md                     # This file
└── contracts/
    └── combat-session.contract.ts    # TypeScript types
```

---

## Key Dependencies

**Already installed** (in `package.json`):

```json
{
  "react": "19.0.0",
  "next": "16.0.1",
  "zod": "^3.23.8",
  "tailwindcss": "^4.0.0",
  "jest": "^30.2.0",
  "@testing-library/react": "^16.1.0",
  "@playwright/test": "^1.56.1"
}
```

**No new dependencies required** for MVP.

---

## Component Architecture

### CombatTracker (Main Container)

**Purpose**: Root component that loads session, manages state, coordinates sub-components.

**File**: `src/components/combat/CombatTracker.tsx`

**Props**:

```typescript
interface CombatTrackerProps {
  sessionId?: string;           // Optional; if not provided, use mock
  onSessionEnd?: () => void;    // Called when user ends combat
  onSessionError?: (error: Error) => void;
}
```

**State** (internal):

```typescript
const [session, setSession] = useState<CombatSession>(mockSession);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);
const [undoStack, setUndoStack] = useState<CombatSession[]>([]);
const [redoStack, setRedoStack] = useState<CombatSession[]>([]);
const [currentLogEntries, setCurrentLogEntries] = useState<CombatLogEntry[]>([]);
```

**Key Methods**:

```typescript
// Load session on mount
useEffect(() => {
  adapter.loadSession(sessionId ?? 'mock')
    .then(setSession)
    .catch(error => { setError(error); });
}, [sessionId]);

// Apply damage
const handleApplyDamage = async (participantId: string, amount: number) => {
  const participant = session.participants.find(p => p.id === participantId);
  const updated = applyDamage(participant, amount);
  // ... update session
};

// Advance turn
const handleNextTurn = () => {
  const newSession = advanceTurn(session);
  setSession(newSession);
  adapter.saveSession(newSession);
  // ... add log entry
};

// Undo
const handleUndo = () => {
  if (undoStack.length > 0) {
    setRedoStack([...redoStack, session]);
    setSession(undoStack[undoStack.length - 1]);
    setUndoStack(undoStack.slice(0, -1));
  }
};
```

**Renders**:

```typescript
return (
  <div className="combat-tracker">
    {isLoading && <Spinner />}
    {error && <ErrorBoundary error={error} />}
    {!isLoading && (
      <>
        <InitiativeOrder
          participants={session.participants}
          currentTurnIndex={session.currentTurnIndex}
        />
        <div className="hp-and-effects">
          {session.participants.map(p => (
            <HPTracker
              key={p.id}
              participant={p}
              onDamageApply={(amount) => handleApplyDamage(p.id, amount)}
              onHealingApply={(amount) => handleApplyHealing(p.id, amount)}
            />
          ))}
        </div>
        <StatusEffectsPanel
          participant={session.participants[session.currentTurnIndex]}
          onEffectAdd={handleEffectAdd}
          onEffectRemove={handleEffectRemove}
        />
        <LairActionNotification
          currentTurnParticipant={session.participants[session.currentTurnIndex]}
          lairActionInitiative={session.lairActionInitiative}
          onTrigger={handleTriggerLairActions}
        />
        <CombatLog entries={currentLogEntries} />
        <div className="controls">
          <button onClick={handlePreviousTurn} disabled={session.currentRoundNumber === 1 && session.currentTurnIndex === 0}>
            Previous Turn
          </button>
          <button onClick={handleNextTurn}>Next Turn</button>
          <button onClick={handleUndo} disabled={undoStack.length === 0}>Undo</button>
          <button onClick={handleRedo} disabled={redoStack.length === 0}>Redo</button>
        </div>
      </>
    )}
  </div>
);
```

---

### InitiativeOrder (Display Component)

**Purpose**: Render participants in initiative order with current turn highlight.

**File**: `src/components/combat/InitiativeOrder.tsx`

**Props**:

```typescript
interface InitiativeOrderProps {
  participants: Participant[];
  currentTurnIndex: number;
}
```

**Renders**:

```typescript
const sorted = [...participants].sort((a, b) => b.initiativeValue - a.initiativeValue);

return (
  <div className="initiative-order">
    <h2>Initiative Order</h2>
    <ul>
      {sorted.map((p, index) => (
        <li
          key={p.id}
          className={
            sorted[index].id === participants[currentTurnIndex].id
              ? 'current-turn'
              : ''
          }
        >
          <span className="initiative">{p.initiativeValue}</span>
          <span className="name">{p.name}</span>
          <span className="hp">{p.currentHP}/{p.maxHP}</span>
        </li>
      ))}
    </ul>
  </div>
);
```

---

### HPTracker (Input Component)

**Purpose**: Display and modify participant HP.

**File**: `src/components/combat/HPTracker.tsx`

**Props**:

```typescript
interface HPTrackerProps {
  participant: Participant;
  onDamageApply: (amount: number) => void;
  onHealingApply: (amount: number) => void;
}
```

**State**:

```typescript
const [damageInput, setDamageInput] = useState('');
const [healingInput, setHealingInput] = useState('');
```

**Renders**:

```typescript
return (
  <div className="hp-tracker">
    <h3>{participant.name}</h3>
    
    {/* HP Bar */}
    <div className="hp-bar-container">
      <div
        className="hp-bar-fill"
        style={{ width: `${(participant.currentHP / participant.maxHP) * 100}%` }}
      />
    </div>
    
    {/* HP Text */}
    <p className={participant.currentHP <= 0 ? 'unconscious' : ''}>
      {Math.max(0, participant.currentHP)}/{participant.maxHP} HP
      {participant.temporaryHP > 0 && ` + ${participant.temporaryHP} temp`}
    </p>
    
    {/* Damage Input */}
    <div className="damage-input">
      <input
        type="number"
        placeholder="Damage"
        value={damageInput}
        onChange={(e) => setDamageInput(e.target.value)}
      />
      <button onClick={() => { onDamageApply(parseInt(damageInput)); setDamageInput(''); }}>
        Apply Damage
      </button>
    </div>
    
    {/* Healing Input */}
    <div className="healing-input">
      <input
        type="number"
        placeholder="Healing"
        value={healingInput}
        onChange={(e) => setHealingInput(e.target.value)}
      />
      <button onClick={() => { onHealingApply(parseInt(healingInput)); setHealingInput(''); }}>
        Apply Healing
      </button>
    </div>
  </div>
);
```

---

## Helper Functions & Utilities

**File**: `src/lib/combat/combatHelpers.ts`

### advanceTurn

```typescript
export function advanceTurn(session: CombatSession): CombatSession {
  const nextTurnIndex = (session.currentTurnIndex + 1) % session.participants.length;
  const newRoundNumber = nextTurnIndex === 0 ? session.currentRoundNumber + 1 : session.currentRoundNumber;
  
  // Decrement effect durations if round advanced
  let participants = session.participants;
  if (nextTurnIndex === 0) {
    participants = session.participants.map(p => ({
      ...p,
      statusEffects: p.statusEffects
        .map(e => e.durationInRounds !== null ? { ...e, durationInRounds: e.durationInRounds - 1 } : e)
        .filter(e => e.durationInRounds === null || e.durationInRounds > 0),
    }));
  }
  
  return {
    ...session,
    currentTurnIndex: nextTurnIndex,
    currentRoundNumber: newRoundNumber,
    participants,
    updatedAt: new Date().toISOString(),
  };
}
```

### applyDamage

```typescript
export function applyDamage(participant: Participant, damage: number): Participant {
  const tempHPRemaining = Math.max(0, participant.temporaryHP - damage);
  const damageToCurrentHP = Math.max(0, damage - (participant.temporaryHP - tempHPRemaining));
  const newCurrentHP = participant.currentHP - damageToCurrentHP;
  
  return {
    ...participant,
    temporaryHP: tempHPRemaining,
    currentHP: newCurrentHP,
  };
}
```

### applyHealing

```typescript
export function applyHealing(participant: Participant, healing: number): Participant {
  return {
    ...participant,
    currentHP: Math.min(participant.maxHP, participant.currentHP + healing),
  };
}
```

### sortParticipantsByInitiative

```typescript
export function sortParticipantsByInitiative(participants: Participant[]): Participant[] {
  return [...participants].sort((a, b) => b.initiativeValue - a.initiativeValue);
}
```

---

## State Management

### Using useState Hooks

```typescript
// In CombatTracker.tsx
const [session, setSession] = useState<CombatSession>(mockSession);

// Update session on damage
const handleApplyDamage = (participantId: string, amount: number) => {
  setSession(prev => ({
    ...prev,
    participants: prev.participants.map(p =>
      p.id === participantId ? applyDamage(p, amount) : p
    ),
    updatedAt: new Date().toISOString(),
  }));
};
```

### Using the Adapter

```typescript
// In combatSessionAdapter.ts
export async function loadSession(sessionId: string): Promise<CombatSession> {
  const stored = localStorage.getItem(`combatSession-${sessionId}`);
  if (!stored) throw new Error('Session not found');
  
  const parsed = JSON.parse(stored);
  return CombatSessionSchema.parse(parsed);
}

export async function saveSession(session: CombatSession): Promise<void> {
  localStorage.setItem(`combatSession-${session.id}`, JSON.stringify(session));
}
```

---

## Testing Patterns

### Unit Test Example (Jest)

```typescript
// src/lib/combat/__tests__/combatHelpers.test.ts
import { advanceTurn, applyDamage } from '../combatHelpers';
import { mockSession } from '../../../test-helpers/fixtures';

describe('combatHelpers', () => {
  describe('advanceTurn', () => {
    it('advances to next participant', () => {
      const session = { ...mockSession, currentTurnIndex: 0 };
      const result = advanceTurn(session);
      expect(result.currentTurnIndex).toBe(1);
    });

    it('increments round when wrapping', () => {
      const session = {
        ...mockSession,
        currentTurnIndex: mockSession.participants.length - 1,
      };
      const result = advanceTurn(session);
      expect(result.currentRoundNumber).toBe(session.currentRoundNumber + 1);
    });
  });

  describe('applyDamage', () => {
    it('applies damage to temp HP first', () => {
      const p = { ...mockSession.participants[0], temporaryHP: 5 };
      const result = applyDamage(p, 8);
      expect(result.temporaryHP).toBe(0);
      expect(result.currentHP).toBe(p.currentHP - 3);
    });
  });
});
```

### Component Test Example (React Testing Library)

```typescript
// src/components/combat/__tests__/HPTracker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { HPTracker } from '../HPTracker';
import { mockParticipant } from '../../../test-helpers/fixtures';

describe('HPTracker', () => {
  it('renders participant HP', () => {
    render(
      <HPTracker
        participant={mockParticipant}
        onDamageApply={jest.fn()}
        onHealingApply={jest.fn()}
      />
    );
    expect(screen.getByText(`${mockParticipant.currentHP}/${mockParticipant.maxHP} HP`)).toBeInTheDocument();
  });

  it('applies damage on button click', () => {
    const onDamage = jest.fn();
    render(
      <HPTracker
        participant={mockParticipant}
        onDamageApply={onDamage}
        onHealingApply={jest.fn()}
      />
    );
    
    const input = screen.getByPlaceholderText('Damage');
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByText('Apply Damage'));
    
    expect(onDamage).toHaveBeenCalledWith(5);
  });
});
```

### E2E Test Example (Playwright)

```typescript
// tests/e2e/combat-tracker.spec.ts
import { test, expect } from '@playwright/test';

test('US1: Load active combat session', async ({ page }) => {
  await page.goto('/combat');
  
  // Verify session loads
  await expect(page.locator('text=Initiative Order')).toBeVisible();
  
  // Verify initiative list
  const initiativeItems = page.locator('[class*="initiative-order"] li');
  await expect(initiativeItems).toHaveCount(2); // Mock has 2 participants
  
  // Verify current turn highlighted
  await expect(page.locator('.current-turn')).toBeVisible();
});

test('US2: Advance turn', async ({ page }) => {
  await page.goto('/combat');
  
  const nextTurnButton = page.locator('button:has-text("Next Turn")');
  await nextTurnButton.click();
  
  // Verify turn advanced (UI updates)
  const currentTurn = page.locator('.current-turn');
  const currentName = await currentTurn.locator('.name').textContent();
  expect(currentName).not.toBe('Goblin 1'); // First participant was previous turn
});

test('US3: Apply damage', async ({ page }) => {
  await page.goto('/combat');
  
  // Find damage input and apply
  const damageInput = page.locator('input[placeholder="Damage"]').first();
  await damageInput.fill('10');
  await page.locator('button:has-text("Apply Damage")').first().click();
  
  // Verify HP updated
  const hpText = page.locator('.hp-tracker p').first();
  await expect(hpText).toContainText(/\d+\/\d+ HP/);
});
```

---

## Common Workflows

### Workflow 1: Adding a New Status Effect

```typescript
// In CombatTracker.tsx
const handleAddStatusEffect = (participantId: string, effectName: string, durationRounds: number | null) => {
  setSession(prev => ({
    ...prev,
    participants: prev.participants.map(p => {
      if (p.id !== participantId) return p;
      
      const newEffect: StatusEffect = {
        id: crypto.randomUUID(),
        name: effectName,
        durationInRounds: durationRounds,
        appliedAtRound: prev.currentRoundNumber,
      };
      
      return {
        ...p,
        statusEffects: [...p.statusEffects, newEffect],
      };
    }),
  }));
  
  // Log entry
  setCurrentLogEntries([...currentLogEntries, {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    roundNumber: session.currentRoundNumber,
    turnIndex: session.currentTurnIndex,
    actionType: 'effect_applied',
    actor: session.participants[session.currentTurnIndex].id,
    target: participantId,
    details: { effectName, durationRounds },
    description: `${session.participants[session.currentTurnIndex].name} applied ${effectName} to ${session.participants.find(p => p.id === participantId)?.name}`,
  }]);
};
```

### Workflow 2: Undoing an Action

```typescript
// In CombatTracker.tsx
const handleUndo = () => {
  if (undoStack.length === 0) return;
  
  const previous = undoStack[undoStack.length - 1];
  setRedoStack([...redoStack, session]);
  setSession(previous);
  setUndoStack(undoStack.slice(0, -1));
  
  // Log undo
  setCurrentLogEntries([...currentLogEntries, {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    roundNumber: previous.currentRoundNumber,
    turnIndex: previous.currentTurnIndex,
    actionType: 'undo',
    details: {},
    description: 'Previous action undone',
  }]);
};
```

### Workflow 3: Handling Session Not Found

```typescript
// In CombatTracker.tsx
useEffect(() => {
  const load = async () => {
    try {
      const loaded = await adapter.loadSession(sessionId ?? 'mock');
      setSession(loaded);
    } catch (err) {
      // Fallback to mock
      setError(new Error('Session not found; using mock data'));
      setSession(mockSession);
    } finally {
      setIsLoading(false);
    }
  };
  
  load();
}, [sessionId]);
```

---

## Debugging & Troubleshooting

### Enable Debug Logging

```typescript
// In combatHelpers.ts
const DEBUG = process.env.NODE_ENV === 'development';

export function advanceTurn(session: CombatSession): CombatSession {
  if (DEBUG) console.log('advanceTurn:', { from: session.currentTurnIndex, to: (session.currentTurnIndex + 1) % session.participants.length });
  // ...
}
```

### Common Issues

**Issue**: HP not updating after damage  
**Debug**: Check if `adapter.saveSession()` was called; verify Zod validation passes

**Issue**: Undo/redo not working  
**Debug**: Log `undoStack` length; check if `setUndoStack` is called correctly

**Issue**: localStorage quota exceeded  
**Debug**: Check browser console for quota error; trim old log entries

**Issue**: Initiative order not sorting correctly  
**Debug**: Verify `initiativeValue` is populated; test `sortParticipantsByInitiative()` in isolation

**Issue**: Status effects not decrementing  
**Debug**: Check if `nextTurnIndex === 0` logic triggers correctly; verify `decrementEffectDurations()` called

---

## Performance Tips

1. **Avoid unnecessary re-renders**: Use `React.memo()` for list items
2. **Batch state updates**: Combine multiple `setSession()` calls into one
3. **Throttle localStorage writes**: Optional in Feature X
4. **Virtualize long lists**: If 50+ participants, use react-window

---

## Next Steps

1. Review `research.md` for design rationale
2. Review `data-model.md` for entity schemas
3. Implement in TDD order (tests first, then implementation)
4. Refer to `CONTRIBUTING.md` for code style & PR process
5. Run local tests frequently: `npm test`, `npm run test:e2e`

---

**Quickstart Status**: ✅ Complete  
**Ready for Implementation**: Yes
