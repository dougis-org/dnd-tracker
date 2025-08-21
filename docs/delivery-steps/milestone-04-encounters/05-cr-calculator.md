# Challenge Rating (CR) Calculator

**Objective:** Implement CR and XP calculation for encounters based on D&D 5e rules.

## Tasks

- [ ] Implement CR calculation logic for groups of creatures
- [ ] Calculate total XP for encounter
- [ ] Adjust CR for party size and difficulty
- [ ] Add UI for displaying CR and XP
- [ ] Write failing tests for calculation logic before implementation (TDD)
- [ ] Write unit and integration tests for CR calculation and UI
- [ ] Ensure CR calculator UI is accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (creature stats, party size, difficulty)
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for CR calculator usage and features

## Acceptance Criteria

- CR and XP calculations match D&D 5e rules for all supported scenarios, including edge cases (mixed party levels, invalid data)
- Adjustments for party size and difficulty are correct and validated
- UI displays CR and XP clearly and accessibly (WCAG 2.1 AA)
- All input (creature stats, party size, difficulty) is validated and sanitized
- Edge cases are handled gracefully with user feedback
- Automated tests (unit and integration) cover all calculation logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all calculator flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
