# Character Assignment to Parties

[Issue #24](https://github.com/dougis-org/dnd-tracker/issues/24)

**Objective:** Enable assigning and removing characters from parties.

## Tasks

- [ ] Implement character selection for party assignment
- [ ] Allow removing characters from parties
- [ ] Validate character-party relationships (no duplicates, valid party size, etc.)
- [ ] Update party and character data accordingly
- [ ] Ensure assignment UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (e.g., character IDs, party IDs)
- [ ] Write failing tests for assignment logic before implementation (TDD)
- [ ] Write tests for all assignment logic (CRUD, validation, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for character assignment usage and features

## Acceptance Criteria

- Characters can be assigned to and removed from parties through the UI and API, with all actions reflected in the backend
- Data updates are reflected in both party and character records, and are accurate
- Invalid assignments (e.g., duplicates, exceeding party size, invalid IDs) are prevented and return clear errors
- Assignment UI is accessible (WCAG 2.1 AA), keyboard navigable, and screen reader friendly
- All input (e.g., character IDs, party IDs) is validated and sanitized
- Automated tests (unit and integration) cover all assignment logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all assignment flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
