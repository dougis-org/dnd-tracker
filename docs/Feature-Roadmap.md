# D&D Tracker - Agile Feature Roadmap (1-2 Day Features)

**Product**: D&D Encounter Tracker Web App
**Version**: 2.0 - Agile Incremental Approach
**Last Updated**: 2025-12-02
**Status**: In Development

This roadmap is the authoritative plan for delivery cadence and milestones. Scope and expectations remain sourced from `docs/Product-Requirements.md`, while technology selections follow `docs/Tech-Stack.md`.

> **Core Principle**: Each feature is a discrete, deployable unit of work that can be completed in 1-2 days. Every feature includes TDD with unit, integration, and E2E tests.

## Progress Tracking

**Current Progress**: 15 of 75 features complete (20%) - Week 2 of 10  
**Phase 1 Status**: Complete ✅ (12 of 12 features complete)  
**Phase 2 Status**: In Progress (4 of 5 features complete)  
**Phase 4 Status**: In Progress (1 of 5 features complete)  
**Next Feature**: Feature 015 - Profile Setup Wizard  
**Started**: 2025-11-01  
**Latest Completion**: Feature 014 (2025-11-26 via PR #469)

> **Note**: Feature numbers F018+ have been renumbered to accommodate decomposed features. See `docs/feature-renumbering-plan.md` for complete mappings.

### Completed Features by Phase

- **Phase 1 (UI Foundation)**: 12/12 complete ✅
  - ✅ F001: Project Setup & Design System
  - ✅ F002: Navigation & Not Implemented Page
  - ✅ F003: Landing Page & Marketing Components (Merged via PR #410 on 2025-11-06)
  - ✅ F006: Party Management Pages (Merged via PR #417 on 2025-11-08)
  - ✅ F007: Monster/NPC Management Pages (Merged via PR #419 on 2025-11-11)
  - ✅ F008: Encounter Builder Pages (Merged via PR #420 on 2025-11-11)
  - ✅ F009: Combat Tracker Page (Merged via PR #443 on 2025-11-12)
  - ✅ F010: User Profile & Settings Pages (Merged via PR #446 on 2025-11-12)
  - ✅ F011: Item Catalog Pages (Merged via PR #447 on 2025-11-13)
  - ✅ F012: Subscription & Billing Pages (Merged via PR #450 on 2025-11-14)
- **Phase 2 (Authentication)**: 4/5 complete
  - ✅ F004: Dashboard Page (Merged via PR #413 on 2025-11-07)
  - ✅ F005: Character Management Pages (Merged via PR #414 on 2025-11-08)
  - ✅ F013: Clerk Integration & Auth Flow (Merged via PR #463 on 2025-11-19)
  - ✅ F014: MongoDB User Model & Webhook (Merged via PR #469 on 2025-11-26)
- **Phase 3 (Entity Management)**: 0/17 complete
- **Phase 4 (Offline)**: 1/5 complete
  - ✅ F035: Service Worker Setup (Merged via PR #458 on 2025-11-18)
- **Phase 5 (Combat Engine)**: 0/16 complete
- **Phase 6 (Combat Polish)**: 0/7 complete
- **Phase 7 (Monetization)**: 0/9 complete
- **Phase 8 (Advanced)**: 0/6 complete

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

| Feature # | Description | Status | Dependencies | GitHub Issue | Milestone |
| :--- | :--- | :--- | :--- | :--- | :--- |
| F001 | Project Setup & Design System | ✅ Complete | - | N/A (Closed) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F002 | Navigation & Not Implemented Page | ✅ Complete | F001 | [#333](https://github.com/dougis-org/dnd-tracker/issues/333) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F003 | Landing Page & Marketing Components | ✅ Complete | F001, F002 | [#357](https://github.com/dougis-org/dnd-tracker/issues/357) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F004 | Dashboard Page | ✅ Complete | F001, F002 | [#358](https://github.com/dougis-org/dnd-tracker/issues/358) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F005 | Character Management Pages | ✅ Complete (Merged via PR #414) | F001, F002 | [#359](https://github.com/dougis-org/dnd-tracker/issues/359) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F006 | Party Management Pages | ✅ Complete (Merged via PR #417) | F001, F002 | [#360](https://github.com/dougis-org/dnd-tracker/issues/360) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F007 | Monster/NPC Management Pages | ✅ Complete (Merged via PR #419) | F001, F002 | [#361](https://github.com/dougis-org/dnd-tracker/issues/361) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F008 | Encounter Builder Pages | ✅ Complete (Merged via PR #420) | F001, F002 | [#362](https://github.com/dougis-org/dnd-tracker/issues/362) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F009 | Combat Tracker Page | ✅ Complete (Merged via PR #443) | F001, F002 | [#363](https://github.com/dougis-org/dnd-tracker/issues/363) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F010 | User Profile & Settings Pages | ✅ Complete (Merged via PR #446) | F001, F002 | [#364](https://github.com/dougis-org/dnd-tracker/issues/364) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F011 | Item Catalog Pages | ✅ Complete (Merged via PR #447) | F001, F002 | [#365](https://github.com/dougis-org/dnd-tracker/issues/365) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F012 | Subscription & Billing Pages | ✅ Complete (Merged via PR #450) | F001, F002 | [#366](https://github.com/dougis-org/dnd-tracker/issues/366) | [Phase 1](https://github.com/dougis-org/dnd-tracker/milestone/1) |
| F013 | Clerk Integration & Auth Flow | ✅ Complete | F001, F002, F012 | [#367](https://github.com/dougis-org/dnd-tracker/issues/367) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F014 | MongoDB User Model & Webhook | ✅ Complete (Merged via PR #469) | F013 | [#368](https://github.com/dougis-org/dnd-tracker/issues/368) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F015 | Profile Setup Wizard | 🚧 In Progress | F014 | [#369](https://github.com/dougis-org/dnd-tracker/issues/369) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F016 | User Dashboard with Real Data | Planned | F004, F014 | [#370](https://github.com/dougis-org/dnd-tracker/issues/370) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F017 | Profile Page Functionality | Planned | F010, F014 | [#371](https://github.com/dougis-org/dnd-tracker/issues/371) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F018 | Character Read Operations | Planned | F014 | [#372](https://github.com/dougis-org/dnd-tracker/issues/372) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F019 | Character Write Operations | Planned | F018 | [#426](https://github.com/dougis-org/dnd-tracker/issues/426) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F020 | Character Validation & Business Rules | Planned | F018, F019 | [#427](https://github.com/dougis-org/dnd-tracker/issues/427) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F021 | Character List Page Integration | Planned | F005, F018 | [#373](https://github.com/dougis-org/dnd-tracker/issues/373) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F022 | Character Creation Form | Planned | F021 | [#374](https://github.com/dougis-org/dnd-tracker/issues/374) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F023 | Character Edit Form | Planned | F021 | [#375](https://github.com/dougis-org/dnd-tracker/issues/375) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F024 | Character Templates | Planned | F018 | [#376](https://github.com/dougis-org/dnd-tracker/issues/376) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F025 | Monster Read Operations | Planned | F014 | [#377](https://github.com/dougis-org/dnd-tracker/issues/377) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F026 | Monster Write Operations | Planned | F025 | [#428](https://github.com/dougis-org/dnd-tracker/issues/428) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F027 | Monster Validation & SRD Integration | Planned | F025, F026 | [#429](https://github.com/dougis-org/dnd-tracker/issues/429) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F028 | Monster List Page Integration | Planned | F007, F025 | [#378](https://github.com/dougis-org/dnd-tracker/issues/378) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F029 | Monster Creation/Edit Forms | Planned | F028 | [#379](https://github.com/dougis-org/dnd-tracker/issues/379) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F030 | Item Model & API | Planned | F014 | [#380](https://github.com/dougis-org/dnd-tracker/issues/380) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F031 | Item Management Pages | Planned | F011, F030 | [#381](https://github.com/dougis-org/dnd-tracker/issues/381) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F032 | Party Model & Read Operations | Planned | F014, F018 | [#382](https://github.com/dougis-org/dnd-tracker/issues/382) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F033 | Party Management Operations | Planned | F032 | [#430](https://github.com/dougis-org/dnd-tracker/issues/430) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F034 | Party Management Integration | Planned | F006, F032 | [#383](https://github.com/dougis-org/dnd-tracker/issues/383) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F035 | Service Worker Setup | ✅ Complete (Merged via PR #458) | F001 | [#384](https://github.com/dougis-org/dnd-tracker/issues/384) | [Phase 4](https://github.com/dougis-org/dnd-tracker/milestone/4) |
| F036 | IndexedDB Setup | Planned | F035 | [#385](https://github.com/dougis-org/dnd-tracker/issues/385) | [Phase 4](https://github.com/dougis-org/dnd-tracker/milestone/4) |
| F037 | Offline Combat with Local Storage | Planned | F036, F044 | [#386](https://github.com/dougis-org/dnd-tracker/issues/386) | [Phase 4](https://github.com/dougis-org/dnd-tracker/milestone/4) |
| F038 | Sync Queue & Conflict Detection | Planned | F037 | [#432](https://github.com/dougis-org/dnd-tracker/issues/432) | [Phase 4](https://github.com/dougis-org/dnd-tracker/milestone/4) |
| F039 | Background Sync | Planned | F037 | [#387](https://github.com/dougis-org/dnd-tracker/issues/387) | [Phase 4](https://github.com/dougis-org/dnd-tracker/milestone/4) |
| F040 | Encounter Model & Read Operations | Planned | F014, F032, F025 | [#388](https://github.com/dougis-org/dnd-tracker/issues/388) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F041 | Encounter Write Operations | Planned | F040 | [#433](https://github.com/dougis-org/dnd-tracker/issues/433) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F042 | Encounter Templates & Presets | Planned | F040 | [#435](https://github.com/dougis-org/dnd-tracker/issues/435) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F043 | Encounter Builder Integration | Planned | F008, F040 | [#389](https://github.com/dougis-org/dnd-tracker/issues/389) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F044 | Combat Session Model & State | Planned | F040 | [#390](https://github.com/dougis-org/dnd-tracker/issues/390) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F045 | Combat Session Persistence | Planned | F044 | [#436](https://github.com/dougis-org/dnd-tracker/issues/436) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F046 | Initiative Calculation & Ordering | Planned | F044 | [#391](https://github.com/dougis-org/dnd-tracker/issues/391) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F047 | Initiative Modifiers & Effects | Planned | F046 | [#437](https://github.com/dougis-org/dnd-tracker/issues/437) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F048 | Combat Tracker Basic Integration | Planned | F009, F046 | [#392](https://github.com/dougis-org/dnd-tracker/issues/392) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F049 | HP Model & Basic Tracking | Planned | F044 | [#393](https://github.com/dougis-org/dnd-tracker/issues/393) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F050 | Damage Types & Resistances | Planned | F049 | [#438](https://github.com/dougis-org/dnd-tracker/issues/438) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F051 | HP Tracking UI Integration | Planned | F048, F049 | [#394](https://github.com/dougis-org/dnd-tracker/issues/394) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F052 | HP History & Undo | Planned | F049 | [#395](https://github.com/dougis-org/dnd-tracker/issues/395) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F053 | Status Effects Model & Basic Effects | Planned | F044 | [#396](https://github.com/dougis-org/dnd-tracker/issues/396) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F054 | Complex Status Effects & Conditions | Planned | F053 | [#439](https://github.com/dougis-org/dnd-tracker/issues/439) | [Phase 5](https://github.com/dougis-org/dnd-tracker/milestone/5) |
| F055 | Status Effects UI | Planned | F048, F053 | [#397](https://github.com/dougis-org/dnd-tracker/issues/397) | [Phase 6](https://github.com/dougis-org/dnd-tracker/milestone/6) |
| F056 | Lair Actions System | Planned | F044 | [#398](https://github.com/dougis-org/dnd-tracker/issues/398) | [Phase 6](https://github.com/dougis-org/dnd-tracker/milestone/6) |
| F057 | Save & Load Combat Sessions | Planned | F044 | [#399](https://github.com/dougis-org/dnd-tracker/issues/399) | [Phase 6](https://github.com/dougis-org/dnd-tracker/milestone/6) |
| F058 | Combat Session History & Archive | Planned | F057 | [#440](https://github.com/dougis-org/dnd-tracker/issues/440) | [Phase 6](https://github.com/dougis-org/dnd-tracker/milestone/6) |
| F059 | Combat Event Logging | Planned | F044 | [#400](https://github.com/dougis-org/dnd-tracker/issues/400) | [Phase 6](https://github.com/dougis-org/dnd-tracker/milestone/6) |
| F060 | Log Export & Analysis | Planned | F059 | [#441](https://github.com/dougis-org/dnd-tracker/issues/441) | [Phase 6](https://github.com/dougis-org/dnd-tracker/milestone/6) |
| F061 | Tier Limit Enforcement | Planned | F014 | Not Created | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F062 | Data Export System | Planned | F018, F040, F059 | Not Created | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F063 | Data Import System | Planned | F018 | Not Created | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F064 | Stripe Account Setup & Integration | Planned | F014 | [#401](https://github.com/dougis-org/dnd-tracker/issues/401) | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F065 | Webhook Handling & Events | Planned | F064 | [#442](https://github.com/dougis-org/dnd-tracker/issues/442) | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F066 | Subscription Checkout | Planned | F064 | [#402](https://github.com/dougis-org/dnd-tracker/issues/402) | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F067 | Subscription Management | Planned | F012, F066 | [#403](https://github.com/dougis-org/dnd-tracker/issues/403) | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F068 | Billing Portal | Planned | F064 | [#404](https://github.com/dougis-org/dnd-tracker/issues/404) | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F069 | Free Trial System | Planned | F066 | [#405](https://github.com/dougis-org/dnd-tracker/issues/405) | [Phase 7](https://github.com/dougis-org/dnd-tracker/milestone/7) |
| F070 | Character Sharing | Planned | F018 | [#407](https://github.com/dougis-org/dnd-tracker/issues/407) | [Phase 8](https://github.com/dougis-org/dnd-tracker/milestone/8) |
| F071 | Advanced Combat Logging (Paid) | Planned | F059, F061 | [#408](https://github.com/dougis-org/dnd-tracker/issues/408) | [Phase 8](https://github.com/dougis-org/dnd-tracker/milestone/8) |
| F072 | Custom Themes (Paid) | Planned | F001, F061 | [#409](https://github.com/dougis-org/dnd-tracker/issues/409) | [Phase 8](https://github.com/dougis-org/dnd-tracker/milestone/8) |
| F073 | Collaborative Mode (Paid) | Planned | F044, F061 | [#410](https://github.com/dougis-org/dnd-tracker/issues/410) | [Phase 8](https://github.com/dougis-org/dnd-tracker/milestone/8) |
| F074 | Performance Optimization | Planned | All previous features | [#411](https://github.com/dougis-org/dnd-tracker/issues/411) | [Phase 8](https://github.com/dougis-org/dnd-tracker/milestone/8) |
| F075 | Polish & Launch Prep | Planned | All previous features | [#412](https://github.com/dougis-org/dnd-tracker/issues/412) | [Phase 8](https://github.com/dougis-org/dnd-tracker/milestone/8) |

## Phase 1: UI Foundation & Site Structure (Week 1)

**Parent Issue**: [#335](https://github.com/dougis-org/dnd-tracker/issues/335)  
**Milestone**: [Phase 1: UI Foundation & Site Structure](https://github.com/dougis-org/dnd-tracker/milestone/1)  
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

**Status**: Complete ✅ (Merged via PR #406)
**Completed**: 2025-11-05
**Branch**: feature/002-navigation-not-implemented-page
**Spec Location**: `specs/002-navigation-not-implemented-page/`

**Duration**: Day 1
**Deliverables**:

- Global navigation component with all menu items
- Mobile responsive hamburger menu with custom hooks for UX
- Footer with links and styling
- `NotImplementedPage` component with friendly message and help links
- Route configuration for all pages (pointing to NotImplemented)
- Breadcrumb component with navigation path tracking
- Comprehensive tests: Navigation rendering, route testing, E2E interactions
- All routes responding correctly with NotImplementedPage fallback

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
/help
/subscription
/pricing
```

**Acceptance Criteria**:

- [x] All routes respond with NotImplementedPage
- [x] Navigation menu shows all sections
- [x] Mobile menu works on small screens
- [x] Breadcrumbs show correct path
- [x] 31/31 tests passing (76.28% coverage)
- [x] ESLint clean (0 errors)
- [x] All quality gates passing

---

### Feature 003: Landing Page & Marketing Components

**Status**: Complete ✅ (Merged via PR #415)
**Branch**: feature/003-landing-page
**Spec Location**: `specs/003-landing-page/`

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

**Status**: In Progress
**Branch**: feature/004-dashboard-page
**Spec Location**: specs/004-dashboard-page/

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

**Status**: Complete ✅ (Merged via PR #414)
**Completed**: 2025-11-08
**Branch**: feature/005-character-management-pages
**Spec Location**: specs/005-character-management-pages/

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

### ✅ Feature 006: Party Management Pages

**Status**: Complete ✅ (Merged via PR #417)
**Completed**: 2025-11-08
**Spec Location**: `specs/006-party-management-pages/`

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

### ✅ Feature 007: Monster/NPC Management Pages

**Status**: Complete ✅ (Merged via PR #419)  
**Completed**: 2025-11-11  
**Spec Location**: `specs/007-monster-management/`

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

### ✅ Feature #008: Encounter Builder Pages

**Status**: Complete ✅ (Merged via PR #420)
**Completed**: 2025-11-11
**Branch**: feature/008-encounter-builder
**Spec Location**: specs/008-encounter-builder/
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

### ✅ Feature #009: Combat Tracker Page

**Status**: Complete ✅ (Merged via PR #443)
**Completed**: 2025-11-12
**Branch**: feature/009-combat-tracker
**Spec Location**: specs/009-combat-tracker/
**Depends on**: Feature 001, Feature 002
**Duration**: Day 2
**Deliverables**:

- Combat tracker main interface ✅
- Initiative order list ✅
- Current turn indicator ✅
- HP/damage input controls ✅
- Status effect pills ✅
- Round/turn counter ✅
- Combat action buttons ✅
- Lair action notification (initiative 20) ✅
- Combat log panel ✅
- Mobile-optimized combat view ✅
- Tests: Combat tracker components ✅
- Test helper patterns for code quality ✅

**Implementation**:

- CombatTracker main component with session loading and state management
- InitiativeOrder component with turn highlighting and sorting
- HPTracker and HPBar components for damage/healing management
- StatusEffectsPanel, StatusEffectMenu, StatusEffectPill components
- RoundTurnCounter, ParticipantStatusBadges, TurnControlButtons, LairActionNotification
- CombatLog and CombatLogEntry components
- Combat helpers and adapters for localStorage persistence
- Undo/redo manager for turn rewinding
- Test helpers (combatTestHelpers.ts, testPatterns.ts) with 10 reusable patterns to eliminate duplication

**Test Coverage**:

- 31 tests for HPTracker (280 lines)
- 21 tests for StatusEffectPill (238 lines)
- 23 tests for StatusEffectMenu (264 lines)
- 22 tests for StatusEffectsPanel (275 lines)
- Integration and unit tests for combat helpers
- All 776 tests passing with 80%+ coverage

**Acceptance Criteria** (All Met):

- ✅ `/combat` shows tracker interface
- ✅ Initiative order displays correctly sorted by initiative
- ✅ HP controls present and functional
- ✅ Status effects show as pills with duration tracking
- ✅ Lair action prompt triggers at initiative 20
- ✅ Damage and healing apply correctly with temp HP support
- ✅ Turn advancement with round incrementing works
- ✅ Undo/redo functionality for state management
- ✅ localStorage persistence for sessions
- ✅ Mobile-optimized responsive UI
- ✅ Accessibility: ARIA labels, live regions, semantic markup
- ✅ 776 total tests passing (70 test suites)

---

### ✅ Feature 010: User Profile & Settings Pages

**Status**: Complete ✅ (Merged via PR #446)
**Completed**: 2025-11-12
**Branch**: feature/010-user-profile-settings
**Spec Location**: specs/010-user-profile-settings/
**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables**:

- Profile page with D&D preferences ✅
- Settings page with sections ✅
- Account settings form ✅
- D&D rules preference selector ✅
- Experience level selector ✅
- Role preference (DM/Player/Both) ✅
- Notification preferences ✅
- Data export section ✅
- Tests: Profile/settings forms ✅
- User adapter with localStorage persistence ✅
- Zod validation schemas ✅

**Implementation Details**:

- **ProfilePage Component**: Main container with async data loading, state management via useEffect
- **ProfileForm Component**: User-editable profile form with inline validation
- **ProfileLoader/ProfileError/ProfileEmpty Components**: Separate state UI components for testability
- **UserAdapter**: localStorage-backed data persistence with 300ms network delay simulation
- **Zod Schemas**: Type-safe validation for user profiles and preferences
- **Test Helpers**: Reusable mock factories (userAdapterMocks.ts) eliminating duplication
- **API Routes**: Profile and preferences endpoints (GET/PUT)
- **Test Coverage**: 18 tests covering all states (loading, success, error, empty, retry)

**Acceptance Criteria** (All Met):

- ✅ `/profile` shows user preferences
- ✅ `/settings` shows all sections  
- ✅ Forms display with real data loading
- ✅ All preference options visible
- ✅ Mock adapter with network delay simulation
- ✅ localStorage persistence
- ✅ Error handling with retry
- ✅ Empty state for new users
- ✅ 18/18 tests passing
- ✅ 80%+ code coverage
- ✅ All components under 450 lines
- ✅ All functions under 50 lines
- ✅ Zero TypeScript errors
- ✅ ESLint clean

---

### ✅ Feature 011: Item Catalog Pages

**Status**: Complete ✅ (Merged via PR #447)
**Completed**: 2025-11-13
**Branch**: feature/011-item-catalog
**Spec Location**: specs/011-item-catalog/
**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables** (All Complete):

- ✅ Item list page with browse, filter, and search functionality
- ✅ Item card component with rarity styling and property display
- ✅ Item detail page layout
- ✅ Item creation form with full D&D item types
- ✅ Magic item properties UI with conditional rendering
- ✅ Item rarity indicators (Common, Uncommon, Rare, Very Rare, Legendary, Artifact)
- ✅ Comprehensive test suite: 34 tests (unit, integration, E2E)
- ✅ localStorage-backed mock adapter for data persistence
- ✅ Full TypeScript support with Zod validation
- ✅ TDD-first implementation with 80%+ coverage

**Implementation Details**:

- **Components**: ItemCard, ItemFilters, ItemSearchBar
- **Adapter**: localStorage-backed item persistence with CRUD operations
- **Types & Schemas**: Item interface with ItemCategory, ItemRarity, ArmorType enums; Zod validation schema
- **Mock Data**: 3 SRD sample items (Longsword, Shortsword, Healing Potion) with system item marking
- **Features**: Debounced search (300ms), memoized filtering, loading states with skeletons, empty states, accessibility (aria-live)
- **Tests**: 21 unit tests, 6 integration tests, 7 E2E tests across ItemSearchBar, ItemFilters, ItemCard, and items list flow

**Acceptance Criteria** (All Met):

- ✅ `/items` shows categorized list with all 10 item categories
- ✅ `/items/:id` shows item details with complete properties
- ✅ `/items/new` shows creation form with all D&D item fields
- ✅ Rarity indicators display with proper styling
- ✅ Filter by category and rarity works correctly
- ✅ Search debounces and filters by name/description
- ✅ Loading states show skeleton placeholders
- ✅ Empty state displays when no items match filters
- ✅ localStorage persists item changes across sessions
- ✅ All tests passing (854/854)
- ✅ ESLint clean, TypeScript strict mode clean
- ✅ Build successful, code within project limits
- ✅ 0 code clones (eliminated via helper extraction)
- ✅ 0 complexity violations
- ✅ All Gemini code review comments addressed:
  - ✅ localStorage persistence implemented (not in-memory)
  - ✅ Modern React patterns with AbortController (not isMounted flag)

### ✅ Feature 012: Subscription & Billing Pages

**Status**: Complete ✅ (Merged via PR #450)
**Completed**: 2025-11-14
**Branch**: feature/012-subscription-billing
**Spec Location**: specs/012-subscription-billing/
**Depends on**: Feature 001, Feature 002
**Duration**: Day 1
**Deliverables** (All Complete):

- ✅ Subscription management page with real-time data loading
- ✅ Current plan display with tier information
- ✅ Usage metrics with progress bars and visual indicators
- ✅ Plan comparison table with feature comparison
- ✅ Upgrade/downgrade buttons (mock implementation)
- ✅ Billing history table with pagination (mock data)
- ✅ Payment method section
- ✅ Comprehensive test suite: 963 tests total
- ✅ localStorage-backed mock adapter for subscription data
- ✅ Zod validation schemas for type safety
- ✅ TDD-first implementation with 87.67% coverage on adapters

**Implementation Details**:

- **Components**: SubscriptionPage, SubscriptionPageUsage, PlanCard, PlanCardHeader, PlanCardCTA, PlanCardTrialInfo, PlanCardRenewalInfo
- **Adapters**: subscriptionAdapter.ts with localStorage persistence and 300ms network delay simulation
- **Validation**: Zod schemas for Subscription, UsageMetric, Plan, Invoice with comprehensive validation
- **Storage Utilities**: getStorage() with three-tier fallback (window → global → no-op), safeJsonParse(), delay()
- **Tests**: 31 adapter tests, 11 storage utility tests, 5 schema test suites (subscription, usage, plan, invoice, type inference)
- **Coverage**: 87.67% on subscriptionAdapter.ts, 94.44% on storageUtils.ts, 100% on validationHelpers.ts

**Mock Data**:

- Current plan: Seasoned Adventurer
- Usage near limits with visual indicators
- Sample billing history with pagination support
- Default plans: Free, Seasoned Adventurer, Master DM

**Acceptance Criteria** (All Met):

- ✅ `/subscription` shows current plan with loading states
- ✅ Usage metrics display with visual progress bars
- ✅ Plan comparison table renders all three tiers
- ✅ Billing history shows mock data with pagination
- ✅ localStorage persistence across sessions
- ✅ All 963 tests passing
- ✅ ESLint clean, TypeScript strict mode clean
- ✅ Build successful
- ✅ 87.67% adapter coverage (only catch blocks uncovered)
- ✅ Codacy Diff Coverage: SUCCESS
- ✅ All CI checks passing

---

**Governance Checkpoint (AI Agent)**: Verify Phase 1 UI deliverables against `docs/Product-Requirements.md §§5-8` and ensure design decisions are documented for future features.

## Phase 2: Authentication & User Management (Week 2)

**Parent Issue**: [#336](https://github.com/dougis-org/dnd-tracker/issues/336)  
**Milestone**: [Phase 2: Authentication & User Management](https://github.com/dougis-org/dnd-tracker/milestone/2)  
**PRD Alignment**: §§4.1, 6.3 (User Management & Security)

### ✅ Feature 013: Clerk Integration & Auth Flow

**Status**: Complete ✅ (Merged via PR #463)
**Completed**: 2025-11-19
**Branch**: feature/013-clerk-integration-auth
**Spec Location**: `specs/013-clerk-integration-auth/`

**Depends on**: Feature 001
**Duration**: Day 2
**Deliverables** (All Complete):

- ✅ Clerk authentication setup with @clerk/nextjs 2.x
- ✅ Sign in/sign up pages with Clerk hosted components
- ✅ Email/password and social login configured
- ✅ Protected route middleware with exact-match logic (prevents false positives)
- ✅ Redirect to login for unauthenticated users
- ✅ Session management with useAuth hooks (useAuth, useIsAuthenticated, useCurrentUser)
- ✅ Sign out functionality via Clerk
- ✅ Auth flow E2E tests with Playwright
- ✅ Test complexity reduced 40% through parameterization

**Implementation Details**:

- **Auth Middleware**: `src/middleware.ts` with exact-match route protection
  - Prevents `/dashboard-info` false positives by using `pathname === route || pathname.startsWith(route + '/')`
  - Protected routes: `/dashboard`, `/subscription`, `/profile`, `/settings`
  
- **Route Handler**: `src/app/api/auth/check/route.ts` for client-side auth verification
  - Returns `{ isAuthenticated, requiresAuth, redirectUrl }` for ProtectedRouteGuard
  
- **Auth Hooks**: `src/components/auth/useAuth.ts` with three hooks:
  - `useAuth()`: Full auth state from Clerk
  - `useIsAuthenticated()`: Boolean authentication status
  - `useCurrentUser()`: Current user profile data
  
- **Protected Components**: ProtectedRouteGuard wrapper for client-side route protection
  
- **Auth Flow Pages**: Sign-in and sign-up with Clerk hosted components
  
- **Tests**: 55 parameterized tests across integration and unit suites
  - Route protection: 8 protected routes + 4 public routes
  - Redirect encoding: 3 test cases
  - Auth state validation: 3 scenarios
  - Response construction: 4 flow scenarios
  - useAuth hooks: 11 test cases across 3 hooks
  - Auth middleware: 9 edge cases
  
- **Code Quality**:
  - 1,082/1,082 tests passing (0 failures)
  - 66.11% statement coverage, 67.61% line coverage
  - useAuth.ts: 92.85% coverage
  - Codacy analysis: Clean (0 issues)
  - ESLint: Clean (0 errors)
  - TypeScript strict mode: Clean (0 errors)
  - Build time: 11.1s compile with zero warnings

**Refactoring (Test Complexity Reduction)**:

- **Before**: 477 lines across 3 files with complexity 31-53
- **After**: 286 lines with parameterized tests
- **Reduction**: 40% lines eliminated through describe.each/it.each
- **Complexity**: All flagged complexity issues resolved

**Acceptance Criteria** (All Met):

- ✅ User can sign up with email via Clerk
- ✅ User can sign in with email/password
- ✅ Protected pages redirect to `/sign-in` for unauthenticated users
- ✅ Sign out works via Clerk session management
- ✅ Social login buttons present and configured (Google, GitHub, etc.)
- ✅ Session persists across page refreshes via Clerk session token
- ✅ Route protection uses exact match (no false positives like `/dashboard-info`)
- ✅ All 1,082 tests passing
- ✅ Build clean (11.1s compile, zero errors/warnings)
- ✅ ESLint clean, TypeScript strict mode clean
- ✅ Codacy analysis passing with zero issues
- ✅ Test complexity reduced 40% through parameterization

---

### ✅ Feature 014: MongoDB User Model & Webhook

**Status**: Complete ✅ (Merged via PR #469)
**Completed**: 2025-11-26
**Branch**: feature/014-mongodb-user-model
**Spec Location**: specs/014-mongodb-user-model/

**Depends on**: Feature 013
**Duration**: Day 1
**Deliverables** (All Complete):

- ✅ MongoDB connection setup with serverless caching via mongoose 8.19.1
- ✅ User Mongoose model with soft-delete and immutable fields
- ✅ UserEvent model for audit trail (fire-and-forget processing)
- ✅ Clerk webhook handler with HMAC-SHA256 validation
- ✅ User creation on sign-up via webhook
- ✅ User profile fields in database
- ✅ Profile data persistence with timestamp-based conflict resolution
- ✅ CRUD endpoints (POST, GET, PATCH, DELETE)
- ✅ Comprehensive test suite: 130+ tests with 80%+ coverage
- ✅ Structured JSON logging (INFO/WARN/ERROR)
- ✅ Webhook receiver with fire-and-forget event processing
- ✅ Zod validation schemas for all payloads

**Implementation Details**:

- **MongoDB Connection**: `src/lib/db/connection.ts` with serverless caching and connection pooling
- **User Model**: `src/lib/models/user.ts` with soft-delete (deletedAt), immutable userId/email, updatedAt tracking
- **UserEvent Model**: Audit trail for all user modifications, fire-and-forget processing
- **Webhook Handler**: `src/app/api/webhooks/user-events/route.ts`
  - HMAC-SHA256 signature validation
  - Fire-and-forget event storage (returns 200 immediately)
  - Timestamp-based conflict resolution (skip if event.timestamp ≤ current.updatedAt)
  - Max payload size: 1MB, timeout: 3s
- **CRUD Endpoints**: `src/app/api/internal/users/`
  - POST: Create user
  - GET /[userId]: Get user (excludes soft-deleted)
  - PATCH /[userId]: Update displayName, metadata only
  - DELETE /[userId]: Soft-delete user
- **Validation**: Zod schemas for webhook payloads, request/response types
- **Logging**: Structured JSON logging with context throughout all operations
- **Tests**: 130+ tests (42 model validation, 30 logging format, 25 error handling, 25+ integration)

**Database Schema**:

```typescript
{
  _id: ObjectId,
  userId: string (immutable),
  email: string (immutable),
  displayName: string,
  metadata: Record<string, any>,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date | null (soft-delete),
  __v: number (versioning)
}
```

**Configuration**:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=dnd-tracker
WEBHOOK_SECRET=your-hmac-key              # Optional
WEBHOOK_MAX_PAYLOAD_SIZE=1048576          # 1MB default
WEBHOOK_TIMEOUT_MS=3000                   # 3s default
```

**Key Patterns**:

- **Soft-Delete**: Set deletedAt timestamp, exclude from default queries
- **Fire-and-Forget**: Return 200 immediately after event storage
- **Conflict Resolution**: Skip update if event.timestamp ≤ current.updatedAt
- **Immutable Fields**: userId and email cannot change after creation
- **Error Codes**: 400 (validation), 401 (signature), 404 (not found), 409 (duplicate), 413 (size), 500 (error)

**Acceptance Criteria** (All Met):

- ✅ Webhook creates user in MongoDB
- ✅ User data persists across requests
- ✅ Profile fields stored and retrieved correctly
- ✅ Soft-delete prevents user data from showing in queries
- ✅ Timestamp-based conflict resolution prevents race conditions
- ✅ HMAC-SHA256 webhook signature validation prevents unauthorized access
- ✅ Fire-and-forget processing ensures quick webhook responses
- ✅ All 1,242 tests passing (1056 unit + 186 integration)
- ✅ ESLint clean, TypeScript strict mode clean
- ✅ Build successful
- ✅ 80%+ code coverage on all files
- ✅ All Codacy issues resolved (8 code quality fixes applied)
- ✅ Merged via PR #469 on 2025-11-26

---

### Feature 015: Profile Setup Wizard

**Status**: 🚧 In Progress
**Branch**: feature/015-profile-setup-wizard
**Spec Location**: specs/015-profile-setup-wizard/spec.md

**Depends on**: Feature 014
**Duration**: Day 1
**Deliverables**:

- Multi-step wizard UI with progress tracking
- First-login detection and automatic wizard trigger
- Experience level selection (Beginner, Intermediate, Advanced)
- Role preference selection (Player, DM, Both)
- D&D ruleset selection (5e, Pathfinder, custom)
- Campaign creation with optional first campaign setup
- Skip/complete buttons with form validation
- Save selections to MongoDB user profile
- Prevent wizard re-display after completion
- Comprehensive test suite: 40+ tests (unit, integration, E2E)
- localStorage-backed mock adapter for development
- Full TypeScript support with Zod validation

**Implementation Details**:

- **Components**: ProfileSetupWizard, WizardStep, WizardNavigation, CompletionStatus
- **Adapter**: userProfileAdapter.ts with MongoDB persistence simulation (localStorage fallback)
- **Validation**: Zod schemas for ProfileSetupData, WizardStepData
- **State Management**: useWizardState hook with localStorage caching
- **Features**:
  - Progress tracking with step counter
  - Form validation with error messages
  - Skip option with confirmation
  - First-login detection via user model
  - Campaign creation integration
  - Preference persistence to MongoDB

**Test Coverage**:

- 15 component unit tests
- 12 integration tests for wizard flow
- 8 E2E tests for user journey
- 40+ tests total with 85%+ coverage
- Mock adapter tests with network simulation

**Acceptance Criteria**:

- [ ] New users see setup wizard on first login
- [ ] Can complete all 4 steps
- [ ] Can skip wizard with confirmation
- [ ] Selections save to MongoDB user profile
- [ ] Wizard doesn't display again after completion
- [ ] Form validation prevents invalid entries
- [ ] Optional campaign creation works
- [ ] All 40+ tests passing
- [ ] ESLint clean, TypeScript strict mode clean
- [ ] Build successful
- [ ] 85%+ code coverage

---

### Feature 016: User Dashboard with Real Data

**Status**: In Progress
**Branch**: feature/016-user-dashboard-real-data
**Spec Location**: specs/016-user-dashboard-real-data/

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

## Phase 3: Core Entity Management (Week 3-4)

**Parent Issue**: [#337](https://github.com/dougis-org/dnd-tracker/issues/337)  
**Milestone**: [Phase 3: Core Entity Management](https://github.com/dougis-org/dnd-tracker/milestone/3)  
**PRD Alignment**: §§4.2-4.4 (Party, Encounter, and Creature Management)

> **Note**: Features F018-F034 represent decomposed character, monster, party, and entity APIs. See issue descriptions for decomposition details.

### Feature 018: Character Read Operations

**Previously**: Character Model & API (decomposed)  
**Depends on**: Feature 014  
**Duration**: Day 1  
**GitHub Issue**: [#372](https://github.com/dougis-org/dnd-tracker/issues/372)  
**Deliverables**:

- Character Mongoose model
- Character list API (GET)
- Character detail API (GET)
- Database indexes
- Tests: Read operations

**API Routes**:

- `GET /api/v1/characters`
- `GET /api/v1/characters/:id`

**Acceptance Criteria**:

- [ ] Character model defined
- [ ] List returns user's characters
- [ ] Detail endpoint returns single character
- [ ] Proper filtering and pagination

---

### Feature 019: Character Write Operations

**Decomposed from**: F018 Character Model & API  
**Depends on**: Feature 018  
**Duration**: Day 1  
**GitHub Issue**: [#426](https://github.com/dougis-org/dnd-tracker/issues/426)  
**Deliverables**:

- Character creation API (POST)
- Character update API (PUT)
- Character delete API (DELETE)
- Optimistic locking
- Tests: Write operations

**API Routes**:

- `POST /api/v1/characters`
- `PUT /api/v1/characters/:id`
- `DELETE /api/v1/characters/:id`

**Acceptance Criteria**:

- [ ] Can create character via API
- [ ] Update modifies character
- [ ] Delete removes character
- [ ] Concurrent updates handled

---

### Feature 020: Character Validation & Business Rules

**Decomposed from**: F018 Character Model & API  
**Depends on**: Feature 018, Feature 019  
**Duration**: Day 1  
**GitHub Issue**: [#427](https://github.com/dougis-org/dnd-tracker/issues/427)  
**Deliverables**:

- Comprehensive validation rules
- Ability score validation
- Level/XP validation
- HP boundary checks
- Tests: Validation edge cases

**Acceptance Criteria**:

- [ ] Validation rejects invalid ability scores
- [ ] Level/XP consistency enforced
- [ ] HP cannot exceed maximum
- [ ] Clear error messages

---

### Feature 021: Character List Page Integration

**Previously**: F019 (renumbered)  
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

### Feature 022: Character Creation Form

**Previously**: F020 (renumbered)  
**Depends on**: Feature 021  
**Duration**: Day 1  
**GitHub Issue**: [#374](https://github.com/dougis-org/dnd-tracker/issues/374)  
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

### Feature 023: Character Edit Form

**Previously**: F021 (renumbered)  
**Depends on**: Feature 021
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

### Feature 024: Character Templates

**Previously**: F022 (renumbered)  
**Depends on**: Feature 018  
**Duration**: Day 1  
**GitHub Issue**: [#376](https://github.com/dougis-org/dnd-tracker/issues/376)  
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

### Feature 025: Monster Read Operations

**Previously**: F023 Monster Model & API (decomposed)  
**Depends on**: Feature 014  
**Duration**: Day 1  
**GitHub Issue**: [#377](https://github.com/dougis-org/dnd-tracker/issues/377)  
**Deliverables**:

- Monster Mongoose model
- Monster list API (GET)
- Monster detail API (GET)
- CR calculation
- Tests: Read operations

**API Routes**:

- `GET /api/v1/monsters`
- `GET /api/v1/monsters/:id`

**Acceptance Criteria**:

- [ ] Monster model defined
- [ ] List returns user's monsters
- [ ] CR calculates correctly
- [ ] Special abilities in schema

---

### Feature 026: Monster Write Operations

**Decomposed from**: F023 Monster Model & API  
**Depends on**: Feature 025  
**Duration**: Day 1  
**GitHub Issue**: [#428](https://github.com/dougis-org/dnd-tracker/issues/428)  
**Deliverables**:

- Monster creation API (POST)
- Monster update API (PUT)
- Monster delete API (DELETE)
- Tests: Write operations

**API Routes**:

- `POST /api/v1/monsters`
- `PUT /api/v1/monsters/:id`
- `DELETE /api/v1/monsters/:id`

**Acceptance Criteria**:

- [ ] Can create monsters
- [ ] Updates save correctly
- [ ] Delete removes monster

---

### Feature 027: Monster Validation & SRD Integration

**Decomposed from**: F023 Monster Model & API  
**Depends on**: Feature 025, Feature 026  
**Duration**: Day 1  
**GitHub Issue**: [#429](https://github.com/dougis-org/dnd-tracker/issues/429)  
**Deliverables**:

- Comprehensive validation rules
- CR validation
- SRD monster import
- Legendary/lair action validation
- Tests: Validation, SRD import

**Acceptance Criteria**:

- [ ] CR validation enforced
- [ ] Can import SRD monsters
- [ ] Legendary actions validated
- [ ] Clear error messages

---

### Feature 028: Monster List Page Integration

**Previously**: F024 (renumbered)  
**Depends on**: Feature 007, Feature 025
**Duration**: Day 1
**Deliverables**:

- Connect monster list to API
- CR filter functionality
- Type filter
- Search by name
- Tests: Monster list integration

**Acceptance Criteria**:

- [ ] List shows monsters
- [ ] Filters work (CR, type)
- [ ] Search functions

---

### Feature 029: Monster Creation/Edit Forms

**Previously**: F025 (renumbered)  
**Depends on**: Feature 028  
**Duration**: Day 1  
**GitHub Issue**: [#379](https://github.com/dougis-org/dnd-tracker/issues/379)  
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

### Feature 030: Item Model & API

**Previously**: F026 (renumbered)  
**Depends on**: Feature 014  
**Duration**: Day 1  
**GitHub Issue**: [#380](https://github.com/dougis-org/dnd-tracker/issues/380)  
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

### Feature 031: Item Management Pages

**Previously**: F027 (renumbered)  
**Depends on**: Feature 011, Feature 030  
**Duration**: Day 1  
**GitHub Issue**: [#381](https://github.com/dougis-org/dnd-tracker/issues/381)  
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

### Feature 032: Party Model & Read Operations

**Previously**: F028 Party Model & API (decomposed)  
**Depends on**: Feature 014, Feature 018  
**Duration**: Day 1  
**GitHub Issue**: [#382](https://github.com/dougis-org/dnd-tracker/issues/382)  
**Deliverables**:

- Party Mongoose model
- Party list API (GET)
- Party detail API (GET)
- Tests: Read operations

**API Routes**:

- `GET /api/v1/parties`
- `GET /api/v1/parties/:id`

**Acceptance Criteria**:

- [ ] Party model defined
- [ ] List returns user's parties
- [ ] Member associations work

---

### Feature 033: Party Management Operations

**Decomposed from**: F028 Party Model & API  
**Depends on**: Feature 032  
**Duration**: Day 1  
**GitHub Issue**: [#430](https://github.com/dougis-org/dnd-tracker/issues/430)  
**Deliverables**:

- Party creation/update/delete APIs
- Member management APIs
- Member limit enforcement
- Tests: Write operations

**API Routes**:

- `POST /api/v1/parties`
- `PUT /api/v1/parties/:id`
- `DELETE /api/v1/parties/:id`
- `POST /api/v1/parties/:id/members`
- `DELETE /api/v1/parties/:id/members/:characterId`

**Acceptance Criteria**:

- [ ] Party CRUD works
- [ ] Can add/remove members
- [ ] Member limit enforced

---

### Feature 034: Party Management Integration

**Previously**: F029 (renumbered)  
**Depends on**: Feature 006, Feature 032  
**Duration**: Day 1  
**GitHub Issue**: [#383](https://github.com/dougis-org/dnd-tracker/issues/383)  
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

## Phase 4: Offline Foundations (Week 5)

**Parent Issue**: [#338](https://github.com/dougis-org/dnd-tracker/issues/338)  
**Milestone**: [Phase 4: Offline Foundations](https://github.com/dougis-org/dnd-tracker/milestone/4)  
**PRD Alignment**: §§4.6, 6.1, 8.3 (Data Persistence & Offline Experience)

> **Note**: Features F035-F039 represent offline-first architecture. See issue descriptions for decomposition details.

### ✅ Feature 035: Service Worker Setup

**Status**: Complete ✅ (Merged via PR #458)
**Completed**: 2025-11-18
**Branch**: feature/035-service-worker-setup
**Spec Location**: specs/035-service-worker-setup/

**Previously**: F030 (renumbered)  
**Depends on**: Feature 001
**Duration**: Day 1
**Deliverables** (All Complete):

- ✅ Service worker registration with `registerServiceWorker()` function
- ✅ App shell precaching (`public/sw.js`) with cache-first strategy for static assets
- ✅ Runtime caching strategies: network-first for APIs, cache fallback for dynamic content
- ✅ Offline detection with `OfflineBanner` component
- ✅ Online/offline indicator with network event listeners
- ✅ Comprehensive test suite: 1038 tests passing
- ✅ Service worker lifecycle events (install, activate, fetch, message)
- ✅ Cache management with version naming and old cache cleanup
- ✅ Encryption support for sensitive offline data
- ✅ Offline queue integration for synced operations

**Implementation Details**:

- **`src/lib/sw/register.ts`**: Service worker registration with lifecycle callbacks, periodic update checks, state tracking
- **`src/lib/sw/strategies.ts`**: Cache strategies (cache-first, network-first, network-with-fallback) with intelligent routing
- **`src/components/OfflineBanner/OfflineBanner.tsx`**: Network status indicator with async setup
- **`public/sw.js`**: Service worker entry point with precaching manifest, cache versioning, request routing
- **Types**: `ServiceWorkerCallbacks`, `ServiceWorkerState` interfaces for type safety
- **Error Handling**: Graceful fallbacks for unsupported browsers, promise-based async handling

**Test Coverage**:

- All 1038 tests passing (no failures)
- 100+ unit tests for SW registration and strategies
- Integration tests for offline/online transitions
- E2E tests for SW lifecycle and cache behavior
- Builder: Exit code 0 (Turbopack compiled successfully)
- Linting: Exit code 0 (ESLint clean)

**Acceptance Criteria** (All Met):

- ✅ Service worker registers in supported browsers
- ✅ Caching strategy validates against `docs/Tech-Stack.md`
- ✅ Offline state detection surfaces UI banner
- ✅ App shell precached on install
- ✅ Runtime caching applied for assets and APIs
- ✅ Old caches cleaned on activation
- ✅ Clients claim on activation for immediate control
- ✅ TypeScript strict mode clean
- ✅ Build succeeds
- ✅ All tests passing

---

### Feature 036: IndexedDB Setup

**Previously**: F031 (renumbered)  
**Depends on**: Feature 035  
**Duration**: Day 1  
**GitHub Issue**: [#385](https://github.com/dougis-org/dnd-tracker/issues/385)  
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

### Feature 037: Offline Combat with Local Storage

**Previously**: F032 Offline Combat (decomposed)  
**Depends on**: Feature 036, Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#386](https://github.com/dougis-org/dnd-tracker/issues/386)  
**Deliverables**:

- Local combat storage
- Offline combat creation
- Local state management
- Tests: Offline combat

**Acceptance Criteria**:

- [ ] Combat experiences operate offline end-to-end
- [ ] Local state persists across refresh
- [ ] Works without network connection

---

### Feature 038: Sync Queue & Conflict Detection

**Decomposed from**: F032 Offline Combat  
**Depends on**: Feature 037  
**Duration**: Day 1  
**GitHub Issue**: [#432](https://github.com/dougis-org/dnd-tracker/issues/432)  
**Deliverables**:

- Sync queue implementation
- Conflict detection logic
- Merge strategies
- Tests: Sync and conflicts

**Acceptance Criteria**:

- [ ] Sync queue records pending operations
- [ ] Conflict detection identifies issues
- [ ] Merge strategies handle conflicts

---

### Feature 039: Background Sync

**Previously**: F033 (renumbered)  
**Depends on**: Feature 037  
**Duration**: Day 1  
**GitHub Issue**: [#387](https://github.com/dougis-org/dnd-tracker/issues/387)  
**Deliverables**:

- Sync mechanism
- Automatic sync when online
- Sync status UI
- Error handling
- Tests: Sync system

**Acceptance Criteria**:

- [ ] Online reconciliation merges queued changes
- [ ] Automatic sync when connection restored
- [ ] Sync status indicator visible to users

---

**Governance Checkpoint (AI Agent)**: Validate offline readiness against `docs/Product-Requirements.md §4.6` and ensure roadmap, PRD, and `docs/Tech-Stack.md` remain synchronized.

## Phase 5: Combat Engine Core (Week 5-6)

**Parent Issue**: [#339](https://github.com/dougis-org/dnd-tracker/issues/339)  
**Milestone**: [Phase 5: Combat Engine Core](https://github.com/dougis-org/dnd-tracker/milestone/5)  
**PRD Alignment**: §§4.3-4.5 (Encounter Builder & Combat Tracker foundations)

> **Note**: Features F040-F055 include decomposed encounter, combat session, initiative, HP, and status effect systems.

### Feature 040: Encounter Model & Read Operations

**Previously**: F034 Encounter Model & API (decomposed)  
**Depends on**: Feature 014, Feature 032, Feature 025  
**Duration**: Day 1  
**GitHub Issue**: [#388](https://github.com/dougis-org/dnd-tracker/issues/388)  
**Deliverables**:

- Encounter Mongoose model
- Encounter list API (GET)
- Encounter detail API (GET)
- Participant associations
- Tests: Read operations

**API Routes**:

- `GET /api/v1/encounters`
- `GET /api/v1/encounters/:id`

**Acceptance Criteria**:

- [ ] Encounter model defined
- [ ] List returns user's encounters
- [ ] CR calculation logic present

---

### Feature 041: Encounter Write Operations

**Decomposed from**: F034 Encounter Model & API  
**Depends on**: Feature 040  
**Duration**: Day 1  
**GitHub Issue**: [#433](https://github.com/dougis-org/dnd-tracker/issues/433)  
**Deliverables**:

- Encounter creation API (POST)
- Encounter update API (PUT)
- Encounter delete API (DELETE)
- Participant management
- Tests: Write operations

**API Routes**:

- `POST /api/v1/encounters`
- `PUT /api/v1/encounters/:id`
- `DELETE /api/v1/encounters/:id`
- `POST /api/v1/encounters/:id/participants`

**Acceptance Criteria**:

- [ ] Can create encounters
- [ ] Can add participants
- [ ] Updates save correctly

---

### Feature 042: Encounter Templates & Presets

**Decomposed from**: F034 Encounter Model & API  
**Depends on**: Feature 040  
**Duration**: Day 1  
**GitHub Issue**: [#435](https://github.com/dougis-org/dnd-tracker/issues/435)  
**Deliverables**:

- Template system
- CR-based presets
- Lair action templates
- Quick encounter generation
- Tests: Templates

**Acceptance Criteria**:

- [ ] Can save encounters as templates
- [ ] CR-based presets available
- [ ] Quick generation works

---

### Feature 043: Encounter Builder Integration

**Previously**: F035 (renumbered)  
**Depends on**: Feature 008, Feature 040  
**Duration**: Day 1  
**GitHub Issue**: [#389](https://github.com/dougis-org/dnd-tracker/issues/389)  
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

### Feature 044: Combat Session Model & State

**Previously**: F036 Combat Session Model (decomposed)  
**Depends on**: Feature 040  
**Duration**: Day 1  
**GitHub Issue**: [#390](https://github.com/dougis-org/dnd-tracker/issues/390)  
**Deliverables**:

- CombatSession model
- Session creation from encounter
- Participant state tracking
- Round/turn tracking
- State machine logic
- Tests: Session model

**API Routes**:

- `POST /api/v1/combat/sessions`
- `GET /api/v1/combat/sessions/:id`
- `PUT /api/v1/combat/sessions/:id/state`

**Acceptance Criteria**:

- [ ] Can start combat from encounter
- [ ] Session state persists
- [ ] Round/turn tracking works

---

### Feature 045: Combat Session Persistence

**Decomposed from**: F036 Combat Session Model  
**Depends on**: Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#436](https://github.com/dougis-org/dnd-tracker/issues/436)  
**Deliverables**:

- Save/load combat sessions
- Session snapshots
- Auto-save functionality
- Tests: Persistence

**Acceptance Criteria**:

- [ ] Sessions save automatically
- [ ] Can load saved sessions
- [ ] Snapshots capture full state

---

### Feature 046: Initiative Calculation & Ordering

**Previously**: F037 Initiative System (decomposed)  
**Depends on**: Feature 044
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

### Feature 047: Initiative Modifiers & Effects

**Decomposed from**: F037 Initiative System  
**Depends on**: Feature 046  
**Duration**: Day 1  
**GitHub Issue**: [#437](https://github.com/dougis-org/dnd-tracker/issues/437)  
**Deliverables**:

- Advantage/disadvantage on initiative
- Initiative bonuses
- Surprise rounds
- Alert feat support
- Tests: Modifiers

**Acceptance Criteria**:

- [ ] Advantage/disadvantage works
- [ ] Bonuses apply correctly
- [ ] Surprise rounds handled

---

### Feature 048: Combat Tracker Basic Integration

**Previously**: F038 (renumbered)  
**Depends on**: Feature 009, Feature 046  
**Duration**: Day 1  
**GitHub Issue**: [#392](https://github.com/dougis-org/dnd-tracker/issues/392)  
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

### Feature 049: HP Model & Basic Tracking

**Previously**: F039 HP Tracking System (decomposed)  
**Depends on**: Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#393](https://github.com/dougis-org/dnd-tracker/issues/393)  
**Deliverables**:

- HP tracking model
- Apply damage API
- Apply healing API
- Temporary HP
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

### Feature 050: Damage Types & Resistances

**Decomposed from**: F039 HP Tracking System  
**Depends on**: Feature 049  
**Duration**: Day 1  
**GitHub Issue**: [#438](https://github.com/dougis-org/dnd-tracker/issues/438)  
**Deliverables**:

- Damage type selection
- Resistance/vulnerability/immunity logic
- Damage calculation with types
- Tests: Damage types

**Acceptance Criteria**:

- [ ] Damage types selectable
- [ ] Resistance halves damage
- [ ] Immunity prevents damage
- [ ] Vulnerability doubles damage

---

### Feature 051: HP Tracking UI Integration

**Previously**: F040 (renumbered)  
**Depends on**: Feature 048, Feature 049  
**Duration**: Day 1  
**GitHub Issue**: [#394](https://github.com/dougis-org/dnd-tracker/issues/394)  
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

### Feature 052: HP History & Undo

**Previously**: F041 (renumbered)  
**Depends on**: Feature 049  
**Duration**: Day 1  
**GitHub Issue**: [#395](https://github.com/dougis-org/dnd-tracker/issues/395)  
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

### Feature 053: Status Effects Model & Basic Effects

**Previously**: F042 Status Effects Model (decomposed)  
**Depends on**: Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#396](https://github.com/dougis-org/dnd-tracker/issues/396)  
**Deliverables**:

- StatusEffect definitions
- ActiveStatusEffect tracking
- Duration management
- Effect expiration
- Basic conditions (blinded, prone, etc.)
- Tests: Status model

**Data**:

- Core D&D 5e conditions
- Duration types
- Effect descriptions

**Acceptance Criteria**:

- [ ] Core effects defined
- [ ] Can apply effects
- [ ] Duration tracks correctly

---

### Feature 054: Complex Status Effects & Conditions

**Decomposed from**: F042 Status Effects Model  
**Depends on**: Feature 053  
**Duration**: Day 1  
**GitHub Issue**: [#439](https://github.com/dougis-org/dnd-tracker/issues/439)  
**Deliverables**:

- Advanced conditions (charmed, frightened, etc.)
- Concentration tracking
- Custom status effects
- Effect stacking rules
- Tests: Complex effects

**Acceptance Criteria**:

- [ ] Advanced conditions work
- [ ] Concentration tracked
- [ ] Custom effects supported
- [ ] Stacking rules enforced

---

### Feature 055: Status Effects UI

**Previously**: F043 (renumbered)  
**Depends on**: Feature 048, Feature 053  
**Duration**: Day 1  
**GitHub Issue**: [#397](https://github.com/dougis-org/dnd-tracker/issues/397)  
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

**Governance Checkpoint (AI Agent)**: Validate combat engine against `docs/Product-Requirements.md §§4.3-4.5` and ensure state management patterns are documented.

## Phase 6: Combat Polish & State (Week 7)

**Parent Issue**: [#340](https://github.com/dougis-org/dnd-tracker/issues/340)  
**Milestone**: [Phase 6: Combat Polish & State](https://github.com/dougis-org/dnd-tracker/milestone/6)  
**PRD Alignment**: §§4.5 (Combat Session Persistence & Logging)

> **Note**: Features F056-F061 include session management, lair actions, and logging with decomposed save/load and export features.

### Feature 056: Lair Actions System

**Previously**: F044 (renumbered)  
**Depends on**: Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#398](https://github.com/dougis-org/dnd-tracker/issues/398)  
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

### Feature 057: Save & Load Combat Sessions

**Previously**: F045 Combat Session Management (decomposed)  
**Depends on**: Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#399](https://github.com/dougis-org/dnd-tracker/issues/399)  
**Deliverables**:

- Save combat sessions
- Load saved sessions
- Auto-save functionality
- Session restoration
- Tests: Save/load

**API Routes**:

- `POST /api/v1/combat/sessions/:id/save`
- `GET /api/v1/combat/sessions/saved`
- `POST /api/v1/combat/sessions/:id/load`

**Acceptance Criteria**:

- [ ] Can save sessions
- [ ] Can load sessions
- [ ] Auto-save works
- [ ] Full state restored

---

### Feature 058: Combat Session History & Archive

**Decomposed from**: F045 Combat Session Management  
**Depends on**: Feature 057  
**Duration**: Day 1  
**GitHub Issue**: [#440](https://github.com/dougis-org/dnd-tracker/issues/440)  
**Deliverables**:

- Session history list
- Archive old sessions
- Session statistics
- Search/filter
- Tests: History management

**Acceptance Criteria**:

- [ ] History list displays
- [ ] Can archive sessions
- [ ] Statistics calculated
- [ ] Search/filter works

---

### Feature 059: Combat Event Logging

**Previously**: F046 Combat Log System (decomposed)  
**Depends on**: Feature 044  
**Duration**: Day 1  
**GitHub Issue**: [#400](https://github.com/dougis-org/dnd-tracker/issues/400)  
**Deliverables**:

- Action logging
- Event timestamps
- Log display panel
- Filter by type/actor
- Tests: Logging system

**Acceptance Criteria**:

- [ ] Actions log correctly
- [ ] Log displays in UI
- [ ] Filters work
- [ ] Timestamps accurate

---

### Feature 060: Log Export & Analysis

**Decomposed from**: F046 Combat Log System  
**Depends on**: Feature 059  
**Duration**: Day 1  
**GitHub Issue**: [#441](https://github.com/dougis-org/dnd-tracker/issues/441)  
**Deliverables**:

- Export log (CSV, JSON, Markdown)
- Basic analytics
- Damage/healing totals
- Tests: Export/analysis

**Acceptance Criteria**:

- [ ] Can export logs
- [ ] Multiple formats supported
- [ ] Analytics calculated
- [ ] Reports generated

---

**Governance Checkpoint (AI Agent)**: Confirm combat persistence meets `docs/Product-Requirements.md §4.5` and logging capabilities support future analytics features.

## Phase 7: Monetization (Week 8)

**Parent Issue**: [#341](https://github.com/dougis-org/dnd-tracker/issues/341)  
**Milestone**: [Phase 7: Monetization](https://github.com/dougis-org/dnd-tracker/milestone/7)  
**PRD Alignment**: §§6.2-6.3 (Subscription Tiers & Payment Integration)

> **Note**: Features F061-F069 include tier enforcement, data portability, and Stripe integration with decomposed webhook handling.

### Feature 061: Tier Limit Enforcement

**Previously**: F047 (renumbered)

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

### Feature 062: Data Export System

**Previously**: F048 (renumbered)  
**Depends on**: Feature 018, Feature 040, Feature 059  
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

### Feature 063: Data Import System

**Previously**: F049 (renumbered)  
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

### Feature 064: Stripe Account Setup & Integration

**Previously**: F050 Stripe Setup & Webhooks (decomposed)  
**Depends on**: Feature 014  
**Duration**: Day 1  
**GitHub Issue**: [#401](https://github.com/dougis-org/dnd-tracker/issues/401)  
**Deliverables**:

- Stripe integration
- Customer creation
- Product/price setup
- Tests: Stripe integration

**API Routes**:

- `POST /api/v1/billing/create-customer`
- `GET /api/v1/billing/products`

**Acceptance Criteria**:

- [ ] Stripe connected
- [ ] Customers created
- [ ] Products configured

---

### Feature 065: Webhook Handling & Events

**Decomposed from**: F050 Stripe Setup & Webhooks  
**Depends on**: Feature 064  
**Duration**: Day 1  
**GitHub Issue**: [#442](https://github.com/dougis-org/dnd-tracker/issues/442)  
**Deliverables**:

- Webhook endpoints
- Event handling
- Subscription status updates
- Tests: Webhook processing

**API Routes**:

- `POST /api/v1/webhooks/stripe`

**Acceptance Criteria**:

- [ ] Webhooks receive events
- [ ] Status updates process
- [ ] Events logged

---

### Feature 066: Subscription Checkout

**Previously**: F051 (renumbered)  
**Depends on**: Feature 064  
**Duration**: Day 1  
**GitHub Issue**: [#402](https://github.com/dougis-org/dnd-tracker/issues/402)  
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

### Feature 067: Subscription Management

**Previously**: F052 (renumbered)

**Depends on**: Feature 012, Feature 066  
**Duration**: Day 1  
**GitHub Issue**: [#403](https://github.com/dougis-org/dnd-tracker/issues/403)  
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

### Feature 068: Billing Portal

**Previously**: F053 (renumbered)  
**Depends on**: Feature 064  
**Duration**: Day 1  
**GitHub Issue**: [#404](https://github.com/dougis-org/dnd-tracker/issues/404)  
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

### Feature 069: Free Trial System

**Previously**: F054 (renumbered)  
**Depends on**: Feature 066  
**Duration**: Day 1  
**GitHub Issue**: [#405](https://github.com/dougis-org/dnd-tracker/issues/405)  
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

**Governance Checkpoint (AI Agent)**: Run security and compliance checks on billing endpoints and record results. Ensure `docs/Tech-Stack.md` documents any third-party account configuration and webhook verification steps.

## Phase 8: Advanced Capabilities (Week 9-10)

**Parent Issue**: [#342](https://github.com/dougis-org/dnd-tracker/issues/342)  
**Milestone**: [Phase 8: Advanced Capabilities](https://github.com/dougis-org/dnd-tracker/milestone/8)  
**PRD Alignment**: §§3.3, 5.3, 12 (Premium Expansion & Future Enhancements)

### Feature 070: Character Sharing

**Previously**: F055 (renumbered)  
**Depends on**: Feature 018  
**GitHub Issue**: [#407](https://github.com/dougis-org/dnd-tracker/issues/407)  
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

### Feature 071: Advanced Combat Logging (Paid)

**Previously**: F056 (renumbered)  
**Depends on**: Feature 061, Feature 064  
**GitHub Issue**: [#408](https://github.com/dougis-org/dnd-tracker/issues/408)  
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

### Feature 072: Custom Themes (Paid)

**Previously**: F057 (renumbered)  
**Depends on**: Feature 001, Feature 064  
**GitHub Issue**: [#409](https://github.com/dougis-org/dnd-tracker/issues/409)  
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

### Feature 073: Collaborative Mode (Paid)

**Previously**: F058 (renumbered)  
**Depends on**: Feature 051, Feature 064  
**GitHub Issue**: [#410](https://github.com/dougis-org/dnd-tracker/issues/410)  
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

### Feature 074: Performance Optimization

**Previously**: F059 (renumbered)  
**Depends on**: All previous features  
**GitHub Issue**: [#411](https://github.com/dougis-org/dnd-tracker/issues/411)  
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

### Feature 075: Polish & Launch Prep

**Previously**: F060 (renumbered)  
**Depends on**: All previous features  
**GitHub Issue**: [#412](https://github.com/dougis-org/dnd-tracker/issues/412)  
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

**Total Features**: 75
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
