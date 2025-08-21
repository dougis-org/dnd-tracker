# Character List View

**Objective:** Build a component to display a list of all user characters with sorting and filtering.

## Tasks

- [ ] Create character list component
- [ ] Add sorting (by name, class, level, updated date)
- [ ] Add filtering (by class, level, status)
- [ ] Implement pagination or infinite scroll
- [ ] Add links to character details and edit
- [ ] Ensure list is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (e.g., filter/sort params)
- [ ] Write failing tests for list logic before implementation (TDD)
- [ ] Write tests for all list logic (sorting, filtering, pagination, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for list usage and features

## Acceptance Criteria

- List displays all characters for the user, with correct data and no missing entries
- Sorting and filtering work as expected for all supported fields
- Pagination/infinite scroll is functional and performant
- Each character links to its detail and edit page, and navigation works
- List is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input (e.g., filter/sort params) is validated and sanitized
- Automated tests (unit and integration) cover all list logic, sorting, filtering, pagination, and accessibility (80%+ coverage)
- Manual testing confirms all list flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
