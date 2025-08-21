# Combat Controls & Shortcuts

**Objective:** Provide a control panel and keyboard shortcuts for common combat actions.

## Tasks

- [ ] Create combat control panel UI
- [ ] Add keyboard shortcuts for advancing turns, applying damage, etc.
- [ ] Allow customization of shortcuts
- [ ] Document all controls and shortcuts
- [ ] Ensure control panel UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (shortcut keys, control actions)
- [ ] Write failing tests for controls/shortcuts logic before implementation (TDD)
- [ ] Write unit and integration tests for controls/shortcuts logic and UI
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for combat controls and shortcuts usage

## Acceptance Criteria

- Control panel is available, functional, and accessible (WCAG 2.1 AA)
- Shortcuts work for all major actions and are validated
- Users can customize shortcuts and changes persist
- All input (shortcut keys, control actions) is validated and sanitized
- Controls and shortcuts are documented in the README
- Automated tests (unit and integration) cover all controls/shortcuts logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all controls/shortcuts flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
