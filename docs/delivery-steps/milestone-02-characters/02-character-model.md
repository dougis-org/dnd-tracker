# Character Model Implementation

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

**Implementation Tasks:**

- [ ] Create complete schema with all D&D fields
- [ ] Add calculated fields (modifiers, proficiency bonus)
- [ ] Implement multiclassing validation
- [ ] Add skill proficiencies
- [ ] Create spellcasting support

**Acceptance Criteria:**

- Character schema supports all D&D 5e fields
- Multiclassing is supported and validated
- Calculated fields are present
- Model passes all tests
