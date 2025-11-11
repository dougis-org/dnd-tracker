# Data Model - Combat Tracker Page (Feature 009)

## Overview

This document describes the data entities and relationships for the Combat Tracker Page UI feature. The focus is on UI-facing data structures; persistence logic is delegated to Feature 036 (CombatSession Model).

## Core Entities

### CombatSession

Represents an active combat instance.

```typescript
interface CombatSession {
  id: string;
  encounterId: string;
  status: 'active' | 'paused' | 'ended';
  currentRoundNumber: number;
  currentTurnIndex: number; // Index into participants array
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  orgId?: string; // Optional for future org sharing
}
```

### Participant

Represents a creature (PC, monster, NPC) in combat.

```typescript
interface Participant {
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
  // Metadata for UI rendering
  metadata?: {
    size?: string;
    alignment?: string;
    tags?: string[];
    iconUrl?: string;
  };
}
```

### StatusEffect

Represents a condition or buff/debuff on a participant.

```typescript
interface StatusEffect {
  id: string;
  name: string; // e.g., "Prone", "Restrained", "Poisoned"
  durationInRounds: number | null; // null = permanent
  appliedAtRound: number;
  category?: string; // e.g., "condition", "buff", "debuff"
  description?: string;
  iconUrl?: string;
}
```

### CombatLogEntry

Represents a single action in the combat log.

```typescript
interface CombatLogEntry {
  id: string;
  timestamp: Date;
  roundNumber: number;
  turnIndex: number;
  actionType:
    | 'damage'
    | 'heal'
    | 'effect_applied'
    | 'effect_removed'
    | 'initiative_set'
    | 'turn_advanced'
    | 'round_started'
    | 'session_started'
    | 'session_paused'
    | 'session_ended';
  actorId: string; // Participant ID
  targetId?: string; // Participant ID (optional)
  details: Record<string, unknown>; // Action-specific data
  description: string; // Human-readable summary
}
```

## Relationships

- **CombatSession** → **Participant[]**: One session has many participants.
- **Participant** → **StatusEffect[]**: One participant can have many status effects.
- **CombatSession** → **CombatLogEntry[]**: One session has many log entries.
- **CombatLogEntry** → **Participant** (via actorId, targetId): Log entries reference participants by ID.

## Constraints & Rules

- **Initiative**: Participants are sorted by initiativeValue (highest first).
- **Turn Index**: currentTurnIndex must be a valid index into the participants array (0 to participants.length - 1).
- **HP**: currentHP must be between 0 and maxHP (or potentially lower if death state is tracked separately).
- **Temporary HP**: Treated as a buffer before actual HP (damage to temp HP first).
- **Status Effects**: Duration counts down at round transitions (e.g., "Prone (2 rounds)" → "Prone (1 round)" after next full round passes).
- **Round/Turn Counter**: Displayed as "Round X, Turn Y/N" where Y is currentTurnIndex + 1 and N is participants.length.

## UI State Management

The tracker component will manage local UI state (in React) for:

- **Optimistic updates**: Damage/heal actions update the UI immediately, then sync to backend.
- **Log view state**: Collapsed/expanded state of combat log panel.
- **Selected participant**: If a participant detail panel is needed.
- **Lair action notification**: Dismissed/shown state.

Backend-driven state:

- **Session data**: All entities above come from the backend (or mock) and are displayed/updated via adapters.
- **Persistence**: Any changes are persisted to the backend or localStorage for MVP.

## Mock Data Example

For development and testing, a sample CombatSession with 6 participants in Round 3, Turn 2:

```typescript
const mockCombatSession: CombatSession = {
  id: 'session-001',
  encounterId: 'encounter-001',
  status: 'active',
  currentRoundNumber: 3,
  currentTurnIndex: 1, // Index 1 = Orc Warrior (2nd in initiative)
  participants: [
    {
      id: 'participant-001',
      name: 'Legolas',
      type: 'character',
      initiativeValue: 18,
      maxHP: 45,
      currentHP: 45,
      temporaryHP: 0,
      acValue: 15,
      statusEffects: [],
    },
    {
      id: 'participant-002',
      name: 'Orc Warrior',
      type: 'monster',
      initiativeValue: 15,
      maxHP: 50,
      currentHP: 38,
      temporaryHP: 0,
      acValue: 16,
      statusEffects: [
        {
          id: 'effect-001',
          name: 'Prone',
          durationInRounds: 2,
          appliedAtRound: 3,
        },
      ],
    },
    // ... 4 more participants
  ],
  createdAt: new Date('2025-11-11T12:00:00Z'),
  updatedAt: new Date('2025-11-11T12:15:00Z'),
  ownerId: 'user-001',
};
```

## Future Considerations

- **Persistent state**: This spec focuses on the UI layer. Backend persistence (database schema, APIs) is Feature 036.
- **Legendary actions**: May extend Participant with a `legendaryActions: LegendaryAction[]` field when Feature 044 is implemented.
- **Lair actions**: May be stored on CombatSession or loaded from the Encounter entity.
- **History/Undo**: May add a `history: CombatLogEntry[]` and `undoStack: Action[]` to support undo/redo (Feature 041).
