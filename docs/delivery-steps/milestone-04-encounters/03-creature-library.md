# Creature Library

**Objective:** Build a searchable, filterable database of creatures/monsters with all D&D stats.

## Tasks

- [ ] Create MongoDB collection for creatures
- [ ] Implement search and filter by name, type, CR, etc.
- [ ] Add pagination and sorting
- [ ] Support import/export of creature data
- [ ] Add UI for browsing and searching creatures
- [ ] Ensure UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (e.g., search/filter params)
- [ ] Write failing tests for library logic before implementation (TDD)
- [ ] Write tests for all library logic (search, filter, pagination, import/export, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for creature library usage and features

## Acceptance Criteria

- Creature library is searchable and filterable for all supported fields
- All D&D stats are present for each creature and displayed correctly
- Pagination and sorting work as expected and are performant
- Import/export is functional, with valid and complete data
- UI is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input (e.g., search/filter params) is validated and sanitized
- Automated tests (unit and integration) cover all library logic, search, filter, pagination, import/export, and accessibility (80%+ coverage)
- Manual testing confirms all library flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
