# Feature Specification: Party Management Pages

**Feature Branch**: `feature/006-party-management-pages`  
**Created**: 2025-11-06  
**Status**: Active  
**Feature Number**: F006

**Maintainer**: @doug
**Canonical components (UI)**: PartyCard, PartyList, PartyForm
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View All Parties (Priority: P1)

A DM needs to see a comprehensive list of all parties they've created, with quick visual preview of party composition (members, roles, level range) to manage their campaigns effectively.

**Why this priority**: Core primary use case - DMs need to manage multiple parties. This is the main entry point for party management.

**Independent Test**: Can be fully tested by navigating to `/parties` and verifying the list renders with mock data. Delivers value immediately: users can see their parties at a glance.

**Acceptance Scenarios**:

1. **Given** user is authenticated, **When** user navigates to `/parties`, **Then** page displays list of all parties with cards
2. **Given** parties exist, **When** viewing `/parties`, **Then** each party card shows: party name, member count, and member role distribution (tank/healer/DPS counts)
3. **Given** multiple parties exist, **When** viewing the list, **Then** parties are displayed in a responsive grid that adapts to screen size (1-3 columns based on viewport)
4. **Given** user is on `/parties`, **When** user clicks on a party card, **Then** user navigates to `/parties/:id` detail page

---

### User Story 2 - View Party Details & Composition (Priority: P1)

A DM needs to see detailed information about a specific party including all members, their stats, and roles to manage combat encounters and track party composition.

**Why this priority**: Essential for campaign management - users need to understand party composition to build balanced encounters.

**Independent Test**: Can be fully tested by navigating to `/parties/:id` with mock data. Delivers value: users understand their party's capabilities and limitations.

**Acceptance Scenarios**:

1. **Given** a party exists, **When** user navigates to `/parties/:id`, **Then** page displays party name, description, and full member list
2. **Given** viewing party detail page, **When** page loads, **Then** display each member as a card showing: name, class, race, level, AC, HP (with visual bars)
3. **Given** members are displayed, **When** viewing member cards, **Then** each shows role badge (tank/healer/DPS) with appropriate color coding
4. **Given** party detail page, **When** user views member list, **Then** a summary section at top shows: total members, average level, party tier, and role distribution visually
5. **Given** party detail page, **When** user clicks on a member card, **Then** user can see full member details in expanded view

---

### User Story 3 - Create New Party (Priority: P1)

A DM needs to create a new party with members to start tracking a new campaign or adventure group.

**Why this priority**: Critical user flow - without ability to create parties, the feature is unusable.

**Independent Test**: Can be fully tested by navigating to `/parties/new`, filling form with mock data, and verifying form submission UI is present. Delivers value: UI is ready for future backend integration.

**Acceptance Scenarios**:

1. **Given** user navigates to `/parties/new`, **When** page loads, **Then** creation form displays with fields: party name, description, campaign setting
2. **Given** on creation form, **When** user sees form, **Then** form includes section for adding members with "Add Member" button
3. **Given** in member section, **When** user clicks "Add Member", **Then** member form appears with fields: character selection (mock dropdown), role (tank/healer/DPS dropdown)
4. **Given** form is filled out, **When** user clicks submit button, **Then** form shows "Not Implemented" message (or submits to mock endpoint)
5. **Given** user navigates away from `/parties/new`, **When** unsaved changes exist, **Then** warning dialog may appear (optional UX polish)

---

### User Story 4 - Edit Party Details (Priority: P2)

A DM needs to update party information (name, description) and manage members to keep party data current.

**Why this priority**: Important for ongoing campaign management but less critical than viewing and creating. Users with existing parties will need this eventually.

**Independent Test**: Can be fully tested by navigating to `/parties/:id/edit` and verifying form displays current data. Delivers value: users can see edit form with all fields pre-populated.

**Acceptance Scenarios**:

1. **Given** party detail page, **When** user clicks Edit button, **Then** user navigates to `/parties/:id/edit` page
2. **Given** on edit form, **When** page loads, **Then** form pre-populates with current party data (name, description, existing members)
3. **Given** user modifies party data, **When** user clicks "Save Changes", **Then** form shows "Not Implemented" message or submits (mock)
4. **Given** user wants to add members during edit, **When** user clicks "Add Member", **Then** member form appears (same as create flow)
5. **Given** user has existing members, **When** viewing member list on edit page, **Then** each member has a "Remove" button for member management

---

### User Story 5 - Delete Party with Confirmation (Priority: P2)

A DM needs to delete parties that are no longer used to keep their party list clean and organized.

**Why this priority**: Important for data management but non-critical - doesn't prevent core workflows.

**Independent Test**: Can be fully tested by viewing party detail/list and verifying delete button appears and triggers confirmation modal. Delivers value: users can see delete action is available.

**Acceptance Scenarios**:

1. **Given** party detail page, **When** user clicks Delete button, **Then** confirmation modal appears asking "Are you sure?"
2. **Given** confirmation modal is open, **When** user clicks "Cancel", **Then** modal closes without deleting
3. **Given** confirmation modal is open, **When** user clicks "Confirm Delete", **Then** form shows "Not Implemented" message or deletes (mock)
4. **Given** party list view, **When** party is viewed, **Then** delete action is available (via Edit or Delete button)

---

### User Story 6 - Member Management UI (Priority: P2)

A DM needs to add, remove, and organize members within a party to manage party composition flexibly.

**Why this priority**: Supports core party management but can be implemented initially with limited functionality (add/remove UI only).

**Independent Test**: Can be fully tested by verifying add/remove member form fields and buttons appear on creation and edit forms.

**Acceptance Scenarios**:

1. **Given** party creation or edit form, **When** user clicks "Add Member", **Then** member input form appears with fields: character name (text), class (dropdown), race (dropdown), level (number)
2. **Given** member form is displayed, **When** user selects a class, **Then** appropriate class icon or label updates visually
3. **Given** member added to list, **When** user views the member preview, **Then** member card shows name, class, level, and role selector
4. **Given** member in list, **When** user clicks role selector, **Then** dropdown options appear: Tank, Healer, DPS, Support (with descriptions)
5. **Given** member is added, **When** user clicks "Remove" next to member, **Then** member is removed from form (visual feedback)
6. **Given** user has added multiple members, **When** user submits form, **Then** all members are included in submission

---

### Edge Cases

- What happens when user tries to delete a party used in encounters? (Show warning: "This party is used in X encounters")
- How does system handle large parties (10+ members)? (Scrollable list, paginated if needed for performance)
- What if user navigates to `/parties/:id` for non-existent party? (Show "Party not found" error or redirect to `/parties`)
- What if user adds duplicate members to same party? (Either prevent or show warning)
- How does system handle member without assigned role? (Default to unassigned or show visual indicator)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display party list page at `/parties` showing all parties with summary cards
- **FR-002**: System MUST display party detail page at `/parties/:id` showing full party composition with member details
- **FR-003**: System MUST display party creation form at `/parties/new` with fields for party name, description, campaign setting, and member management
- **FR-004**: System MUST display party edit form at `/parties/:id/edit` with pre-populated data and member management
- **FR-005**: System MUST display delete confirmation modal when user requests party deletion
- **FR-006**: System MUST render member cards on detail/edit pages with: name, class, race, level, AC, HP, role badge, and visual indicators
- **FR-007**: System MUST display role selector (Tank/Healer/DPS/Support) for each member with color-coded badges
- **FR-008**: System MUST show party composition summary: member count, average level, party tier, role distribution chart/counts
- **FR-009**: System MUST display responsive grid layout for party list (1-3 columns based on viewport)
- **FR-010**: System MUST implement member add/remove UI with form validation

### Key Entities

- **Party**: Represents a group of adventurers. Attributes: ID, name, description, campaign setting, created date, updated date, member array
- **PartyMember**: Represents an individual party member. Attributes: character ID/name, class, race, level, AC, HP, role (tank/healer/dps), position in party
- **Role**: Enum representing party roles - Tank, Healer, DPS, Support

### Mock Data Requirements

- **Party 1**: "The Grovewalkers" - 4 members (1 tank, 1 healer, 2 DPS)
  - Theron (Paladin, Half-Orc, Lvl 5, AC 18, HP 52, Tank)
  - Elara (Cleric, Half-Elf, Lvl 5, AC 17, HP 38, Healer)
  - Kess (Rogue, Halfling, Lvl 5, AC 15, HP 28, DPS)
  - Bron (Barbarian, Dwarf, Lvl 4, AC 14, HP 45, DPS)
- **Party 2**: "Moonlit Syndicate" - 5 members (1 tank, 1 healer, 2 DPS, 1 support)
  - Astra (Warlock, Tiefling, Lvl 6, AC 15, HP 30, DPS)
  - Malachai (Wizard, High Elf, Lvl 6, AC 12, HP 25, Support)
  - Torvin (Fighter, Dwarf, Lvl 6, AC 18, HP 62, Tank)
  - Silas (Bard, Human, Lvl 5, AC 14, HP 32, Support/DPS)
  - Nyx (Ranger, Wood Elf, Lvl 6, AC 15, HP 45, DPS)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All party management pages render without errors and match design specifications
- **SC-002**: Party list displays 2+ mock parties with correct card layouts and composition summaries
- **SC-003**: Party detail page displays full member list with correct stats, roles, and visual indicators
- **SC-004**: Creation and edit forms display all required fields and member management UI
- **SC-005**: Responsive design works correctly at mobile (375px), tablet (768px), and desktop (1920px) breakpoints
- **SC-006**: All components have 80%+ test coverage with unit and integration tests
- **SC-007**: Form validation UI shows appropriate error states for invalid inputs
- **SC-008**: Member role selector displays all role options with proper styling and indicators
- **SC-009**: Delete confirmation modal appears when user attempts to delete party
- **SC-010**: All ESLint, TypeScript type-checking, and Codacy quality gates pass
