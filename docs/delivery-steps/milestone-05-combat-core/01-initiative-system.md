# Initiative System Implementation

## Objective
Build complete initiative tracking with DEX tiebreaking

## Core Components

### 1. Initiative Rolling
```typescript
// utils/initiative.ts
export function rollInitiative(participant: CombatParticipant): number {
  const roll = Math.floor(Math.random() * 20) + 1;
  return roll + participant.initiativeModifier;
}

export function sortByInitiative(participants: CombatParticipant[]): CombatParticipant[] {
  return participants.sort((a, b) => {
    // First sort by initiative
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    // Then by dexterity for tiebreaking
    if (b.dexterity !== a.dexterity) {
      return b.dexterity - a.dexterity;
    }
    // Finally by name for consistency
    return a.name.localeCompare(b.name);
  });
}
```

### 2. Lair Action Insertion
```typescript
export function insertLairActions(
  participants: CombatParticipant[],
  hasLairActions: boolean
): CombatParticipant[] {
  if (!hasLairActions) return participants;
  
  const lairAction: CombatParticipant = {
    id: 'lair-action',
    name: 'Lair Action',
    type: 'lair',
    initiative: 20,
    dexterity: 0,
    isLairAction: true
  };
  
  return [...participants, lairAction].sort(sortByInitiative);
}
```

## Implementation Tasks
- [ ] Create initiative rolling UI
- [ ] Implement manual override
- [ ] Add bulk roll functionality
- [ ] Create visual indicators for current turn
- [ ] Add keyboard shortcuts for navigation