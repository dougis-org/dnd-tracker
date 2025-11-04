# D&D Tracker - Agile Feature Roadmap (1-2 Day Features)

**Product**: D&D Encounter Tracker Web App
**Version**: 2.0 - Agile Incremental Approach
**Last Updated**: 2025-11-02
**Status**: In Development

This roadmap is the authoritative plan for delivery cadence and milestones. Scope and expectations remain sourced from `docs/Product-Requirements.md`, while technology selections follow `docs/Tech-Stack.md`.

> **Core Principle**: Each feature is a discrete, deployable unit of work that can be completed in 1-2 days. Every feature includes TDD with unit, integration, and E2E tests.

## Progress Tracking

**Current Progress**: 1 of 60 features complete (1.7%) - Week 1 of 10  
**Phase 1 Status**: In Progress (1 of 12 features complete)  
**Next Feature**: Feature 002 - Navigation & Not Implemented Page  
**Started**: 2025-11-01  
**Latest Completion**: Feature 001 (2025-11-02 via PR #332)

### Completed Features by Phase

- **Phase 1 (UI Foundation)**: 1/12 complete
  - ✅ F001: Project Setup & Design System
- **Phase 2 (Authentication)**: 0/5 complete
- **Phase 3 (Entity Management)**: 0/12 complete
- **Phase 4 (Offline)**: 0/4 complete
- **Phase 5 (Combat Engine)**: 0/9 complete
- **Phase 6 (Combat Polish)**: 0/6 complete
- **Phase 7 (Monetization)**: 0/5 complete
- **Phase 8 (Advanced)**: 0/7 complete

## Table of Contents

- [Progress Tracking](#progress-tracking)
- [Feature Summary](#feature-summary)
- Phase 1: UI Foundation & Site Structure (Week 1) — [Issue #335](https://github.com/dougis-org/dnd-tracker/issues/335)
- Phase 2: Authentication & User Management (Week 2) — [Issue #336](https://github.com/dougis-org/dnd-tracker/issues/336)
- Phase 3: Core Entity Management (Week 3-4) — [Issue #337](https://github.com/dougis-org/dnd-tracker/issues/337)
- Phase 4: Offline Foundations (Week 5) — [Issue #338](https://github.com/dougis-org/dnd-tracker/issues/338)
- Phase 5: Combat Engine Core (Week 5-6) — [Issue #339](https://github.com/dougis-org/dnd-tracker/issues/339)
- Phase 6: Combat Polish & State (Week 7) — [Issue #340](https://github.com/dougis-org/dnd-tracker/issues/340)
- Phase 7: Monetization (Week 8) — [Issue #341](https://github.com/dougis-org/dnd-tracker/issues/341)
- Phase 8: Advanced Capabilities (Week 9-10) — [Issue #342](https://github.com/dougis-org/dnd-tracker/issues/342)
- [Summary](#summary)
- [Key Milestones](#key-milestones)
- [Testing Strategy](#testing-strategy)
- [Deployment Strategy](#deployment-strategy)
- [Success Criteria](#success-criteria)

## Feature Summary

| Feature # | Description | Status | Dependencies | Link |
| :--- | :--- | :--- | :--- | :--- |
| F001 | Project Setup & Design System | ✅ Complete | - | [Details](#feature-001-project-setup--design-system) |
| F002 | Navigation & Not Implemented Page | In Progress | Feature 001 | [Details](#feature-002-navigation--not-implemented-page) |
| F003 | Landing Page & Marketing Components | Planned | Feature 001, 002 | [Details](#feature-003-landing-page--marketing-components) |
| F004 | Dashboard Page | Planned | Feature 001, 002 | [Details](#feature-004-dashboard-page) |
| F005 | Character Management Pages | Planned | Feature 001, 002 | [Details](#feature-005-character-management-pages) |
| F006 | Party Management Pages | Planned | Feature 001, 002 | [Details](#feature-006-party-management-pages) |
| F007 | Monster/NPC Management Pages | Planned | Feature 001, 002 | [Details](#feature-007-monsternpc-management-pages) |
| F008 | Encounter Builder Pages | Planned | Feature 001, 002 | [Details](#feature-008-encounter-builder-pages) |
| F009 | Combat Tracker Page | Planned | Feature 001, 002 | [Details](#feature-009-combat-tracker-page) |
| F010 | User Profile & Settings Pages | Planned | Feature 001, 002 | [Details](#feature-010-user-profile--settings-pages) |
| F011 | Item Catalog Pages | Planned | Feature 001, 002 | [Details](#feature-011-item-catalog-pages) |
| F012 | Subscription & Billing Pages | Planned | Feature 001, 002 | [Details](#feature-012-subscription--billing-pages) |
| F013 | Clerk Integration & Auth Flow | Planned | Feature 001, 002, 012 | [Details](#feature-013-clerk-integration--auth-flow) |
| F014 | MongoDB User Model & Webhook | Planned | Feature 013 | [Details](#feature-014-mongodb-user-model--webhook) |
| F015 | Profile Setup Wizard | Planned | Feature 014 | [Details](#feature-015-profile-setup-wizard) |
| F016 | User Dashboard with Real Data | Planned | Feature 004, 014 | [Details](#feature-016-user-dashboard-with-real-data) |
| F017 | Profile Page Functionality | Planned | Feature 010, 014 | [Details](#feature-017-profile-page-functionality) |
| F018 | Character Model & API | Planned | Feature 014 | [Details](#feature-018-character-model--api) |
| F019 | Character List Page Integration | Planned | Feature 005, 018 | [Details](#feature-019-character-list-page-integration) |
| F020 | Character Creation Form | Planned | Feature 019 | [Details](#feature-020-character-creation-form) |
| F021 | Character Edit Form | Planned | Feature 019 | [Details](#feature-021-character-edit-form) |
| F022 | Character Templates | Planned | Feature 018 | [Details](#feature-022-character-templates) |
| F023 | Monster Model & API | Planned | Feature 014 | [Details](#feature-023-monster-model--api) |
| F024 | Monster List Page Integration | Planned | Feature 007, 023 | [Details](#feature-024-monster-list-page-integration) |
| F025 | Monster Creation/Edit Forms | Planned | Feature 024 | [Details](#feature-025-monster-creationedit-forms) |
| F026 | Item Model & API | Planned | Feature 014 | [Details](#feature-026-item-model--api) |
| F027 | Item Management Pages | Planned | Feature 011, 026 | [Details](#feature-027-item-management-pages) |
| F028 | Party Model & API | Planned | Feature 014, 018 | [Details](#feature-028-party-model--api) |
| F029 | Party Management Integration | Planned | Feature 006, 028 | [Details](#feature-029-party-management-integration) |
| F030 | Service Worker Setup | Planned | Feature 001 | [Details](#feature-030-service-worker-setup) |
| F031 | IndexedDB Setup | Planned | Feature 030 | [Details](#feature-031-indexeddb-setup) |
| F032 | Offline Combat | Planned | Feature 031, 036 | [Details](#feature-032-offline-combat) |
| F033 | Background Sync | Planned | Feature 032 | [Details](#feature-033-background-sync) |
| F034 | Encounter Model & API | Planned | Feature 014, 028, 023 | [Details](#feature-034-encounter-model--api) |
| F035 | Encounter Builder Integration | Planned | Feature 008, 034 | [Details](#feature-035-encounter-builder-integration) |
| F036 | Combat Session Model | Planned | Feature 034 | [Details](#feature-036-combat-session-model) |
| F037 | Initiative System | Planned | Feature 036 | [Details](#feature-037-initiative-system) |
| F038 | Combat Tracker Basic Integration | Planned | Feature 009, 037 | [Details](#feature-038-combat-tracker-basic-integration) |
| F039 | HP Tracking System | Planned | Feature 036 | [Details](#feature-039-hp-tracking-system) |
| F040 | HP Tracking UI Integration | Planned | Feature 038, 039 | [Details](#feature-040-hp-tracking-ui-integration) |
| F041 | HP History & Undo | Planned | Feature 039 | [Details](#feature-041-hp-history--undo) |
| F042 | Status Effects Model | Planned | Feature 036 | [Details](#feature-042-status-effects-model) |
| F043 | Status Effects UI | Planned | Feature 038, 042 | [Details](#feature-043-status-effects-ui) |
| F044 | Lair Actions System | Planned | Feature 036 | [Details](#feature-044-lair-actions-system) |
| F045 | Combat Session Management | Planned | Feature 036 | [Details](#feature-045-combat-session-management) |
| F046 | Combat Log System | Planned | Feature 036 | [Details](#feature-046-combat-log-system) |
| F047 | Tier Limit Enforcement | Planned | Feature 014 | [Details](#feature-047-tier-limit-enforcement) |
| F048 | Data Export System | Planned | Feature 018, 034, 046 | [Details](#feature-048-data-export-system) |
| F049 | Data Import System | Planned | Feature 018 | [Details](#feature-049-data-import-system) |
| F050 | Stripe Setup & Webhooks | Planned | Feature 014 | [Details](#feature-050-stripe-setup--webhooks) |
| F051 | Subscription Checkout | Planned | Feature 050 | [Details](#feature-051-subscription-checkout) |
| F052 | Subscription Management | Planned | Feature 012, 051 | [Details](#feature-052-subscription-management) |
| F053 | Billing Portal | Planned | Feature 050 | [Details](#feature-053-billing-portal) |
| F054 | Free Trial System | Planned | Feature 051 | [Details](#feature-054-free-trial-system) |
| F055 | Character Sharing | Planned | Feature 018 | [Details](#feature-055-character-sharing) |
| F056 | Advanced Combat Logging (Paid) | Planned | Feature 046, 047 | [Details](#feature-056-advanced-combat-logging-paid) |
| F057 | Custom Themes (Paid) | Planned | Feature 001, 047 | [Details](#feature-057-custom-themes-paid) |
| F058 | Collaborative Mode (Paid) | Planned | Feature 036, 047 | [Details](#feature-058-collaborative-mode-paid) |
| F059 | Performance Optimization | Planned | All previous features | [Details](#feature-059-performance-optimization) |
| F060 | Polish & Launch Prep | Planned | All previous features | [Details](#feature-060-polish--launch-prep) |

## Phase 1: UI Foundation & Site Structure (Week 1) (Issue #335)

**PRD Alignment**: §§5.1-5.4, 8.1-8.3 (Onboarding Experience & Marketing Surfaces)

### Feature 001: Project Setup & Design System

**Status**: Complete ✅ (Merged via PR #332)
**Completed**: 2025-11-02
**Branch**: 001-project-setup-design-system
**Spec Location**: `specs/001-project-setup-design-system/`

**Duration**: Day 1
**Deliverables**:

- Next.js 16.0.1 project with TypeScript 5.9.2 and Node 25.1.0
- Tailwind CSS 4.x configuration
- shadcn/ui setup with all components installed
- ESLint integrated and using existing `.eslintrc.js`
- Markdownlint integrated and using existing `.markdownlint.json`
- Color scheme, typography, spacing system
- Dark/light theme toggle (UI only)
- Common layouts: `MainLayout`, `AuthLayout`, `DashboardLayout`
- Jest + Playwright test setup
- Deployment pipeline to Fly.io
- Tests: Component library smoke tests
- Commands: npm run commands expected by CI are setup
  - test:ci:parallel
    - Runs the entire test suite using `--maxWorkers=50%`
  - lint
    - Runs ESLint
  - lint:markdown
    - Runs markdownlint
  - lint:markdown:fix
    - runs npm run lint:markdown passing `--fix`

**Acceptance Criteria**:

- [x] `npm run dev` starts the application
- [x] Theme toggle switches between light/dark
- [x] All shadcn/ui components render in Storybook
- [x] Deploys successfully to Fly.io

---

### Feature 002: Navigation & Not Implemented Page

**Status**: In Progress
**Started**: 2025-11-02
**Branch**: feature/002-navigation-not-implemented-page

**Depends on**: Feature 001
**Duration**: Day 1
**Deliverables**:

- Global navigation component with all menu items
- Mobile responsive hamburger menu
- Footer with links
- `NotImplementedPage` component with friendly message
- Route configuration for all pages (pointing to NotImplemented)
- Breadcrumb component
- Tests: Navigation rendering, route testing

**Pages/Routes Added**:

```
/ (landing)
/dashboard
/characters
/characters/new
/characters/:id
/parties
/parties/new
/parties/:id
/encounters
/encounters/new
/encounters/:id
/monsters
/monsters/new
/monsters/:id
/items
/items/new
/items/:id
/combat
/combat/:sessionId
/profile
/settings
/subscription
/pricing
```

**Acceptance Criteria**:

- [ ] All routes respond with NotImplementedPage
- [ ] Navigation menu shows all sections
- [ ] Mobile menu works on small screens
- [ ] Breadcrumbs show correct path
- [ ] Stakeholder design review sign-off captured for navigation mock

---

### Feature 003: Landing Page & Marketing Components

**Depends on**: Feature 001, Feature 002
**Duration**: Day 2
**Deliverables**:

- Landing page with hero section
- Feature showcase (3 columns with icons)
- Interactive demo section (mock data, non-functional)
- Pricing tier comparison table
- Testimonials carousel (hardcoded data)
- CTA buttons (non-functional)
- SEO meta tags
- Tests: Landing page components, responsive design

**Acceptance Criteria**:

- [ ] Landing page displays at `/`
- [ ] All sections render with mock data
- [ ] Page is mobile responsive
- [ ] Meta tags present in page head
- [ ] Stakeholder design review sign-off captured for landing page mock

---

### Feature 004: Dashboard Page

**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Dashboard layout with stat cards
- Quick action buttons grid
- Recent activity feed (mock data)
- Campaign overview section
- Usage metrics display (mock data)
- Welcome message for new users
- Tests: Dashboard component rendering

**Mock Data Includes**:

- 3 active parties
- 5 recent combat sessions
- Usage: 2/3 parties, 8/15 encounters
- Sample recent activity items

**Acceptance Criteria**:

- [ ] Dashboard shows at `/dashboard`
- [ ] All widgets render with mock data
- [ ] Quick actions are visible but show NotImplemented on click
- [ ] Responsive grid layout works
- [ ] Stakeholder design review sign-off captured for dashboard mock

---

### Feature 005: Character Management Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 2
**Deliverables**:

- Character list page with search/filter UI
- Character card component
- Character detail page layout
- Character creation/edit form (all fields, no submission)
- Character stats display component
- Delete confirmation modal
- Tests: Character page components, form validation UI

**Mock Data**:

- 5 sample characters with full D&D stats
- Different classes, races, levels
- HP, AC, abilities, equipment

**Acceptance Criteria**:

- [ ] `/characters` shows list of mock characters
- [ ] Search and filter UI elements present
- [ ] `/characters/:id` shows character details
- [ ] `/characters/new` shows creation form
- [ ] Form has all D&D 5e fields
- [ ] Stakeholder design review sign-off captured for character management mock

---

### Feature 006: Party Management Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Party list page
- Party card with member preview
- Party detail page with member list
- Party creation/edit form
- Add/remove member UI (mock)
- Party composition stats
- Tests: Party page components

**Mock Data**:

- 2 sample parties
- 4-5 members per party
- Party roles (tank, healer, DPS)

**Acceptance Criteria**:

- [ ] `/parties` shows list of parties
- [ ] `/parties/:id` shows party details with members
- [ ] `/parties/new` shows creation form
- [ ] Member management UI present
- [ ] Stakeholder design review sign-off captured for party management mock

---

### Feature 007: Monster/NPC Management Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 2
**Deliverables**:

- Monster list page with CR filter
- Monster card component
- Monster detail page with stat block
- Monster creation/edit form
- Special abilities section
- Legendary/lair actions UI
- Monster template library UI
- Tests: Monster page components

**Mock Data**:

- 10 sample monsters (various CRs)
- Legendary creatures with special abilities
- Lair action examples

**Acceptance Criteria**:

- [ ] `/monsters` shows filterable list
- [ ] `/monsters/:id` shows full stat block
- [ ] `/monsters/new` shows creation form
- [ ] Special abilities section displays
- [ ] Stakeholder design review sign-off captured for monster management mock

---

### Feature 008: Encounter Builder Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Encounter list page
- Encounter card with participant preview
- Encounter detail page
- Encounter builder wizard UI
- Participant selection (parties/monsters)
- CR calculator display
- Lair configuration section
- Tests: Encounter builder components

**Mock Data**:

- 3 sample encounters
- Mix of party + monster participants
- Difficulty ratings

**Acceptance Criteria**:

- [ ] `/encounters` shows list
- [ ] `/encounters/:id` shows details
- [ ] `/encounters/new` shows builder wizard
- [ ] CR calculation displays (mock)
- [ ] Stakeholder design review sign-off captured for encounter builder mock

---

### Feature 009: Combat Tracker Page

**Depends on**: Feature 001, Feature 002
**Duration**: Day 2
**Deliverables**:

- Combat tracker main interface
- Initiative order list
- Current turn indicator
- HP/damage input controls
- Status effect pills
- Round/turn counter
- Combat action buttons
- Lair action notification (initiative 20)
- Combat log panel
- Mobile-optimized combat view
- Tests: Combat tracker components

**Mock Data**:

- Active combat session
- 6 participants with initiatives
- Some with status effects
- Current round: 3, turn: 2

**Acceptance Criteria**:

- [ ] `/combat` shows tracker interface
- [ ] Initiative order displays correctly
- [ ] HP controls present
- [ ] Status effects show as pills
- [ ] Lair action prompt at initiative 20
- [ ] Stakeholder design review sign-off captured for combat tracker mock

---

### Feature 010: User Profile & Settings Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Profile page with D&D preferences
- Settings page with sections
- Account settings form
- D&D rules preference selector
- Experience level selector
- Role preference (DM/Player/Both)
- Notification preferences
- Data export section
- Tests: Profile/settings forms

**Mock Data**:

- User profile information
- Current settings/preferences

**Acceptance Criteria**:

- [ ] `/profile` shows user preferences
- [ ] `/settings` shows all sections
- [ ] Forms display but don't submit
- [ ] All preference options visible
- [ ] Stakeholder design review sign-off captured for profile/settings mock

---

### Feature 011: Item Catalog Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Item list page with categories
- Item card component
- Item detail page
- Item creation/edit form
- Magic item properties UI
- Item rarity indicators
- Tests: Item page components

**Mock Data**:

- 15 sample items
- Weapons, armor, magic items
- Various rarities

**Acceptance Criteria**:

- [ ] `/items` shows categorized list
- [ ] `/items/:id` shows item details
- [ ] `/items/new` shows creation form
- [ ] Rarity indicators display
- [ ] Stakeholder design review sign-off captured for item catalog mock

---

### Feature 012: Subscription & Billing Pages

**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Subscription management page
- Current plan display
- Usage metrics with progress bars
- Plan comparison table
- Upgrade/downgrade buttons (non-functional)
- Billing history table (mock)
- Payment method section
- Tests: Subscription page components

**Mock Data**:

- Current plan: Seasoned Adventurer
- Usage near limits
- Sample billing history

**Acceptance Criteria**:

- [ ] `/subscription` shows current plan
- [ ] Usage metrics display with visual indicators
- [ ] Plan comparison table renders
- [ ] Billing history shows mock data
- [ ] Stakeholder design review sign-off captured for subscription mock

---

**Governance Checkpoint (AI Agent)**: Verify Phase 1 UI deliverables against `docs/Product-Requirements.md §§5-8` and ensure design decisions are documented for future features.

## Phase 2: Authentication & User Management (Week 2) (Issue #336)

**PRD Alignment**: §§4.1, 6.3 (User Management & Security)

### Feature 013: Clerk Integration & Auth Flow

**Depends on**: Feature 001
**Duration**: Day 2
**Deliverables**:

- Clerk authentication setup
- Sign in/sign up pages
- Email/password and social login
- Protected route middleware
- Redirect to login for unauthenticated users
- Session management
- Sign out functionality
- Tests: Auth flow E2E tests

**Technical Tasks**:

- Configure Clerk with environment variables
- Add ClerkProvider to app
- Create sign-in/sign-up pages
- Add middleware for protected routes
- Update navigation with auth state

**Acceptance Criteria**:

- [ ] User can sign up with email
- [ ] User can sign in
- [ ] Protected pages redirect to login
- [ ] Sign out works
- [ ] Social login buttons present

---

### Feature 014: MongoDB User Model & Webhook

**Depends on**: Feature 013
**Duration**: Day 1
**Deliverables**:

- MongoDB connection setup
- User Mongoose model
- Clerk webhook handler
- User creation on sign-up
- User profile fields in database
- Profile data persistence
- Tests: Webhook handling, database operations

**Database Schema**:

```typescript
{
  clerkId: string,
  email: string,
  name: string,
  profile: {
    experienceLevel: string,
    preferredRole: string,
    ruleset: string,
    createdAt: Date
  },
  subscription: {
    tier: string,
    status: string
  },
  usage: {
    parties: number,
    encounters: number,
    characters: number
  }
}
```

**Acceptance Criteria**:

- [ ] Webhook creates user in MongoDB
- [ ] User data persists
- [ ] Profile fields stored correctly

---

### Feature 015: Profile Setup Wizard

**Depends on**: Feature 014
**Duration**: Day 1
**Deliverables**:

- First-login profile setup flow
- Multi-step wizard UI
- Experience level selection
- Role preference selection
- Ruleset selection
- Skip option
- Save profile to database
- Tests: Wizard flow, data persistence

**Acceptance Criteria**:

- [ ] New users see setup wizard
- [ ] Can complete or skip wizard
- [ ] Selections save to database
- [ ] Wizard doesn't show again

---

### Feature 016: User Dashboard with Real Data

**Depends on**: Feature 004, Feature 014
**Duration**: Day 1
**Deliverables**:

- Connect dashboard to user model
- Display real usage metrics
- Show user's actual tier
- Personalized welcome message
- Empty states for new users
- Tests: Dashboard data loading

**Acceptance Criteria**:

- [ ] Dashboard shows real user data
- [ ] Usage metrics reflect database
- [ ] Empty states display for new users
- [ ] Tier limits shown correctly

---

### Feature 017: Profile Page Functionality

**Depends on**: Feature 010, Feature 014
**Duration**: Day 1
**Deliverables**:

- Connect profile page to database
- Load user preferences
- Save profile updates
- Update D&D preferences
- Success/error messages
- Tests: Profile update flow

**API Routes**:

- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`

**Acceptance Criteria**:

- [ ] Profile loads from database
- [ ] Can update preferences
- [ ] Changes persist
- [ ] Success messages show

---

**Governance Checkpoint (AI Agent)**: Confirm auth + user data flows fulfill `docs/Product-Requirements.md §4.1` and update integration notes in `docs/Tech-Stack.md` if required.

## Phase 3: Core Entity Management (Week 3-4) (Issue #337)

**PRD Alignment**: §§4.2-4.4 (Party, Encounter, and Creature Management)

### Feature 018: Character Model & API

**Depends on**: Feature 014
**Duration**: Day 2
**Deliverables**:

- Character Mongoose model
- Character creation API
- Character list API
- Character detail API
- Character update API
- Character delete API
- Validation rules
- Tests: API endpoints, validation

**API Routes**:

- `POST /api/v1/characters`
- `GET /api/v1/characters`
- `GET /api/v1/characters/:id`
- `PUT /api/v1/characters/:id`
- `DELETE /api/v1/characters/:id`

**Acceptance Criteria**:

- [ ] Can create character via API
- [ ] List returns user's characters
- [ ] Update modifies character
- [ ] Delete removes character
- [ ] Validation rejects invalid data

---

### Feature 019: Character List Page Integration

**Depends on**: Feature 005, Feature 018
**Duration**: Day 1
**Deliverables**:

- Connect character list to API
- Real-time search/filter
- Loading states
- Error handling
- Empty state for no characters
- Delete functionality
- Tests: List page integration

**Acceptance Criteria**:

- [ ] List shows real characters
- [ ] Search filters results
- [ ] Can delete characters
- [ ] Loading states display

---

### Feature 020: Character Creation Form

**Depends on**: Feature 019
**Duration**: Day 1
**Deliverables**:

- Connect form to creation API
- Form validation
- Success redirect
- Error handling
- Multiclass support
- Tests: Form submission flow

**Acceptance Criteria**:

- [ ] Form creates character
- [ ] Validation shows errors
- [ ] Redirects on success
- [ ] Multiclass works

---

### Feature 021: Character Edit Form

**Depends on**: Feature 019
**Duration**: Day 1
**Deliverables**:

- Load character data in form
- Connect to update API
- Optimistic updates
- Conflict resolution
- Tests: Edit flow

**Acceptance Criteria**:

- [ ] Form loads existing data
- [ ] Updates save correctly
- [ ] Success feedback shown

---

### Feature 022: Character Templates

**Depends on**: Feature 018
**Duration**: Day 1
**Deliverables**:

- Template creation from character
- Template list UI
- Create from template
- Default templates
- Tests: Template functionality

**API Routes**:

- `POST /api/v1/characters/:id/save-template`
- `GET /api/v1/characters/templates`
- `POST /api/v1/characters/from-template`

**Acceptance Criteria**:

- [ ] Can save as template
- [ ] Templates list shows
- [ ] Can create from template

---

### Feature 023: Monster Model & API

**Depends on**: Feature 014
**Duration**: Day 2
**Deliverables**:

- Monster Mongoose model
- Monster CRUD APIs
- Special abilities sub-schema
- Legendary/lair actions
- CR validation
- Tests: Monster APIs

**API Routes**:

- `POST /api/v1/monsters`
- `GET /api/v1/monsters`
- `GET /api/v1/monsters/:id`
- `PUT /api/v1/monsters/:id`
- `DELETE /api/v1/monsters/:id`

**Acceptance Criteria**:

- [ ] Monster CRUD works
- [ ] Special abilities save
- [ ] CR calculates correctly

---

### Feature 024: Monster List Page Integration

**Depends on**: Feature 007, Feature 023
**Duration**: Day 1
**Deliverables**:

- Connect monster list to API
- CR filter functionality
- Type filter
- Search by name
- Tests: Monster list integration

**Acceptance Criteria**:

- [ ] List shows monsters
- [ ] Filters work
- [ ] Search functions

---

### Feature 025: Monster Creation/Edit Forms

**Depends on**: Feature 024
**Duration**: Day 1
**Deliverables**:

- Connect forms to APIs
- Stat block builder
- Ability editor
- Legendary action editor
- Tests: Monster form flows

**Acceptance Criteria**:

- [ ] Can create monsters
- [ ] Can edit monsters
- [ ] Abilities save correctly

---

### Feature 026: Item Model & API

**Depends on**: Feature 014
**Duration**: Day 1
**Deliverables**:

- Item Mongoose model
- Item CRUD APIs
- Magic properties schema
- Rarity system
- Tests: Item APIs

**API Routes**:

- `POST /api/v1/items`
- `GET /api/v1/items`
- `GET /api/v1/items/:id`
- `PUT /api/v1/items/:id`
- `DELETE /api/v1/items/:id`

**Acceptance Criteria**:

- [ ] Item CRUD works
- [ ] Magic properties save
- [ ] Categories function

---

### Feature 027: Item Management Pages

**Depends on**: Feature 011, Feature 026
**Duration**: Day 1
**Deliverables**:

- Connect item pages to APIs
- Category filtering
- Rarity filtering
- Item creation/edit
- Tests: Item page integration

**Acceptance Criteria**:

- [ ] Item pages functional
- [ ] Filters work
- [ ] Can manage items

---

### Feature 028: Party Model & API

**Depends on**: Feature 014, Feature 018
**Duration**: Day 1
**Deliverables**:

- Party Mongoose model
- Party CRUD APIs
- Member management APIs
- Tests: Party APIs

**API Routes**:

- `POST /api/v1/parties`
- `GET /api/v1/parties`
- `PUT /api/v1/parties/:id`
- `DELETE /api/v1/parties/:id`
- `POST /api/v1/parties/:id/members`
- `DELETE /api/v1/parties/:id/members/:characterId`

**Acceptance Criteria**:

- [ ] Party CRUD works
- [ ] Can add/remove members
- [ ] Member limit enforced

---

### Feature 029: Party Management Integration

**Depends on**: Feature 006, Feature 028
**Duration**: Day 1
**Deliverables**:

- Connect party pages to APIs
- Member selection UI
- Drag-drop member ordering
- Role assignment
- Tests: Party management flow

**Acceptance Criteria**:

- [ ] Can create parties
- [ ] Can manage members
- [ ] Roles assign correctly

---

**Governance Checkpoint (AI Agent)**: Validate entity domain coverage against `docs/Product-Requirements.md §§4.2-4.4` and confirm API schemas remain aligned with the technical design.

## Phase 4: Offline Foundations (Week 5) (Issue #338)

**PRD Alignment**: §§4.6, 6.1, 8.3 (Data Persistence & Offline Experience)

### Feature 030: Service Worker Setup

**Depends on**: Feature 001
**Duration**: Day 1
**Deliverables**:

- Service worker registration
- Cache strategy
- Offline detection
- Online/offline indicator
- Tests: Service worker

**Acceptance Criteria**:

- [ ] Service worker registers in supported browsers
- [ ] Caching strategy validated against `docs/Tech-Stack.md`
- [ ] Offline state detection surfaces UI banner

---

### Feature 031: IndexedDB Setup

**Depends on**: Feature 030
**Duration**: Day 1
**Deliverables**:

- IndexedDB wrapper
- Schema definition
- CRUD operations
- Migration support
- Tests: IndexedDB operations

**Acceptance Criteria**:

- [ ] IndexedDB initializes with migration path
- [ ] CRUD operations validated with sample data set
- [ ] Data model matches PRD §4.6 persistence requirements

---

### Feature 032: Offline Combat

**Depends on**: Feature 031, Feature 036
**Duration**: Day 2
**Deliverables**:

- Local combat storage
- Offline combat creation
- Local state management
- Sync queue
- Tests: Offline combat

**Acceptance Criteria**:

- [ ] Combat experiences operate offline end-to-end
- [ ] Local state persists across refresh
- [ ] Sync queue records pending operations

---

### Feature 033: Background Sync

**Depends on**: Feature 032
**Duration**: Day 1
**Deliverables**:

- Sync mechanism
- Conflict resolution
- Sync status UI
- Error handling
- Tests: Sync system

**Acceptance Criteria**:

- [ ] Online reconciliation merges queued changes
- [ ] Conflict resolution follows documented policy
- [ ] Sync status indicator visible to users

---

**Governance Checkpoint (AI Agent)**: Validate offline readiness against `docs/Product-Requirements.md §4.6` and ensure roadmap, PRD, and `docs/Tech-Stack.md` remain synchronized.

## Phase 5: Combat Engine Core (Week 5-6) (Issue #339)

**PRD Alignment**: §§4.3-4.5 (Encounter Builder & Combat Tracker foundations)

### Feature 034: Encounter Model & API

**Depends on**: Feature 014, Feature 028, Feature 023
**Duration**: Day 2
**Deliverables**:

- Encounter Mongoose model
- Encounter CRUD APIs
- Participant management
- CR calculation
- Lair action configuration
- Tests: Encounter APIs

**API Routes**:

- `POST /api/v1/encounters`
- `GET /api/v1/encounters`
- `PUT /api/v1/encounters/:id`
- `DELETE /api/v1/encounters/:id`
- `POST /api/v1/encounters/:id/participants`

**Acceptance Criteria**:

- [ ] Encounter CRUD works
- [ ] Can add participants
- [ ] CR calculates

---

### Feature 035: Encounter Builder Integration

**Depends on**: Feature 008, Feature 034
**Duration**: Day 1
**Deliverables**:

- Connect builder to APIs
- Party selection
- Monster selection
- CR calculation display
- Lair action setup
- Tests: Builder functionality

**Acceptance Criteria**:

- [ ] Builder creates encounters
- [ ] Can add parties/monsters
- [ ] CR updates live

---

### Feature 036: Combat Session Model

**Depends on**: Feature 034
**Duration**: Day 1
**Deliverables**:

- CombatSession model
- Session creation from encounter
- Participant state tracking
- Round/turn tracking
- Tests: Session model

**API Routes**:

- `POST /api/v1/combat/sessions`
- `GET /api/v1/combat/sessions/:id`
- `PUT /api/v1/combat/sessions/:id`

**Acceptance Criteria**:

- [ ] Can start combat
- [ ] Session persists
- [ ] State tracks correctly

---

### Feature 037: Initiative System

**Depends on**: Feature 036
**Duration**: Day 2
**Deliverables**:

- Initiative rolling
- Manual initiative entry
- Dexterity tie-breaking
- Initiative order sorting
- Turn advancement
- Tests: Initiative logic

**API Routes**:

- `POST /api/v1/combat/sessions/:id/initiative/roll`
- `PUT /api/v1/combat/sessions/:id/initiative/:participantId`
- `POST /api/v1/combat/sessions/:id/next-turn`
- `POST /api/v1/combat/sessions/:id/previous-turn`

**Acceptance Criteria**:

- [ ] Initiative rolls work
- [ ] Tie-breaking correct
- [ ] Turn advances properly

---

### Feature 038: Combat Tracker Basic Integration

**Depends on**: Feature 009, Feature 037
**Duration**: Day 1
**Deliverables**:

- Load combat session
- Display initiative order
- Show current turn
- Next/previous controls
- Round counter
- Tests: Tracker integration

**Acceptance Criteria**:

- [ ] Tracker loads session
- [ ] Initiative displays
- [ ] Can advance turns
- [ ] Round increments

---

### Feature 039: HP Tracking System

**Depends on**: Feature 036
**Duration**: Day 1
**Deliverables**:

- Apply damage API
- Apply healing API
- Temporary HP
- HP validation
- Death/unconscious states
- Tests: HP system

**API Routes**:

- `POST /api/v1/combat/sessions/:id/damage`
- `POST /api/v1/combat/sessions/:id/heal`
- `POST /api/v1/combat/sessions/:id/temp-hp`

**Acceptance Criteria**:

- [ ] Damage applies
- [ ] Healing works
- [ ] Temp HP tracks
- [ ] States update

---

### Feature 040: HP Tracking UI Integration

**Depends on**: Feature 038, Feature 039
**Duration**: Day 1
**Deliverables**:

- Damage/heal inputs
- HP bars visual
- Quick damage buttons
- Temp HP indicator
- Unconscious/dead display
- Tests: HP UI integration

**Acceptance Criteria**:

- [ ] Can apply damage/healing
- [ ] HP bars update
- [ ] Visual states show

---

### Feature 041: HP History & Undo

**Depends on**: Feature 039
**Duration**: Day 1
**Deliverables**:

- HP change history
- Undo last action
- Redo functionality
- History limit (last 5)
- Tests: History system

**API Routes**:

- `GET /api/v1/combat/sessions/:id/history`
- `POST /api/v1/combat/sessions/:id/undo`
- `POST /api/v1/combat/sessions/:id/redo`

**Acceptance Criteria**:

- [ ] History tracks
- [ ] Undo works
- [ ] Limited to 5 actions

---

### Feature 042: Status Effects Model

**Depends on**: Feature 036
**Duration**: Day 1
**Deliverables**:

- StatusEffect definitions
- ActiveStatusEffect tracking
- Duration management
- Effect expiration
- Tests: Status model

**Data**:

- All D&D 5e conditions
- Duration types
- Effect descriptions

**Acceptance Criteria**:

- [ ] Effects defined
- [ ] Can apply effects
- [ ] Duration tracks

---

### Feature 043: Status Effects UI

**Depends on**: Feature 038, Feature 042
**Duration**: Day 1
**Deliverables**:

- Apply status effect UI
- Status pills display
- Duration countdown
- Remove effect
- Effect descriptions
- Tests: Status UI

**API Routes**:

- `POST /api/v1/combat/sessions/:id/participants/:pid/effects`
- `DELETE /api/v1/combat/sessions/:id/participants/:pid/effects/:eid`

**Acceptance Criteria**:

- [ ] Can apply effects
- [ ] Pills display
- [ ] Duration shows
- [ ] Can remove

---

### Feature 044: Lair Actions System

**Depends on**: Feature 036
**Duration**: Day 1
**Deliverables**:

- Lair action triggers
- Initiative 20 handling
- Action selection UI
- Environmental effects
- Tests: Lair system

**API Routes**:

- `POST /api/v1/combat/sessions/:id/lair-action`
- `GET /api/v1/combat/sessions/:id/available-lair-actions`

**Acceptance Criteria**:

- [ ] Triggers on init 20
- [ ] Can select action
- [ ] Effects apply

---

### Feature 045: Combat Session Management

**Depends on**: Feature 036
**Duration**: Day 1
**Deliverables**:

- Pause/resume combat
- End combat
- Combat summary
- Session list page
- Tests: Session management

**API Routes**:

- `PUT /api/v1/combat/sessions/:id/pause`
- `PUT /api/v1/combat/sessions/:id/resume`
- `PUT /api/v1/combat/sessions/:id/end`

**Acceptance Criteria**:

- [ ] Can pause/resume
- [ ] End generates summary
- [ ] List shows sessions

---

### Feature 046: Combat Log System

**Depends on**: Feature 036
**Duration**: Day 1
**Deliverables**:

- Action logging
- Log display panel
- Filter by type
- Export log
- Tests: Logging system

**Acceptance Criteria**:

- [ ] Actions log
- [ ] Log displays
- [ ] Can filter
- [ ] Export works

---

### Feature 047: Tier Limit Enforcement

**Depends on**: Feature 014
**Duration**: Day 1
**Deliverables**:

- Usage tracking
- Limit checks
- Warning at 80%
- Block at limit
- Upgrade prompts
- Tests: Limit enforcement

**Acceptance Criteria**:

- [ ] Usage tracks
- [ ] Limits enforce
- [ ] Warnings show
- [ ] Upgrade prompts work

---

### Feature 048: Data Export System

**Depends on**: Feature 018, Feature 034, Feature 046
**Duration**: Day 1
**Deliverables**:

- Character export (JSON)
- Encounter export (JSON)
- Combat log export (PDF)
- Bulk export
- Tests: Export functionality

**API Routes**:

- `GET /api/v1/export/characters`
- `GET /api/v1/export/encounters`
- `GET /api/v1/export/combat/:id`

**Acceptance Criteria**:

- [ ] Exports generate
- [ ] Formats correct
- [ ] Bulk works

---

### Feature 049: Data Import System

**Depends on**: Feature 018
**Duration**: Day 1
**Deliverables**:

- Character import
- Validation
- Duplicate handling
- Error messages
- Tests: Import flow

**API Routes**:

- `POST /api/v1/import/characters`
- `POST /api/v1/import/validate`

**Acceptance Criteria**:

- [ ] Import works
- [ ] Validation catches errors
- [ ] Duplicates handled

---

### Feature 050: Stripe Setup & Webhooks

**Depends on**: Feature 014
**Duration**: Day 2
**Deliverables**:

- Stripe integration
- Webhook endpoints
- Event handling
- Customer creation
- Tests: Stripe integration

**API Routes**:

- `POST /api/v1/webhooks/stripe`
- `POST /api/v1/billing/create-customer`

**Acceptance Criteria**:

- [ ] Stripe connected
- [ ] Webhooks receive events
- [ ] Customers created

---

### Feature 051: Subscription Checkout

**Depends on**: Feature 050
**Duration**: Day 1
**Deliverables**:

- Checkout session creation
- Redirect to Stripe
- Success/cancel pages
- Subscription activation
- Tests: Checkout flow

**API Routes**:

- `POST /api/v1/billing/checkout`
- `GET /api/v1/billing/success`
- `GET /api/v1/billing/cancel`

**Acceptance Criteria**:

- [ ] Checkout works
- [ ] Payment processes
- [ ] Subscription activates

---

### Feature 052: Subscription Management

**Depends on**: Feature 012, Feature 051
**Duration**: Day 1
**Deliverables**:

- Current plan display
- Upgrade/downgrade
- Cancel subscription
- Resume subscription
- Tests: Subscription management

**API Routes**:

- `POST /api/v1/billing/upgrade`
- `POST /api/v1/billing/downgrade`
- `POST /api/v1/billing/cancel`

**Acceptance Criteria**:

- [ ] Can change plans
- [ ] Cancel works
- [ ] Limits update

---

### Feature 053: Billing Portal

**Depends on**: Feature 050
**Duration**: Day 1
**Deliverables**:

- Customer portal link
- Invoice history
- Payment methods
- Billing details
- Tests: Portal integration

**API Routes**:

- `POST /api/v1/billing/portal`
- `GET /api/v1/billing/invoices`

**Acceptance Criteria**:

- [ ] Portal accessible
- [ ] Invoices show
- [ ] Can update payment

---

### Feature 054: Free Trial System

**Depends on**: Feature 051
**Duration**: Day 1
**Deliverables**:

- Trial activation
- Trial countdown
- Trial expiration
- Conversion prompts
- Tests: Trial flow

**Acceptance Criteria**:

- [ ] Trial activates
- [ ] Countdown shows
- [ ] Expires correctly
- [ ] Prompts to convert

---

**Governance Checkpoint (AI Agent)**: Confirm monetization flows match PRD §§3.1-3.2 and Stripe configurations in `docs/Tech-Stack.md`.

## Phase 6: Combat Polish & State (Week 7) (Issue #340)

**PRD Alignment**: §§4.3-4.6 (Combat UX, State Persistence & Edge Cases)

This phase focuses on polishing the combat experience and hardening state management across offline/online transitions. Typical work includes:

- Finalizing HP history, undo/redo UX, and edge case handling
- Ensuring pause/resume/end-of-combat flows and session summaries are robust
- Completing status-effects, lair action, and initiative edge-case fixes
- Expanding E2E coverage for combat and offline sync reconciliation

**Governance Checkpoint (AI Agent)**: Verify combat state persistence and undo/redo behaviors against `docs/Product-Requirements.md §4.6`. Capture regression test results and stakeholder acceptance notes.

## Phase 7: Monetization (Week 8) (Issue #341)

**PRD Alignment**: §§3.1-3.2 (Monetization & Billing)

This phase finalizes paid features and billing integration. Work includes:

- Stripe webhook verification and billing portal integration
- Free-trial flows and subscription lifecycle handling
- Tiered feature gating and telemetry for paid features
- UX polish for checkout and subscription management

**Governance Checkpoint (AI Agent)**: Run security and compliance checks on billing endpoints and record results. Ensure `docs/Tech-Stack.md` documents any third-party account configuration and webhook verification steps.

## Phase 8: Advanced Capabilities (Week 9-10) (Issue #342)

**PRD Alignment**: §§3.3, 5.3, 12 (Premium Expansion & Future Enhancements)

### Feature 055: Character Sharing

**Depends on**: Feature 018
**Duration**: Day 1
**Deliverables**:

- Share link generation
- Permission system
- Accept/reject shares
- Shared character list
- Tests: Sharing system

**API Routes**:

- `POST /api/v1/characters/:id/share`
- `GET /api/v1/characters/shared`

**Acceptance Criteria**:

- [ ] Links generate
- [ ] Permissions work
- [ ] Can accept/reject

---

### Feature 056: Advanced Combat Logging (Paid)

**Depends on**: Feature 046, Feature 047
**Duration**: Day 1
**Deliverables**:

- Detailed action log
- Statistics calculation
- Analytics dashboard
- Tier gating
- Tests: Advanced logging

**Acceptance Criteria**:

- [ ] Detailed logs work
- [ ] Stats calculate
- [ ] Gated to paid tiers

---

### Feature 057: Custom Themes (Paid)

**Depends on**: Feature 001, Feature 047
**Duration**: Day 1
**Deliverables**:

- Theme selector
- Custom colors
- Font preferences
- Layout density
- Tests: Theme system

**Acceptance Criteria**:

- [ ] Themes apply
- [ ] Custom colors work
- [ ] Preferences save

---

### Feature 058: Collaborative Mode (Paid)

**Depends on**: Feature 036, Feature 047
**Duration**: Day 2
**Deliverables**:

- Real-time sync (Pusher)
- Shared campaigns
- Live combat updates
- Presence indicators
- Tests: Collaboration

**Acceptance Criteria**:

- [ ] Real-time works
- [ ] Multiple users sync
- [ ] Presence shows

---

### Feature 059: Performance Optimization

**Depends on**: All previous features
**Duration**: Day 1
**Deliverables**:

- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis
- Tests: Performance metrics

**Acceptance Criteria**:

- [ ] <3s load time
- [ ] <100ms interactions
- [ ] 95+ Lighthouse score

---

### Feature 060: Polish & Launch Prep

**Depends on**: All previous features
**Duration**: Day 1
**Deliverables**:

- Bug fixes
- UI polish
- Error boundaries
- 404 page
- Analytics setup
- Launch checklist
- Tests: Full E2E suite

**Acceptance Criteria**:

- [ ] No critical bugs
- [ ] All tests pass
- [ ] Analytics tracking
- [ ] Ready for launch

---

**Governance Checkpoint (AI Agent)**: Audit premium capabilities against PRD §§3.3 & 12 and document follow-on enhancements for the next roadmap revision.

## Summary

**Total Features**: 60
**Estimated Duration**: 10 weeks (50-60 working days)
**Daily Deployment**: Each feature deploys to production

## Key Milestones

- **End of Week 1**: Complete UI shell (all pages, no functionality)
- **End of Week 2**: Authentication working, users can sign up/in
- **End of Week 4**: All entities manageable (characters, monsters, parties, encounters)
- **End of Week 5**: Offline foundations (service worker, IndexedDB, sync queue) validated against PRD §4.6
- **End of Week 6**: Combat engine fully functional (MVP achieved)
- **End of Week 8**: Monetization live
- **End of Week 10**: Full feature set complete

## Testing Strategy

Each feature includes:

1. **Unit Tests**: Component and function testing
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: User flow testing with Playwright

## Deployment Strategy

- Continuous deployment to Fly.io
- Feature flags for incomplete features
- Database migrations run automatically
- Zero-downtime deployments
- Rollback capability for each feature

## Success Criteria

Each feature must:

- [ ] Pass all tests (unit, integration, E2E)
- [ ] Deploy successfully
- [ ] Not break existing functionality
- [ ] Be usable (even if showing "not implemented")
- [ ] Meet accessibility standards
- [ ] Work on mobile devices
