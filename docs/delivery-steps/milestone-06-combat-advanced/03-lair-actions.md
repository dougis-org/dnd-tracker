# Lair Actions System

**Objective:** Implement lair action triggers and execution, including initiative 20 support.

## Tasks

- [ ] Add lair action triggers to combat state
- [ ] Support initiative 20 automatic triggers
- [ ] Add UI for configuring and executing lair actions
- [ ] Log lair actions in combat log
- [ ] Write failing tests for lair action logic before implementation (TDD)
- [ ] Write unit and integration tests for lair action logic and UI
- [ ] Ensure lair actions UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (lair action data, triggers)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for lair actions system usage and features

## Acceptance Criteria

- Lair actions trigger on initiative 20 and are validated
- UI supports configuration and execution and is accessible (WCAG 2.1 AA)
- Lair actions are logged and changes persist
- All input (lair action data, triggers) is validated and sanitized
- Automated tests (unit and integration) cover all lair action logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all lair action flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
