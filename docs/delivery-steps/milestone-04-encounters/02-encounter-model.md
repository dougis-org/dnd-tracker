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

**Implementation Tasks:**

- [ ] Create Mongoose schema for encounters
- [ ] Link to party and creature models
- [ ] Add state and timing fields
- [ ] Support lair and legendary actions
- [ ] Calculate CR and XP
- [ ] Write tests for encounter logic

**Acceptance Criteria:**

- Encounter schema supports all required fields
- Links to party and creature models are functional
- Lair and legendary actions are supported
- CR and XP are calculated and stored
- Model passes all tests
