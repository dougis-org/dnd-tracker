# Environmental Effects

**Objective:** Add support for environmental mechanics and effects in combat.

## Tasks

- [ ] Implement data model for environmental effects
- [ ] Add UI for applying/removing effects
- [ ] Integrate with combat state and log
- [ ] Add visual indicators for environment
- [ ] Write failing tests for environmental logic before implementation (TDD)
- [ ] Write unit and integration tests for environmental logic and UI
- [ ] Ensure environmental effects UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (environmental effect data)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for environmental effects usage and features

## Acceptance Criteria

- Environmental effects can be applied/removed and are validated
- Effects are visible in UI and log, and are accessible (WCAG 2.1 AA)
- Visual indicators are present and accessible
- All input (environmental effect data) is validated and sanitized
- Automated tests (unit and integration) cover all environmental logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all environmental effects flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
