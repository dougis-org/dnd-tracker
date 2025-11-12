# Combat Tracker Data Model

**Date**: 2025-11-11  
**Feature**: Feature 009 — Combat Tracker  
**Status**: ✅ Complete

---

## Overview

This document describes the data entities, validation rules, relationships, and persistence strategy for the Combat Tracker feature. All entities are defined using TypeScript interfaces and Zod schemas for runtime validation.

---

## Core Entities

### 1. CombatSession

Represents an active combat instance. This is the root entity that contains all state for a single combat encounter.

**Fields**:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | string | ✅ | (generated) | UUID or ObjectId |
| encounterId | string | ❌ | undefined | Link to parent Encounter (Feature 008) |
| status | 'active' \| 'paused' \| 'ended' | ✅ | 'active' | Encounter state |
| currentRoundNumber | number | ✅ | 1 | Starts at 1 |
| currentTurnIndex | number | ✅ | 0 | Index into participants array (0-based) |
| participants | Participant[] | ✅ | [] | All combatants; length >= 1 |
| lairActionInitiative | number | ✅ | 20 | Lair action trigger (D&D 5e default) |
| createdAt | ISO8601 string | ✅ | (now) | Session creation timestamp |
| updatedAt | ISO8601 string | ✅ | (now) | Last modification timestamp |
| owner_id | string | ✅ | (user) | Authenticated user ID |
| org_id | string | ❌ | undefined | Organization scope (future) |

**Validation Rules**:

```typescript
{
  id: string & pattern /^[a-f0-9-]{36}$/ (UUID) or ObjectId,
  encounterId: undefined | string,
  status: one of ['active', 'paused', 'ended'],
  currentRoundNumber: integer >= 1,
  currentTurnIndex: integer >= 0 and < participants.length,
  participants: array of Participant, length >= 1,
  lairActionInitiative: integer >= 1 and <= 30 (D&D initiative range),
  createdAt: ISO8601 datetime string,
  updatedAt: ISO8601 datetime string,
  owner_id: string (non-empty),
  org_id: undefined | string (non-empty),
}
```

**State Transitions**:

```
(new) → active (user creates or loads)
       ↓
     paused (user clicks pause button - future feature)
       ↓
    active (user clicks resume - future feature)
       ↓
     ended (user ends combat)
```

**Relationships**:

- **1-to-many with Participant**: CombatSession contains array of 1 or more Participants
- **0-to-1 with Encounter**: CombatSession may be linked to Feature 008 (Encounter), but is independent
- **0-to-many with CombatLogEntry**: Implicit; log entries reference this session's ID

**Indexes** (MongoDB, future Feature 036):

```javascript
{
  owner_id: 1,
  status: 1,
  createdAt: 1,
  updatedAt: -1,  // For "most recent sessions" listing
}
```

---

### 2. Participant

Represents a single entity participating in combat (monster, character, NPC). Participants are **embedded** within CombatSession (not normalized references).

**Fields**:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | string | ✅ | (generated) | UUID or random string |
| name | string | ✅ | — | Display name (e.g., "Goblin 1", "Barbarian") |
| type | 'monster' \| 'character' \| 'npc' | ✅ | — | Entity category |
| initiativeValue | number | ✅ | — | Initiative roll result (1–30 in D&D 5e) |
| maxHP | number | ✅ | — | Maximum hit points (>= 1) |
| currentHP | number | ✅ | maxHP (default) | Current hit points (can be negative) |
| temporaryHP | number | ✅ | 0 | Temporary hit points (shields first against damage) |
| acValue | number | ✅ | — | Armor class (display only in MVP) |
| statusEffects | StatusEffect[] | ✅ | [] | Applied conditions (Prone, Poisoned, etc.) |
| metadata | Record<string, unknown> | ❌ | {} | Custom data (notes, tags, source refs) |

**Validation Rules**:

```typescript
{
  id: string (non-empty, unique within session),
  name: string, min length 1, max length 200,
  type: one of ['monster', 'character', 'npc'],
  initiativeValue: integer, range [1, 30],
  maxHP: integer >= 1,
  currentHP: integer (can be negative for overkill tracking),
  temporaryHP: integer >= 0,
  acValue: integer, range [0, 30],
  statusEffects: array of StatusEffect,
  metadata: object (any structure),
}
```

**State Transitions** (during combat):

```
Healthy (currentHP > 0, no status effects)
    ↓ (take damage)
Injured (currentHP > 0, or status effects applied)
    ↓ (take more damage)
Unconscious (currentHP <= 0) [future: death saves]
    ↓ (healing or conditions clear)
Healthy (or still Injured)
```

**Relationships**:

- **Many-to-1 with CombatSession**: Each Participant is embedded in exactly one session
- **Many-to-many (implicit) with StatusEffect**: Participant contains array of StatusEffect

**Constraints**:

- `currentHP` can be negative (for GM reference; UI shows "0" with "Unconscious" label)
- `temporaryHP` never exceeds max in UI, but schema allows overflow (game rule: temp HP can exceed max)
- `acValue` is immutable during combat (informational only)

---

### 3. StatusEffect

Represents a condition or effect applied to a Participant (e.g., Prone, Poisoned, Blinded, Restrained).

**Fields**:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | string | ✅ | (generated) | UUID |
| name | string | ✅ | — | D&D 5e effect name (e.g., "Prone", "Restrained") |
| durationInRounds | number \| null | ✅ | null | Rounds remaining; null = permanent |
| appliedAtRound | number | ✅ | (current round) | Round when effect applied (for tracking) |
| description | string | ❌ | — | Optional effect description |
| icon | string | ❌ | — | Icon name or emoji (UI only) |

**Validation Rules**:

```typescript
{
  id: string, pattern /^[a-f0-9-]{36}$/,
  name: string, min length 1, max length 100,
  durationInRounds: integer >= 1, or null (permanent),
  appliedAtRound: integer >= 1,
  description: undefined | string,
  icon: undefined | string,
}
```

**Predefined Effects** (D&D 5e standard conditions):

```typescript
const StandardEffects = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
  'Exhaustion', // Note: Exhaustion has 6 levels; handled in metadata
];
```

**State Transitions**:

```
Applied (added to participant)
    ↓ (round ends, duration decrements)
Active (1 round remaining)
    ↓ (round ends, duration expires)
Removed (effect no longer active)
```

**Relationships**:

- **Many-to-1 with Participant**: Each StatusEffect is embedded in a participant's array
- **Many-to-1 with CombatSession**: Participant is part of session

**Duration Decrement Logic**:

1. At end of each round (when `currentTurnIndex` wraps from last to 0):
   - For each Participant in session:
     - For each StatusEffect with `durationInRounds !== null`:
       - Decrement `durationInRounds` by 1
       - If `durationInRounds <= 0`, remove effect
2. Log entry created: "Round X ended, status effect durations decremented"

---

### 4. CombatLogEntry

Represents a single action recorded in the combat log for audit and reference purposes.

**Fields**:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| id | string | ✅ | (generated) | UUID |
| timestamp | ISO8601 string | ✅ | (now) | Action timestamp |
| roundNumber | number | ✅ | — | Round when action occurred |
| turnIndex | number | ✅ | — | Turn index when action occurred |
| actionType | ActionType | ✅ | — | Enum of action types (see below) |
| actor | string | ❌ | undefined | Participant ID who triggered action |
| target | string | ❌ | undefined | Participant ID who was affected |
| details | Record<string, unknown> | ✅ | {} | Action-specific data |
| description | string | ✅ | — | Human-readable summary |

**ActionType Enum**:

```typescript
type ActionType = 
  | 'damage'                // Damage applied to participant
  | 'heal'                  // Healing applied to participant
  | 'effect_applied'        // Status effect added
  | 'effect_removed'        // Status effect removed
  | 'initiative_set'        // Initiative order set (start of combat)
  | 'turn_advanced'         // Turn advanced (Next Turn clicked)
  | 'turn_rewound'          // Turn rewound (Previous Turn clicked)
  | 'round_started'         // Round began
  | 'round_ended'           // Round ended
  | 'undo'                  // Action undone
  | 'redo';                 // Action redone
```

**Details Field** (action-specific payload):

```typescript
// damage
{ participantId: string, amount: number, tempHPApplied: number, hpApplied: number }

// heal
{ participantId: string, amount: number, newHP: number }

// effect_applied
{ participantId: string, effectName: string, effectId: string, durationRounds: number | null }

// effect_removed
{ participantId: string, effectName: string, effectId: string }

// turn_advanced or turn_rewound
{ newTurnIndex: number, newRoundNumber: number, currentParticipant: string }

// undo / redo
{ actionType: string, actionDescription: string }
```

**Validation Rules**:

```typescript
{
  id: string, UUID pattern,
  timestamp: ISO8601 datetime,
  roundNumber: integer >= 1,
  turnIndex: integer >= 0,
  actionType: one of ActionType enum,
  actor: undefined | string (participant ID),
  target: undefined | string (participant ID),
  details: object (any structure),
  description: string (non-empty),
}
```

**Relationships**:

- **Many-to-1 with CombatSession**: Log entries implicit; not stored in session array (kept client-side in MVP)
- **References Participant**: Via actor/target participant IDs

**Constraints**:

- Log entries are **immutable** once created (no edits)
- Log entries are **ordered** by timestamp (ascending, oldest first)
- Log is kept in memory during session (not persisted to localStorage in MVP; Feature 036)

---

## Zod Validation Schemas

**File**: `src/lib/schemas/combat.ts`

All schemas defined here for runtime validation:

```typescript
import { z } from 'zod';

// ===== StatusEffect =====
export const StatusEffectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  durationInRounds: z.number().int().positive().nullable(),
  appliedAtRound: z.number().int().nonnegative(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export type StatusEffect = z.infer<typeof StatusEffectSchema>;

// ===== Participant =====
export const ParticipantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  type: z.enum(['monster', 'character', 'npc']),
  initiativeValue: z.number().int().min(1).max(30),
  maxHP: z.number().int().min(1),
  currentHP: z.number().int(),
  temporaryHP: z.number().int().nonnegative(),
  acValue: z.number().int().min(0).max(30),
  statusEffects: z.array(StatusEffectSchema),
  metadata: z.record(z.unknown()).optional(),
});

export type Participant = z.infer<typeof ParticipantSchema>;

// ===== CombatSession =====
export const CombatSessionSchema = z.object({
  id: z.string().uuid(),
  encounterId: z.string().optional(),
  status: z.enum(['active', 'paused', 'ended']),
  currentRoundNumber: z.number().int().min(1),
  currentTurnIndex: z.number().int().nonnegative(),
  participants: z.array(ParticipantSchema).min(1),
  lairActionInitiative: z.number().int().min(1).max(30).default(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  owner_id: z.string().min(1),
  org_id: z.string().optional(),
});

export type CombatSession = z.infer<typeof CombatSessionSchema>;

// ===== Action Inputs =====
export const DamageInputSchema = z.object({
  participantId: z.string(),
  amount: z.number().int().positive(),
  targetType: z.enum(['currentHP', 'temporaryHP']).default('currentHP'),
});

export type DamageInput = z.infer<typeof DamageInputSchema>;

export const HealingInputSchema = z.object({
  participantId: z.string(),
  amount: z.number().int().positive(),
});

export type HealingInput = z.infer<typeof HealingInputSchema>;

export const StatusEffectInputSchema = z.object({
  participantId: z.string(),
  name: z.string().min(1).max(100),
  durationInRounds: z.number().int().positive().nullable(),
});

export type StatusEffectInput = z.infer<typeof StatusEffectInputSchema>;

// ===== Log Entry =====
export const CombatLogEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  roundNumber: z.number().int().min(1),
  turnIndex: z.number().int().nonnegative(),
  actionType: z.enum([
    'damage', 'heal', 'effect_applied', 'effect_removed',
    'initiative_set', 'turn_advanced', 'turn_rewound',
    'round_started', 'round_ended', 'undo', 'redo'
  ]),
  actor: z.string().optional(),
  target: z.string().optional(),
  details: z.record(z.unknown()),
  description: z.string(),
});

export type CombatLogEntry = z.infer<typeof CombatLogEntrySchema>;
```

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────┐
│      CombatSession (root)           │
│  ─ id, status, currentRound, ...    │
└────────────┬────────────────────────┘
             │
             │ contains array (1+)
             ▼
┌─────────────────────────────────────┐
│       Participant (embedded)        │
│  ─ id, name, hp, acValue, ...       │
└────────────┬────────────────────────┘
             │
             │ contains array (0+)
             ▼
┌─────────────────────────────────────┐
│      StatusEffect (embedded)        │
│  ─ id, name, duration, ...          │
└─────────────────────────────────────┘


┌─────────────────────────────────────┐
│      CombatLogEntry (client-side)   │
│  ─ id, actionType, details, ...     │
│  References: actor, target (PIDs)   │
└─────────────────────────────────────┘
```

---

## Persistence & Storage Strategy

### MVP Storage (localStorage)

**Key format**: `combatSession-{sessionId}`

**Value**: JSON serialized CombatSession

```javascript
localStorage.setItem('combatSession-123', JSON.stringify({
  id: '123',
  status: 'active',
  currentRoundNumber: 2,
  // ... rest of session
}));
```

**Validation on load**:

```typescript
const stored = localStorage.getItem('combatSession-' + sessionId);
if (!stored) throw new Error('Session not found');
const parsed = JSON.parse(stored);
const session = CombatSessionSchema.parse(parsed); // Zod validation
```

**Write-on-change**:

- On every state mutation (damage applied, turn advanced, effect added), save to localStorage
- No batching in MVP (each change = write)
- Optional: throttle writes for performance (Feature X)

### Future Persistence (Feature 036)

- Replace localStorage with MongoDB + backend API
- Same Zod schemas used for HTTP request/response validation
- Adapter pattern allows seamless migration

---

## Constraints & Edge Cases

### HP Constraints

- `currentHP` can go negative (tracks overkill for reference)
- UI shows "0 HP" with "Unconscious" label when `currentHP <= 0`
- Healing cannot exceed `maxHP`
- Damage to `temporaryHP` first, then `currentHP`

### Initiative Constraints

- Participants sorted by `initiativeValue` (highest first)
- Ties handled by stable sort (maintain insertion order for ties)
- Optional: Tiebreaker by Dexterity modifier (stored in metadata)

### Status Effect Constraints

- No duplicate effects on same participant (can replace instead)
- Duration of 0 removes effect immediately
- Permanent effects (`durationInRounds === null`) persist until manually removed

### Round & Turn Constraints

- `currentRoundNumber` starts at 1
- `currentTurnIndex` wraps 0 → participants.length-1 → 0 (increment round on wrap)
- Invalid `currentTurnIndex` (e.g., > participants.length) treated as error

### Undo/Redo Constraints

- Each undo/redo push records full session state (no delta encoding in MVP)
- No undo of undo/redo actions (undo/redo stacks are separate)
- Stacks cleared on session end

---

## Example Data

### Minimal Valid Session

```typescript
{
  id: 'a1b2c3d4-e5f6-47g8-h9i0-j1k2l3m4n5o6',
  status: 'active',
  currentRoundNumber: 1,
  currentTurnIndex: 0,
  participants: [
    {
      id: 'p1',
      name: 'Goblin Ambusher',
      type: 'monster',
      initiativeValue: 14,
      maxHP: 7,
      currentHP: 7,
      temporaryHP: 0,
      acValue: 15,
      statusEffects: [],
    },
    {
      id: 'p2',
      name: 'Barbarian',
      type: 'character',
      initiativeValue: 10,
      maxHP: 60,
      currentHP: 60,
      temporaryHP: 0,
      acValue: 16,
      statusEffects: [],
    },
  ],
  lairActionInitiative: 20,
  createdAt: '2025-11-11T18:00:00Z',
  updatedAt: '2025-11-11T18:00:00Z',
  owner_id: 'user_123',
}
```

### Session with Status Effects

```typescript
{
  // ... (same as above)
  participants: [
    {
      // ... (Goblin)
      statusEffects: [
        {
          id: 'e1',
          name: 'Prone',
          durationInRounds: 1,
          appliedAtRound: 2,
          icon: '⬇️',
        },
      ],
    },
    {
      // ... (Barbarian)
      currentHP: 45, // Took 15 damage
      temporaryHP: 5, // Spell absorbed 5
      statusEffects: [
        {
          id: 'e2',
          name: 'Blessed', // Custom effect
          durationInRounds: null, // Permanent
          appliedAtRound: 1,
        },
      ],
    },
  ],
}
```

---

## Backward Compatibility

For future schema changes (Feature 036, 037, etc.):

1. **Add optional fields**: Use `.optional()` in Zod schemas
2. **Default old data**: Migrate on load (e.g., `deathSaveSuccesses ??= 0`)
3. **No removal**: Fields are never removed; deprecated fields marked `deprecated: true` in comments
4. **Version field** (optional): Add `schemaVersion: number` for major migrations

Example (Feature X: death saves):

```typescript
export const ParticipantSchema = z.object({
  // ... existing fields
  deathSaveSuccesses: z.number().int().min(0).max(3).optional(), // Feature X
  deathSaveFailures: z.number().int().min(0).max(3).optional(),  // Feature X
});
```

---

## Related Documentation

- `research.md` — Design decisions and rationale
- `quickstart.md` — Developer setup and usage examples
- `specs/009-combat-tracker/spec.md` — Feature requirements and acceptance criteria
- `CONTRIBUTING.md` — Code style, testing, deployment

---

**Model Status**: ✅ Complete  
**Schema Validation**: ✅ Zod schemas finalized  
**Relationships**: ✅ Documented  
**Next Phase**: Quickstart guide + component implementation
