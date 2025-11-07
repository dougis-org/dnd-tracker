# Feature Specification: Party Management Pages

**Feature Branch**: `feature/006-party-management-pages`  
**Created**: 2025-11-06  
**Status**: Draft  
**Input**: User description: "Create UI pages for party management including party list, detail view, creation/edit forms, member management, and party composition stats."

**Maintainer**: @doug  
**Canonical components (UI)**: GlobalNav  
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## User Scenarios & Testing

### User Story 1 - Browse Party Library (Priority: P1)

A Dungeon Master wants to see all their saved parties at a glance to quickly select which party to use for an upcoming encounter.

**Why this priority**: This is the foundational feature that enables all other party management workflows. Without the ability to browse and select parties, users cannot proceed to detail view or management operations.

**Independent Test**: Can be fully tested by viewing the party list page and verifying it displays all mock parties with basic information, and delivers the value of providing party discovery.

**Acceptance Scenarios**:

1. **Given** the user navigates to `/parties`, **When** the page loads, **Then** a list of all parties displays with party name, member count, and composition summary
2. **Given** there are no parties in the system, **When** the user navigates to `/parties`, **Then** an empty state displays with a call-to-action to create a new party
3. **Given** the party list exists, **When** the user views the list, **Then** each party card shows the party name, number of members, and a quick visual preview of party composition (roles/classes)

---

### User Story 2 - View Party Details (Priority: P1)

A Dungeon Master wants to see all members of a specific party with their details (class, level, AC, HP) to understand the party composition and capabilities.

**Why this priority**: Viewing party details is critical for encounter preparation. DMs need to know party composition to balance encounters appropriately and understand player capabilities.

**Independent Test**: Can be fully tested by navigating to a party detail page and verifying all member information displays correctly, delivering the value of understanding party capability.

**Acceptance Scenarios**:

1. **Given** a party exists with multiple members, **When** the user clicks on a party card or navigates to `/parties/:id`, **Then** the detail page displays the party name, member list with full character details (name, class, level, AC, HP)
2. **Given** the user is viewing a party detail, **When** the page loads, **Then** party composition stats display (e.g., "1 Tank, 1 Healer, 1 DPS", class distribution)
3. **Given** a party exists, **When** the user views the detail page, **Then** action buttons display for managing the party (edit, add member, delete)

---

### User Story 3 - Create a New Party (Priority: P2)

A Dungeon Master wants to create a new party by selecting characters from their character library and assigning roles to them.

**Why this priority**: Creation is essential but secondary to browsing and viewing existing parties. Users will browse parties before creating new ones in typical workflows.

**Independent Test**: Can be fully tested by completing the party creation form and verifying the new party appears in the list, delivering the value of ability to organize characters into parties.

**Acceptance Scenarios**:

1. **Given** the user clicks "Create New Party" on `/parties`, **When** navigating to `/parties/new`, **Then** a form displays with fields for party name and member selection
2. **Given** the user is on the party creation form, **When** they fill in the party name and select characters, **Then** the form validates that a party name is provided and at least one member is selected
3. **Given** the user completes the party creation form, **When** they submit it, **Then** a success message displays and the user is redirected to the party detail page showing the new party [NEEDS CLARIFICATION: should form redirect to detail page or list page?]

---

### User Story 4 - Edit Party Details (Priority: P2)

A Dungeon Master wants to modify party information (name, members, member roles) to keep parties organized and reflect changes in campaign composition.

**Why this priority**: While important for ongoing management, editing is secondary to creation in the typical user workflow. Users create parties first, then edit infrequently.

**Independent Test**: Can be fully tested by opening a party edit form, making changes, and verifying the changes persist, delivering the value of flexibility in party management.

**Acceptance Scenarios**:

1. **Given** a party exists, **When** the user clicks the edit button on the party detail page, **Then** a form loads with current party information (name, members, roles)
2. **Given** the user is on the edit form, **When** they modify the party name or member list, **Then** changes are reflected in real-time in a preview section
3. **Given** the user makes changes, **When** they click save, **Then** the changes persist and the user sees a success message

---

### User Story 5 - Manage Party Members (Priority: P2)

A Dungeon Master wants to add or remove characters from a party and assign/modify member roles (tank, healer, DPS) to reflect their party's composition.

**Why this priority**: Member management is important but not essential for the MVP. Users can create parties with initial members, but more sophisticated member role management can follow in later iterations.

**Independent Test**: Can be fully tested by adding a member to a party, removing a member, and updating roles, delivering the value of maintaining accurate party composition.

**Acceptance Scenarios**:

1. **Given** a party exists and the user is viewing its detail page, **When** they click "Add Member", **Then** a modal or form displays showing available characters that can be added
2. **Given** the user has selected a character to add, **When** they confirm, **Then** the character is added to the party and a role selector appears [NEEDS CLARIFICATION: should role assignment be required or optional during member addition?]
3. **Given** a member is in a party, **When** the user clicks the remove button next to the member, **Then** a confirmation dialog appears; upon confirmation, the member is removed from the party
4. **Given** a member is in a party, **When** the user selects or modifies the member's role, **Then** the role updates immediately and persists

---

### User Story 6 - Delete a Party (Priority: P3)

A Dungeon Master wants to remove a party they no longer use to keep their party list clean and organized.

**Why this priority**: Party deletion is a cleanup feature that adds value but is not required for basic functionality. Users can have archived parties without blocking their workflows.

**Independent Test**: Can be fully tested by clicking delete on a party, confirming the action, and verifying the party is removed from the list, delivering the value of keeping the party library organized.

**Acceptance Scenarios**:

1. **Given** a party exists, **When** the user clicks the delete button on the party detail page, **Then** a confirmation dialog appears asking if they want to delete the party
2. **Given** the user confirms deletion, **When** they click the delete confirmation button, **Then** the party is removed from the system and the user is redirected to the party list
3. **Given** a party has been deleted, **When** the user views the party list, **Then** the deleted party no longer appears in the list

---

### Edge Cases

- What happens when a user tries to create a party with a duplicate name? (Allow duplicates with different IDs; name is not unique)
- How does the system handle a party with no members? (Should be prevented; minimum 1 member required)
- What if a character that was in a party is deleted from the character library? (Character remains in party with a "missing" state; party management can remove it)
- How does the system handle party name length limits? (Clear validation message if name exceeds limit)
- What if the user tries to add a character that's already in the party? (Prevent duplicate member additions with a clear message)

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a list of all parties belonging to the current user on `/parties` with party name, member count, and composition preview
- **FR-002**: System MUST provide an empty state on `/parties` when no parties exist with a clear call-to-action to create a new party
- **FR-003**: System MUST display detailed party information on `/parties/:id` including party name, full member list with character details (name, class, level, AC, HP), and party composition stats
- **FR-004**: System MUST display party action buttons (Edit, Add Member, Delete) on the party detail page
- **FR-005**: System MUST provide a party creation form at `/parties/new` with fields for party name and member selection UI
- **FR-006**: System MUST allow users to select one or more characters when creating a new party, with validation requiring at least one member and a non-empty party name
- **FR-007**: System MUST allow users to edit party name and member list via an edit form accessible from the party detail page
- **FR-008**: System MUST provide add/remove member functionality with immediate visual feedback (member appears/disappears from list)
- **FR-009**: System MUST display role assignment UI for each party member with role options (Tank, Healer, DPS, Other)
- **FR-010**: System MUST allow users to delete a party with a confirmation dialog to prevent accidental deletion
- **FR-011**: System MUST display party composition statistics (e.g., "1 Tank, 1 Healer, 2 DPS") based on assigned member roles
- **FR-012**: System MUST provide visual feedback (loading states, success/error messages) for all party operations (create, update, delete, add member, remove member)
- **FR-013**: System MUST be fully responsive and mobile-friendly, supporting party management on devices of all sizes
- **FR-014**: System MUST display mock data (2 sample parties with 4-5 members each) when the system is first loaded to demonstrate functionality

### Key Entities

- **Party**: A collection of characters representing a group of player characters. Attributes: id, name, members[], owner_id, created_at, updated_at. Relationships: owns many Members
- **PartyMember**: A character within a party with an assigned role. Attributes: id, party_id, character_id, role (Tank/Healer/DPS/Other), order. Relationships: belongs to Party, references Character
- **Character**: Represents a player character (simplified reference). Attributes: id, name, class, level, ac, max_hp, current_hp. Relationships: can be member of many Parties

## Success Criteria

### Measurable Outcomes

- **SC-001**: Party list page loads in under 1 second and displays all parties without lag
- **SC-002**: Users can create a party with a name and one or more members in fewer than 5 interactions (clicks/form submissions)
- **SC-003**: Party detail page displays all member information (name, class, level, AC, HP) completely and accurately
- **SC-004**: Party composition stats are calculated and displayed correctly (e.g., role distribution matches assigned roles)
- **SC-005**: All party management operations (create, edit, delete, add/remove members) provide immediate visual feedback within 500ms
- **SC-006**: Add/remove member operations do not require page refresh to reflect changes
- **SC-007**: Delete operations require explicit confirmation to prevent accidental deletion
- **SC-008**: Party pages remain fully functional and usable on mobile devices (screens as small as 320px width)
- **SC-009**: All acceptance scenarios from User Stories pass automated testing
- **SC-010**: Feature meets or exceeds 80% test coverage for new components and utilities

## Assumptions

1. **Mock Data Persistence**: Mock parties and characters persist during the session but are not stored long-term (feature is UI-only in this phase)
2. **Character Library Available**: Feature 005 (Character Management Pages) or equivalent character data structure is available for party member selection
3. **No Real Persistence**: This feature creates/displays UI only; no API integration or database persistence occurs (planned for Phase 3: Feature 018/028)
4. **User Authentication**: Feature assumes users are authenticated (Feature 013 or equivalent provides auth context)
5. **Design System Available**: Feature 001 and Feature 002 design system and navigation are available for consistent styling and navigation
6. **Role Options Fixed**: Party member roles are limited to predefined set (Tank, Healer, DPS, Other) and cannot be customized
7. **Party Ownership**: Each party belongs to the logged-in user; no multi-user or collaborative party management in this phase

## Constraints

- **UI-Only Phase**: Feature operates with mock data and no backend persistence (database integration occurs in later phases)
- **No Real-Time Sync**: Changes do not sync across browser tabs or devices
- **Single-User**: Party management is single-user only; no sharing or collaborative features
- **Storage Limit**: Mock data is limited to session storage; closing browser or clearing storage loses data
- **No Validation Against Live Data**: Form validation does not check against real database; only client-side validation

## Timeline

- **Duration**: 1 day
- **Type**: UI-Only Feature (Mock Data, No Backend Integration)
