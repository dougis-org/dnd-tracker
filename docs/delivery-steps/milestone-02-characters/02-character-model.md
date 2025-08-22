# Character Model Implementation ([#13](https://github.com/dougis-org/dnd-tracker/issues/13))

**Objective:** Create comprehensive D&D 5e character schema with multiclassing support.

**Schema Definition:**

```typescript
// models/Character.ts
export interface ICharacter {
  userId: string; // Clerk ID of owner

  // Basic Information
  name: string;
  race: string;
  subrace?: string;
  background: string;
  alignment: string;
  experiencePoints: number;

  // Multiclassing Support
  classes: Array<{
    className: string;
    level: number;
    subclass?: string;
    hitDiceSize: number; // d6, d8, d10, d12
    hitDiceUsed: number;
  }>;
  totalLevel: number; // Sum of all class levels

  // Ability Scores
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}
```

## Implementation Tasks

- [ ] Create complete schema with all D&D fields
- [ ] Add calculated fields (modifiers, proficiency bonus)
- [ ] Implement multiclassing validation
- [ ] Add skill proficiencies
- [ ] Create spellcasting support
- [ ] Validate and sanitize all input to the character model
- [ ] Write failing tests for character model before implementation (TDD)
- [ ] Write tests for all model logic (CRUD, validation, edge cases)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for character model and integration

## Acceptance Criteria

- Character schema supports all D&D 5e fields, including multiclassing, skills, and spellcasting
- Calculated fields (modifiers, proficiency bonus) are present and correct
- Multiclassing is supported and validated according to D&D 5e rules
- All input to the character model is validated and sanitized
- Automated tests (unit and integration) cover all model logic, validation, and error handling (80%+ coverage)
- Manual testing confirms CRUD, validation, and error scenarios
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
