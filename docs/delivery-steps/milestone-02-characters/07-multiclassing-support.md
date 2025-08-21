# Multiclassing Support

**Objective:** Add logic and UI for multiclassing in character creation and editing.

## Tasks

- [ ] Implement multiclassing logic in character schema and forms
- [ ] Add UI for adding/removing classes
- [ ] Validate multiclassing rules (prerequisites, hit dice, etc.)
- [ ] Update character summary to show all classes
- [ ] Ensure multiclassing UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (e.g., class names, levels)
- [ ] Write failing tests for multiclassing logic before implementation (TDD)
- [ ] Write tests for all multiclassing logic (validation, UI, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for multiclassing usage and features

## Acceptance Criteria

- Users can add and remove multiple classes in the UI, and changes are reflected in the model
- Validation prevents all invalid multiclassing scenarios (prerequisites, hit dice, etc.)
- UI clearly shows all classes and levels, and updates in real time
- Multiclassing is reflected in character details and summary
- Multiclassing UI is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input (e.g., class names, levels) is validated and sanitized
- Automated tests (unit and integration) cover all multiclassing logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all multiclassing flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
