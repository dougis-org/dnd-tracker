# Quickstart: Implementing Party Management Pages

**Feature**: Party Management Pages (F006)  
**Date**: 2025-11-06  
**Target Duration**: 1 day (full-time development)

## Implementation Order (TDD-First Approach)

Follow this priority order to implement components efficiently. Each step follows TDD: write failing tests first, implement to pass, then refactor.

### Phase 1: Foundation & Core Components (Morning)

**Estimated Time**: 3-4 hours

#### Step 1: Set up TypeScript types and mock data (30 min)

1. Create `src/types/party.ts` with Party, PartyMember, and Role enums
2. Create `src/lib/mockData/parties.ts` with mock party data and factory functions
3. Create `src/lib/utils/partyHelpers.ts` with utility functions (getPartyComposition, getAverageLevel, etc.)

**Files to create**: 3 files, ~150 LOC

#### Step 2: Build MemberCard component (45 min)

1. Write unit tests in `tests/unit/components/MemberCard.test.tsx` (3-4 test cases)
2. Create `src/components/parties/MemberCard.tsx` (80-100 LOC)
3. Verify tests pass (green phase)
4. Refactor if needed

**Rationale**: MemberCard is lowest complexity, used in multiple places, good starting point

#### Step 3: Build RoleSelector component (30 min)

1. Write unit tests in `tests/unit/components/RoleSelector.test.tsx` (2-3 test cases)
2. Create `src/components/parties/RoleSelector.tsx` (40-60 LOC)
3. Verify tests pass

**Rationale**: Simple dropdown, needed for MemberForm, low risk

#### Step 4: Build PartyCard component (45 min)

1. Write unit tests in `tests/unit/components/PartyCard.test.tsx` (4-5 test cases)
2. Create `src/components/parties/PartyCard.tsx` (90-120 LOC)
3. Verify tests pass

**Rationale**: Used on party list page, good to have early for UI validation

#### Step 5: Build PartyCompositionSummary component (30 min)

1. Write unit tests in `tests/unit/components/PartyCompositionSummary.test.tsx` (3-4 test cases)
2. Create `src/components/parties/PartyCompositionSummary.tsx` (60-80 LOC)
3. Verify tests pass

**Rationale**: Reusable summary display, needed for detail and card contexts

### Phase 2: Forms & Complex Components (Afternoon)

**Estimated Time**: 3-4 hours

#### Step 6: Build MemberForm component (60 min)

1. Write unit tests in `tests/unit/components/MemberForm.test.tsx` (5-6 test cases)
2. Create `src/components/parties/MemberForm.tsx` (120-150 LOC)
3. Verify tests pass

**Rationale**: Form component, more complex, depends on RoleSelector

#### Step 7: Build DeleteConfirmModal component (30 min)

1. Write unit tests in `tests/unit/components/DeleteConfirmModal.test.tsx` (3-4 test cases)
2. Create `src/components/parties/DeleteConfirmModal.tsx` (50-70 LOC)
3. Verify tests pass

**Rationale**: Simple dialog, low complexity, good confidence builder

#### Step 8: Build PartyForm component (90 min)

1. Write unit tests in `tests/unit/components/PartyForm.test.tsx` (6-8 test cases)
2. Create `src/components/parties/PartyForm.tsx` (150-180 LOC)
3. Verify tests pass

**Rationale**: Most complex form component, depends on MemberForm

#### Step 9: Build PartyDetail component (60 min)

1. Write unit tests in `tests/unit/components/PartyDetail.test.tsx` (5-6 test cases)
2. Create `src/components/parties/PartyDetail.tsx` (100-120 LOC)
3. Verify tests pass

**Rationale**: Reusable detail display, depends on MemberCard and PartyCompositionSummary

### Phase 3: Pages & Integration (Late Afternoon)

**Estimated Time**: 2-3 hours

#### Step 10: Build Party List page (45 min)

1. Write integration tests in `tests/integration/parties/party-list.test.tsx` (4-5 test cases)
2. Create `src/app/parties/page.tsx` (60-80 LOC)
3. Verify tests pass

**Test scenarios**:

- List renders with mock parties
- PartyCard components display correctly
- Click navigation works
- Responsive layout

#### Step 11: Build Party Detail page (60 min)

1. Write integration tests in `tests/integration/parties/party-detail.test.tsx` (4-5 test cases)
2. Create `src/app/parties/[id]/page.tsx` (70-90 LOC)
3. Verify tests pass

**Test scenarios**:

- Correct party displays
- PartyDetail component renders
- Edit/Delete buttons work
- 404 for invalid party ID

#### Step 12: Build Party Create page (30 min)

1. Write integration tests in `tests/integration/parties/party-create.test.tsx` (3-4 test cases)
2. Create `src/app/parties/new/page.tsx` (40-50 LOC)
3. Verify tests pass

**Test scenarios**:

- Form displays
- Submit shows "Not Implemented" message
- Cancel button works

#### Step 13: Build Party Edit page (30 min)

1. Write integration tests in `tests/integration/parties/party-edit.test.tsx` (3-4 test cases)
2. Create `src/app/parties/[id]/edit/page.tsx` (40-50 LOC)
3. Verify tests pass

**Test scenarios**:

- Form pre-populates with party data
- Submit shows "Not Implemented" message
- Delete confirmation modal works

### Phase 4: E2E Tests & Refinement (Final Hour)

**Estimated Time**: 1 hour

#### Step 14: Add E2E test for complete user flow (30 min)

1. Create `tests/e2e/party-management.spec.ts` (200-250 LOC)

**Critical user flows**:

- View party list
- Click party card to view detail
- Click Edit button
- Return to list

#### Step 15: Final Quality Checks (30 min)

1. Run full test suite: `npm run test:ci:parallel`
2. Run type checking: `npm run type-check`
3. Run linting: `npm run lint`
4. Run Codacy analysis: `codacy_cli_analyze`
5. Fix any issues found

---

## Component Dependency Graph

```
PartyForm (complex)
├── MemberForm
│   └── RoleSelector
├── MemberCard
│   └── RoleSelector
└── DeleteConfirmModal

PartyDetail (medium)
├── MemberCard
│   └── RoleSelector
└── PartyCompositionSummary

PartyCard (simple)
└── PartyCompositionSummary

Pages (depend on above)
├── /parties          → uses PartyCard, PartyCompositionSummary
├── /parties/:id      → uses PartyDetail
├── /parties/new      → uses PartyForm
└── /parties/:id/edit → uses PartyForm, DeleteConfirmModal
```

**Implementation must follow dependencies** (build-order matters for testing).

---

## Code Organization Checklist

### File Structure After Implementation

```
src/
├── types/
│   └── party.ts (new)
├── lib/
│   ├── mockData/
│   │   └── parties.ts (new)
│   └── utils/
│       └── partyHelpers.ts (new)
├── components/
│   └── parties/
│       ├── MemberCard.tsx (new)
│       ├── RoleSelector.tsx (new)
│       ├── PartyCard.tsx (new)
│       ├── PartyCompositionSummary.tsx (new)
│       ├── MemberForm.tsx (new)
│       ├── DeleteConfirmModal.tsx (new)
│       ├── PartyForm.tsx (new)
│       └── PartyDetail.tsx (new)
└── app/
    └── parties/
        ├── page.tsx (new - list)
        ├── new/
        │   └── page.tsx (new - create)
        └── [id]/
            ├── page.tsx (new - detail)
            └── edit/
                └── page.tsx (new - edit)

tests/
├── unit/
│   ├── components/
│   │   ├── MemberCard.test.tsx (new)
│   │   ├── RoleSelector.test.tsx (new)
│   │   ├── PartyCard.test.tsx (new)
│   │   ├── PartyCompositionSummary.test.tsx (new)
│   │   ├── MemberForm.test.tsx (new)
│   │   ├── DeleteConfirmModal.test.tsx (new)
│   │   ├── PartyForm.test.tsx (new)
│   │   └── PartyDetail.test.tsx (new)
│   └── lib/
│       └── partyHelpers.test.ts (new)
├── integration/
│   └── parties/
│       ├── party-list.test.tsx (new)
│       ├── party-detail.test.tsx (new)
│       ├── party-create.test.tsx (new)
│       └── party-edit.test.tsx (new)
└── e2e/
    └── party-management.spec.ts (new)
```

**Total new files**: ~30 files  
**Total estimated LOC**: ~1500-2000 (including tests)

---

## Testing Strategy

### Unit Tests (Per Component)

Each component test file includes:

- Rendering tests (does it render? correct props display?)
- Interaction tests (click handlers, form input)
- Variant tests (if component has variants)
- Accessibility tests (ARIA labels, keyboard navigation)
- Edge case tests (empty data, missing props, etc.)

**Target**: 80%+ coverage per component

### Integration Tests (Per Page)

Each page test file includes:

- Page renders correctly
- Mock data displays
- Navigation works
- Forms show "Not Implemented" on submit
- Error states handled

**Target**: All user-facing flows tested

### E2E Tests (User Workflows)

Critical workflows:

1. View party list and click party card
2. Navigate through party detail, edit, and back to list
3. Verify page transitions work correctly

**Target**: Critical paths covered

---

## TypeScript Type Definitions

All components must use strict TypeScript types. No `any` types.

```typescript
// src/types/party.ts structure
export type DnDClass = 'Barbarian' | 'Bard' | ... (12 classes);
export type DnDRace = 'Human' | 'Elf' | ... (9 races);
export type PartyRole = 'Tank' | 'Healer' | 'DPS' | 'Support';

export interface PartyMember {
  id: string;
  partyId: string;
  characterName: string;
  class: DnDClass;
  race: DnDRace;
  level: number;
  ac: number;
  hp: number;
  role?: PartyRole;
  position: number;
}

export interface Party {
  id: string;
  name: string;
  description?: string;
  campaignSetting?: string;
  members: PartyMember[];
  created_at: Date | string;
  updated_at: Date | string;
}
```

---

## Mock Data Patterns

Always use factory functions for test data:

```typescript
// In tests, not hard-coded data
const testParty = createMockParty({
  name: 'Test Party',
  members: [createMockMember({ name: 'Test Hero' })]
});
```

---

## Common Pitfalls to Avoid

1. ❌ **Hardcoding data in components**: Always use props
2. ❌ **Mixing component logic with page logic**: Keep pages simple, logic in components
3. ❌ **Not testing edge cases**: Empty lists, missing optional fields, invalid IDs
4. ❌ **Over-engineering**: Start simple, refactor if needed
5. ❌ **Skipping accessibility**: Every component needs keyboard support + ARIA labels
6. ❌ **Duplicating test setup**: Use factory functions and helpers
7. ❌ **Files >450 lines**: Keep components focused, extract helpers

---

## Success Criteria for Implementation

✅ All 30 files created (8 components, 4 pages, 3 utils, 15 tests)  
✅ All tests passing (`npm run test:ci:parallel`)  
✅ Type checking passes (`npm run type-check`)  
✅ ESLint clean (`npm run lint`)  
✅ Codacy analysis passes  
✅ 80%+ test coverage  
✅ Build succeeds (`npm run build`)  
✅ No console errors/warnings in dev mode  
✅ Responsive design verified on mobile/tablet/desktop  
✅ All pages navigate correctly  
✅ Forms show "Not Implemented" on submit

---

## Time Budget

| Phase | Task | Time | Cumulative |
|-------|------|------|-----------|
| 1 | Setup types & mock data | 30 min | 30 min |
| 1 | MemberCard | 45 min | 1:15 |
| 1 | RoleSelector | 30 min | 1:45 |
| 1 | PartyCard | 45 min | 2:30 |
| 1 | PartyCompositionSummary | 30 min | 3:00 |
| 2 | MemberForm | 60 min | 4:00 |
| 2 | DeleteConfirmModal | 30 min | 4:30 |
| 2 | PartyForm | 90 min | 6:00 |
| 2 | PartyDetail | 60 min | 7:00 |
| 3 | Party List page | 45 min | 7:45 |
| 3 | Party Detail page | 60 min | 8:45 |
| 3 | Party Create page | 30 min | 9:15 |
| 3 | Party Edit page | 30 min | 9:45 |
| 4 | E2E tests | 30 min | 10:15 |
| 4 | Quality checks & fixes | 30 min | 10:45 |

**Total: ~10.75 hours** for complete implementation (fits within 1-day estimate with buffer)

---

## Next Steps After Quickstart

1. ✅ Execute implementation following this guide in order
2. ✅ Commit each completed component/page with appropriate test coverage
3. ✅ Run full quality suite after each major section
4. ✅ After completion: Create PR for feature merge
5. 🔄 Future (F014+): Replace mock data with real MongoDB backend
