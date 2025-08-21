# Character Validation & Business Rules

**Objective:** Enforce D&D 5e rules and custom business logic for character creation and editing.

## Tasks

- [ ] Implement validation for all D&D 5e rules (ability scores, class limits, etc.)
- [ ] Add custom business rules (subscription tier limits, etc.)
- [ ] Integrate validation into forms and API
- [ ] Validate and sanitize all input at both form and API level
- [ ] Write failing tests for validation logic before implementation (TDD)
- [ ] Write tests for all validation logic (rules, business logic, edge cases)
- [ ] Ensure validation error messages are accessible and clear (ARIA, screen reader support)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for validation rules and business logic

## Acceptance Criteria

- All D&D 5e rules (ability scores, class limits, etc.) are enforced at both form and API level
- Custom business rules (e.g., subscription tier limits) are applied and enforced
- Invalid data is prevented at both form and API level, with clear and accessible error messages
- All input is validated and sanitized before processing
- Validation error messages are accessible (WCAG 2.1 AA), screen reader friendly, and clear to users
- Automated tests (unit and integration) cover all validation logic, business rules, and error handling (80%+ coverage)
- Manual testing confirms all validation flows, error handling, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
