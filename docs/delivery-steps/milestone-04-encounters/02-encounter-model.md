# Encounter Model Implementation

**Objective:** Create a schema for encounters, linking parties and creatures, and supporting encounter state.

**Schema Definition:**

```typescript
// models/Encounter.ts
export interface IEncounter {
  partyId: string;
  name: string;
  description?: string;
  creatures: Array<{
    creatureId: string;
    count: number;
    initiative?: number;
    lairAction?: boolean;
    legendaryActions?: number;
  }>;
  startedAt?: Date;
  endedAt?: Date;
  state: "pending" | "active" | "completed";
  cr: number;
  xp: number;
  lairConfig?: object;
  createdAt: Date;
  updatedAt: Date;
}
```

## Implementation Tasks

- [ ] Create Mongoose schema for encounters
- [ ] Link to party and creature models
- [ ] Add state and timing fields
- [ ] Support lair and legendary actions
- [ ] Calculate CR and XP
- [ ] Validate and sanitize all input to the encounter model
- [ ] Write failing tests for encounter model before implementation (TDD)
- [ ] Write tests for all model logic (CRUD, validation, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for encounter model and integration

## Acceptance Criteria

- Encounter schema supports all required fields (party, creatures, state, CR/XP, lair/legendary actions) and matches the schema definition
- Links to party and creature models are functional and tested
- Lair and legendary actions are supported and validated
- CR and XP are calculated and stored correctly
- All input to the encounter model is validated and sanitized
- Automated tests (unit and integration) cover all model logic, validation, and error handling (80%+ coverage)
- Manual testing confirms CRUD, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
