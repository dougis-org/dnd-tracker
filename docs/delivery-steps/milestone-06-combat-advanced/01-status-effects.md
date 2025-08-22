# Status Effects System

**Objective:** Implement a comprehensive system for tracking D&D 5e conditions and status effects.

## Tasks

- [ ] Create data model for all D&D 5e conditions
- [ ] Add UI for applying/removing effects
- [ ] Track effect duration and concentration
- [ ] Integrate with combat state and log
- [ ] Add visual indicators for effects
- [ ] Ensure status effects UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (effect data, durations, concentration)
- [ ] Write failing tests for status effects logic before implementation (TDD)
- [ ] Write unit and integration tests for status effects logic and UI
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for status effects system usage and features

## Acceptance Criteria

- All D&D 5e conditions are supported and validated
- Effects can be applied/removed in UI and changes persist
- Duration and concentration are tracked and validated
- Visual indicators are present and accessible (WCAG 2.1 AA)
- All input (effect data, durations, concentration) is validated and sanitized
- Status effects UI is accessible (ARIA, keyboard navigation, screen reader support)
- Automated tests (unit and integration) cover all status effects logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all status effects flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
