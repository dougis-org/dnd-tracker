# API & Component Contracts - Combat Tracker Page (Feature 009)

## Component Contracts

### CombatTracker Component

**Purpose**: Main container component for the combat tracker UI.

**Props**:

```typescript
interface CombatTrackerProps {
  sessionId: string; // ID of the active combat session
  onTurnChange?: (newTurnIndex: number) => void; // Callback when turn advances
  onDamageApplied?: (participantId: string, damage: number) => void;
  onHealingApplied?: (participantId: string, healing: number) => void;
  onStatusEffectAdded?: (participantId: string, effect: StatusEffect) => void;
  onStatusEffectRemoved?: (participantId: string, effectId: string) => void;
}
```

**State**:

```typescript
- session: CombatSession (loaded from adapter)
- logEntries: CombatLogEntry[] (recent actions)
- selectedParticipantId?: string (for detail panel, if any)
- showLog: boolean (log panel visible?)
- lairActionNotification: { shown: boolean; dismissedAtRound?: number }
```

**Exports**:

```typescript
export function CombatTracker(props: CombatTrackerProps): JSX.Element
```

---

### InitiativeOrder Component

**Purpose**: Display participants in initiative order with current turn highlight.

**Props**:

```typescript
interface InitiativeOrderProps {
  participants: Participant[];
  currentTurnIndex: number;
  onParticipantClick?: (participantId: string) => void;
  onNextTurn?: () => void;
  onPreviousTurn?: () => void;
}
```

**Rendering**:

- Participants sorted by initiativeValue (descending).
- Current turn (currentTurnIndex) highlighted with distinct background/border (e.g., blue).
- Next/Previous turn buttons below or within the list.
- Each entry shows: Name, Initiative Value, HP (numeric), Status Effects (as pills).

**Exports**:

```typescript
export function InitiativeOrder(props: InitiativeOrderProps): JSX.Element
```

---

### HPTracker Component

**Purpose**: Display and manage HP for a single participant.

**Props**:

```typescript
interface HPTrackerProps {
  participant: Participant;
  onDamageApplied: (damage: number) => void;
  onHealingApplied: (healing: number) => void;
}
```

**Features**:

- Displays "currentHP / maxHP" (e.g., "38 / 50").
- Optional HP bar (visual indicator of remaining health percentage).
- Input field for damage/healing (numeric, positive for damage, negative for healing).
- Quick-damage buttons: [5], [10], [20], [Custom].
- Visual state for unconscious/dead (HP ≤ 0).

**Exports**:

```typescript
export function HPTracker(props: HPTrackerProps): JSX.Element
```

---

### StatusEffectsPanel Component

**Purpose**: Display and manage status effects on a participant.

**Props**:

```typescript
interface StatusEffectsPanelProps {
  participant: Participant;
  onEffectAdded: (effect: StatusEffect) => void;
  onEffectRemoved: (effectId: string) => void;
}
```

**Features**:

- Display status effect pills/tags (name + duration if rounds).
- "Add Effect" button opens a menu/modal with common D&D 5e conditions.
- Each pill has a close button (X) to remove.
- Hovering over pill shows tooltip with effect description.

**Exports**:

```typescript
export function StatusEffectsPanel(props: StatusEffectsPanelProps): JSX.Element
```

---

### CombatLog Component

**Purpose**: Display recent combat actions in a collapsible panel.

**Props**:

```typescript
interface CombatLogProps {
  entries: CombatLogEntry[];
  onCollapse?: (isCollapsed: boolean) => void;
  filterByActionType?: (type: CombatLogEntry['actionType']) => void;
}
```

**Features**:

- Show last 10–20 entries (scroll to see more).
- Collapsible/expandable panel.
- Optional filter buttons (Damage, Heal, Effects, etc.).
- Each entry shows: Round/Turn, Action, Actor, Target, Details.
- Human-readable descriptions (e.g., "Orc Warrior took 12 damage (38/50 HP remaining)").

**Exports**:

```typescript
export function CombatLog(props: CombatLogProps): JSX.Element
```

---

## Data Adapter Contracts

### CombatSessionAdapter

**Purpose**: Abstract layer for loading and persisting combat session data.

**Interface**:

```typescript
interface CombatSessionAdapter {
  // Load a combat session by ID
  getSession(sessionId: string): Promise<CombatSession>;

  // Update session state (turn advancement, damage, etc.)
  updateSession(sessionId: string, updates: Partial<CombatSession>): Promise<CombatSession>;

  // Apply damage to a participant
  applyDamage(sessionId: string, participantId: string, damage: number): Promise<Participant>;

  // Apply healing to a participant
  applyHealing(sessionId: string, participantId: string, healing: number): Promise<Participant>;

  // Add status effect to a participant
  addStatusEffect(sessionId: string, participantId: string, effect: StatusEffect): Promise<Participant>;

  // Remove status effect from a participant
  removeStatusEffect(sessionId: string, participantId: string, effectId: string): Promise<Participant>;

  // Log an action
  logAction(sessionId: string, logEntry: CombatLogEntry): Promise<CombatLogEntry>;

  // Get combat log entries
  getLogEntries(sessionId: string, limit?: number): Promise<CombatLogEntry[]>;
}
```

**Implementation**:

For MVP, use in-memory or localStorage-backed adapter:

```typescript
export const mockCombatSessionAdapter: CombatSessionAdapter = {
  async getSession(sessionId: string): Promise<CombatSession> {
    // Return mock session or load from localStorage
    return mockCombatSession;
  },

  async updateSession(sessionId: string, updates: Partial<CombatSession>): Promise<CombatSession> {
    // Update in-memory store or localStorage
    return { ...mockCombatSession, ...updates };
  },

  // ... other methods
};
```

**Future**: Replace with real API calls (Feature 036+).

---

## Hook Contracts (Optional)

### useCombatSession Hook

**Purpose**: Manage combat session state and actions.

```typescript
interface UseCombatSessionReturn {
  session: CombatSession | null;
  loading: boolean;
  error?: Error;
  advanceTurn: () => void;
  rewindTurn: () => void;
  applyDamage: (participantId: string, damage: number) => void;
  applyHealing: (participantId: string, healing: number) => void;
  addStatusEffect: (participantId: string, effect: StatusEffect) => void;
  removeStatusEffect: (participantId: string, effectId: string) => void;
}

export function useCombatSession(sessionId: string): UseCombatSessionReturn {
  // Implementation
}
```

**Usage**:

```typescript
const { session, advanceTurn, applyDamage } = useCombatSession('session-001');
```

---

## Type Definitions

See `specs/009-combat-tracker/data-model.md` for full type definitions.

---

## Integration Points (Future)

### Feature 036: CombatSession Model

- Replace mock adapter with real API calls to `/api/v1/combat/sessions/{sessionId}`.
- Implement `PUT /api/v1/combat/sessions/{sessionId}` for updates.

### Feature 037: Initiative System

- Integrate initiative rolling into tracker (pre-fill initiative values).
- Support re-rolling initiative if needed.

### Feature 038: Combat Tracker Integration

- Connect tracker UI to backend models.
- Enable real-time persistence of session state.

### Feature 039–040: HP Tracking System

- Backend HP tracking with constraints (max HP, death save rules).
- Integrate with tracker UI.

---

## Testing Strategy

### Unit Tests

Test each component with mock props:

```typescript
describe('InitiativeOrder', () => {
  it('displays participants sorted by initiative', () => {
    // ...
  });

  it('highlights current turn participant', () => {
    // ...
  });

  it('calls onNextTurn when Next Turn button clicked', () => {
    // ...
  });
});
```

### Integration Tests

Test adapter layer:

```typescript
describe('CombatSessionAdapter', () => {
  it('loads a mock session', async () => {
    const adapter = mockCombatSessionAdapter;
    const session = await adapter.getSession('session-001');
    expect(session.id).toBe('session-001');
  });

  it('applies damage correctly', async () => {
    // ...
  });
});
```

### E2E Tests

Test full user flows:

```typescript
describe('Combat Tracker E2E', () => {
  it('loads tracker and allows damage to be applied', async () => {
    // Navigate to /combat
    // Click on HPTracker for a participant
    // Enter damage value
    // Confirm damage applied visually
  });
});
```

---

## Acceptance Criteria (Per Contract)

- Component props match interface
- All exported functions match signature
- Adapters implement full interface
- Types align with data-model.md definitions
- No `any` types; use strict TypeScript
- 80%+ unit test coverage for components and adapters
