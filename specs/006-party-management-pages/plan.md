# Implementation Plan: Party Management Pages

**Branch**: `feature/006-party-management-pages` | **Date**: 2025-11-06 | **Spec**: `specs/006-party-management-pages/spec.md`
**Input**: Feature specification from `/specs/006-party-management-pages/spec.md`

**Maintainer**: @doug

**Note**: This plan follows the TDD execution model detailed in `/CONTRIBUTING.md` and custom execution instructions.

## Summary

Party Management Pages provides DMs with UI for viewing, creating, editing, and deleting parties - groups of adventurers for D&D campaigns. This feature delivers mock-data driven UI pages at `/parties`, `/parties/new`, `/parties/:id`, and `/parties/:id/edit` with full member management interfaces. Implementation uses Next.js App Router, shadcn/ui components, TypeScript, and comprehensive Jest/Playwright testing. All pages use mock data and show "Not Implemented" messages on form submissions until backend integration (F014+).

## Technical Context

**Language/Version**: TypeScript 5.9.2 with Next.js 16.0.1 / React 19.2.0  
**Primary Dependencies**: 
  - Frontend: React hooks, shadcn/ui components, Tailwind CSS 4.x
  - Testing: Jest 30.2.0+, Playwright 1.56.1+, @testing-library/react
  - Form handling: React Hook Form or uncontrolled form components (mock only)

**Storage**: Mock JSON data in memory during session (no persistence until F014 - MongoDB integration)  
**Testing**: Jest for unit/integration, Playwright for E2E critical flows  
**Target Platform**: Web application (Next.js)  
**Project Type**: Single web application (monorepo not applicable)  
**Performance Goals**: Page load <2s (development), form interactions <200ms response time  
**Constraints**: 
  - All pages must work without authentication until F013 (Clerk integration)
  - Mock data only - forms show "Not Implemented" message
  - Component files must be <450 lines, functions <50 lines
  - 80%+ test coverage on all touched code

**Scale/Scope**: 
  - 4 main pages: list, detail, create, edit
  - ~6 reusable components (PartyCard, PartyForm, MemberCard, RoleSelector, etc.)
  - ~15 total files (components, pages, tests, utilities)
  - Estimated complexity: Medium (component composition, conditional rendering, form state)

## Constitution Check

*GATE: Must pass before Phase 0 research*

Project follows `.specify/memory/constitution.md` requirements:
- ✅ Feature scope is discrete and deployable within 1-2 days (Day 1 from roadmap)
- ✅ Depends on completed features: F001 (Design System), F002 (Navigation)
- ✅ Follows Next.js App Router conventions (specified in Tech-Stack.md)
- ✅ Uses only approved tech stack: TypeScript, React 19, Tailwind CSS 4.x, shadcn/ui
- ✅ Includes comprehensive test strategy (Jest + Playwright)
- ✅ No premature optimization - focuses on correct implementation
- ✅ All code quality gates enforced: <450 line files, <50 line functions, 80%+ coverage, ESLint clean

### Post-ratification checklist

- [x] Confirm `.specify/memory/constitution.md` is referenced in the feature spec
- [ ] Run Codacy analysis on any edited files (per repo rules)
- [ ] Update templates if constitution wording changes

## Project Structure

### Documentation (this feature)

```text
specs/006-party-management-pages/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── party-list.contract.md
│   ├── party-detail.contract.md
│   ├── party-create.contract.md
│   ├── party-edit.contract.md
│   └── components.contract.md
└── tasks.md             # Phase 2 output (to be created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── parties/
│   │   ├── page.tsx                 # Party list page (/parties)
│   │   ├── [id]/
│   │   │   ├── page.tsx             # Party detail page (/parties/:id)
│   │   │   └── edit/
│   │   │       └── page.tsx         # Party edit page (/parties/:id/edit)
│   │   └── new/
│   │       └── page.tsx             # Party creation page (/parties/new)
│   └── layout.tsx                   # (existing)
│
├── components/
│   ├── parties/
│   │   ├── PartyCard.tsx            # Card component for party list
│   │   ├── PartyDetail.tsx          # Party detail view (reusable)
│   │   ├── PartyForm.tsx            # Form for create/edit (reusable)
│   │   ├── MemberCard.tsx           # Individual member display
│   │   ├── MemberForm.tsx           # Add/edit member in form
│   │   ├── RoleSelector.tsx         # Dropdown for member roles
│   │   ├── DeleteConfirmModal.tsx   # Confirmation dialog
│   │   └── PartyCompositionSummary.tsx # Stats display
│   └── (existing components)
│
├── lib/
│   ├── mockData/
│   │   └── parties.ts               # Mock party data
│   ├── utils/
│   │   └── partyHelpers.ts          # Party utility functions (calculations)
│   └── (existing utilities)
│
└── types/
    ├── party.ts                     # Party/Member/Role TypeScript types
    └── (existing types)

tests/
├── unit/
│   ├── components/
│   │   ├── PartyCard.test.tsx
│   │   ├── PartyDetail.test.tsx
│   │   ├── PartyForm.test.tsx
│   │   ├── MemberCard.test.tsx
│   │   ├── RoleSelector.test.tsx
│   │   └── DeleteConfirmModal.test.tsx
│   └── lib/
│       └── partyHelpers.test.ts
│
├── integration/
│   ├── parties/
│   │   ├── party-list.test.tsx      # Integration test for /parties page
│   │   ├── party-detail.test.tsx    # Integration test for /parties/:id page
│   │   ├── party-create.test.tsx    # Integration test for /parties/new page
│   │   └── party-edit.test.tsx      # Integration test for /parties/:id/edit page
│   └── (existing tests)
│
└── e2e/
    ├── party-management.spec.ts     # E2E tests for party workflows
    └── (existing tests)
```

**Structure Decision**: Single web application with monolithic structure. Party management pages follow Next.js App Router conventions with:
- Page components in `src/app/parties/`
- Reusable UI components in `src/components/parties/`
- Utility functions in `src/lib/`
- Type definitions in `src/types/`
- Tests mirror source structure: unit tests for components, integration tests for pages, E2E for user workflows

## Complexity Tracking

No constitution violations. All decisions justified by:
- **Single app structure**: Party feature is part of monolithic D&D Tracker (Tech-Stack.md), not separate microservice
- **No persistence layer**: Mock data only (backend integration is F014, deferred dependency)
- **Component composition**: Follows shadcn/ui and React best practices
- **Test coverage**: Aligns with project requirement for 80%+ coverage on touched code

---

## Phase 0: Research Outcomes

*To be completed during Phase 0 execution*

### Research Tasks to Execute

1. **Form Handling Pattern**: Research best practices for form state management in Next.js 16 with React 19
   - Determine: Controlled vs. uncontrolled components, React Hook Form vs. native form handling, validation library choice
   - Deliverable: Decision in research.md

2. **Modal/Dialog Implementation**: Research shadcn/ui Dialog component patterns for delete confirmation
   - Determine: Dialog component API, accessibility requirements, focus management
   - Deliverable: Implementation pattern in research.md

3. **Mock Data Architecture**: Research patterns for serving mock data in Next.js during development phase
   - Determine: In-memory data structures vs. JSON files, data factory patterns, type safety with mock data
   - Deliverable: Mock data structure in research.md

4. **Responsive Grid Layout**: Research Tailwind CSS 4.x grid patterns for adaptive 1-3 column layouts
   - Determine: Grid template patterns, breakpoints, gap sizing
   - Deliverable: Grid pattern examples in research.md

5. **Component Composition**: Research best practices for extracting shared member display logic
   - Determine: How to reuse MemberCard across detail, edit, and list contexts
   - Deliverable: Component composition pattern in research.md

---

## Phase 1: Design & Contracts

*To be completed during Phase 1 execution*

### Expected Outputs

1. **data-model.md**: Entity definitions for Party, PartyMember, Role with validation rules
2. **contracts/** directory: API contracts for each page/component interface
3. **quickstart.md**: Step-by-step guide for implementing first page (party list)
4. **Updated agent context**: Technology additions from research phase

---

## Ready for Execution

This plan is complete and ready for:
- Phase 0: Research unknown technologies and design decisions
- Phase 1: Create data model, API contracts, and component architecture
- Phase 2: Implement using TDD workflow

**Next Step**: Execute Phase 0 research tasks and create research.md
