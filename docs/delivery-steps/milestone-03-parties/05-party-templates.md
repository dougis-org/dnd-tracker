# Party Templates

[Issue #25](https://github.com/dougis-org/dnd-tracker/issues/25)

**Objective:** Allow users to save and reuse party templates for quick setup.

## Tasks

- [ ] Implement template creation from existing parties
- [ ] Allow users to apply templates to new parties
- [ ] Manage template list (edit/delete)
- [ ] Validate template data (structure, required fields, no duplicates)
- [ ] Ensure template UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (e.g., template names, data)
- [ ] Write failing tests for template logic before implementation (TDD)
- [ ] Write tests for all template logic (CRUD, validation, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for party template usage and features

## Acceptance Criteria

- Users can create, edit, and delete party templates through the UI and API, with all actions reflected in the backend
- Templates can be applied to new parties, and data is copied correctly
- Template data is validated (structure, required fields, no duplicates) and reusable
- Template UI is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input (e.g., template names, data) is validated and sanitized
- Automated tests (unit and integration) cover all template logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all template flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
