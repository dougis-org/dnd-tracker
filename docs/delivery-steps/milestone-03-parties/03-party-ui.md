# Party Management UI

[Issue #23](https://github.com/dougis-org/dnd-tracker/issues/23)

**Objective:** Build the user interface for creating, editing, and managing parties.

## Tasks

- [ ] Create party management page/component
- [ ] List all parties for the user
- [ ] Add, edit, and delete party functionality
- [ ] Display party details and members
- [ ] Ensure UI is responsive and accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (e.g., party names, member data)
- [ ] Write failing tests for UI logic before implementation (TDD)
- [ ] Write tests for all UI logic (CRUD, display, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for party management UI usage and features

## Acceptance Criteria

- Users can view, create, edit, and delete parties through the UI, with all actions reflected in the backend
- Party details and members are visible, accurate, and up to date
- UI is responsive (works on all screen sizes) and accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input (e.g., party names, member data) is validated and sanitized
- Automated tests (unit and integration) cover all UI logic, CRUD, and accessibility (80%+ coverage)
- Manual testing confirms all UI flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
