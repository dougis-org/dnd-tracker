# Creature Model Implementation

## Objective

Create comprehensive creature/monster schema with legendary and lair actions

## Schema Definition

```typescript
// models/Creature.ts
export interface ICreature {
  // Ownership
  userId?: string; // Optional for system creatures
  isSystemCreature: boolean;

  // Basic Info
  name: string;
  size: "tiny" | "small" | "medium" | "large" | "huge" | "gargantuan";
  type: string; // beast, humanoid, dragon, etc.
  alignment: string;

  // Combat Stats
  armorClass: number;
  hitPoints: {
    average: number;
    formula: string; // e.g., "8d10 + 16"
  };
  speed: {
    walk: number;
    swim?: number;
    fly?: number;
    burrow?: number;
  };

  // Challenge Rating
  challengeRating: number;
  experiencePoints: number;
  proficiencyBonus: number;

  // Legendary Actions
  legendaryActions?: {
    count: number;
    actions: Array<{
      name: string;
      cost: number;
      description: string;
    }>;
  };

  // Lair Actions
  lairActions?: {
    description: string;
    initiativeCount: 20;
    actions: Array<{
      name: string;
      description: string;
      effect: string;
    }>;
  };
}
```

## Implementation Tasks

- [ ] Create Mongoose schema for creature with all fields above
- [ ] Add validation for all required fields and D&D rules
- [ ] Implement support for legendary and lair actions
- [ ] Add indexes for performance and search
- [ ] Validate and sanitize all input to the creature model
- [ ] Write failing tests for creature model before implementation (TDD)
- [ ] Write tests for all model logic (CRUD, validation, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for creature model and integration

## Acceptance Criteria

- Creature schema supports all required fields (ownership, stats, legendary/lair actions, etc.) and matches the schema definition
- Legendary and lair actions are supported and validated
- All input to the creature model is validated and sanitized
- Automated tests (unit and integration) cover all model logic, validation, and error handling (80%+ coverage)
- Manual testing confirms CRUD, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
