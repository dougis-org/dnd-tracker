# Usage Tracking & Limits

**Objective:** Track and enforce usage limits for parties, encounters, and creatures.

## Tasks

- [ ] Track usage for all content types per user
- [ ] Enforce limits in API and UI
- [ ] Display usage stats to users
- [ ] Alert users when approaching limits
- [ ] Write failing tests for usage logic before implementation (TDD)
- [ ] Write unit and integration tests for usage tracking and limits
- [ ] Validate and sanitize all usage tracking and limit data
- [ ] Document all usage tracking logic, environment variables, and usage

## Acceptance Criteria

- Usage is tracked for all content types and validated
- Limits are enforced by tier and tested
- Users are alerted as they approach limits and changes persist
- All usage tracking and limit data is validated and sanitized
- Automated tests (unit and integration) cover all usage tracking and limit logic (80%+ coverage)
- Manual testing confirms all usage tracking and limit flows
- All new environment variables are documented in `.env.example` and loaded correctly
- Documentation is complete and up to date
