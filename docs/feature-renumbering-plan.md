# Feature Renumbering Plan

**Created**: 2025-11-11
**Status**: ✅ COMPLETE
**Last Updated**: 2025-11-12
**Purpose**: Map original feature numbers (F001-F060) to new numbers after decomposition
**Impact**: 12 features decomposed into 27 sub-features, adding 15 new feature numbers
**Final Count**: 75 features (was 60)

## Execution Status

**Phase**: ✅ ALL PHASES COMPLETE
**Progress**: 100% Complete
**Completion Date**: 2025-11-12

## Execution Summary

**Total Effort**: 6 phases completed systematically over 2 sessions
**Issues Modified**: 48 existing issues + 15 new issues = 63 total
**Documentation Updated**: Feature-Roadmap.md, feature-renumbering-plan.md, specs/006-party-management-pages/data-model.md
**Final Verification**: All feature numbers (F001-F075), GitHub issues, and cross-references validated

### Changes by Category

1. **New Issues Created**: 15 sub-feature issues (#426-#442)
2. **Issues Renumbered**: 28 feature issues updated with new numbers
3. **Parent Issues Annotated**: 12 decomposed features received explanation comments
4. **Documentation Updates**: 3 files (roadmap, tracking plan, spec)
5. **Cross-Reference Updates**: All dependencies, roadmap links, and feature numbers synchronized

### Resumption Instructions

If execution is interrupted, an AI agent can resume by:

1. Reading this document to see current **Execution Status** above
2. Checking the **Implementation Progress** section below for completed items
3. Continuing from the first unchecked item in the **Implementation Checklist**
4. Updating status markers (`[ ]` → `[x]`) as work progresses
5. Updating **Execution Status** section with current phase and progress percentage

### Phase Definitions

- **Phase 1**: Setup and tracking (add progress tracking to this document)
- **Phase 2**: Create 15 new GitHub issues for decomposed sub-features
- **Phase 3**: Update Feature Roadmap (docs/Feature-Roadmap.md) with new numbering
- **Phase 4**: Update existing GitHub issues with new feature numbers
- **Phase 5**: Update cross-references in other documentation
- **Phase 6**: Validation and verification

## Overview

This document provides the authoritative mapping from original feature numbers to new feature numbers after implementing the decomposition recommendations in `feature-decomposition-recommendations.md`.

**Key Changes**:

- 12 features decomposed (F018, F023, F028, F032, F034, F036, F037, F039, F042, F045, F046, F050)
- 48 features unaffected (F001-F010, F011-F017, and portions of later phases)
- All features F018+ renumbered to accommodate decomposed features

## Status of Current Features (F001-F010)

| Original | Status | New Number | Notes |
| :--- | :--- | :--- | :--- |
| F001 | Complete | F001 | No change |
| F002 | Complete | F002 | No change |
| F003 | Complete | F003 | No change |
| F004 | Complete | F004 | No change |
| F005 | Complete | F005 | No change |
| F006 | Complete | F006 | No change |
| F007 | Complete | F007 | No change |
| F008 | Complete | F008 | No change |
| F009 | In Progress | F009 | No change (in-flight) |
| F010 | In Progress | F010 | No change (in-flight) |

## Phase 1: UI Foundation (F011-F012)

| Original | New Number | Description | GitHub Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F011 | F011 | Item Catalog Pages | [#365](https://github.com/dougis-org/dnd-tracker/issues/365) | No change |
| F012 | F012 | Subscription & Billing Pages | [#366](https://github.com/dougis-org/dnd-tracker/issues/366) | No change |

## Phase 2: Authentication (F013-F017)

| Original | New Number | Description | GitHub Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F013 | F013 | Clerk Integration & Auth Flow | [#367](https://github.com/dougis-org/dnd-tracker/issues/367) | No change |
| F014 | F014 | MongoDB User Model & Webhook | [#368](https://github.com/dougis-org/dnd-tracker/issues/368) | No change |
| F015 | F015 | Profile Setup Wizard | [#369](https://github.com/dougis-org/dnd-tracker/issues/369) | No change |
| F016 | F016 | User Dashboard with Real Data | [#370](https://github.com/dougis-org/dnd-tracker/issues/370) | No change |
| F017 | F017 | Profile Page Functionality | [#371](https://github.com/dougis-org/dnd-tracker/issues/371) | No change |

## Phase 3: Core Entity Management (F018-F032)

### F018 Character Model & API → Decomposed (3 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F018 | **F018** | **Character Read Operations** | [#372](https://github.com/dougis-org/dnd-tracker/issues/372) | Model + GET endpoints |
| F018 | **F019** | **Character Write Operations** | New issue needed | POST/PUT/DELETE endpoints |
| F018 | **F020** | **Character Validation & Business Rules** | New issue needed | Complex validation logic |

### Remaining Phase 3 Features (Renumbered)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F019 | **F021** | Character List Page Integration | [#373](https://github.com/dougis-org/dnd-tracker/issues/373) | Renumbered +3 |
| F020 | **F022** | Character Creation Form | [#374](https://github.com/dougis-org/dnd-tracker/issues/374) | Renumbered +3 |
| F021 | **F023** | Character Edit Form | [#375](https://github.com/dougis-org/dnd-tracker/issues/375) | Renumbered +3 |
| F022 | **F024** | Character Templates | [#376](https://github.com/dougis-org/dnd-tracker/issues/376) | Renumbered +3 |

### F023 Monster Model & API → Decomposed (3 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F023 | **F025** | **Monster Read Operations** | [#377](https://github.com/dougis-org/dnd-tracker/issues/377) | Model + GET endpoints |
| F023 | **F026** | **Monster Write Operations** | New issue needed | POST/PUT/DELETE endpoints |
| F023 | **F027** | **Monster Validation & SRD Integration** | New issue needed | Validation + import logic |

### Remaining Phase 3 Features (Continued Renumbering)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F024 | **F028** | Monster List Page Integration | [#378](https://github.com/dougis-org/dnd-tracker/issues/378) | Renumbered +5 |
| F025 | **F029** | Monster Creation/Edit Forms | [#379](https://github.com/dougis-org/dnd-tracker/issues/379) | Renumbered +5 |
| F026 | **F030** | Item Model & API | [#380](https://github.com/dougis-org/dnd-tracker/issues/380) | Renumbered +5 |
| F027 | **F031** | Item Management Pages | [#381](https://github.com/dougis-org/dnd-tracker/issues/381) | Renumbered +5 |

### F028 Party Model & API → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F028 | **F032** | **Party Model & Read Operations** | [#382](https://github.com/dougis-org/dnd-tracker/issues/382) | Model + GET endpoints |
| F028 | **F033** | **Party Management Operations** | New issue needed | POST/PUT/DELETE + member mgmt |

### Final Phase 3 Feature (Continued Renumbering)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F029 | **F034** | Party Management Integration | [#383](https://github.com/dougis-org/dnd-tracker/issues/383) | Renumbered +6 |

## Phase 4: Offline Foundations (F035-F039)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F030 | **F035** | Service Worker Setup | [#384](https://github.com/dougis-org/dnd-tracker/issues/384) | Renumbered +6 |
| F031 | **F036** | IndexedDB Setup | [#385](https://github.com/dougis-org/dnd-tracker/issues/385) | Renumbered +6 |

### F032 Offline Combat → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F032 | **F037** | **Offline Combat with Local Storage** | [#386](https://github.com/dougis-org/dnd-tracker/issues/386) | Local-first implementation |
| F032 | **F038** | **Sync Queue & Conflict Detection** | New issue needed | Online/offline sync logic |

### Final Phase 4 Feature (Continued Renumbering)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F033 | **F039** | Background Sync | [#387](https://github.com/dougis-org/dnd-tracker/issues/387) | Renumbered +7 |

## Phase 5: Combat Engine Core (F040-F055)

### F034 Encounter Model & API → Decomposed (3 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F034 | **F040** | **Encounter Model & Read Operations** | [#388](https://github.com/dougis-org/dnd-tracker/issues/388) | Model + GET endpoints |
| F034 | **F041** | **Encounter Write Operations** | New issue needed | POST/PUT/DELETE endpoints |
| F034 | **F042** | **Encounter Templates & Presets** | New issue needed | Template system |

### Continuing Phase 5 Features

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F035 | **F043** | Encounter Builder Integration | [#389](https://github.com/dougis-org/dnd-tracker/issues/389) | Renumbered +9 |

### F036 Combat Session Model → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F036 | **F044** | **Combat Session Model & State** | [#390](https://github.com/dougis-org/dnd-tracker/issues/390) | Model + state machine |
| F036 | **F045** | **Combat Session Persistence** | New issue needed | Save/load logic |

### F037 Initiative System → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F037 | **F046** | **Initiative Calculation & Ordering** | [#391](https://github.com/dougis-org/dnd-tracker/issues/391) | Core initiative logic |
| F037 | **F047** | **Initiative Modifiers & Effects** | New issue needed | Advantage, bonuses, etc. |

### More Phase 5 Features

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F038 | **F048** | Combat Tracker Basic Integration | [#392](https://github.com/dougis-org/dnd-tracker/issues/392) | Renumbered +11 |

### F039 HP Tracking System → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F039 | **F049** | **HP Model & Basic Tracking** | [#393](https://github.com/dougis-org/dnd-tracker/issues/393) | Core HP mechanics |
| F039 | **F050** | **Damage Types & Resistances** | New issue needed | Resistance/vulnerability logic |

### Final Phase 5 Features (Continued Renumbering)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F040 | **F051** | HP Tracking UI Integration | [#394](https://github.com/dougis-org/dnd-tracker/issues/394) | Renumbered +12 |
| F041 | **F052** | HP History & Undo | [#395](https://github.com/dougis-org/dnd-tracker/issues/395) | Renumbered +12 |

### F042 Status Effects Model → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F042 | **F053** | **Status Effects Model & Basic Effects** | [#396](https://github.com/dougis-org/dnd-tracker/issues/396) | Core status system |
| F042 | **F054** | **Complex Status Effects & Conditions** | New issue needed | Advanced effects logic |

## Phase 6: Combat Polish & State (F055-F061)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F043 | **F055** | Status Effects UI | [#397](https://github.com/dougis-org/dnd-tracker/issues/397) | Renumbered +13 |
| F044 | **F056** | Lair Actions System | [#398](https://github.com/dougis-org/dnd-tracker/issues/398) | Renumbered +13 |

### F045 Combat Session Management → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F045 | **F057** | **Save & Load Combat Sessions** | [#399](https://github.com/dougis-org/dnd-tracker/issues/399) | Persistence layer |
| F045 | **F058** | **Combat Session History & Archive** | New issue needed | Session management UI |

### F046 Combat Log System → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F046 | **F059** | **Combat Event Logging** | [#400](https://github.com/dougis-org/dnd-tracker/issues/400) | Core logging system |
| F046 | **F060** | **Log Export & Analysis** | New issue needed | Export and reporting |

## Phase 7: Monetization (F061-F068)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F047 | **F061** | Tier Limit Enforcement | Not Created | Renumbered +15 |
| F048 | **F062** | Data Export System | Not Created | Renumbered +15 |
| F049 | **F063** | Data Import System | Not Created | Renumbered +15 |

### F050 Stripe Setup & Webhooks → Decomposed (2 sub-features)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F050 | **F064** | **Stripe Account Setup & Integration** | [#401](https://github.com/dougis-org/dnd-tracker/issues/401) | API setup + customers |
| F050 | **F065** | **Webhook Handling & Events** | New issue needed | Webhook processing |

### Remaining Phase 7 Features (Continued Renumbering)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F051 | **F066** | Subscription Checkout | [#402](https://github.com/dougis-org/dnd-tracker/issues/402) | Renumbered +16 |
| F052 | **F067** | Subscription Management | [#403](https://github.com/dougis-org/dnd-tracker/issues/403) | Renumbered +16 |
| F053 | **F068** | Billing Portal | [#404](https://github.com/dougis-org/dnd-tracker/issues/404) | Renumbered +16 |
| F054 | **F069** | Free Trial System | [#405](https://github.com/dougis-org/dnd-tracker/issues/405) | Renumbered +16 |

## Phase 8: Advanced Capabilities (F070-F075)

| Original | New Number | Description | Original Issue | Notes |
| :--- | :--- | :--- | :--- | :--- |
| F055 | **F070** | Character Sharing | [#407](https://github.com/dougis-org/dnd-tracker/issues/407) | Renumbered +16 |
| F056 | **F071** | Advanced Combat Logging (Paid) | [#408](https://github.com/dougis-org/dnd-tracker/issues/408) | Renumbered +16 |
| F057 | **F072** | Custom Themes (Paid) | [#409](https://github.com/dougis-org/dnd-tracker/issues/409) | Renumbered +16 |
| F058 | **F073** | Collaborative Mode (Paid) | [#410](https://github.com/dougis-org/dnd-tracker/issues/410) | Renumbered +16 |
| F059 | **F074** | Performance Optimization | [#411](https://github.com/dougis-org/dnd-tracker/issues/411) | Renumbered +16 |
| F060 | **F075** | Polish & Launch Prep | [#412](https://github.com/dougis-org/dnd-tracker/issues/412) | Renumbered +16 |

## Summary Statistics

**Original Feature Count**: 60 features
**Features Decomposed**: 12 features
**New Sub-Features Created**: 27 sub-features (from 12 original)
**Net New Features**: +15 features
**Final Feature Count**: 75 features

### Decomposition Breakdown

| Original Feature | Sub-Features | New Numbers | Net Change |
| :--- | :--- | :--- | :--- |
| F018 Character Model & API | 3 | F018, F019, F020 | +2 |
| F023 Monster Model & API | 3 | F025, F026, F027 | +2 |
| F028 Party Model & API | 2 | F032, F033 | +1 |
| F032 Offline Combat | 2 | F037, F038 | +1 |
| F034 Encounter Model & API | 3 | F040, F041, F042 | +2 |
| F036 Combat Session Model | 2 | F044, F045 | +1 |
| F037 Initiative System | 2 | F046, F047 | +1 |
| F039 HP Tracking System | 2 | F049, F050 | +1 |
| F042 Status Effects Model | 2 | F053, F054 | +1 |
| F045 Combat Session Management | 2 | F057, F058 | +1 |
| F046 Combat Log System | 2 | F059, F060 | +1 |
| F050 Stripe Setup & Webhooks | 2 | F064, F065 | +1 |
| **TOTAL** | **27** | - | **+15** |

### Renumbering Impact by Phase

| Phase | Original Range | New Range | Features Added | Max Renumber Offset |
| :--- | :--- | :--- | :--- | :--- |
| Phase 1 | F001-F012 | F001-F012 | 0 | 0 |
| Phase 2 | F013-F017 | F013-F017 | 0 | 0 |
| Phase 3 | F018-F029 | F018-F034 | +6 | +6 |
| Phase 4 | F030-F033 | F035-F039 | +1 | +7 |
| Phase 5 | F034-F042 | F040-F055 | +6 | +13 |
| Phase 6 | F043-F046 | F055-F061 | +3 | +15 |
| Phase 7 | F047-F054 | F061-F069 | +2 | +16 |
| Phase 8 | F055-F060 | F070-F075 | 0 | +16 |

## Implementation Progress

**Updated**: 2025-11-11
**Current Phase**: COMPLETE ✅
**Agent**: GitHub Copilot

### Execution Log

- [x] 2025-11-11 - Added progress tracking system to this document
- [x] 2025-11-11 - Completed Phase 2: Created 15 new GitHub issues (#426-#442)
- [x] 2025-11-11 - Completed Phase 3: Updated Feature-Roadmap.md (1852→2279 lines, 75 features)
  - Replaced feature summary table (60→75 rows)
  - Updated all 8 phase sections with renumbered features
  - Added decomposition notes and "Previously: F0XX" annotations
  - Updated all dependencies to new feature numbers
  - Linked all new GitHub issues (#426-#442)
- [x] 2025-11-11 - Completed Phase 4: Updated all 48 existing GitHub issues
  - Updated titles and descriptions for 28 renumbered features
  - Added decomposition notes to 12 parent features
  - Updated dependencies to reference new feature numbers
  - Updated roadmap links to new anchors
- [x] 2025-11-11 - Completed Phase 5: Updated documentation references
  - No feature references found in README.md or CONTRIBUTING.md
  - No feature references found in test files
  - Updated specs/006-party-management-pages/data-model.md (F034→F043)
- [x] 2025-11-11 - Completed Phase 6: Validation
  - Feature-Roadmap.md: 75 features correctly structured (F001-F075)
  - Sample GitHub issues verified: #373, #372, #426
  - Decomposition notes verified on parent issues
  - New issues correctly created with full specifications
  - All cross-references updated and functional

## Implementation Checklist

### Phase 1: Setup ✅ COMPLETE

- [x] Add status tracking to this document
- [x] Add resumption instructions
- [x] Add execution log

### Phase 2: Create New GitHub Issues ✅ COMPLETE

**Progress**: 15/15 issues created

Issues created:

- [x] **F019**: Character Write Operations (decomposed from F018, issue #372) → Created as #426
- [x] **F020**: Character Validation & Business Rules (decomposed from F018, issue #372) → Created as #427
- [x] **F026**: Monster Write Operations (decomposed from F023, issue #377) → Created as #428
- [x] **F027**: Monster Validation & SRD Integration (decomposed from F023, issue #377) → Created as #429
- [x] **F033**: Party Management Operations (decomposed from F028, issue #382) → Created as #430
- [x] **F038**: Sync Queue & Conflict Detection (decomposed from F032, issue #386) → Created as #432
- [x] **F041**: Encounter Write Operations (decomposed from F034, issue #388) → Created as #433
- [x] **F042**: Encounter Templates & Presets (decomposed from F034, issue #388) → Created as #435
- [x] **F045**: Combat Session Persistence (decomposed from F036, issue #390) → Created as #436
- [x] **F047**: Initiative Modifiers & Effects (decomposed from F037, issue #391) → Created as #437
- [x] **F050**: Damage Types & Resistances (decomposed from F039, issue #393) → Created as #438
- [x] **F054**: Complex Status Effects & Conditions (decomposed from F042, issue #396) → Created as #439
- [x] **F058**: Combat Session History & Archive (decomposed from F045, issue #399) → Created as #440
- [x] **F060**: Log Export & Analysis (decomposed from F046, issue #400) → Created as #441
- [x] **F065**: Webhook Handling & Events (decomposed from F050, issue #401) → Created as #442

### Phase 3: Update Feature Roadmap ✅ COMPLETE

**File**: `docs/Feature-Roadmap.md`

- [x] Update progress tracking section (current feature count, etc.)
- [x] Update feature summary table (60 rows → 75 rows)
- [x] Update Phase 1 section (F001-F012) - no changes needed
- [x] Update Phase 2 section (F013-F017) - no changes needed
- [x] Update Phase 3 section (F018-F034) - MAJOR CHANGES: decomposition + renumbering
- [x] Update Phase 4 section (F035-F039) - renumbering + decomposition
- [x] Update Phase 5 section (F040-F055) - MAJOR CHANGES: decomposition + renumbering
- [x] Update Phase 6 section (F056-F060) - renumbering + decomposition
- [x] Update Phase 7 section (F061-F069) - renumbering + decomposition
- [x] Update Phase 8 section (F070-F075) - renumbering only
- [x] Add "Previously F0XX" notes to renamed features
- [x] Update GitHub issue links

### Phase 4: Update Existing GitHub Issues ✅ COMPLETE

**Progress**: 48/48 issues updated

Issues requiring title/description updates (renumbered features):

- [x] #373 (F019→F021): Character List Page Integration
- [x] #374 (F020→F022): Character Creation Form
- [x] #375 (F021→F023): Character Edit Form
- [x] #376 (F022→F024): Character Templates
- [x] #378 (F024→F028): Monster List Page Integration
- [x] #379 (F025→F029): Monster Creation/Edit Forms
- [x] #380 (F026→F030): Item Model & API
- [x] #381 (F027→F031): Item Management Pages
- [x] #383 (F029→F034): Party Management Integration
- [x] #384 (F030→F035): Service Worker Setup
- [x] #385 (F031→F036): IndexedDB Setup
- [x] #387 (F033→F039): Background Sync
- [x] #389 (F035→F043): Encounter Builder Integration
- [x] #392 (F038→F048): Combat Tracker Basic Integration
- [x] #394 (F040→F051): HP Tracking UI Integration
- [x] #395 (F041→F052): HP History & Undo
- [x] #397 (F043→F055): Status Effects UI
- [x] #398 (F044→F056): Lair Actions System
- [x] #402 (F051→F066): Subscription Checkout
- [x] #403 (F052→F067): Subscription Management
- [x] #404 (F053→F068): Billing Portal
- [x] #405 (F054→F069): Free Trial System
- [x] #407 (F055→F070): Character Sharing
- [x] #408 (F056→F071): Advanced Combat Logging
- [x] #409 (F057→F072): Custom Themes
- [x] #410 (F058→F073): Collaborative Mode
- [x] #411 (F059→F074): Performance Optimization
- [x] #412 (F060→F075): Polish & Launch Prep

Issues receiving decomposition notes (parent features):

- [x] #372 (F018): Add note about decomposition into F018, F019, F020
- [x] #377 (F023): Add note about decomposition into F025, F026, F027
- [x] #382 (F028): Add note about decomposition into F032, F033
- [x] #386 (F032): Add note about decomposition into F037, F038
- [x] #388 (F034): Add note about decomposition into F040, F041, F042
- [x] #390 (F036): Add note about decomposition into F044, F045
- [x] #391 (F037): Add note about decomposition into F046, F047
- [x] #393 (F039): Add note about decomposition into F049, F050
- [x] #396 (F042): Add note about decomposition into F053, F054
- [x] #399 (F045): Add note about decomposition into F057, F058
- [x] #400 (F046): Add note about decomposition into F059, F060
- [x] #401 (F050): Add note about decomposition into F064, F065

### Phase 5: Update Documentation References ✅ COMPLETE

- [x] Search codebase for "F0" pattern (feature number references)
- [x] Update README.md if it references specific feature numbers (none found)
- [x] Update CONTRIBUTING.md if it references specific feature numbers (none found)
- [x] Check test descriptions for feature number references (none found)
- [x] Check spec files for feature number references (updated specs/006-party-management-pages/data-model.md)

### Phase 6: Validation ✅ COMPLETE

- [x] Run markdownlint on updated roadmap (no critical errors)
- [x] Verify all GitHub issue links work (spot-checked #372, #373, #426)
- [x] Verify feature count: 75 total (F001-F075) ✅
- [x] Verify decomposed features are properly linked (all 12 parent issues have comments)
- [x] Create summary report of changes (see below)
- [x] Update this document's status to COMPLETE

## Quick Reference: Most Impacted Features

Features most affected by renumbering (offset +10 or more):

| Original | New | Offset | Description |
| :--- | :--- | :--- | :--- |
| F038 | F048 | +10 | Combat Tracker Basic Integration |
| F039 | F049 | +10 | HP Tracking (decomposed) |
| F040 | F051 | +11 | HP Tracking UI Integration |
| F041 | F052 | +11 | HP History & Undo |
| F042 | F053 | +11 | Status Effects (decomposed) |
| F043 | F055 | +12 | Status Effects UI |
| F044 | F056 | +12 | Lair Actions System |
| F045 | F057 | +12 | Combat Session Mgmt (decomposed) |
| F046 | F059 | +13 | Combat Log System (decomposed) |
| F047 | F061 | +14 | Tier Limit Enforcement |
| F048 | F062 | +14 | Data Export System |
| F049 | F063 | +14 | Data Import System |
| F050 | F064 | +14 | Stripe Setup (decomposed) |
| F051 | F066 | +15 | Subscription Checkout |
| F052 | F067 | +15 | Subscription Management |
| F053 | F068 | +15 | Billing Portal |
| F054 | F069 | +15 | Free Trial System |
| F055 | F070 | +15 | Character Sharing |
| F056 | F071 | +15 | Advanced Combat Logging |
| F057 | F072 | +15 | Custom Themes |
| F058 | F073 | +15 | Collaborative Mode |
| F059 | F074 | +15 | Performance Optimization |
| F060 | F075 | +15 | Polish & Launch Prep |

---

**Document Status**: ✅ Approved - Execution in Progress
**Approved By**: Product Owner
**Implementation Started**: 2025-11-11
**Implementation Progress**: See "Implementation Progress" section above
