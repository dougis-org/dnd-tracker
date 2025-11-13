# Feature Specification: Item Catalog Pages

**Feature Branch**: `feature/011-item-catalog`  
**Created**: 2025-11-12  
**Status**: Draft  
**Input**: User description: "A catalog of user and system items to keep track of"

**Maintainer**: @doug
**Canonical components (UI)**: GlobalNav, ItemCard, ItemDetailCard, ItemFilter
**Constitution**: This specification must comply with `.specify/memory/constitution.md`. After edits, run the required Codacy analysis for any edited files per repository rules.

## Assumptions & Open Questions

- **Assumption**: Authentication and persistent storage are provided by later features (Feature 013/014). For now the UI should support both mock/local data and real API integration where available.
- **Assumption**: Item scoping follows a similar model to monsters: user-owned items (global to user), campaign-scoped instances, and potentially public/system items (D&D SRD references).
- **Assumption**: Items are independent entities used by characters and encounters; they will integrate with character management (F005) and party management (F006) in follow-up features.
- **Assumption**: Categories, rarity, and properties are finite enums/lists defined by D&D 5e rules; system will not support arbitrary properties on this feature's MVP.

## User Scenarios & Testing (mandatory)

### User Story 1 - Browse and find items for character equipment (Priority: P1)

As a DM or player I want to browse a catalog of items, search by name, and filter by type/rarity so I can equip characters for an encounter or campaign.

**Why this priority**: Core workflow for character building and encounter prep. Without item browsing, characters cannot be properly equipped, blocking character management workflows.

**Independent Test**: Open `/items`, search for "longsword", and verify results show matching items. Can be fully tested by searching, filtering, and viewing the list independently from character/encounter creation.

**Acceptance Scenarios**:

1. **Given** the user is on `/items`, **When** they see a list of at least 5 sample items, **Then** each item displays name, type, rarity, and a brief property summary.
2. **Given** the user is on `/items`, **When** they search for "longsword", **Then** results update to show items with "longsword" in the name or description.
3. **Given** the user applies filter "Type: Weapon", **When** the filter is active, **Then** only weapons are displayed.
4. **Given** the user applies filter "Rarity: Rare", **When** the filter is active, **Then** only rare items are displayed.
5. **Given** filters and search are combined (e.g., "Type: Weapon" AND search "sword"), **When** both are active, **Then** only rare weapons with "sword" in name are shown.

---

### User Story 2 - View detailed item information (Priority: P1)

As a DM I want to see a full item stat card with properties, weight, value, and detailed descriptions so I can make informed decisions about item inclusion in encounters.

**Why this priority**: Essential for item selection and understanding item mechanics during prep.

**Independent Test**: Open `/items/:id` for a sample item and verify all fields render correctly (weight, cost, properties, description, type, rarity).

**Acceptance Scenarios**:

1. **Given** the user clicks an item from the list, **When** they navigate to `/items/:id`, **Then** they see the item's name, type, rarity, weight, value/cost, full description, and properties.
2. **Given** an item has special properties (e.g., "Versatile", "+1 modifier"), **When** viewing the detail page, **Then** properties are displayed in a clearly formatted section.
3. **Given** an item has no weight (e.g., a curse), **When** the item is viewed, **Then** the weight field is omitted or shows "—".

---

### User Story 3 - Create and manage custom items (Priority: P2)

As a DM I want to create custom items (homebrew equipment, magic items) and add them to my personal library so I can use them across encounters and campaigns.

**Why this priority**: Allows DMs to extend the catalog with house rules and homebrew content; second to browsing but critical for customization.

**Independent Test**: Open `/items/new`, fill in required fields (name, type, rarity), and submit. Verify the item appears in `/items` list and can be viewed at `/items/:id`.

**Acceptance Scenarios**:

1. **Given** the user is on `/items/new`, **When** they submit the form with name, type, and rarity, **Then** the item is added to the personal library and appears in `/items`.
2. **Given** the user opens `/items/:id/edit`, **When** they update the item description or properties and save, **Then** the changes are reflected on the detail page.
3. **Given** an item was created by the user, **When** viewing `/items/:id`, **Then** an "Edit" button is available; if the item is a system item, edit is disabled.

---

### User Story 4 - Filter items by multiple criteria (Priority: P2)

As a DM I want to apply multiple independent filters (type, rarity, weight range) simultaneously and clear filters quickly so I can narrow down to the item I need.

**Why this priority**: Improves usability when catalog grows; filters are independent and can be tested together.

**Independent Test**: Apply filters for type, rarity, and weight; verify list updates. Clear all filters and verify list resets.

**Acceptance Scenarios**:

1. **Given** the user has filters for "Type: Armor" and "Rarity: Uncommon", **When** both are applied, **Then** only uncommon armor is shown.
2. **Given** filters are active, **When** the user clicks "Clear Filters", **Then** all filters reset and the full list returns.

---

### Edge Cases

- Items with no description: detail page should show placeholder or "No additional details available".
- Search with special characters (e.g., "+1 Sword"): search should handle symbols and match appropriately.
- Empty results: when search/filter yields no results, UI should show friendly message "No items match your criteria."
- Item names with identical text: if two items have same name (e.g., "Potion of Healing" user-created vs SRD), detail page should show source (User Library, System Catalog) to disambiguate.

## Requirements (mandatory)

### Functional Requirements

- **FR-001**: Item list page (`/items`) MUST display a paginated or scrollable list of items with name, type, rarity, weight, and a short property summary.
- **FR-002**: Item detail page (`/items/:id`) MUST display the full item card including: name, type, rarity, weight, cost/value, full description, special properties (if any), damage (for weapons), armor class bonus (for armor), and any other relevant D&D 5e attributes.
- **FR-003**: Item creation page (`/items/new`) MUST provide a form capturing required fields: name, type (from enum: Weapon, Armor, Consumable, MagicalItem, WondrousItem, etc.), rarity (from enum: Common, Uncommon, Rare, VeryRare, Legendary, Artifact), weight, cost/value, and description. Additional fields like damage, properties, and AC bonuses MUST be available when relevant to type.
- **FR-004**: Item edit page (`/items/:id/edit`) MUST allow editing of all item fields for user-created items; system/SRD items MUST be read-only with edit disabled.
- **FR-005**: Item list MUST support independent filtering by type, rarity, and optionally weight range. Filters MUST be combinable.
- **FR-006**: Item list MUST support searching by name and description; search results MUST update in real-time or on submit.
- **FR-007**: Item detail page MUST show whether an item is user-created (personal library), campaign-scoped, or from system catalog; if system item, show source (e.g., "D&D 5e SRD").
- **FR-008**: System MUST provide a seed dataset of at least 50 D&D 5e SRD items covering common weapons, armor, and consumables for demo/reference.
- **FR-009**: All pages MUST be navigable from the global navigation and respect mobile/responsive layouts.
- **FR-010**: Item cards on the list MUST include visual indicators for rarity (color-coded badge or icon).

### Key Entities

- **Item**: Represents equipment, consumable, or magical item. Key attributes: id, name, type (enum: Weapon, Armor, Consumable, MagicalItem, WondrousItem, Tool, Mount, Vehicle, Other), rarity (enum: Common, Uncommon, Rare, VeryRare, Legendary, Artifact), weight (pounds), cost (in gp/sp/cp), description, properties (array of strings), tags (array), createdBy (userId, optional), isSystem (boolean), source (string, e.g., "D&D 5e SRD", "User Created"), createdAt, updatedAt.
  - **Weapon** (conditional): damage (die notation, e.g., "1d8"), damageType (slashing, piercing, bludgeoning, etc.), properties (Finesse, Versatile, Reach, Light, etc.)
  - **Armor** (conditional): armorClass (base AC), armorType (Light, Medium, Heavy), strRequirement (optional)
  - **Consumable** (conditional): quantity (stock count), uses (charges or single-use)

- **ItemCategory**: Enum representing item type categories (Weapon, Armor, Consumable, MagicalItem, WondrousItem, Tool, Mount, Vehicle, Other).

- **ItemRarity**: Enum representing rarity levels (Common, Uncommon, Rare, VeryRare, Legendary, Artifact).

## Success Criteria (mandatory)

### Measurable Outcomes

- **SC-001**: `/items` is accessible and displays the item list for 100% of users; at minimum 50 system items are present by default.
- **SC-002**: 95% of list filter and search actions return visible matching results within 1 second on a typical developer machine or common cloud runner environment.
- **SC-003**: Users can create a new custom item via the UI (or mock-save) and see it listed within one UX flow (create → list → detail) in at most 3 user actions.
- **SC-004**: Item detail page displays all mandatory fields for 98% of sample items in the test dataset.
- **SC-005**: Accessibility: Core pages (`/items`, `/items/:id`, `/items/new`) pass basic keyboard-navigation and screen-reader spot checks during review.
- **SC-006**: Users can combine multiple filters (type + rarity) and see updates within 500ms.

### Performance benchmark (normative)

To make SC-002 and SC-006 testable, the feature adopts the following benchmark:

- **Environments**:
  - Developer workstation (target): 4 physical cores, 16 GB RAM, NVMe/SSD, Chromium via Playwright.
  - CI baseline (ubuntu-latest): headless Chromium on GitHub Actions.
- **Dataset sizes**:
  - Representative: 100 items (seeded via mock data).
  - Stress (informational): 1,000 items (optional).
- **Measurement**:
  - Action: user triggers search, applies filter, or combines filters.
  - Metric: latency from action start to first matching result visible in the DOM (measured in ms).
- **Success criteria (pass/fail)**:
  - Developer workstation (100 items): 95th percentile latency <= 1.0 second (primary). Median <= 0.5s (informational).
  - CI baseline (100 items): median latency <= 1.5 seconds (secondary).
  - Stress (1,000 items): median <= 3.0 seconds (informational only).

## Testable Acceptance Criteria (normalized)

- **AC-001**: Visiting `/items` shows at least 50 items (seed dataset) in the list.
- **AC-002**: Applying filter "Type: Weapon" on `/items` shows only weapons in the current dataset.
- **AC-003**: Applying filter "Rarity: Rare" on `/items` shows only rare items.
- **AC-004**: Combining filters "Type: Armor" + "Rarity: Uncommon" shows only uncommon armor.
- **AC-005**: Searching for "longsword" shows items with "longsword" in name or description.
- **AC-006**: Visiting `/items/:id` shows item name, type, rarity, weight, cost, description, and properties.
- **AC-007**: Visiting `/items/new` shows a form with fields for name, type (dropdown), rarity (dropdown), weight, cost, description.
- **AC-008**: Saving a new custom item (mock or real) results in the item appearing in `/items` list and detail page reachable at `/items/:id`.
- **AC-009**: Attempting to edit a system/SRD item shows edit disabled; attempting to edit a user-created item allows all fields to be updated.
- **AC-010**: Clear Filters button resets all active filters and returns full list.

## Implementation Notes (UI-only guidance)

- The spec intentionally omits backend schema and API design; use the Key Entities section to guide API contract design in a follow-up story.
- For this feature MVP: prefer read/write via mock adapters or existing API stubs so UI teams can iterate before API stabilization.
- Seed dataset should include canonical D&D 5e items (longsword, shortsword, plate armor, leather armor, potion of healing, rope, etc.) for demo and testing.
- Item icons/visual indicators for rarity can use simple color badges (Common=gray, Uncommon=green, Rare=blue, VeryRare=purple, Legendary=orange, Artifact=gold).

## Questions (batched)

None at this time. The specification scope is clear and follows established patterns from Feature 007 (Monster Management) and previous features.

## Files referenced (for implementers)

- Design reference: `docs/design/dnd-tracker-database-design.md` (item data model inspiration)  
- Roadmap: `docs/Feature-Roadmap.md` (Feature 011 entry)  
- PRD Item Management: `docs/Product-Requirements.md` §4.2, 4.3 (Party & Encounter Management sections reference item integration)

## Next steps

1. Review specification for completeness and alignment with PRD.
2. Create API contract story (Item model & CRUD APIs) as planned Feature 030 (already in roadmap).
3. Implement UI pages in the following vertical slices:
   - List page with filtering/search (core value)
   - Detail page (enables viewing and understanding items)
   - Creation/edit forms (enables customization)
   - Item integration with character/party pages (depends on F005, F006)

---

**End of specification (draft)**
