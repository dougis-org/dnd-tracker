# Character Forms Implementation ([#15](https://github.com/dougis-org/dnd-tracker/issues/15))

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

## Implementation Tasks

- [ ] Create multi-step form component
- [ ] Implement React Hook Form integration
- [ ] Add Zod validation for all fields
- [ ] Create ability score calculators
- [ ] Add class-specific form sections
- [ ] Implement save draft functionality
- [ ] Ensure all forms are accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input in forms
- [ ] Write failing tests for form logic before implementation (TDD)
- [ ] Write tests for all form logic (validation, edge cases, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for form usage and validation

## Acceptance Criteria

- Multi-step form is functional and covers all required sections (basic info, abilities, skills, equipment, spellcasting)
- Zod validation is enforced for all fields and prevents invalid input
- Ability score calculators work for all supported methods (point buy, array, rolling)
- Drafts can be saved and resumed without data loss
- All forms are accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input is validated and sanitized at both form and API level
- Automated tests (unit and integration) cover all form logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all form flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
