# Feature Decomposition Recommendations

**Document Date**: 2025-11-11  
**Review Scope**: Features F011-F060 (50 features across 8 phases)  
**Status**: Proposal - Requires feature renumbering to implement  
**Companion Document**: See `docs/feature-renumbering-plan.md` for detailed number mappings

> **Note**: Features F001-F008 are complete, F009 and F010 are in progress. This analysis focuses on upcoming features F011 and beyond.

## Executive Summary

After reviewing the Feature Roadmap and connected GitHub issues, this document proposes decomposing several large features into smaller, more manageable deliverable items. The goal is to maintain steady progress while reducing risk and enabling earlier value delivery.

**Key Findings:**

- **12 features** should be decomposed into 27 sub-features (15 net new features)
- **3 phases** (3, 5, and 6) have features that are particularly large
- Current 1-2 day estimates for some features are aggressive given their scope
- Better decomposition will improve testability and reduce integration complexity
- **Implementation requires renumbering**: F018-F060 → F018-F075 (see renumbering plan)

**Impact**: 60 features → 75 features (25% increase)

---

## Decomposition Philosophy

**Guiding Principles:**

1. Each sub-feature should deliver **standalone value** or enable a clear milestone
2. Sub-features should be independently **testable**
3. Maintain **clear dependency chains** between sub-features
4. Target **4-8 hours of work** per sub-feature (half-day increments)
5. Prefer **vertical slices** (full stack) over horizontal (layer-by-layer)

---

## Phase 1: UI Foundation

**Status**: F011 and F012 are appropriately sized as single features (1 day each). No decomposition recommended.

---

## Phase 2: Authentication & User Management

**Status**: F013-F017 are appropriately sized as single features. No decomposition recommended for this phase.

---

## Phase 3: Core Entity Management (Significant Decomposition Needed)

### F018: Character Model & API

**Current Scope**: 2-day feature covering model, 5 API endpoints, validation
**Issue**: Model complexity + multiple endpoints = integration headaches

**Recommended Decomposition:**

#### F018a: Character Data Model & Core Schema (4-6 hours)

- Mongoose schema definition
- Basic validation rules
- Index setup
- **Acceptance**: Model instantiates, basic CRUD works in tests
- **Delivers**: Foundation for all character work

#### F018b: Character Read Operations (3-4 hours)

- `GET /api/v1/characters` (list)
- `GET /api/v1/characters/:id` (detail)
- Filtering and pagination
- **Acceptance**: Can retrieve characters, pagination works
- **Delivers**: Read-only character access

#### F018c: Character Write Operations (4-5 hours)

- `POST /api/v1/characters` (create)
- `PUT /api/v1/characters/:id` (update)
- `DELETE /api/v1/characters/:id` (delete)
- Advanced validation
- **Acceptance**: CRUD operations complete
- **Delivers**: Full character management

**Rationale**: Separating read from write allows frontend integration to start earlier with read-only views. Model definition done first ensures consistent schema.

---

### F023: Monster Model & API

**Current Scope**: 2-day feature with complex monster stat blocks
**Issue**: Special abilities, legendary actions, lair actions = high complexity

**Recommended Decomposition:**

#### F023a: Monster Base Model & Basic Stats (4-6 hours)

- Core Mongoose schema (HP, AC, abilities, CR)
- Basic CRUD endpoints
- Simple validation
- **Acceptance**: Basic monster CRUD works
- **Delivers**: Simple monsters can be created

#### F023b: Monster Special Abilities & Actions (4-5 hours)

- Special abilities sub-schema
- Actions and multiattack
- API support for abilities
- **Acceptance**: Monsters with special abilities work
- **Delivers**: Complex monster stat blocks

#### F023c: Legendary & Lair Actions (3-4 hours)

- Legendary action system
- Lair action configuration
- Initiative 20 lair mechanics
- **Acceptance**: Legendary creatures fully supported
- **Delivers**: Boss monster functionality

**Rationale**: Base monsters are common; legendary creatures are rare. Building incrementally allows testing with simple monsters first, then adding complexity.

---

### F028: Party Model & API

**Current Scope**: 1-day feature but member management is complex
**Issue**: Member relationships and roles need careful handling

**Recommended Decomposition:**

#### F028a: Party Base Model & CRUD (3-4 hours)

- Party Mongoose schema (name, description)
- Basic CRUD operations
- **Acceptance**: Can create/read/update/delete parties
- **Delivers**: Empty party management

#### F028b: Party Member Management (4-5 hours)

- Add/remove member endpoints
- Member roles and ordering
- Character reference validation
- **Acceptance**: Can manage party membership
- **Delivers**: Full party composition

**Rationale**: Separates party metadata from membership logic. Allows testing party lifecycle before complex member operations.

---

## Phase 5: Combat Engine Core (Largest Decomposition Need)

### F034: Encounter Model & API

**Current Scope**: 2-day feature with encounter CRUD, participants, CR calculation
**Issue**: CR calculation alone is substantial work

**Recommended Decomposition:**

#### F034a: Encounter Base Model & CRUD (4-6 hours)

- Encounter Mongoose schema
- Basic CRUD endpoints
- Simple encounter metadata
- **Acceptance**: Can create/manage encounters
- **Delivers**: Encounter containers

#### F034b: Encounter Participant Management (4-5 hours)

- Participant sub-schema
- Add/remove participants API
- Party and monster references
- **Acceptance**: Can populate encounters
- **Delivers**: Encounter composition

#### F034c: CR Calculation & Difficulty Rating (4-6 hours)

- Challenge Rating calculation logic
- Difficulty tier determination
- XP calculation
- **Acceptance**: Encounter difficulty calculated
- **Delivers**: Balanced encounter design

**Rationale**: CR calculation requires understanding D&D 5e rules deeply. Separating it allows that logic to be perfected independently.

---

### F036: Combat Session Model

**Current Scope**: 1-day feature but session state is the heart of combat
**Issue**: Participant state tracking is complex and critical

**Recommended Decomposition:**

#### F036a: Combat Session Creation & Metadata (3-4 hours)

- CombatSession Mongoose schema
- Session creation from encounter
- Basic session lifecycle (start/end)
- **Acceptance**: Can create sessions from encounters
- **Delivers**: Combat session foundation

#### F036b: Participant State Tracking (4-5 hours)

- Participant state sub-schema
- Current HP, conditions, initiative
- Round/turn tracking
- **Acceptance**: Session state persists correctly
- **Delivers**: Combat state management

**Rationale**: Session creation is simpler than state tracking. Separating allows early testing of session lifecycle before adding complexity.

---

### F037: Initiative System

**Current Scope**: 2-day feature with rolling, manual entry, tie-breaking
**Issue**: Initiative is core to combat flow, needs thorough testing

**Recommended Decomposition:**

#### F037a: Initiative Rolling & Manual Entry (4-5 hours)

- Roll initiative for all participants
- Manual initiative entry
- Initiative storage in session
- **Acceptance**: Can set initiative for all participants
- **Delivers**: Initiative input mechanisms

#### F037b: Initiative Ordering & Turn Management (4-5 hours)

- Sort participants by initiative
- Dexterity tie-breaking
- Next/previous turn navigation
- **Acceptance**: Turn order works correctly
- **Delivers**: Combat turn progression

**Rationale**: Rolling initiative is straightforward. Turn management logic requires careful testing of edge cases (ties, deaths, etc.).

---

### F039: HP Tracking System

**Current Scope**: 1-day feature but HP logic has many edge cases
**Issue**: Temporary HP, healing, death/unconsciousness = complex state machine

**Recommended Decomposition:**

#### F039a: Basic Damage & Healing (3-4 hours)

- Apply damage API
- Apply healing API
- HP validation (0 to max)
- **Acceptance**: Basic HP modification works
- **Delivers**: Core HP mechanics

#### F039b: Temporary HP & Death States (4-5 hours)

- Temporary HP system
- Death state (HP <= -maxHP)
- Unconscious state (HP = 0)
- Death save tracking
- **Acceptance**: All HP states handled
- **Delivers**: Complete HP system

**Rationale**: Basic damage/healing can be tested independently. Complex states like death saves need separate focus.

---

### F042: Status Effects Model

**Current Scope**: 1-day feature but D&D 5e has 15+ conditions
**Issue**: Each condition has unique rules and interactions

**Recommended Decomposition:**

#### F042a: Status Effect Data Model (3-4 hours)

- StatusEffect definitions (all D&D 5e conditions)
- ActiveStatusEffect schema
- Basic duration tracking (rounds, concentration, etc.)
- **Acceptance**: Can define and store effects
- **Delivers**: Effect catalog

#### F042b: Status Effect Application & Expiration (4-5 hours)

- Apply effect to participant
- Remove effect
- Duration countdown on turn end
- Automatic expiration
- **Acceptance**: Effects lifecycle works
- **Delivers**: Functional condition system

**Rationale**: Defining effects is data work. Application logic and expiration need careful testing.

---

## Phase 6: Combat Polish & State (Clarification Needed)

### F043: Status Effects UI

**Current Scope**: 1-day feature
**Recommendation**: **No decomposition needed**, but clarify relationship with F042

**Note**: This feature should consume F042b (application logic). Consider renaming to "Status Effects Integration" to make clear it's UI + API wiring.

---

### F045: Combat Session Management

**Current Scope**: 1-day feature with pause/resume/end/summary
**Issue**: Session state transitions need careful handling

**Recommended Decomposition:**

#### F045a: Pause/Resume Mechanics (3-4 hours)

- Pause session API
- Resume session API
- State validation during pause
- **Acceptance**: Can pause and resume sessions
- **Delivers**: Session suspension

#### F045b: End Session & Summary Generation (4-5 hours)

- End session API
- Combat summary calculation (XP, rounds, etc.)
- Session history/archival
- **Acceptance**: Sessions end cleanly with summary
- **Delivers**: Session lifecycle completion

**Rationale**: Pause/resume is simpler than end logic. Summaries require aggregating all combat data.

---

### F046: Combat Log System

**Current Scope**: 1-day feature but logging must integrate everywhere
**Issue**: Log entries generated by many different actions

**Recommended Decomposition:**

#### F046a: Combat Log Infrastructure (3-4 hours)

- Log entry schema
- Log recording mechanism
- Basic query API
- **Acceptance**: Can record and retrieve log entries
- **Delivers**: Logging foundation

#### F046b: Log Display & Export (4-5 hours)

- Log display panel UI
- Filter by type/participant
- Export to PDF
- **Acceptance**: Can view and export logs
- **Delivers**: User-facing log features

**Rationale**: Infrastructure must exist before UI. Separating allows backend logging to be tested independently.

---

## Phase 4: Offline Foundations (Minor Adjustments)

### F032: Offline Combat

**Current Scope**: 2-day feature depending on F031 and F036
**Issue**: Offline sync is complex and affects all combat features

**Recommended Decomposition:**

#### F032a: Local Combat Storage (4-5 hours)

- IndexedDB schema for combat sessions
- Local session creation
- Local state management
- **Acceptance**: Combat works offline (no sync)
- **Delivers**: Offline combat functionality

#### F032b: Sync Queue & Conflict Detection (4-6 hours)

- Queue local changes
- Detect online/offline transitions
- Basic conflict detection
- **Acceptance**: Changes queue for sync
- **Delivers**: Offline-to-online bridge

**Rationale**: Local storage can work without sync. Sync logic is separate concern that needs thorough testing.

---

## Phase 7: Monetization (Minor Adjustments)

### F050: Stripe Setup & Webhooks

**Current Scope**: 2-day feature with integration + webhooks + customer creation
**Issue**: Webhook handling is critical and needs isolated testing

**Recommended Decomposition:**

#### F050a: Stripe Account Setup & Integration (4-5 hours)

- Stripe API key configuration
- Customer creation API
- Basic Stripe connection test
- **Acceptance**: Can create Stripe customers
- **Delivers**: Stripe connectivity

#### F050b: Webhook Handling & Events (4-6 hours)

- Webhook endpoint setup
- Signature verification
- Event handling (subscription created, updated, canceled)
- **Acceptance**: Webhooks process correctly
- **Delivers**: Subscription lifecycle automation

**Rationale**: Webhook handling is complex and must be bulletproof. Separating allows dedicated testing of webhook scenarios.

---

## Summary of Decomposition Recommendations

### Features to Decompose (12 total)

**Phase 3:**

- F018: Character Model & API → 3 sub-features (F018a-c)
- F023: Monster Model & API → 3 sub-features (F023a-c)
- F028: Party Model & API → 2 sub-features (F028a-b)

**Phase 4:**

- F032: Offline Combat → 2 sub-features (F032a-b)

**Phase 5:**

- F034: Encounter Model & API → 3 sub-features (F034a-c)
- F036: Combat Session Model → 2 sub-features (F036a-b)
- F037: Initiative System → 2 sub-features (F037a-b)
- F039: HP Tracking System → 2 sub-features (F039a-b)
- F042: Status Effects Model → 2 sub-features (F042a-b)

**Phase 6:**

- F045: Combat Session Management → 2 sub-features (F045a-b)
- F046: Combat Log System → 2 sub-features (F046a-b)

**Phase 7:**

- F050: Stripe Setup & Webhooks → 2 sub-features (F050a-b)

---

## Impact Analysis

### Benefits of Decomposition

1. **Earlier Value Delivery**: Read operations can ship before write operations
2. **Parallel Development**: Multiple developers can work on sub-features simultaneously
3. **Reduced Risk**: Smaller changes = easier to test, review, and rollback
4. **Better Estimation**: 4-8 hour tasks are easier to estimate than 1-2 day tasks
5. **Clearer Progress**: More granular tracking of feature completion
6. **Improved Testability**: Each sub-feature has focused test scope

### Tradeoffs

1. **Feature Renumbering Required**: 48 features (F018-F060 plus new) must be renumbered, affecting documentation, issues, and team communication
2. **More GitHub Issues**: 60 features become 75 features (25% increase in total feature count, 15 new issues)
3. **More PR Reviews**: Each sub-feature gets its own PR (15 additional PRs)
4. **Dependency Management**: Must carefully sequence sub-feature work
5. **Documentation Overhead**: Each sub-feature needs acceptance criteria
6. **One-Time Migration Cost**: Time required to update roadmap, issues, and references

---

## Implementation Approach

### Required Approach: Feature Renumbering

**Context**: The repository's spec kit workflow (`.specify/scripts/`) requires **unique 3-digit feature numbers** for every piece of work. Sub-designators like "F018a" or "F018b" are not supported by the current branch naming and spec directory resolution logic.

**Therefore**: Each decomposed sub-feature must receive its own unique feature number (F018, F019, F020, etc.), which requires renumbering all subsequent features in the roadmap.

### Implementation Steps

1. **Create Renumbering Plan**: Map old feature numbers to new numbers (see `feature-renumbering-plan.md`)
2. **Update Feature Roadmap**: Replace feature table with new numbering scheme
3. **Update GitHub Issues**: Create new issues for decomposed features, update issue numbers in roadmap
4. **Update Spec Directories**: Rename existing spec directories to match new numbers (for in-progress work)
5. **Update All References**: Search codebase for feature number references and update
6. **Update Branch Names**: For any active branches, rename to match new numbering
7. **Communicate Changes**: Notify team of renumbering via CHANGELOG and team channels

### Workflow Alignment

**Branch Naming**:

```bash
# Each feature gets unique number
feature/018-character-read-api
feature/019-character-write-api
feature/020-character-validation
```

**Spec Directories**:

```text
specs/018-character-read-api/
specs/019-character-write-api/
specs/020-character-validation/
```

**GitHub Issues**:

- Each feature → one GitHub issue
- Dependencies tracked in issue links
- Roadmap references issue numbers

**Pros**:

- Works with existing spec kit workflow (no code changes)
- Clear separation via unique numbers
- Full compatibility with `.specify/scripts/` tooling
- Each feature independently trackable

**Cons**:

- One-time renumbering effort (affects 48 features)
- Breaks existing feature number references (documentation, issues, conversations)
- Requires communication to team about new numbering

**Mitigation**:

- Provide clear mapping document (old → new numbers)
- Update all documentation in single PR
- Use GitHub issue descriptions to note "Previously planned as F023"

---

## Next Steps

1. **Review with stakeholders**: Confirm decomposition approach and accept feature renumbering
2. **Review renumbering plan**: Validate mappings in `docs/feature-renumbering-plan.md`
3. **Update Feature Roadmap**: Replace `docs/Feature-Roadmap.md` with new feature numbers (F001-F075)
4. **Create new GitHub issues**: Generate 15 new issues for decomposed sub-features
5. **Update existing GitHub issues**: Update titles and descriptions with new feature numbers
6. **Update documentation**: Search and replace feature number references across all docs
7. **Communicate changes**: Announce renumbering to team with mapping document
8. **Update CONTRIBUTING.md**: Document the renumbering and decomposition rationale
9. **Begin implementation**: Start with Phase 3 decomposed features (F018-F020: Character API)

---

## Appendix: Features That Should NOT Be Decomposed

The following features are appropriately sized and should remain as single units:

**Phase 1**: F001, F002, F003, F004, F005, F006, F007, F008, F010, F011, F012
**Phase 2**: F013, F014, F015, F016, F017
**Phase 3**: F019, F020, F021, F022, F024, F025, F026, F027, F029
**Phase 4**: F030, F031, F033
**Phase 5**: F035, F038, F040, F041
**Phase 6**: F043, F044
**Phase 7**: F047, F048, F049, F051, F052, F053, F054
**Phase 8**: F055, F056, F057, F058, F059, F060

These features are either:

- Simple UI pages with mock data
- Straightforward API integrations
- Single-responsibility features
- Already well-scoped at 4-8 hours

---

**Document Prepared By**: GitHub Copilot  
**Review Requested From**: Product Owner / Tech Lead  
**Estimated Impact**: +15 features (60 → 75 total), improved delivery predictability, feature renumbering required  
**Risk Level**: Medium (requires one-time renumbering effort, affects 48 features)  
**See Also**: `docs/feature-renumbering-plan.md` for complete number mappings
