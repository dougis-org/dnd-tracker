# Creature Templates

**Objective:** Allow users to create, save, and reuse custom creature templates.

## Tasks

- [ ] Implement template creation from existing creatures
- [ ] Allow users to apply templates to new creatures
- [ ] Manage template list (edit/delete)
- [ ] Validate and sanitize template data
- [ ] Write failing tests for template logic before implementation (TDD)
- [ ] Write unit and integration tests for template creation, application, and management
- [ ] Ensure template UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for creature template usage and features

## Acceptance Criteria

- Users can create, edit, and delete creature templates through an accessible UI (WCAG 2.1 AA)
- Templates can be applied to new creatures and changes persist
- All template data is validated and sanitized before saving or applying
- Automated tests (unit and integration) cover all template logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all template flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
