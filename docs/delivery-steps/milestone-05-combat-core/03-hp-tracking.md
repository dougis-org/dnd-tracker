# HP Tracking Implementation

**Objective:** Track and update hit points (HP) for all combatants, including damage, healing, and validation.

## Tasks

- [ ] Implement HP state for all combatants
- [ ] Add UI for damage and healing
- [ ] Validate HP cannot go below 0 or above max
- [ ] Support temporary HP and death saves
- [ ] Add undo/redo for HP changes
- [ ] Ensure HP tracking UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (HP values, damage, healing, temp HP, death saves)
- [ ] Write failing tests for HP tracking logic before implementation (TDD)
- [ ] Write unit and integration tests for HP tracking logic and UI
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for HP tracking usage and features

## Acceptance Criteria

- HP updates correctly for all combatants, including edge cases (min/max, temp HP, death saves)
- Damage, healing, and temp HP are supported and validated
- Death saves are tracked and validated
- Undo/redo works for HP changes and is validated
- All input (HP values, damage, healing, temp HP, death saves) is validated and sanitized
- HP tracking UI is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- Automated tests (unit and integration) cover all HP tracking logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all HP tracking flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
