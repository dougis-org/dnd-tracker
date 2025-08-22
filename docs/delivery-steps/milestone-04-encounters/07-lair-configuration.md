# Lair Action Configuration

**Objective:** Support lair action setup and configuration for encounters and creatures.

## Tasks

- [ ] Add lair action fields to creature and encounter models
- [ ] Implement UI for configuring lair actions
- [ ] Validate and sanitize lair action triggers and effects
- [ ] Support initiative 20 triggers
- [ ] Write failing tests for lair action logic before implementation (TDD)
- [ ] Write unit and integration tests for lair action logic and UI
- [ ] Ensure lair action UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for lair action configuration and usage

## Acceptance Criteria

- Lair actions can be configured for any creature or encounter through an accessible UI (WCAG 2.1 AA)
- Initiative 20 triggers are supported and function correctly
- All lair action triggers and effects are validated and sanitized
- UI for lair actions is functional, accessible, and user-friendly
- Automated tests (unit and integration) cover all lair action logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all lair action flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
