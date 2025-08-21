# Effect Duration & Concentration

**Objective:** Track effect durations and concentration for all combatants.

## Tasks

- [ ] Implement duration tracking for all effects
- [ ] Add concentration checks and UI
- [ ] Auto-expire effects when duration ends
- [ ] Integrate with undo/redo and combat log
- [ ] Write failing tests for duration logic before implementation (TDD)
- [ ] Write unit and integration tests for duration logic and UI
- [ ] Ensure duration/concentration UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (effect durations, concentration data)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for duration/concentration tracking usage and features

## Acceptance Criteria

- Effect durations are tracked, auto-expire, and are validated
- Concentration is enforced and visible in UI, and is accessible (WCAG 2.1 AA)
- Undo/redo and logging are integrated and validated
- All input (effect durations, concentration data) is validated and sanitized
- Automated tests (unit and integration) cover all duration/concentration logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all duration/concentration flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
