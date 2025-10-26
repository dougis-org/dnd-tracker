# Research: Character Management System (Feature 003)

**Date**: 2025-10-21  
**Feature**: Character Management System  
**Branch**: `003-character-management`

## 1. D&D 5e Rules & Calculations

**Decision**: Use official D&D 5e SRD (System Reference Document) as authoritative source.

**Rationale**:

- D&D 5e is the established system for this project
- SRD is freely available and open-licensed
- Ensures game balance and player expectations
- Ability modifiers, proficiency bonuses, and skills must match official rules

**Implementation**: Ability Score to Modifier = `(score - 10) / 2` (rounded down). Proficiency Bonus = `ceil(level / 4) + 1` (2-6 for levels 1-20). AC = `10 + DEX modifier + armor bonus`. Initiative = `DEX modifier`. Saving Throws = `ability modifier + proficiency bonus (if proficient)`.

---

## 2. Multiclass Support

**Decision**: Independent level tracking per class with automatic total level calculation.

**Rationale**: D&D 5e officially supports multiclass. Players expect full functionality. Must maintain per-class level for hit die progression. Total level determines proficiency bonus.

**Implementation**: Character has `classes: { class: string, level: number }[]`. Total level = sum of all class levels. Proficiency bonus based on total level. Each class contributes hit die type to HP.

---

## 3. Data Model Architecture

**Decision**: Character is Aggregate Root, owned by User, referenced by Party and Encounter.

**Rationale**: Clean architecture. User ownership enables tier limit enforcement. References prevent data duplication. Soft-delete maintains referential integrity.

**Implementation**: Character (top-level root) → User (owns many) + Race (references) + Class (references). PartyMember and EncounterParticipant reference Character. Soft delete with 30-day grace.

---

## 4. Tier Limit Enforcement

**Decision**: Calculate usage at creation, enforce per subscription tier.

**Rationale**: Free=10, Seasoned=50, Expert=250 creatures. Enforces quotas. Warnings help users.

**Implementation**: At creation, query `Character.count({ userId, deletedAt: null })`. Compare to tier limit. At limit: 403 Forbidden + upgrade prompt. At 80% limit: display warning.

---

## 5. Race and Class Configuration

**Decision**: System entities seeded at startup, cached in memory.

**Rationale**: D&D 5e has fixed official set. Startup caching enables fast lookups. Allows future expansions.

**Implementation**: Seed races (Human, Elf, Dwarf, etc.) and classes (Barbarian, Bard, etc.). Race: `{ name, abilities, traits }`. Class: `{ name, hitDie, proficiencies, spellcasting }`.

---

## 6. Character Search

**Decision**: MongoDB regex for name (case-insensitive partial), filters for class/race/level range.

**Rationale**: Matches user expectations. Partial matching. Performant with indexes.

**Implementation**: Name search with `$regex` and `$options: 'i'`. Class/race filters with exact match. Level range with `$gte/$lte`. Index on `{ userId, deletedAt }`.

---

## 7. Soft Delete Pattern

**Decision**: Soft delete with 30-day grace period.

**Rationale**: Prevents accidental loss. Maintains referential integrity. Users can undo within grace period. Valuable campaign history.

**Implementation**: `deletedAt: Date` field (null when active). Soft delete sets timestamp. List queries filter `{ deletedAt: null }`. Daily job hard-deletes after 30 days.

---

## 8. Derived Value Calculations

**Decision**: Calculate on-the-fly from base stats, cache for performance.

**Rationale**: Single source of truth. Ensures consistency. Caching prevents repeated calculations for lists. Invalidated on update.

**Implementation**: Stored: `abilityScores: { str, dex, con, int, wis, cha }`. Calculated on read: modifiers, saves, skills, AC, initiative. Cached in `cachedStats` field.

---

## 9. RESTful API Design

**Decision**: RESTful Next.js routes with Zod validation.

**Rationale**: Consistent with Features 001-002. Zod type-safe validation. Standard CRUD patterns.

**Implementation**: All requests include userId from Clerk context. Responses include success status. Zod schema validation. Error responses: 400/403/404/500.

---

## 10. Character Duplication

**Decision**: Duplicate endpoint creates independent character copy.

**Rationale**: Users explicitly duplicate to create templates. No separate template system needed. Simplifies data model.

**Implementation**: Endpoint `POST /api/characters/:id/duplicate`. New character with same stats + name "{Original} (Copy)". Future: mark as shareable.

---

## 11. Performance Targets

**Decision**: List view loads 50 characters < 1 second. Search filters < 500ms.

**Rationale**: Industry-standard responsiveness. 50 characters typical per page.

**Implementation**: Database indexes on `{ userId, deletedAt }`. Pagination 20 per page. Lazy load derived values. Future: Redis if needed.

---

## 12. Key Design Summary

| Decision | Choice | Impact |
|----------|--------|--------|
| D&D 5e Rules | Official SRD | Accuracy, trust |
| Multiclass | Independent levels + total | Full choice |
| Model | Character Aggregate Root | Clean architecture |
| Tier Limits | Enforced at creation | Quota compliance |
| Races/Classes | System entities | Flexibility |
| Search | MongoDB regex + filters | Scalable |
| Deletion | Soft delete 30d grace | User recovery |
| Templates | Duplicate endpoint | Simplicity |
| API | RESTful + Zod | Type safety |
| Performance | < 1s list, < 500ms search | Responsive |


---

## Multiclass Architecture

### Decision
Support multiclass via independent level tracking per class with automatic total level calculation.

### Rationale
- D&D 5e officially supports multiclass with specific rules
- Players expect full multiclass functionality
- Must maintain per-class level for hit die progression
- Total level determines proficiency bonus and spell slots

### Alternatives Considered
- Single level field + class indicator: Cannot support true multiclass
- Separate character per class: Would duplicate data, complicate encounters
- Hard-coded multiclass limits: Reduces player choice

### Implementation Details
- Character has array of `classes: { class: string, level: number }[]`
- Total level = sum of all class levels
- Proficiency bonus based on total level, not individual class levels
- Each class contributes its hit die type to HP calculation
- Spell slots calculated per class with their spellcasting level

---

## Character Data Model & Relationships

### Decision
Character is primary entity, owned by User, referenced by Parties and Encounters.

### Rationale
- Follows DDD (Domain-Driven Design) principle: Character is an Aggregate Root
- User ownership enables tier limit enforcement
- References from Party/Encounter prevent data duplication
- Soft-delete maintains referential integrity with historical data

### Alternatives Considered
- Embedding characters in parties: Would duplicate data when same character used in multiple parties
- Creating characters as sub-entities of parties: Would prevent cross-party reuse
- Hard delete: Would orphan party/encounter references and lose campaign history

### Implementation Details
- Character is top-level Aggregate Root
- User owns many Characters (1-to-many relationship)
- Character references Race and Class entities
- Character is referenced by PartyMember (join table for many-to-many with Party)
- Character is referenced by EncounterParticipant (join table for many-to-many with Encounter)
- Soft delete stores deletion date; hard delete happens after 30 days

---

## Tier Limit Enforcement

### Decision
Calculate usage at time of character list retrieval; enforce limits at creation time.

### Rationale
- User.subscription field from Feature 002 determines tier
- Each tier has fixed creature limit (Free: 10, Seasoned: 50, Expert: 250)
- Limit enforcement prevents quota bypass
- Display warnings help users understand limits before upgrade decision

### Alternatives Considered
- Store aggregate usage count: Requires synchronization, complex updates
- Hard failure at exact limit: No warning, worse UX
- No upgrade prompt: Users don't understand why creation blocked

### Implementation Details
- When creating character: Query `Character.count({ userId, deletedAt: null })` and compare to tier limit
- If at limit: Return 403 Forbidden with upgrade prompt
- Display usage: "You have 8 of 10 creature slots" (shows remaining)
- Show 80% warning: Trigger when count >= (limit * 0.8)

---

## Race and Class Configuration

### Decision
Race and Class are system entities, stored in MongoDB collections, loaded at app startup.

### Rationale
- D&D 5e has fixed, stable set of official races and classes
- Loading at startup caches in memory for fast lookups
- Allows future enhancements (expansions, homebrew support)
- Data-driven approach separates game data from application logic

### Alternatives Considered
- Hard-coded race/class arrays in code: Cannot update without redeploy
- Loaded per-request from DB: Slower, unnecessary repeated queries
- External API (D&D Beyond): Introduces external dependency, licensing issues

### Implementation Details
- Seed Race collection with: Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling
- Seed Class collection with: Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard
- Each Race has: `{ name, abilities: { str, dex, con, int, wis, cha }, traits: [] }`
- Each Class has: `{ name, hitDie, proficiencies: [], spellcasting: boolean }`

---

## Character Search and Filtering

### Decision
Search by name (case-insensitive partial), filter by class/race/level range using MongoDB queries.

### Rationale
- Case-insensitive matches user expectations ("Search" not case-sensitive by default)
- Partial matching finds "Legolas" from search "leg"
- MongoDB regex queries are performant with proper indexing
- Filters on discrete values (class, race) use exact match; level range uses range query

### Alternatives Considered
- Full-text search engine (Elasticsearch): Overkill for character search, added complexity
- In-memory filtering: Would load all characters, scales poorly to 10k+
- Database sorting only: Requires user pagination through all results

### Implementation Details
- Name search: `Character.find({ name: { $regex: searchTerm, $options: 'i' } })`
- Class filter: `Character.find({ 'classes.class': classId })`
- Race filter: `Character.find({ race: raceId })`
- Level range: `Character.find({ 'classes.level': { $gte: minLevel, $lte: maxLevel } })`
- Indexes: Create index on `userId, deletedAt` for fast user-scoped queries

---

## Soft Delete Pattern

### Decision
Soft delete with 30-day grace period for data recovery.

### Rationale
- Prevents accidental permanent loss of character data
- Maintains referential integrity with parties/encounters
- Allows users to "undo" deletion within grace period
- Historical records valuable for campaign continuity

### Alternatives Considered
- Hard delete: Immediate loss, no recovery, orphans references
- No delete: Storage grows unbounded, confuses users with old characters
- 90-day grace: Too long, clutters list; 30 days balances recovery vs cleanup

### Implementation Details
- Add `deletedAt: Date` field to Character schema (null when active)
- Soft delete: Set `deletedAt = Date.now()`
- List query: Include filter `{ deletedAt: null }` to hide deleted characters
- Hard delete: Scheduled job runs daily, hard-deletes where `deletedAt < (now - 30 days)`
- Recovery: Admin endpoint or user restore action can clear `deletedAt` within grace period

---

## D&D 5e Derived Calculations

### Decision
Calculate derived values on-the-fly from base stats, cache in database for performance.

### Rationale
- Single source of truth: ability scores
- Recalculating on display ensures consistency with base stats
- Caching prevents repeated calculations for frequent reads
- Invalidated on character update

### Alternatives Considered
- Store all derived values: Database bloat, sync complexity
- Always calculate: Slower for list displays with 50+ characters
- External calculation service: Network latency, added complexity

### Implementation Details
- Stored fields: `abilityScores: { str, dex, con, int, wis, cha }`
- Calculated on read: Modifiers, saving throws, skills, AC, initiative
- Cache in Character document: `cachedStats: { modifiers: {}, skills: {}, ac, initiative }`
- Invalidate cache: When `abilityScores` or `race` or `classes` change

---

## API Contract Design

### Decision
RESTful API with Zod validation, following Next.js app router patterns.

### Rationale
- Consistent with existing Features 001-002 implementation
- Zod provides type-safe validation
- RESTful is standard for CRUD operations
- Next.js API routes (app/api/characters/*) follow project conventions

### Alternatives Considered
- GraphQL: Added complexity not justified for straightforward CRUD
- RPC-style API: Non-standard, confusing
- Custom validation: Error-prone, duplicated across files

### Implementation Details
- All requests include userId from Clerk auth context
- All responses include success status and error details
- Request validation with Zod schemas
- Response types defined with TypeScript interfaces
- Error responses: 400 (validation), 403 (tier limit), 404 (not found), 500 (server)

---

## Character Templates vs Duplication

### Decision
Implement "duplicate character" feature; templates are created when users duplicate a character.

### Rationale
- User explicitly duplicates a character to create a template
- No need for separate template system
- Simplifies data model: templates are just characters
- Allows sharing templates (future Feature 017)

### Alternatives Considered
- Separate template entity: Duplicates character data model, unnecessary
- Template flag in Character: Would complicate queries to filter templates vs regular

### Implementation Details
- Duplicate endpoint: Create new Character with same stats + name = "{Original} (Copy)"
- Consume duplicate endpoint: `/api/characters/:id/duplicate` → POST
- Both regular characters and duplicates stored in same collection
- Future: Templates could be marked as public/shared (Feature 017)

---

## Performance Targets

### Decision
Character list view loads 50 characters in < 1 second; search filters return in < 500ms.

### Rationale
- Users expect responsive UI
- 50 characters is typical maximum visible per page
- 500ms search latency is imperceptible (<= 300ms ideal, 500ms acceptable)
- Based on industry standards for web apps (not real-time, not batch)

### Alternatives Considered
- Tighter performance: Would require caching layer (Redis), added complexity
- Looser targets (2-3s): Poor UX, users perceive as "slow"

### Implementation Details
- Database indexes: `{ userId, deletedAt }` for fast user-scoped queries
- Pagination: 20 characters per page by default, configurable
- Lazy load derived values: Calculate only for displayed characters
- Future caching: Redis for character search cache (if performance degrades)

---

## Summary of Key Design Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| D&D 5e Rules | Official SRD calculations | Game accuracy, player trust |
| Multiclass | Independent class levels + total tracking | Full player choice, complexity managed |
| Data Model | Character as Aggregate Root, owned by User | Clean architecture, tier enforcement |
| Tier Limits | Enforced at creation, warning at 80% | User awareness, quota compliance |
| Races/Classes | System entities, seeded at startup | Flexibility, performance |
| Search | MongoDB regex (name), filters (class/race/level) | Scalable to 10k+ characters |
| Deletion | Soft delete with 30-day grace period | User recovery, referential integrity |
| Templates | Duplicate endpoint, no separate entity | Simplicity, user control |
| API | RESTful Next.js routes, Zod validation | Consistency, type safety |
| Performance | < 1s list load, < 500ms search | Industry-standard responsiveness |
