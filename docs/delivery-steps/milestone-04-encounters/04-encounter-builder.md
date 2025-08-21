# Encounter Builder

**Objective:** Create a drag-and-drop interface for building encounters with parties and creatures, including real-time CR/XP calculation and validation.

## Tasks

- [ ] Implement drag-and-drop UI for adding/removing creatures and parties
- [ ] Display party and creature stats in builder
- [ ] Support CR/XP calculation in real time
- [ ] Allow saving and editing encounters
- [ ] Add validation for encounter rules (party size, CR limits, etc.)
- [ ] Add creature search/filter and environment selection
- [ ] Ensure builder UI is accessible (ARIA, keyboard navigation, screen reader support, drag-and-drop accessibility)
- [ ] Validate and sanitize all input (e.g., party/creature IDs, encounter data)
- [ ] Write failing tests for builder logic before implementation (TDD)
- [ ] Write tests for all builder logic (UI, validation, CR/XP, accessibility)
- [ ] Document all new environment variables in `.env.example` (if any)
- [ ] Update documentation for encounter builder usage and features

## Acceptance Criteria

- Users can build encounters visually using drag-and-drop, and all actions are reflected in the backend
- Party and creature stats are visible, accurate, and editable in the builder
- CR/XP updates in real time as the encounter is built/edited
- Encounter rules (party size, CR limits, etc.) are enforced and prevent invalid configurations
- Encounters can be saved and edited, and changes persist
- Builder UI is accessible (WCAG 2.1 AA), keyboard navigable, screen reader friendly, and drag-and-drop is accessible
- All input (e.g., party/creature IDs, encounter data) is validated and sanitized
- Automated tests (unit and integration) cover all builder logic, validation, CR/XP, and accessibility (80%+ coverage)
- Manual testing confirms all builder flows, validation, and accessibility
- All new environment variables (if any) are documented in `.env.example` and loaded correctly
- All new setup and usage steps are documented in the project README
