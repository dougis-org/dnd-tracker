# Legendary Actions Management

**Objective:** Add support for legendary action tracking and management in combat.

## Tasks

- [ ] Implement legendary action usage tracking
- [ ] Add UI for spending and resetting actions
- [ ] Enforce D&D 5e rules for legendary actions
- [ ] Integrate with combat log and undo/redo
- [ ] Write failing tests for legendary action logic before implementation (TDD)
- [ ] Write unit and integration tests for legendary action logic and UI
- [ ] Ensure legendary actions UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (legendary action data, usage)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for legendary actions usage and features

## Acceptance Criteria

- Legendary actions are tracked, enforced, and validated
- UI allows spending and resetting actions and is accessible (WCAG 2.1 AA)
- Undo/redo and logging are integrated and validated
- All input (legendary action data, usage) is validated and sanitized
- Automated tests (unit and integration) cover all legendary action logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all legendary action flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
