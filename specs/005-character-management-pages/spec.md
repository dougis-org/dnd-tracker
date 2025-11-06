```markdown
# Feature Specification: Character Management Pages

**Feature Branch**: `feature/005-character-management-pages`
**Created**: 2025-11-05
**Status**: Draft
**Input**: User description: "Character Management Pages: list, detail, create/edit forms, stats display, delete confirmation modal, search and filters, mock data UI"

**Maintainer**: @doug
**Canonical components (UI)**: GlobalNav, Breadcrumb, NotImplementedPage
**Constitution**: This specification must comply with `.specify/memory/constitution.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Characters (Priority: P1)

As a player, I want to see a list of my characters so I can quickly find and open a character to view or manage it.

**Why this priority**: The character list is the primary entry point for managing characters; without it users cannot access details or edits.

**Independent Test**: Visit `/characters` and confirm a paginated list or grid of mock characters displays with search and filter controls.

**Acceptance Scenarios**:

1. **Given** the user navigates to `/characters`, **When** the page loads, **Then** the UI displays a list of mock characters (at least 5) with name, class, level, and quick stats (HP, AC).
2. **Given** the list is shown, **When** the user uses the search box and types a character name, **Then** the list filters to matching results.

---

### User Story 2 - View Character Details (Priority: P1)

As a player, I want to open a character to view all stats and equipment so I can inspect build and role-play details.

**Why this priority**: Details are core to the feature — they surface all the data users expect for a character.

**Independent Test**: Visit `/characters/:id` and verify the stat block renders (HP, AC, abilities, equipment, class, race, level).

**Acceptance Scenarios**:

1. **Given** a character card in the list, **When** the user clicks it, **Then** they are taken to `/characters/:id` showing full character information.
2. **Given** an invalid id, **When** the user attempts to load details, **Then** the page shows a friendly error or empty state with a link back to `/characters`.

---

### User Story 3 - Create New Character (Priority: P2)

As a player, I want a creation form that lets me create a new character with all standard D&D 5e fields so I can add characters to my roster.

**Why this priority**: Creation enables the product to be useful for new users and content generation.

**Independent Test**: Visit `/characters/new` and verify the form contains fields for name, class, race, level, HP, AC, abilities (STR/DEX/CON/INT/WIS/CHA), and equipment lists. The form is UI-only (no persistent submission required for this mock iteration).

**Acceptance Scenarios**:

1. **Given** the create form is open, **When** the user fills valid inputs for required fields and clicks Submit, **Then** the UI shows a success toast or navigates to the new character detail page (mock behavior).
2. **Given** required fields are empty, **When** the user attempts to submit, **Then** inline validation prevents submission and shows validation messages.

---

### User Story 4 - Edit Character (Priority: P2)

As a player, I want to edit a character's details so I can correct or update stats.

**Independent Test**: Visit `/characters/:id` and use an Edit button to open the same form prefilled with the character's mock data.

**Acceptance Scenarios**:

1. **Given** the user opens Edit for a character, **When** they change values and click Save, **Then** the UI updates the displayed values (mock behavior) and shows confirmation.

---

### User Story 5 - Delete Character (Priority: P3)

As a player, I want to remove a character from my roster with a confirmation step to prevent accidental deletion.

**Independent Test**: From the character detail page, click Delete and verify a modal appears asking to confirm deletion.

**Acceptance Scenarios**:

1. **Given** the user requests deletion, **When** they confirm, **Then** the character is removed from the mock list and the UI navigates to `/characters`.

---

### Edge Cases

- What happens when there are zero characters? The list should show an empty state with a prominent CTA to create a character.
- How are very long character names or equipment lists handled? UI should gracefully wrap or truncate with full view in details.
- How does the UI behave on narrow screens? List collapses into a stacked layout and cards are tappable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a list of characters at `/characters` with at least name, class, level, HP, and AC visible on each card.
- **FR-002**: The system MUST provide a character detail page at `/characters/:id` that shows full stats, abilities, equipment, and notes.
- **FR-003**: The system MUST provide a Create form at `/characters/new` containing all standard D&D 5e fields (name, class, race, level, HP, AC, STR/DEX/CON/INT/WIS/CHA, skills, equipment, backstory).
- **FR-004**: The system MUST provide an Edit form accessible from the detail page to update character fields (UI-only for this iteration).
- **FR-005**: The system MUST include a Delete action that opens a confirmation modal before removing a character from the mock list.
- **FR-006**: The system MUST include a search box to filter characters by name and a basic filter control to narrow by class or level.
- **FR-007**: The UI MUST include basic client-side validation for required fields (name, class, level) and sensible ranges for numeric fields (level: 1-20, HP: >=0).
- **FR-008**: All flows MUST be testable with mocked data and without backend persistence for the initial mock iteration.

*Clarifications (resolved):*

- **Required fields for MVP (choice: B — Standard required)**: The MVP will require the following fields as mandatory in forms and validation: name, class, race, level, HP, AC, and the six ability scores (STR, DEX, CON, INT, WIS, CHA). Other fields such as equipment lists, skills, and backstory are optional for this iteration and may be editable but are not required to submit the form.
- **Deletion semantics (choice: B — Permanent delete + undo)**: Delete will remove the character from the mock list immediately after confirmation, but the UI will present a transient toast with an "Undo" action available for ~5 seconds to restore the deleted item in the mock data. This balances simple behavior with a guard against accidental deletes.
- **Search & filter expectations (choice: A — Partial, case-insensitive, combinable filters)**: Search will be partial (substring) and case-insensitive. Filters (e.g., class, level) will be combinable so users can narrow results by multiple criteria (for example: class=Rogue AND level>=5).

### Key Entities *(include if feature involves data)*

- **Character**: Represents a player character. Attributes (minimal, technology-agnostic):
  - id (unique identifier)
  - name
  - class (e.g., Fighter, Wizard)
  - race (e.g., Human, Elf)
  - level (integer)
  - hitPoints (current and max)
  - armorClass
  - abilities (STR, DEX, CON, INT, WIS, CHA scores)
  - skills (list)
  - equipment (list of items)
  - notes/backstory (text)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view a populated characters list at `/characters` with at least 5 mock characters visible.
- **SC-002**: Search reduces visible results to matching characters in under 1 second (perceived instant filtering on typical dev machine).
- **SC-003**: The create form validates required fields and prevents submission when required fields are missing in 100% of manual tests.
- **SC-004**: The delete confirmation prevents accidental deletes in manual testing (confirm modal appears and requires explicit confirm action).
- **SC-005**: Mobile layout displays character cards readable on small screens and primary actions (view, create) remain accessible.

## Assumptions

- This feature implements UI-only mock behavior for listing, viewing, creating, editing, and deleting characters; no persistent API calls are required for the initial iteration.
- Authorization and multi-user concerns are out of scope; assume a single user context for UI mocks.
-- Form field lists are broadly aligned with D&D 5e conventions; required fields for the MVP are: name, class, race, level, HP, AC, and abilities (STR–CHA). Other fields remain optional.

## Test Plan (brief)

- Unit tests for components: CharacterCard, CharacterList, CharacterDetail, CharacterForm, DeleteModal.
- Integration tests for page flows: list → detail → edit → list; create → list; delete → list.
- E2E checks: basic navigation to `/characters`, `/characters/new`, and `/characters/:id` with mocked data.

---

**Spec Ready For**: Planning (/speckit.plan) pending clarifications in NEEDS CLARIFICATION markers above.

```
