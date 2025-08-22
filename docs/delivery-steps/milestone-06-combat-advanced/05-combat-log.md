# Combat Log & History

**Objective:** Build a detailed combat log with timestamps and export features.

## Tasks

- [ ] Log all combat actions with timestamps
- [ ] Add UI for viewing and filtering log
- [ ] Support export to JSON/PDF
- [ ] Integrate with undo/redo system
- [ ] Write failing tests for log logic before implementation (TDD)
- [ ] Write unit and integration tests for log logic and UI
- [ ] Ensure combat log UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (log data, export requests)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for combat log usage and features

## Acceptance Criteria

- All actions are logged with timestamps and are validated
- Log is viewable and filterable in UI, and is accessible (WCAG 2.1 AA)
- Export to JSON/PDF works and is validated
- Undo/redo is integrated and validated
- All input (log data, export requests) is validated and sanitized
- Automated tests (unit and integration) cover all log logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all log flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
