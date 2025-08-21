# Undo/Redo System

**Objective:** Add undo and redo functionality for all major combat actions.

## Tasks

- [ ] Implement undo/redo stack for combat actions
- [ ] Integrate with turn, HP, and state changes
- [ ] Add UI controls for undo/redo
- [ ] Write failing tests for undo/redo logic before implementation (TDD)
- [ ] Write unit and integration tests for undo/redo logic and UI
- [ ] Validate and sanitize all undo/redo actions and state
- [ ] Ensure undo/redo UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for undo/redo system usage and features

## Acceptance Criteria

- Undo/redo works for all major combat actions and is validated
- UI controls are available, intuitive, and accessible (WCAG 2.1 AA)
- All undo/redo actions and state are validated and sanitized
- Automated tests (unit and integration) cover all undo/redo logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all undo/redo flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
