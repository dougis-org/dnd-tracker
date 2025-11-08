# Feature Specification: Monster / NPC Management

**Feature Branch**: `feature/007-monster-management`  
**Created**: 2025-11-08  
**Status**: Draft  
**Input**: User description: "Build the pages for monster and NPC management for use in campaigns and combat"

**Maintainer**: @doug
**Canonical components (UI)**: GlobalNav, MonsterCard, MonsterStatBlock, TemplateLibrary
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## Assumptions & Open Questions

- Assumption: Authentication and persistent storage are provided by later features (Feature 013/014). For now the UI should support both mock/local data and real API integration where available.

- Scope policy (resolved): Users may choose one of three scopes when creating or editing a monster/NPC:

  - Global: The monster is owned by the user and available across all of their campaigns (default personal library).

  - Campaign-specific: The monster is scoped to a single campaign and visible only when that campaign is active/selected.

  - Public: The monster is published to the system catalog, becomes read-only for all other users, and ownership transfers to the system. The original creator is preserved in metadata and credited on the monster detail page.

  The UI MUST allow the user to set the scope at creation time and edit scope later (subject to rules below). Public monsters are visible to all users as read-only entries. When a monster is made public its ownership transfers to the system account (ownerId = "system") and the original creator is recorded as creditedBy/creditedTo metadata for attribution.

## User Scenarios & Testing (mandatory)

### User Story 1 - Add and reuse monsters in combat (Priority: P1)

As a DM I want to add monsters to my library, view their stat blocks, and add them to encounters/combats so I can run a session more easily.

Why this priority: This is the core workflow that delivers value in combat and encounter building. Without it the app cannot support the DM's primary task.  

Independent Test: Use the Monster list page to add a monster to an encounter. Verify the monster appears in the encounter participant list with the correct initiative placeholder.

Acceptance Scenarios:

1. Given the user is on `/monsters`, when they click a monster, then they see a full stat block at `/monsters/:id` displaying HP, AC, CR, abilities, actions, legendary and lair actions if present.

2. Given the user is viewing an encounter builder, when they select a monster from the library, then the monster appears in the encounter participant list.

---

### User Story 2 - Create and edit monsters (Priority: P2)

As a DM I want to create new monsters (or edit existing ones) with a stat block builder so I can capture homebrew content and adjust monsters during play.

Why this priority: Creation/editing is necessary for homebrew and fine-tuning challenge. It's second to reuse in combat but still essential.

Independent Test: Open `/monsters/new` and complete the creation form. On save (or mock-save), verify the new monster appears in the list and its detail page shows the input fields.

Acceptance Scenarios:

1. Given the user is on `/monsters/new`, when they submit the required fields (name, CR, HP, AC), then the monster appears in `/monsters`.

2. Given the user opens `/monsters/:id/edit`, when they change an ability or HP value and save, then the updated values appear on the detail page.

---

### User Story 3 - Filter and search monsters (Priority: P3)

As a DM I want to filter the monster list by CR, type, and search by name so I can quickly find appropriate monsters during planning or combat.

Why this priority: Finding monsters quickly improves speed during prep and play.

Independent Test: On `/monsters` apply a CR filter and search by a monster name; confirm the list updates to show matching results.

Acceptance Scenarios:

1. Given the user has a populated library, when they apply CR filter `>= 5`, then only monsters with CR 5+ are shown.

2. Given the user types "goblin" into search, when they submit, then list shows monsters whose name contains "goblin".

---

### Edge Cases

- Monster missing optional fields (no legendary actions): detail page should gracefully hide those sections.
- Extremely long ability descriptions should wrap or collapse to maintain layout.
- Duplicate names: UI should show name and optional descriptor (e.g., "Goblin — Archer") to disambiguate.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: Monster list page (`/monsters`) MUST display a paginated or scrollable list of monsters with name, CR, type, and a short preview.
- **FR-002**: Monster detail page (`/monsters/:id`) MUST display a full stat block including at minimum: name, CR, size, type, alignment, HP, AC, speed, abilities (STR/DEX/CON/INT/WIS/CHA), saving throws, skills, damage resistances/immunities, condition immunities, senses, languages, challenge rating (CR), actions, legendary actions, lair actions, and special traits.
- **FR-003**: Monster creation page (`/monsters/new`) MUST provide a form that captures the required fields: name, CR, HP, AC, size, type, key abilities, actions (list), and optional legendary/lair actions.
- **FR-004**: Monster edit page (`/monsters/:id/edit`) MUST allow all fields editable and persist changes when backend is available; in mock mode the UI should reflect the change in the local dataset.
- **FR-005**: Monster list MUST support filtering by CR range and type, and searching by name. Filters and search MUST be combinable.
- **FR-006**: Monster templates library MUST allow saving monsters as templates and instantiating from templates when creating new monsters.
- **FR-007**: The UI MUST render special abilities, legendary actions and lair actions in clearly labeled sections and support multiple entries.
- **FR-008**: All pages MUST be navigable from the global navigation and respect mobile/responsive layouts.
- **FR-009**: Users MUST be able to set a Monster's scope to one of {Global, Campaign, Public} during creation and via edit page.
- **FR-010**: When a user marks a Monster as Public, ownership MUST transfer to the system account and the Monster becomes read-only for other users; the original creator's identity MUST be preserved in credited metadata and displayed on the detail page.

*Notes on uncertainty:* the sharing/scope of monster libraries (global vs campaign-scoped vs public system catalog) is recorded above and reflected in FR-009/FR-010. If additional sharing models are required (team workspaces, paid-shared catalogs), open a follow-up story.

### Key Entities

- **Monster**: Represents a creature or NPC. Key attributes: id, name, cr, size, type, alignment, hp, ac, speed, abilities (STR/DEX/CON/INT/WIS/CHA), savingThrows, skills, resistances, immunities, senses, languages, actions (array), legendaryActions (array), lairActions (array), tags, templateId (optional), createdAt, updatedAt.

  Additional ownership and scope metadata: `ownerId` (current owner; may be "system" for public entries), `createdBy` (original creator userId), `scope` (enum: `global` | `campaign` | `public`), `isPublic` (boolean), `publicAt` (timestamp if public), `creditedTo` (userId or display name shown on public entries).

- **MonsterTemplate**: A reusable definition used to instantiate a Monster. Key attributes: templateId, name, defaultValues (subset of Monster fields), tags, createdBy.

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: `/monsters` is accessible and displays the monster list for 100% of users in the test group.
- **SC-002**: 95% of list filter and search actions return visible matching results within 1 second on a typical developer machine or common cloud runner environment.
- **SC-003**: Users can create a new monster via the UI (or mock-save) and see it listed within one UX flow (create → list → detail) in at most 3 user actions.
- **SC-004**: Monster detail page displays all mandatory stat-block fields for 98% of sample monsters (based on provided mock dataset of 10 monsters).
- **SC-005**: Accessibility: Core pages (`/monsters`, `/monsters/:id`, `/monsters/new`) pass basic keyboard-navigation and screen-reader spot checks during review.

## Testable Acceptance Criteria (normalized)

- AC-001: Visiting `/monsters` shows at least one monster (given mock data is present).
- AC-002: Applying CR filter `>= 5` on `/monsters` shows only monsters with CR 5 or greater in the current dataset.
- AC-003: Visiting `/monsters/:id` shows the monster's name, HP, AC, CR, actions, and any legendary/lair actions if defined.
- AC-004: Visiting `/monsters/new` shows a form with fields for name, CR, HP, AC, and actions.
- AC-005: Saving a new monster (mock or real) results in the monster appearing on the `/monsters` list and its detail page being reachable.

## Implementation Notes (UI-only, non-implementation guidance)

- The spec intentionally omits backend schema design; use the Key Entities section to guide API contract design in a follow-up story.

- For this feature MVP: prefer read/write via mock adapters or existing API stubs so UI teams can iterate before API stabilization.

## Policy note

The library scope decision has been recorded above: support for *Global*, *Campaign-specific*, and *Public* scopes with the public ownership-transfer behavior.

## Files referenced (for implementers)

- Design reference: `docs/design/dnd-tracker-database-design.md` (monster data model inspiration)
- Roadmap: `docs/Feature-Roadmap.md` (Feature 007 entry)

## Next steps

1. Create API contract story (Monster model & CRUD APIs) as Feature 023/024 (already planned).
2. Implement UI pages in the following vertical slices (list/detail → create/edit → templates → encounter integration).

---

**End of specification (draft)**
