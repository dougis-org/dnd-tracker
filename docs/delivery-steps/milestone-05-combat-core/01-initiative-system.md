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

export function sortByInitiative(
  participants: CombatParticipant[]
): CombatParticipant[] {
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
    id: "lair-action",
    name: "Lair Action",
    type: "lair",
    initiative: 20,
    dexterity: 0,
    isLairAction: true,
  };

  return [...participants, lairAction].sort(sortByInitiative);
}
```

## Tasks

- [ ] Create initiative rolling UI
- [ ] Implement manual override
- [ ] Add bulk roll functionality
- [ ] Create visual indicators for current turn
- [ ] Add keyboard shortcuts for navigation
- [ ] Ensure initiative UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (participant data, manual overrides)
- [ ] Write failing tests for initiative logic before implementation (TDD)
- [ ] Write unit and integration tests for initiative logic and UI
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for initiative system usage and features

## Acceptance Criteria

- Initiative rolling and sorting works for all supported scenarios, including tiebreakers and lair actions
- Manual override and bulk roll functionality are available and validated
- Visual indicators for current turn are clear and accessible
- Keyboard shortcuts work and are accessible
- All input (participant data, manual overrides) is validated and sanitized
- Initiative UI is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- Automated tests (unit and integration) cover all initiative logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all initiative flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
