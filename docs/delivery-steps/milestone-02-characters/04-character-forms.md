# Character Forms Implementation

**Objective:** Create comprehensive character creation and edit forms with validation.

**Form Structure:**

- Multi-step form with sections:
  - Basic Info (name, race, class, background)
  - Ability Scores (with point buy/standard array/rolling)
  - Skills and Proficiencies
  - Equipment and Features
  - Spellcasting (if applicable)

**Form Schema with Zod:**

```typescript
// schemas/character.ts
import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(1).max(50),
  race: z.string().min(1),
  classes: z
    .array(
      z.object({
        className: z.string(),
        level: z.number().min(1).max(20),
        subclass: z.string().optional(),
      })
    )
    .min(1),
  abilities: z.object({
    strength: z.number().min(1).max(30),
    dexterity: z.number().min(1).max(30),
    // ... other abilities
  }),
});
```

**Implementation Tasks:**

- [ ] Create multi-step form component
- [ ] Implement React Hook Form integration
- [ ] Add Zod validation
- [ ] Create ability score calculators
- [ ] Add class-specific form sections
- [ ] Implement save draft functionality

**Acceptance Criteria:**

- Multi-step form is functional
- Zod validation is enforced
- Ability score calculators work
- Drafts can be saved and resumed
