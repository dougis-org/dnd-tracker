# Quickstart: Character Management Implementation

**Feature**: 003 - Character Management System  
**Date**: 2025-10-21

## Quick Overview

Feature 003 adds complete CRUD operations for D&D 5e characters with multiclass support, stat block calculations, and tier-based usage limits.

**Key Files to Create/Modify**:

```
src/
├── app/api/characters/
│   ├── route.ts                    (POST create, GET list)
│   └── [id]/
│       ├── route.ts               (GET detail, PUT update, DELETE soft-delete)
│       └── duplicate/route.ts      (POST duplicate)
├── lib/
│   ├── db/models/
│   │   ├── Character.ts           (Mongoose schema & model)
│   │   ├── Race.ts                (Seed races, schema)
│   │   └── Class.ts               (Seed classes, schema)
│   ├── validations/
│   │   └── character.ts           (Zod schemas)
│   └── services/
│       └── characterService.ts    (Business logic)
└── components/
    └── characters/
        ├── CharacterForm.tsx       (Create/Edit form)
        ├── CharacterList.tsx       (Paginated list with search)
        └── CharacterCard.tsx       (Display component)

tests/
├── unit/
│   ├── character-model.test.ts     (Schema validation)
│   └── character-service.test.ts   (Business logic)
├── integration/
│   ├── characters-api.test.ts      (API endpoints)
│   └── tier-limits.test.ts         (Tier enforcement)
└── e2e/
    └── character-workflow.spec.ts  (Complete user flows)
```

## Implementation Phases (TDD Approach)

### Phase 1: Models & Validation

**Deliverable**: MongoDB schemas and validation schemas

**Files**: `Character.ts`, `Race.ts`, `Class.ts`, `character.ts` (validations)

**Tests** (write first):

- `character-model.test.ts`: Schema validation for valid/invalid inputs
- Verify derived value calculations (modifiers, AC, initiative)
- Verify multiclass level tracking
- Verify soft delete behavior

**Implementation**:

1. Create Mongoose schemas with indexes
2. Add validation middleware
3. Implement derived value calculation methods
4. Add soft delete query helpers

### Phase 2: API Routes

**Deliverable**: RESTful endpoints (POST/GET/PUT/DELETE)

**Files**: API route handlers in `src/app/api/characters/`

**Tests** (write first):

- `characters-api.test.ts`: Happy path for all CRUD operations
- Invalid input validation errors (400)
- Authentication checks (401)
- Authorization checks (403)
- Tier limit enforcement (403 with upgrade prompt)
- Pagination and search/filter parameters

**Implementation**:

1. Create POST /characters endpoint
2. Create GET /characters endpoint (with pagination, search, filters)
3. Create GET /characters/:id endpoint
4. Create PUT /characters/:id endpoint
5. Create DELETE /characters/:id endpoint
6. Create POST /characters/:id/duplicate endpoint

### Phase 3: Business Logic

**Deliverable**: Service layer with validation and calculations

**Files**: `characterService.ts`

**Tests** (write first):

- `character-service.test.ts`: Character creation with tier limit check
- Multiclass level calculation
- D&D 5e stat block calculations
- Soft delete and recovery logic
- Usage metrics tracking

**Implementation**:

1. Create CharacterService with methods:
   - `createCharacter(userId, data)` - with tier limit check
   - `getCharacter(userId, characterId)`
   - `listCharacters(userId, filters, pagination)`
   - `updateCharacter(userId, characterId, data)`
   - `deleteCharacter(userId, characterId)` - soft delete
   - `duplicateCharacter(userId, characterId)`
   - `calculateDerivedStats(character)`

### Phase 4: Components & UI

**Deliverable**: React components for creating, listing, viewing characters

**Files**: `CharacterForm.tsx`, `CharacterList.tsx`, `CharacterCard.tsx`

**Tests** (write first):

- `character-form.test.tsx`: Form validation, submission
- `character-list.test.tsx`: Rendering, pagination, search
- `character-card.test.tsx`: Display and interactions

**Implementation**:

1. Create CharacterForm component (multiclass support)
2. Create CharacterList component (search, filters, pagination)
3. Create CharacterCard component (stat block display)
4. Add form validation and error handling
5. Integrate with API routes

### Phase 5: Tier Limit Integration

**Deliverable**: Usage tracking and limit enforcement UI

**Files**: API integration, UI warnings

**Tests** (write first):

- `tier-limits.test.ts`: Limit enforcement at creation
- Warning display at 80% of limit
- Upgrade prompt when at limit

**Implementation**:

1. Query User.subscription tier
2. Enforce limits in API
3. Display usage warnings in UI
4. Show upgrade prompt when limit reached

### Phase 6: End-to-End Testing

**Deliverable**: Full user workflow tests

**Files**: `character-workflow.spec.ts`

**Test Scenarios**:

1. Create character → verify in list → edit → verify changes
2. Create multiclass character → verify total level calculation
3. Delete character → verify soft delete → verify list
4. Duplicate character → verify independence
5. Search and filter characters
6. Reach tier limit → see upgrade prompt

---

## Key Implementation Details

### D&D 5e Calculations

```typescript
// Ability Modifier
modifier(score) = Math.floor((score - 10) / 2)

// Proficiency Bonus
profBonus(level) = Math.ceil(level / 4) + 1  // 2-6 for levels 1-20

// AC (simple version, without armor)
ac = 10 + modifier('dex')

// Initiative
initiative = modifier('dex')

// Max HP (example)
maxHP = hitDieForClass(lvl1) + modifiers('con').map(m => m + hitDie).reduce()
```

### Multiclass Example

```typescript
classes: [
  { classId: 'fighter', level: 5 },
  { classId: 'wizard', level: 3 }
]

totalLevel = 8
proficiencyBonus = ceil(8 / 4) + 1 = 3  // Based on TOTAL level
```

### Tier Limit Check

```typescript
async function checkTierLimit(userId: string) {
  const user = await User.findById(userId);
  const count = await Character.countDocuments({
    userId,
    deletedAt: null
  });
  const limit = tierLimits[user.subscription.tier];
  
  if (count >= limit) {
    throw new Error('Tier limit reached'); // 403 response
  }
  if (count >= limit * 0.8) {
    // Display warning: "You have X of Y creature slots"
  }
}
```

### Soft Delete Query Helper

```typescript
// Model method to exclude soft-deleted
Character.find({ userId, deletedAt: null })
```

---

## Testing Coverage Targets

- **Unit Tests** (validation, calculations): 95%+ coverage
- **Integration Tests** (API endpoints, database): 85%+ coverage
- **E2E Tests** (user workflows): All main flows covered
- **Overall Target**: 80%+ code coverage on touched files

---

## References

- **Specification**: `specs/003-character-management/spec.md`
- **Data Model**: `specs/003-character-management/data-model.md`
- **API Contract**: `specs/003-character-management/contracts/characters-api.yaml`
- **Research**: `specs/003-character-management/research.md`
- **Project Standards**: `CONTRIBUTING.md`, `TESTING.md`

---

## Next Steps

After planning is complete:

1. Run `/speckit.tasks` to generate task breakdown
2. Begin Phase 1 implementation with tests
3. Follow TDD approach: Red (failing test) → Green (implementation) → Refactor
4. Run `npm run test:ci` after each phase
5. Run `npm run lint:fix` after each file edit
