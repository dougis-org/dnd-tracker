# Turn Tracker Implementation

**Objective:** Implement turn and round management for combat encounters.

## Tasks

- [ ] Create turn tracker state and logic
- [ ] Advance turn and round automatically
- [ ] Handle initiative order changes (delay, ready, etc.)
- [ ] Display current turn and round in UI
- [ ] Add undo/redo for turn actions
- [ ] Ensure turn tracker UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (turn/round data, initiative changes)
- [ ] Write failing tests for turn tracker logic before implementation (TDD)
- [ ] Write unit and integration tests for turn tracker logic and UI
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for turn tracker usage and features

## Acceptance Criteria

- Turn and round advance correctly for all supported scenarios
- Initiative order can be changed as needed and changes are validated
- UI clearly shows current turn and round and is accessible (WCAG 2.1 AA)
- Undo/redo works for turn actions and is validated
- All input (turn/round data, initiative changes) is validated and sanitized
- Automated tests (unit and integration) cover all turn tracker logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all turn tracker flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
