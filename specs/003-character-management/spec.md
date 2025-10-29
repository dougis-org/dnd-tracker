# Feature 003 — Character Management System (Specify)

Related Issue: [#178](https://github.com/dougis-org/dnd-tracker/issues/178)

## Short Description

Complete CRUD operations for player characters and NPCs with full D&D 5e stat tracking, multiclass support, and character templates.

## Purpose / Value

- Allow DMs and players to create, edit, duplicate, and remove character records.
- Provide validated, shareable character data to other features (parties, encounters, export).

## Success Criteria

- API endpoints for character CRUD implemented and documented.
- Front-end character form with validation and templates available.
- 80%+ unit test coverage for business logic and route handlers.

## Deliverables

- `spec.md` (this file)
- Data model sketch for `Character`.
- API contract for `/api/characters`.
- UI wireframes for create/edit/list.

## High-level Acceptance Tests

1. POST /api/characters with valid payload creates a Character and returns 201 with id.
2. GET /api/characters returns paginated list supporting filters (ownerId, name).
3. PUT /api/characters/:id updates fields and enforces validation rules (no negative HP, valid ability scores).
4. DELETE /api/characters/:id soft-deletes the character (preserve history).

## Initial Tasks (Specify phase)

1. Finalize Character schema: fields, types, relations (ownerId, templates boolean).
2. Define API request/response contract (OpenAPI snippets).
3. List validation rules and edge-cases (multiclass XP, level caps).
4. Identify required unit/integration tests (TDD-first).

## Notes

- Tier enforcement (Free limit: 10 creatures) will be implemented at plan/implement phases and should be noted in the contract.
# Feature Specification: Character Management System

**Feature Branch**: `003-character-management`  
**Created**: 2025-10-21  
**Status**: Draft  
**Input**: User description: "Complete CRUD operations for player characters and NPCs with D&D 5e stat tracking, multiclass support, and character templates."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Character (Priority: P1)

A Dungeon Master wants to create a player character for a campaign. They need an intuitive form to enter the character's basic information including name, race, class, and ability scores.

**Why this priority**: This is the foundational feature that enables all other character operations. Without the ability to create characters, users cannot build parties or encounters.

**Independent Test**: Can be fully tested by creating a character, verifying it saves to the database, and appears in the character list. Delivers immediate value by giving DMs their first character.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the character creation page, **When** they fill in character name, race, class, and ability scores, **Then** a new character is created and saved to their account.
2. **Given** a user creating a character, **When** they enter an invalid ability score (< 1 or > 20), **Then** the form shows a validation error and prevents submission.
3. **Given** a user creating a character, **When** they select a multiclass option, **Then** they can specify levels in multiple classes with proper total level tracking.
4. **Given** a user at their tier limit (Free: 10 characters), **When** they attempt to create another character, **Then** they see an upgrade prompt instead of creation.

---

### User Story 2 - View and Search Characters (Priority: P1)

A Dungeon Master wants to see all their characters in an organized list with the ability to search and filter by name, level, class, or race.

**Why this priority**: Users need to quickly find characters they want to use. This is essential for the next features (parties, encounters) which depend on selecting characters.

**Independent Test**: Can be tested by creating multiple characters and verifying search/filter functions correctly isolate desired characters.

**Acceptance Scenarios**:

1. **Given** a user with 5 created characters, **When** they view the character list, **Then** all 5 characters display with name, class, level, race, and AC visible.
2. **Given** a user with characters named "Aragorn", "Legolas", "Boromir", **When** they search for "Ara", **Then** only "Aragorn" displays.
3. **Given** a user with characters of mixed classes, **When** they filter by "Wizard", **Then** only Wizard characters display.
4. **Given** a user with 15+ characters, **When** they view the list, **Then** pagination displays with navigation controls.

---

### User Story 3 - Update Character Details (Priority: P1)

A Dungeon Master wants to modify a character's stats, ability scores, or other details after creation (e.g., after leveling up or correcting an error).

**Why this priority**: Characters change during campaigns (leveling, equipment changes, stat corrections). This enables long-term character management beyond initial creation.

**Independent Test**: Can be tested by editing a character, verifying the changes persist and update in listings.

**Acceptance Scenarios**:

1. **Given** an existing character, **When** a user edits their level from 1 to 5, **Then** the character updates and reflects the new level in the list.
2. **Given** a user editing a character, **When** they attempt to reduce level to 0, **Then** validation prevents the change and shows an error.
3. **Given** a multiclass character, **When** a user adjusts class levels, **Then** total level automatically updates and displays correctly.
4. **Given** a user editing a character, **When** they save changes, **Then** the edit timestamp updates and character data persists correctly.

---

### User Story 4 - Delete Characters (Priority: P1)

A Dungeon Master wants to remove characters they no longer need from their account.

**Why this priority**: Users need to manage their character library and free up space, especially as they approach tier limits.

**Independent Test**: Can be tested by deleting a character and verifying it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** a character in the user's list, **When** they click delete and confirm, **Then** the character is removed and no longer appears in the list.
2. **Given** a user deleting a character, **When** they confirm deletion, **Then** a success message displays and tier usage updates.
3. **Given** a character used in a party or encounter, **When** deletion is attempted, **Then** a confirmation warns about orphaned relationships.

---

### User Story 5 - Duplicate Characters as Templates (Priority: P2)

A Dungeon Master wants to create multiple similar characters quickly by duplicating an existing character and making minor modifications.

**Why this priority**: This accelerates character creation for similar NPCs (e.g., 3 goblin warriors). Valuable but not blocking other features.

**Independent Test**: Can be tested by duplicating a character and verifying a new independent copy exists with same base stats.

**Acceptance Scenarios**:

1. **Given** an existing character, **When** a user clicks "Duplicate", **Then** a new character is created with identical stats and the name "Copy of [Original]".
2. **Given** a duplicated character, **When** a user edits the duplicate, **Then** the original character remains unchanged.
3. **Given** a user at their tier limit, **When** they try to duplicate, **Then** an upgrade prompt appears instead.

---

### User Story 6 - D&D 5e Stat Block Display (Priority: P2)

A Dungeon Master wants to view the complete D&D 5e stat block for a character including ability modifiers, saving throws, skills, and derived values.

**Why this priority**: Essential for using characters in combat. DMs need AC, initiative, hit dice, and skill values visible at a glance.

**Independent Test**: Can be tested by creating a character and verifying all D&D 5e derived values calculate and display correctly.

**Acceptance Scenarios**:

1. **Given** a character with ability scores, **When** viewing the character, **Then** ability modifiers calculate correctly (+2 for 14-15, -1 for 8-9, etc.).
2. **Given** a character with proficiency bonus, **When** viewing skills, **Then** proficient skills show bonus added to modifier.
3. **Given** a character, **When** viewing their stat block, **Then** initiative shows DEX modifier correctly.

---

### Edge Cases

- What happens when a user tries to create a character with duplicate names? (System allows it; names aren't unique keys. Users may have multiple "Goblin Warrior" characters. Search returns all matches.)
- How does the system handle characters created near tier limit boundaries? (Create succeeds, shows warning on next list view)
- What happens if a character's race/class combination is invalid? (Validation prevents creation)
- How are characters shared between users handled? (Out of scope for Feature 003; Feature 017)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create new characters with name, race, class, level, and D&D 5e ability scores.
- **FR-002**: System MUST validate character creation inputs (name required, ability scores 1-20, level 1-20, valid race/class combination).
- **FR-003**: System MUST support multiclass characters with level tracking across multiple classes (e.g., Fighter 5 / Wizard 3 = total level 8).
- **FR-004**: System MUST calculate and display all D&D 5e derived values including:
  - **Ability Modifiers**: All 6 abilities (STR, DEX, CON, INT, WIS, CHA) using formula: `floor((ability_score - 10) / 2)`
  - **Saving Throws**: All 6 ability saves (STR, DEX, CON, INT, WIS, CHA) using formula: `ability_modifier + [proficiency_bonus if proficient]`. Class proficiencies: Barbarian (STR), Bard (CHA), Cleric (WIS), Druid (WIS), Fighter (STR, CON), Monk (STR, DEX), Paladin (WIS, CHA), Ranger (STR, DEX), Rogue (DEX), Sorcerer (CHA), Warlock (WIS), Wizard (INT).
  - **Skills**: All 18 D&D 5e skills with ability associations and proficiency bonuses:
    1. Acrobatics (DEX)
    2. Animal Handling (WIS)
    3. Arcana (INT)
    4. Athletics (STR)
    5. Deception (CHA)
    6. History (INT)
    7. Insight (WIS)
    8. Intimidation (CHA)
    9. Investigation (INT)
    10. Medicine (WIS)
    11. Nature (INT)
    12. Perception (WIS)
    13. Performance (CHA)
    14. Persuasion (CHA)
    15. Religion (INT)
    16. Sleight of Hand (DEX)
    17. Stealth (DEX)
    18. Survival (WIS)
  - **Armor Class (AC)**: Formula: `10 + DEX_modifier`
  - **Initiative**: Formula: `DEX_modifier`
  - **Proficiency Bonus**: Formula: `ceil(total_character_level / 4) + 1` (ranges 2-6)
- **FR-005**: System MUST persist all character data to database with user ownership (characters visible only to owner).
- **FR-006**: System MUST display paginated character list (default 20 per page) with name, race, class, level, AC, and HP visible.
- **FR-007**: System MUST support search by character name (case-insensitive partial match).
- **FR-008**: System MUST support filtering by class, race, and **total character level** (sum of all class levels for multiclass characters). Example: A Fighter 5/Wizard 3 character has total level 8 and appears in filters for "level 6-10".
- **FR-009**: System MUST allow users to edit any character attribute after creation (name, race, class, levels, ability scores).
- **FR-010**: System MUST allow users to delete characters with soft delete pattern (preserve history for 30 days before hard delete).
- **FR-011**: System MUST support duplicating existing characters, creating independent copies with "Copy of [Original]" naming convention.
- **FR-012**: System MUST enforce tier-based usage limits: Free=10 characters, Seasoned=50 characters, Expert=250 characters.
- **FR-013**: System MUST prevent character creation when user has reached tier limit and show upgrade prompt instead.
- **FR-014**: System MUST display usage warnings at 80% of tier limit ("You have 8 of 10 character slots used").
- **FR-015**: System MUST support race and class data as configurable system entities (D&D 5e standard races and classes).

### Key Entities

- **Character**: Represents a player character or NPC with D&D 5e stat block. Attributes include name, race, class(es), level(s), ability scores (STR/DEX/CON/INT/WIS/CHA), skills, saving throws, AC, HP, hit dice, proficiency bonus, traits, features, equipment slots. Relationships: owned by User (many-to-one), can be used in Parties (many-to-many via PartyMember), can be used in Encounters (many-to-many via EncounterParticipant).
- **Race**: System entity defining D&D 5e races (Human, Elf, Dwarf, etc.) with ability bonuses, traits, and constraints. Relationships: referenced by Character (many-to-one).
- **Class**: System entity defining D&D 5e classes (Fighter, Wizard, Rogue, etc.) with hit dice, proficiencies, and class features. Relationships: referenced by Character (many-to-one), supports multiclass via level tracking.
- **User**: Existing entity representing authenticated user. Relationships: owns Characters (one-to-many), has subscription tier that determines creature limits.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a character in under 2 minutes with all required D&D 5e stats.
- **SC-002**: Character list view loads in under 1 second with 50 characters displayed.
- **SC-003**: Search filters return results in under 500ms across 200+ user characters.
- **SC-004**: 95% of character creation attempts succeed on first submission (validation is clear).
- **SC-005**: All D&D 5e derived values calculate with 100% accuracy against D&D 5e SRD: ability modifiers (±4 range), saving throws (with class proficiencies), all 18 skills (with proficiency indicators), AC (10+DEX modifier), initiative (DEX modifier), proficiency bonus (2-6 based on level), and hit points (with CON modifiers).
- **SC-006**: Users reach 80% of tier limit receive clear warning, and creation is blocked at limit with contextual upgrade option.
- **SC-007**: Character data persists correctly after creation, edit, and deletion with zero data loss.
- **SC-008**: System supports up to 10,000 total characters across all users. Performance targets from SC-002 and SC-003 must be maintained (50 characters load <1s, 200+ character search <500ms). The 10,000-character capacity is an architectural goal; Feature 003 optimizes for the 50-200 character range.
- **SC-009**: Multiclass characters correctly track and display total level calculation (sum of all class levels).
- **SC-010**: 90% of users successfully complete character creation without support tickets.

## Assumptions

- **D&D 5e Reference**: System uses official D&D 5e ability score modifiers, proficiency bonuses, and skill definitions (from SRD or open-licensed source).
- **Data Retention**: Deleted characters are soft-deleted for 30 days then hard-deleted (allows restoration during grace period).
- **Race/Class Combination Validation**: All PHB race/class combinations are valid; system enforces no restrictions (even typically non-canonical combinations are allowed).
- **Ability Score Rolling**: System accepts manually entered ability scores; does not implement rolling/point-buy (user provides scores).
- **User Ownership**: Each character is owned by exactly one user; no sharing in Feature 003 (Feature 017 adds sharing).
- **Tier Limits**: Limits are per-user at time of feature, applied per subscription tier (enforced via User.subscription field).
- **UI Framework**: Character forms and lists use existing shadcn/ui components and patterns.
- **Database**: MongoDB with Mongoose ODM, following existing schema patterns from Feature 002.
- **Version History**: Feature 003 tracks edit timestamps only. Full character version history (rollback capability) is deferred to future phases and will be addressed in Feature 007.

---

## References *(informational)*

### D&D 5e Source Material

- **Ability Modifiers & Proficiency Bonus**: D&D 5e Player's Handbook (PHB), Chapter 1 (Pg. 12-15)
- **Saving Throws**: PHB Chapter 7 (Pg. 179), includes class-specific proficiencies
- **Skills**: PHB Chapter 7 (Pg. 181-182), all 18 skills with ability associations
- **Armor Class (AC)**: PHB Chapter 9 (Pg. 144)
- **Initiative**: PHB Chapter 9 (Pg. 189)
- **Hit Points**: PHB Chapter 1 (Pg. 12), includes CON modifier calculations

**Compliance Note**: Specifications conform to D&D 5e SRD (System Reference Document) and open-source D&D 5e rules materials. All formulas and skill definitions are taken from official D&D 5e sources.
