# D&D Tracker - Agile Feature Roadmap (1-2 Day Increments)

**Product**: D&D Encounter Tracker Web App
**Version**: 2.0 - Agile Incremental Approach
**Last Updated**: 2025-11-01
**Status**: Planning Phase

> **Core Principle**: Each increment is a discrete, deployable unit of work that can be completed in 1-2 days. Every increment includes TDD with unit, integration, and E2E tests.

## Phase 1: UI Foundation & Site Structure (Week 1)

### Increment 001: Project Setup & Design System

**Duration**: Day 1
**Deliverables**:

- Next.js 16.0.1 project with TypeScript 5.9.2
- Tailwind CSS 4.x configuration
- shadcn/ui setup with all components installed
- Color scheme, typography, spacing system
- Dark/light theme toggle (UI only)
- Common layouts: `MainLayout`, `AuthLayout`, `DashboardLayout`
- Jest + Playwright test setup
- Deployment pipeline to Fly.io
- Tests: Component library smoke tests

**Acceptance Criteria**:

- [ ] `npm run dev` starts the application
- [ ] Theme toggle switches between light/dark
- [ ] All shadcn/ui components render in Storybook
- [ ] Deploys successfully to Fly.io

---

### Increment 002: Navigation & Not Implemented Page

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

---

### Increment 003: Landing Page & Marketing Components

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

---

### Increment 004: Dashboard Page

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

---

### Increment 005: Character Management Pages

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

---

### Increment 006: Party Management Pages

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

---

### Increment 007: Monster/NPC Management Pages

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

---

### Increment 008: Encounter Builder Pages

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

---

### Increment 009: Combat Tracker Page

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

---

### Increment 010: User Profile & Settings Pages

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

---

### Increment 011: Item Catalog Pages

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

---

### Increment 012: Subscription & Billing Pages

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

---

## Phase 2: Authentication & User Management (Week 2)

### Increment 013: Clerk Integration & Auth Flow

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

### Increment 014: MongoDB User Model & Webhook

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

### Increment 015: Profile Setup Wizard

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

### Increment 016: User Dashboard with Real Data

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

### Increment 017: Profile Page Functionality

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

## Phase 3: Core Entity Management (Week 3-4)

### Increment 018: Character Model & API

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

### Increment 019: Character List Page Integration

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

### Increment 020: Character Creation Form

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

### Increment 021: Character Edit Form

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

### Increment 022: Character Templates

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

### Increment 023: Monster Model & API

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

### Increment 024: Monster List Page Integration

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

### Increment 025: Monster Creation/Edit Forms

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

### Increment 026: Item Model & API

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

### Increment 027: Item Management Pages

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

### Increment 028: Party Model & API

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

### Increment 029: Party Management Integration

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

## Phase 4: Combat Engine Core (Week 5-6)

### Increment 030: Encounter Model & API

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

### Increment 031: Encounter Builder Integration

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

### Increment 032: Combat Session Model

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

### Increment 033: Initiative System

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

### Increment 034: Combat Tracker Basic Integration

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

### Increment 035: HP Tracking System

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

### Increment 036: HP Tracking UI Integration

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

### Increment 037: HP History & Undo

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

### Increment 038: Status Effects Model

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

### Increment 039: Status Effects UI

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

### Increment 040: Lair Actions System

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

## Phase 5: Combat Polish & State (Week 7)

### Increment 041: Combat Session Management

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

### Increment 042: Combat Log System

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

### Increment 043: Tier Limit Enforcement

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

### Increment 044: Data Export System

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

### Increment 045: Data Import System

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

## Phase 6: Monetization (Week 8)

### Increment 046: Stripe Setup & Webhooks

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

### Increment 047: Subscription Checkout

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

### Increment 048: Subscription Management

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

### Increment 049: Billing Portal

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

### Increment 050: Free Trial System

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

## Phase 7: Offline & Advanced Features (Week 9-10)

### Increment 051: Service Worker Setup

**Duration**: Day 1
**Deliverables**:

- Service worker registration
- Cache strategy
- Offline detection
- Online/offline indicator
- Tests: Service worker

**Acceptance Criteria**:

- [ ] SW registers
- [ ] Caching works
- [ ] Offline detected

---

### Increment 052: IndexedDB Setup

**Duration**: Day 1
**Deliverables**:

- IndexedDB wrapper
- Schema definition
- CRUD operations
- Migration support
- Tests: IndexedDB operations

**Acceptance Criteria**:

- [ ] DB initializes
- [ ] CRUD works
- [ ] Migrations run

---

### Increment 053: Offline Combat

**Duration**: Day 2
**Deliverables**:

- Local combat storage
- Offline combat creation
- Local state management
- Sync queue
- Tests: Offline combat

**Acceptance Criteria**:

- [ ] Combat works offline
- [ ] State persists locally
- [ ] Queue tracks changes

---

### Increment 054: Background Sync

**Duration**: Day 1
**Deliverables**:

- Sync mechanism
- Conflict resolution
- Sync status UI
- Error handling
- Tests: Sync system

**Acceptance Criteria**:

- [ ] Syncs when online
- [ ] Conflicts resolve
- [ ] Status shows

---

### Increment 055: Character Sharing

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

### Increment 056: Advanced Combat Logging (Paid)

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

### Increment 057: Custom Themes (Paid)

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

### Increment 058: Collaborative Mode (Paid)

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

### Increment 059: Performance Optimization

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

### Increment 060: Polish & Launch Prep

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

## Summary

**Total Increments**: 60
**Estimated Duration**: 10 weeks (50-60 working days)
**Daily Deployment**: Each increment deploys to production

## Key Milestones

- **End of Week 1**: Complete UI shell (all pages, no functionality)
- **End of Week 2**: Authentication working, users can sign up/in
- **End of Week 4**: All entities manageable (characters, monsters, parties, encounters)
- **End of Week 6**: Combat tracker fully functional (MVP achieved)
- **End of Week 8**: Monetization live
- **End of Week 10**: Full feature set complete

## Testing Strategy

Each increment includes:

1. **Unit Tests**: Component and function testing
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: User flow testing with Playwright

## Deployment Strategy

- Continuous deployment to Fly.io
- Feature flags for incomplete features
- Database migrations run automatically
- Zero-downtime deployments
- Rollback capability for each increment

## Success Criteria

Each increment must:

- [ ] Pass all tests (unit, integration, E2E)
- [ ] Deploy successfully
- [ ] Not break existing functionality
- [ ] Be usable (even if showing "not implemented")
- [ ] Meet accessibility standards
- [ ] Work on mobile devices
