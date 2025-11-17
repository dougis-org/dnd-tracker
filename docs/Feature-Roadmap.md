# D&D Tracker - Agile Feature Roadmap (1-2 Day Features)

**Product**: D&D Encounter Tracker Web App
**Version**: 2.0 - Agile Incremental Approach
**Last Updated**: 2025-11-12
**Status**: In Development

This roadmap is the authoritative plan for delivery cadence and milestones. Scope and expectations remain sourced from `docs/Product-Requirements.md`, while technology selections follow `docs/Tech-Stack.md`.

> **Core Principle**: Each feature is a discrete, deployable unit of work that can be completed in 1-2 days. Every feature includes TDD with unit, integration, and E2E tests.

## Progress Tracking

**Current Progress**: 12 of 75 features complete (16.0%) - Week 1 of 10  
**Phase 1 Status**: Complete ✅ (12 of 12 features complete)  
**Phase 2 Status**: In Progress (2 of 5 features complete)  
**Next Feature**: Feature 013 - Clerk Integration & Auth Flow  
**Started**: 2025-11-01  
**Latest Completion**: Feature 012 (2025-11-14 via PR #450)

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
- **Phase 2 (Authentication)**: 2/5 complete
  - ✅ F004: Dashboard Page (Merged via PR #413 on 2025-11-07)
  - ✅ F005: Character Management Pages (Merged via PR #414 on 2025-11-08)
- **Phase 3 (Entity Management)**: 0/17 complete
- **Phase 4 (Offline)**: 0/5 complete
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
- Phase 8: Advanced Capabilities (Week 9-10) — [Issue #342](https://github.com/dougis-org/dnd-tracker/milestone/8)
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
| F013 | Clerk Integration & Auth Flow | In Progress | F001, F002, F012 | [#367](https://github.com/dougis-org/dnd-tracker/issues/367) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F014 | MongoDB User Model & Webhook | Planned | F013 | [#368](https://github.com/dougis-org/dnd-tracker/issues/368) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F015 | Profile Setup Wizard | Planned | F014 | [#369](https://github.com/dougis-org/dnd-tracker/issues/369) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F016 | User Dashboard with Real Data | Planned | F004, F014 | [#370](https://github.com/dougis-org/dnd-tracker/issues/370) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F017 | Profile Page Functionality | Planned | F010, F014 | [#371](https://github.com/dougis-org/dnd-tracker/issues/371) | [Phase 2](https://github.com/dougis-org/dnd-tracker/milestone/2) |
| F018 | Character Read Operations | Planned | F014 | [#372](https://github.com/dougis-org/dnd-tracker/issues/372) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F019 | Character Write Operations | Planned | F018 | [#426](https://github.com/dougis-org/dnd-tracker/issues/426) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F020 | Character Validation & Business Rules | Planned | F018, F019 | [#427](https://github.com/dougis-org/dnd-tracker/issues/427) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F021 | Character List Page Integration | Planned | F005, F018 | [#373](https://github.com/dougis-org/dnd-tracker/issues/373) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F022 | Character Creation Form | Planned | F021 | [#374](https://github.com/dougis-org/dnd-tracker/issues/374) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F023 | Character Edit Form | Planned | F021 | [#375](https://github.com/dougis-org/dnd-tracker/issues/375) | [Phase 3](https://github.com.dougis-org/dnd-tracker/milestone/3) |
| F024 | Character Templates | Planned | F018 | [#376](https://github.com/dougis-org/dnd-tracker/issues/376) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F025 | Monster Read Operations | Planned | F014 | [#377](https://github.com/dougis-org/dnd-tracker/issues/377) | [Phase 3](https://github.com/dougis-org/dnd-tracker/milestone/3) |
| F026 | Monster Write Operations | Planned | F025 | [#428](https://github.com/dougis-org/dnd-tracker/issues/428) | [Phase 3](https://github.com.dougis-org/dnd-tracker/milestone/3) |
| F027 | Monster Validation & SRD Integration | Planned | F025, F026 | [#429](https://github.com.dougis-org.dnd-tracker/issues/429) | [Phase 3](https://github.com.dougis-org/dnd-tracker/milestone/3) |
... more lines ...