# D&D Tracker Feature Roadmap

**Product**: D&D Encounter Tracker Web App
**Version**: 1.0
**Last Updated**: 2025-10-21
**Status**: Active Development

## Overview

This roadmap outlines the iterative development plan for the D&D Tracker, breaking down the complete PRD into atomic, isolated features suitable for the spec kit approach. Each feature represents a complete vertical slice of functionality that can be specified, designed, implemented, and tested independently while contributing to the overall system.

## Completed Features

### ✅ Feature 001: MVP Foundation & Architecture

**Status**: Planning Complete (Tasks Defined)
**Spec Location**: `specs/001-build-dnd-tracker/`
**Description**: Established project structure, technology stack, data models, API contracts, and architectural patterns for the D&D Tracker application.

**Deliverables**:

- Next.js 15.5+ project structure with TypeScript
- MongoDB 8.0+ connection and Mongoose ODM setup
- shadcn/ui component library configuration
- Complete data model for 8 core entities
- API contracts for authentication, characters, and combat
- Integration test scenarios and quickstart guide

**Dependencies**: None (foundation feature)
**Completion Status**: Design artifacts complete, ready for implementation

---

### ✅ Feature 002: User Registration and Profile Management

**Status**: Complete ✅ (Merged via PR #158)
**Spec Location**: `specs/002-when-a-user/`
**Completed**: 2025-10-21
**Description**: User authentication via Clerk, MongoDB persistence, D&D profile preferences, subscription tier assignment, and usage tracking infrastructure.

**Deliverables**:

- Clerk webhook integration for user lifecycle events
- Extended User Mongoose model with D&D profile fields
- Profile setup wizard for new users with skip functionality
- Profile management UI in settings
- Usage metrics tracking infrastructure
- Free tier subscription assignment
- Next.js middleware integration with Clerk auth
- Complete E2E test coverage for user flows

**Dependencies**: Feature 001 (foundation)
**Completion Status**:

- ✅ Validation schemas (Phase 3.1)
- ✅ Data model extensions (Phase 3.2)
- ✅ Service layer (Phase 3.3)
- ✅ Clerk webhook handler (Phase 3.4)
- ✅ Profile API routes (Phase 3.5)
- ✅ UI components - ProfileForm & ProfileSetupWizard (Phase 3.6-3.7)
- ✅ E2E tests - Playwright scenarios (Phase 3.9)
- ✅ Integration & polish (Phase 3.10)

**Test Results**: 267 tests passing, 100% coverage on new components, all quality checks passed

---

## Planned Features (Priority Order)

### Feature 003: Character Management System

**Priority**: P1 - Critical Path
**Estimated Effort**: 2-3 weeks
**Description**: Complete CRUD operations for player characters and NPCs with D&D 5e stat tracking, multiclass support, and character templates.

**User Value**: DMs can create and manage characters for their campaigns with full D&D 5e stat blocks, including multiclassing, race/class combinations, and saving character templates for reuse.

**Scope**:

- Character creation form with validation
- Full D&D 5e stats (AC, HP, ability scores, initiative)
- Multiclass support with level tracking
- Race and class selection with data validation
- Character templates for quick creation
- Character list view with search/filter
- Character edit and delete operations
- Tier limit enforcement (Free: 10 creatures max)

**Key Entities**: Character, Player (optional assignment)
**API Endpoints**:

- `POST /api/characters` - Create character
- `GET /api/characters` - List characters (paginated, filterable)
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character
- `POST /api/characters/:id/duplicate` - Create from template

**Dependencies**: Feature 002 (user system for ownership and limits)
**Blocks**: Feature 004 (needs characters), Feature 005 (needs characters)

---

### Feature 004: Party Management

**Priority**: P1 - Critical Path
**Estimated Effort**: 1-2 weeks
**Description**: Group characters into parties, manage party composition, and save party templates for campaign organization.

**User Value**: DMs can organize characters into parties for different campaigns or gaming groups, with the ability to reuse party compositions across encounters.

**Scope**:

- Party creation with name and description
- Add/remove characters from parties
- Party member role assignment (tank, healer, DPS)
- Party templates for quick setup
- Party list view with member preview
- Party edit and delete operations
- Tier limit enforcement (Free: 1 party, Seasoned: 3 parties)

**Key Entities**: Party, PartyMember (join table)
**API Endpoints**:

- `POST /api/parties` - Create party
- `GET /api/parties` - List parties
- `GET /api/parties/:id` - Get party details with members
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Delete party
- `POST /api/parties/:id/members` - Add character to party
- `DELETE /api/parties/:id/members/:characterId` - Remove from party

**Dependencies**: Feature 003 (character system)
**Blocks**: Feature 005 (encounters use parties)

---

### Feature 005: Monster and NPC Library

**Priority**: P1 - Critical Path
**Estimated Effort**: 2 weeks
**Description**: Monster/NPC creation with stat blocks, special abilities, legendary actions, and searchable creature library.

**User Value**: DMs can create custom monsters or NPCs with full stat blocks, manage special abilities, and quickly find creatures for encounters using search and filters.

**Scope**:

- Monster creation form with D&D stat block
- Special abilities (legendary actions, lair actions, reactions)
- Monster templates and stat block library
- Search and filter by CR, type, source
- Monster list view with quick stats preview
- Monster edit and delete operations
- Import from SRD data (optional enhancement)

**Key Entities**: Monster, SpecialAbility
**API Endpoints**:

- `POST /api/monsters` - Create monster
- `GET /api/monsters` - List monsters (search, filter by CR/type)
- `GET /api/monsters/:id` - Get monster details
- `PUT /api/monsters/:id` - Update monster
- `DELETE /api/monsters/:id` - Delete monster

**Dependencies**: Feature 002 (user system for ownership)
**Blocks**: Feature 006 (encounters need monsters)

---

### Feature 006: Encounter Builder

**Priority**: P1 - Critical Path
**Estimated Effort**: 2-3 weeks
**Description**: Design encounters by selecting participants (party + monsters), configure lair settings, and calculate encounter difficulty.

**User Value**: DMs can build balanced encounters by combining parties and monsters, with automatic CR calculation and lair action configuration for memorable combat scenarios.

**Scope**:

- Encounter creation wizard
- Add party or individual characters
- Add monsters with quantity
- CR calculation and difficulty estimation
- Lair action configuration (optional)
- Environmental hazard setup
- Encounter templates for reuse
- Encounter list view with quick stats
- Tier limit enforcement (Free: 3 encounters, 6 max participants)

**Key Entities**: Encounter, EncounterParticipant
**API Endpoints**:

- `POST /api/encounters` - Create encounter
- `GET /api/encounters` - List encounters
- `GET /api/encounters/:id` - Get encounter details
- `PUT /api/encounters/:id` - Update encounter
- `DELETE /api/encounters/:id` - Delete encounter
- `POST /api/encounters/:id/participants` - Add participant
- `DELETE /api/encounters/:id/participants/:id` - Remove participant

**Dependencies**: Feature 003 (characters), Feature 004 (parties), Feature 005 (monsters)
**Blocks**: Feature 007 (combat sessions use encounters)

---

### Feature 007: Initiative and Turn Management

**Priority**: P1 - Critical Path
**Estimated Effort**: 2-3 weeks
**Description**: Roll initiative, manage turn order with dexterity tie-breaking, track current turn, and advance rounds automatically.

**User Value**: DMs can quickly start combat with automatic initiative ordering, clear visual indication of current turn, and seamless round progression with minimal bookkeeping.

**Scope**:

- Initiative rolling (automated or manual entry)
- Initiative order calculation with dexterity tie-breaking
- Manual initiative override/reordering
- Current turn indicator with visual highlight
- Next/previous turn navigation
- Round counter with automatic advancement
- "Delay turn" and "Ready action" support
- Initiative tracker UI component

**Key Entities**: CombatSession, InitiativeEntry
**API Endpoints**:

- `POST /api/combat/sessions` - Start combat from encounter
- `POST /api/combat/sessions/:id/initiative` - Roll initiative
- `PUT /api/combat/sessions/:id/initiative/:participantId` - Update initiative
- `POST /api/combat/sessions/:id/next-turn` - Advance to next turn
- `POST /api/combat/sessions/:id/previous-turn` - Go back one turn
- `PUT /api/combat/sessions/:id/round` - Set round number

**Dependencies**: Feature 006 (encounters)
**Blocks**: Feature 008 (HP tracking needs active combat), Feature 009 (status effects need turns)

---

### Feature 008: HP and Damage Tracking

**Priority**: P1 - Critical Path
**Estimated Effort**: 1-2 weeks
**Description**: Track hit points with damage and healing, temporary HP, visual HP bars, and undo functionality for mistakes.

**User Value**: DMs can quickly apply damage or healing to combatants with visual feedback, support temporary HP mechanics, and undo mistakes without breaking combat flow.

**Scope**:

- Damage application with validation
- Healing with max HP limits
- Temporary HP tracking
- Death saving throws counter
- HP history with undo (last 5 actions)
- Visual HP bars with color coding
- Quick damage buttons (e.g., 5, 10, 15)
- "Unconscious" and "Dead" status automation

**Key Entities**: CombatSession.participants (HP state)
**API Endpoints**:

- `POST /api/combat/sessions/:id/damage` - Apply damage
- `POST /api/combat/sessions/:id/heal` - Apply healing
- `POST /api/combat/sessions/:id/temp-hp` - Set temporary HP
- `POST /api/combat/sessions/:id/undo` - Undo last HP change

**Dependencies**: Feature 007 (combat sessions)
**Blocks**: None

---

### Feature 009: Status Effects and Conditions

**Priority**: P1 - Critical Path
**Estimated Effort**: 2 weeks
**Description**: Apply status effects (poisoned, blessed, etc.) with duration tracking, automatic expiration, and condition descriptions.

**User Value**: DMs can track temporary conditions on combatants with automatic duration countdown, reducing mental overhead and ensuring conditions don't get forgotten.

**Scope**:

- Status effect library (D&D 5e conditions)
- Apply status effect with duration (rounds, minutes, hours)
- Duration tracking with automatic decrements
- "Until save" and "Concentration" duration types
- Status effect expiration notifications
- Multiple effects per participant
- Status icon visual indicators
- Effect descriptions and mechanical reminders

**Key Entities**: StatusEffect, ActiveStatusEffect
**API Endpoints**:

- `GET /api/status-effects` - List available effects
- `POST /api/combat/sessions/:id/participants/:pid/effects` - Apply effect
- `DELETE /api/combat/sessions/:id/participants/:pid/effects/:eid` - Remove effect
- `PUT /api/combat/sessions/:id/participants/:pid/effects/:eid` - Update duration

**Dependencies**: Feature 007 (combat sessions and turns)
**Blocks**: None

---

### Feature 010: Lair Actions System

**Priority**: P2 - Important
**Estimated Effort**: 1-2 weeks
**Description**: Configure lair actions for encounters, trigger automatically on initiative 20, and manage environmental effects during combat.

**User Value**: DMs running lair encounters get automated prompts for lair actions on initiative count 20, making complex boss fights smoother and more dramatic.

**Scope**:

- Lair action creation and library
- Assign lair actions to encounters
- Automatic trigger on initiative count 20
- Lair action selection UI during combat
- Environmental effect descriptions
- Multiple lair action options per encounter
- Lair action history log

**Key Entities**: LairAction, EncounterLairAction
**API Endpoints**:

- `POST /api/lair-actions` - Create lair action template
- `GET /api/lair-actions` - List lair action templates
- `POST /api/encounters/:id/lair-actions` - Assign to encounter
- `POST /api/combat/sessions/:id/lair-action` - Trigger lair action
- `GET /api/combat/sessions/:id/lair-actions` - Get available actions

**Dependencies**: Feature 006 (encounters), Feature 007 (initiative tracking)
**Blocks**: None

---

### Feature 011: Combat Session State Management

**Priority**: P2 - Important
**Estimated Effort**: 1 week
**Description**: Save combat state, pause/resume sessions, end combat, and persist combat history for later review.

**User Value**: DMs can pause combat mid-session and resume later without losing state, and review past combat sessions for campaign continuity.

**Scope**:

- Combat session state persistence
- Pause/resume combat functionality
- End combat with summary
- Combat session list (active vs completed)
- Combat history with participant snapshots
- Resume from saved session
- Combat session deletion

**Key Entities**: CombatSession (status field)
**API Endpoints**:

- `PUT /api/combat/sessions/:id/pause` - Pause session
- `PUT /api/combat/sessions/:id/resume` - Resume session
- `PUT /api/combat/sessions/:id/end` - End session
- `GET /api/combat/sessions` - List sessions (filter by status)
- `GET /api/combat/sessions/:id/summary` - Get combat summary

**Dependencies**: Feature 007 (combat sessions)
**Blocks**: None

---

### Feature 012: Offline Combat Capability

**Priority**: P2 - Important
**Estimated Effort**: 2 weeks
**Description**: IndexedDB storage for offline combat tracking, background sync when online, and offline-first architecture for core features.

**User Value**: DMs can run combat without internet connectivity, ensuring games aren't disrupted by network issues, with automatic sync when reconnected.

**Scope**:

- IndexedDB setup for combat sessions
- Offline combat session creation
- Local HP and status effect tracking
- Background sync with server when online
- Conflict resolution for synced data
- Offline mode indicator in UI
- "Sync status" display

**Key Entities**: LocalCombatSession (IndexedDB schema)
**Technical Scope**:

- Service Worker setup
- IndexedDB wrapper utilities
- Sync queue management
- Online/offline detection
- Optimistic UI updates

**Dependencies**: Feature 007 (combat sessions), Feature 008 (HP tracking)
**Blocks**: None

---

### Feature 013: Subscription Tier Enforcement

**Priority**: P2 - Important
**Estimated Effort**: 1-2 weeks
**Description**: Enforce usage limits per subscription tier, display limit warnings, and show contextual upgrade prompts.

**User Value**: Users understand their tier limits and are prompted to upgrade when approaching limits, supporting the freemium business model.

**Scope**:

- Real-time usage tracking (parties, encounters, creatures, participants)
- Limit checks before creation operations
- Warning at 80% of limit
- Upgrade prompts when limit reached
- Usage dashboard showing current limits
- Tier comparison in upgrade flow
- Prevent operations when limit exceeded

**Key Entities**: User.usage (metrics), TIER_LIMITS (constants)
**API Endpoints**:

- `GET /api/users/:id/usage` - Get current usage metrics
- `GET /api/tiers` - Get tier limits and pricing
- Validation in existing endpoints (e.g., POST /api/characters checks limit)

**Dependencies**: Feature 002 (user system)
**Blocks**: None (enhancement to all features)

---

### Feature 014: Dashboard and Quick Actions

**Priority**: P2 - Important
**Estimated Effort**: 1-2 weeks
**Description**: User dashboard with quick stats, recent activity, quick action buttons, and shortcuts to common workflows.

**User Value**: DMs get a centralized hub for their campaigns with quick access to recent sessions, parties, and encounters, speeding up session prep.

**Scope**:

- Dashboard layout with stat cards
- Active campaigns overview
- Usage metrics display (with tier limits)
- Recent combat sessions list
- Quick actions: "Start Combat", "Create Character", "Build Encounter"
- Recently used characters/monsters
- Favorite templates shortcuts
- "Resume Last Session" functionality

**Key Entities**: Dashboard aggregates from User, Party, Encounter, CombatSession
**API Endpoints**:

- `GET /api/dashboard` - Get dashboard data (aggregated)
- `GET /api/recent` - Get recent activity feed

**Dependencies**: Feature 002 (user), Feature 004 (parties), Feature 006 (encounters), Feature 007 (sessions)
**Blocks**: None

---

### Feature 015: Landing Page and Marketing Site

**Priority**: P3 - Enhancement
**Estimated Effort**: 2 weeks
**Description**: Public landing page with hero section, feature showcase, pricing tiers, testimonials, and demo combat tracker.

**User Value**: Prospective users can learn about the product, see features in action via interactive demo, and understand pricing before signing up.

**Scope**:

- Hero section with value proposition
- Feature preview tabs (initiative, lair actions, status effects)
- Interactive demo with sample encounter
- Pricing tier comparison table
- Testimonial carousel (data-driven from collection)
- Call-to-action buttons
- SEO optimization (meta tags, schema markup)
- Mobile-responsive design

**Key Entities**: Testimonial (new collection)
**Pages**:

- `/` - Landing page
- `/pricing` - Detailed pricing page
- `/demo` - Interactive demo

**Dependencies**: Feature 002 (authentication for signup)
**Blocks**: None

---

### Feature 016: Export and Data Portability

**Priority**: P3 - Enhancement
**Estimated Effort**: 1 week
**Description**: Export characters, encounters, and combat logs to JSON and PDF formats for backup and sharing.

**User Value**: Users can backup their data, share characters with other DMs, and maintain campaign records outside the platform.

**Scope**:

- Export character to JSON
- Export encounter to JSON
- Export combat session to PDF (summary)
- Export party roster to PDF
- Import character from JSON
- Bulk export (all characters, all encounters)
- Export history log

**Key Entities**: All entities support export
**API Endpoints**:

- `GET /api/characters/:id/export?format=json` - Export character
- `GET /api/encounters/:id/export?format=json` - Export encounter
- `GET /api/combat/sessions/:id/export?format=pdf` - Export combat log
- `POST /api/characters/import` - Import character from JSON

**Dependencies**: Feature 003 (characters), Feature 006 (encounters), Feature 007 (sessions)
**Blocks**: None

---

### Feature 017: Character Sharing and Permissions

**Priority**: P3 - Enhancement
**Estimated Effort**: 1-2 weeks
**Description**: Share characters with other users, set view/edit permissions, and allow collaborative party building.

**User Value**: Players can manage their own characters and share them with DMs, enabling collaborative campaign management and reducing DM workload.

**Scope**:

- Character ownership and sharing settings
- Share via link or email invitation
- Permission levels (view, edit, play)
- Shared character list view
- Accept/reject character shares
- Collaborative party building
- Share activity log

**Key Entities**: CharacterShare (permissions table)
**API Endpoints**:

- `POST /api/characters/:id/share` - Create share link
- `POST /api/characters/:id/permissions` - Grant permission
- `DELETE /api/characters/:id/permissions/:userId` - Revoke permission
- `GET /api/characters/shared-with-me` - List shared characters

**Dependencies**: Feature 003 (characters)
**Blocks**: None

---

### Feature 018: Advanced Combat Logging (Paid Feature)

**Priority**: P3 - Enhancement
**Estimated Effort**: 1 week
**Description**: Detailed combat history with turn-by-turn action log, damage breakdown, and combat statistics (Seasoned tier and above).

**User Value**: Paying users get detailed combat analytics for reviewing encounters, analyzing player performance, and creating campaign summaries.

**Scope**:

- Turn-by-turn action log
- Damage dealt/received per participant
- Healing statistics
- Status effect duration tracking
- Combat duration and round count
- Export combat log to PDF
- Tier gate (Seasoned+)

**Key Entities**: CombatAction (log table)
**API Endpoints**:

- `GET /api/combat/sessions/:id/log` - Get detailed log (tier check)
- `GET /api/combat/sessions/:id/stats` - Get combat statistics

**Dependencies**: Feature 007 (combat sessions), Feature 013 (tier enforcement)
**Blocks**: None

---

### Feature 019: Custom Themes and UI Customization (Paid Feature)

**Priority**: P3 - Enhancement
**Estimated Effort**: 2 weeks
**Description**: Theme selection (light/dark/high contrast), custom color schemes, and UI layout preferences (Expert tier and above).

**User Value**: Power users can customize the app appearance to match their preferences or accessibility needs, improving usability for long sessions.

**Scope**:

- Theme selector (light, dark, high contrast, sepia)
- Custom color scheme builder (primary, accent colors)
- Font size preferences
- Compact vs spacious layout toggle
- Save theme per user profile
- Theme preview before applying
- Tier gate (Expert+)

**Key Entities**: User.preferences.theme (extended)
**API Endpoints**:

- `PUT /api/users/:id/theme` - Update theme preferences
- `GET /api/themes` - List available themes (tier-filtered)

**Dependencies**: Feature 002 (user preferences), Feature 013 (tier enforcement)
**Blocks**: None

---

### Feature 020: Payment Integration and Subscription Management

**Priority**: P2 - Important (Monetization)
**Estimated Effort**: 2-3 weeks
**Description**: Stripe integration for subscription management, payment processing, upgrade/downgrade flows, and billing dashboard.

**User Value**: Users can self-service their subscription changes, view billing history, and manage payment methods securely.

**Scope**:

- Stripe Checkout integration
- Subscription creation and upgrades
- Downgrade with data migration warnings
- Billing dashboard with invoice history
- Payment method management
- Subscription cancellation flow
- Webhook handlers for subscription events
- Tier access enforcement

**Key Entities**: Subscription (Stripe sync), Invoice, PaymentMethod
**API Endpoints**:

- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/portal` - Redirect to Stripe customer portal
- `POST /api/webhooks/stripe` - Handle subscription events
- `GET /api/billing/invoices` - List invoices
- `POST /api/billing/upgrade` - Upgrade tier
- `POST /api/billing/downgrade` - Downgrade tier

**Dependencies**: Feature 002 (user system), Feature 013 (tier enforcement)
**Blocks**: All paid features (Features 018, 019)

---

## Feature Dependency Graph

```
Foundation Layer:
001 (MVP Foundation) → 002 (User System)

Core Entity Layer:
002 → 003 (Characters)
002 → 005 (Monsters)
003 → 004 (Parties)

Combat Preparation Layer:
003 + 004 + 005 → 006 (Encounters)

Combat Execution Layer:
006 → 007 (Initiative/Turns)
007 → 008 (HP Tracking)
007 → 009 (Status Effects)
006 + 007 → 010 (Lair Actions)
007 → 011 (State Management)
007 + 008 → 012 (Offline Mode)

Platform Features:
002 → 013 (Tier Enforcement)
002 + 004 + 006 + 007 → 014 (Dashboard)
002 → 015 (Landing Page)
003 + 006 + 007 → 016 (Export)
003 → 017 (Sharing)

Monetization:
002 + 013 → 020 (Payments)
007 + 013 → 018 (Advanced Logging - Paid)
002 + 013 → 019 (Custom Themes - Paid)
```

## Development Phases

### Phase 1: Core MVP (Features 001-002) ✅ Complete

**Timeline**: Weeks 1-4
**Goal**: User authentication and profile management
**Completion**: 100% (Completed 2025-10-21 via PR #158)
**Deliverables**:

- User registration via Clerk
- MongoDB user persistence
- D&D profile preferences
- Profile setup wizard
- Usage tracking infrastructure

### Phase 2: Entity Management (Features 003-006)

**Timeline**: Weeks 5-14 (10 weeks)
**Goal**: Character, party, monster, and encounter creation
**Deliverables**:

- Character CRUD with templates
- Party management
- Monster library
- Encounter builder

### Phase 3: Combat Engine (Features 007-011)

**Timeline**: Weeks 15-24 (10 weeks)
**Goal**: Full combat tracking with initiative, HP, status effects
**Deliverables**:

- Initiative system with tie-breaking
- HP and damage tracking with undo
- Status effects with duration management
- Lair actions automation
- Combat session state persistence

### Phase 4: Platform Features (Features 012-014)

**Timeline**: Weeks 25-30 (6 weeks)
**Goal**: Offline capability, tier enforcement, dashboard
**Deliverables**:

- IndexedDB offline storage
- Subscription limit enforcement
- User dashboard with quick actions

### Phase 5: Monetization (Feature 020)

**Timeline**: Weeks 31-33 (3 weeks)
**Goal**: Payment processing and subscription management
**Deliverables**:

- Stripe integration
- Billing dashboard
- Tier upgrade/downgrade flows

### Phase 6: Enhancements (Features 015-019)

**Timeline**: Weeks 34-42 (9 weeks)
**Goal**: Marketing, export, sharing, premium features
**Deliverables**:

- Landing page
- Data export/import
- Character sharing
- Advanced combat logging (paid)
- Custom themes (paid)

---

## Success Metrics per Feature

Each feature includes testable acceptance criteria aligned with PRD success metrics:

- **User Adoption**: Track feature usage rates (target >60% of active users)
- **Performance**: Page load <3s, interactions <100ms
- **Quality**: 80%+ test coverage, <5% bug rate
- **Tier Conversion**: Upgrade prompts shown when limits approached
- **Retention**: Users return within 7 days of feature use

## Constitutional Compliance

All features must adhere to:

- **TDD Approach**: Tests written before implementation
- **File Size**: Max 450 lines per file (uncommented)
- **Function Size**: Max 50 lines per function
- **Test Coverage**: 80%+ on touched code
- **No Duplication**: Extract utilities for shared logic
- **Remote Authority**: Codacy scans and CI checks authoritative

## Spec Kit Process per Feature

1. **Specify** (`/specify`): Create `spec.md` from feature description
2. **Plan** (`/plan`): Generate `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
3. **Tasks** (`/tasks`): Generate `tasks.md` with TDD approach
4. **Implement** (`/implement`): Execute tasks with quality checks
5. **Validate**: Run tests, Codacy scan, E2E scenarios
6. **Merge**: Create PR, auto-merge after checks pass

---

**Total Estimated Timeline**: 42 weeks (10 months) for complete feature set
**Current Progress**: 2 of 20 features complete (10%) - Week 4 of 42
**Phase 1 Status**: ✅ Complete (Weeks 1-4)
**Next Feature**: Feature 003 - Character Management System (P1, Critical Path)

---

*This roadmap is a living document. Update after each feature completion.*
