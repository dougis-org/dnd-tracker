# Feature Specification: Encounter Builder Pages

**Feature Branch**: `feature/008-encounter-builder`
**Created**: 2025-11-08
**Status**: Draft
**Input**: User description: "Build the encounter creation pages for user interaction"

**Maintainer**: @doug
**Canonical components (UI)**: EncountersList, EncounterCreatePage, EncounterEditor
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## Clarifications

### Session 2025-11-08

- Q: Data sharing model for encounters & templates? → A: Per-user storage for MVP; design schema to include an `owner_id` and an optional `org_id` (nullable) so the permissions/organization-sharing model can be added later without a breaking migration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create encounter from scratch (Priority: P1)

A Game Master (GM) wants to create a new encounter by selecting monsters, assigning HP and quantities, adding notes, and saving the encounter to reuse later.

**Why this priority**: Core value — enables sessions to be prepared and reused.

**Independent Test**: A user can open the "New Encounter" page, add at least one monster and quantity, set initiative ordering, and save the encounter. The saved encounter appears in the user's encounter list and can be opened for review.

**Acceptance Scenarios**:

1. **Given** the GM is authenticated and on the encounters page, **When** they click "New Encounter", **Then** they see the encounter creation form.
2. **Given** the form is filled with at least one participant (monster or party member) and a name, **When** the GM clicks "Save", **Then** the encounter is persisted and visible in the encounters list.

---

### User Story 2 - Build encounter from a party or saved template (Priority: P2)

The GM wants to quickly scaffold an encounter by importing members from a selected party or using a saved encounter template, then tweak quantities and notes.

**Why this priority**: Improves speed and reduces repetitive tasks for common session tasks.

**Independent Test**: From the New Encounter page, selecting a party or template pre-populates participant entries. Modifying any field and saving persists the modified encounter as a new item.

**Acceptance Scenarios**:

1. **Given** a party exists, **When** the GM selects "Import from party" and chooses a party, **Then** the party members are added as participants in the form.

---

### User Story 3 - Edit encounter and adjust initiative/HP during planning (Priority: P3)

The GM wants to edit a saved encounter to change initiative order, hit points, or remove participants before a session.

**Why this priority**: Allows iterative planning and corrections.

**Independent Test**: Opening a saved encounter and changing initiative values or HP then saving persists the changes and the encounter reflects updates in the list and when reopened.

**Acceptance Scenarios**:

1. **Given** a saved encounter, **When** the GM reopens it and modifies participant order or HP, **Then** saving updates the stored encounter and subsequent opens show new values.

---

### Edge Cases

- Creating an encounter with zero participants should be blocked with a clear validation error.
- Duplicate participant entries (same monster and instance) should be allowed but clearly distinguishable (e.g., instance count or suffix).
- Large encounters (50+ participants) should not crash the UI; ensure the list scrolls and input remains responsive.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a "New Encounter" page with a form to enter encounter name, participants, notes, and optional template selection.
- **FR-002**: The system MUST allow adding participants of types: monster, party member, or custom NPC, with configurable name, quantity, HP, and initiative.
- **FR-003**: The system MUST validate that an encounter has a name and at least one participant before allowing save.
- **FR-004**: The system MUST support importing participants from an existing party or a saved encounter template.
- **FR-005**: The system MUST allow saving encounters as reusable templates and listing saved encounters in the Encounters list.
- **FR-006**: The system MUST allow editing saved encounters and persisting changes.
- **FR-007**: The system MUST provide a compact, paginated list view for encounters with search and simple filters (by name, tag, created date).

### Key Entities

- **Encounter**: Represents an encounter instance. Attributes: id, name, description, participants[], created_at, updated_at, tags, template_flag, owner_id, org_id (nullable).
- **Participant**: Represents a participant entry in an encounter. Attributes: id, type (monster|party_member|custom), displayName, quantity, hp, initiative, metadata (notes).
- **EncounterTemplate**: A saved encounter flagged for reuse. Essentially an Encounter with template_flag=true.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can create and save a basic encounter (name + one participant) without help in under 2 minutes in testing.
- **SC-002**: Saved encounters appear in the encounters list within 2 seconds of saving in test environment.
- **SC-003**: Import from party or template successfully pre-populates participant lists 98% of the time in automated tests.
- **SC-004**: UI remains responsive (no full reflows or freezes) for encounters with up to 100 participants in a modern desktop browser during testing.

---

## Non-functional Considerations (short)

- Provide client-side validation and optimistic UI updates for create/save flows; server-side persistence is eventually consistent but must reflect saved items on reload.
- Accessibility: form controls should have labels, keyboard focus order, and announcements for save errors.

## Assumptions

- This feature is UI-first: backend persistence uses existing project persistence conventions (not specified here) and is available via existing APIs or local storage for initial MVP.
- Users are authenticated and have access to their saved parties and templates.

## Out of Scope

- Live combat session integration (initiative tracking during an active combat session) — this is covered by separate features.
- Complex AI-driven monster selection or CR balancing suggestions.

## Next Steps

1. Implement UI pages: Encounters list, New Encounter page, Encounter editor.
2. Add unit tests for components and integration E2E scenarios for the user stories above.
3. Create API contract / adapters if backend endpoints are missing (separate story).
