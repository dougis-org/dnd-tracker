# Action Descriptions & Tooltips

**Objective:** Provide detailed descriptions and tooltips for all actions in combat.

## Tasks

- [ ] Add descriptions for all D&D 5e actions
- [ ] Implement tooltips in combat UI
- [ ] Support custom action descriptions
- [ ] Document all actions and effects
- [ ] Ensure tooltips and descriptions are accessible (ARIA, keyboard navigation, screen reader support)
- [ ] Validate and sanitize all input (action descriptions, custom actions)
- [ ] Write failing tests for action description logic before implementation (TDD)
- [ ] Write unit and integration tests for action descriptions and tooltips
- [ ] Document any new environment variables in `.env.example` (if any)
- [ ] Update documentation for action descriptions and tooltips usage

## Acceptance Criteria

- All actions have descriptions/tooltips and are validated
- UI displays tooltips contextually and accessibly (WCAG 2.1 AA)
- Custom actions are supported and validated
- All input (action descriptions, custom actions) is validated and sanitized
- Documentation is complete and up to date
- Automated tests (unit and integration) cover all action description logic, validation, and accessibility (80%+ coverage)
- Manual testing confirms all action description flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
