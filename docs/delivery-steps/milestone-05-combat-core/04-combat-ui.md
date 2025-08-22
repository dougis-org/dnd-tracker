# Combat Tracker UI

**Objective:** Build the main combat tracker interface for initiative, turns, and HP management.

## Tasks

- [ ] Create responsive combat tracker UI
- [ ] Display initiative, turn order, and HP
- [ ] Add controls for advancing turns, applying damage/healing
- [ ] Show combatant details and statuses
- [ ] Integrate undo/redo and state management
- [ ] Ensure combat tracker UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (combatant data, actions)
- [ ] Write failing tests for combat UI logic before implementation (TDD)
- [ ] Write unit and integration tests for combat UI logic and state management
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for combat tracker usage and features

## Acceptance Criteria

- UI is responsive, intuitive, and accessible (WCAG 2.1 AA)
- All combat data is visible, actionable, and validated
- Controls work for all core combat actions and are accessible
- Undo/redo is integrated and validated
- All input (combatant data, actions) is validated and sanitized
- Automated tests (unit and integration) cover all combat UI logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all combat UI flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
