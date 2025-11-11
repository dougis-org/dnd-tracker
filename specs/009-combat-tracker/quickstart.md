# Quick Start - Combat Tracker Page (Feature 009)

## Objective

Implement the Combat Tracker page UI (/combat) with mock data, focusing on P1 user stories: loading a combat session, advancing turns, and applying damage/healing.

## Prerequisites

- Node.js 25.x or higher
- npm 9.x or higher
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with Next.js 16, React 19, TypeScript, and Tailwind CSS

## Getting Started

### 1. Set Up Feature Branch

```bash
cd /home/doug/ai-dev-2/dnd-tracker
git checkout feature/009-combat-tracker
git pull origin feature/009-combat-tracker
```

### 2. Review Project Structure

```
src/
├── app/
│   ├── combat/
│   │   └── page.tsx          # Main Combat Tracker page
│   └── ...
├── components/
│   ├── combat/
│   │   ├── CombatTracker.tsx
│   │   ├── InitiativeOrder.tsx
│   │   ├── HPTracker.tsx
│   │   ├── StatusEffectsPanel.tsx
│   │   ├── CombatLog.tsx
│   │   └── ...│   └── ...
├── lib/
│   ├── adapters/
│   │   └── combat-session.adapter.ts  # Mock/API adapter for session data
│   └── ...
└── types/
    ├── combat-session.ts
    ├── participant.ts
    ├── status-effect.ts
    └── combat-log.ts
```

### 3. Install Dependencies

If not already done:

```bash
npm install
```

Verify the project compiles:

```bash
npm run type-check
```

### 4. Start Development Server

```bash
npm run dev
```

The app will run at <http://localhost:3000>. Navigate to <http://localhost:3000/combat> to view the Combat Tracker page.

## Development Workflow (TDD)

### Phase 1: Test Suite

1. Create test files for each component:
   - `tests/unit/components/combat/CombatTracker.test.tsx`
   - `tests/unit/components/combat/InitiativeOrder.test.tsx`
   - `tests/unit/components/combat/HPTracker.test.tsx`
   - `tests/unit/components/combat/StatusEffectsPanel.test.tsx`
   - `tests/unit/components/combat/CombatLog.test.tsx`

2. Write failing tests for User Story 1 (Load session):
   - Component renders without crashing
   - Initiative order list displays all participants
   - Current turn is highlighted
   - Round/turn counter shows correct values
   - Status effects display as pills

3. Run tests to confirm they fail:

   ```bash
   npm run test:ci:parallel
   ```

### Phase 2: Implementation

1. Create mock data adapter in `lib/adapters/combat-session.adapter.ts`:
   - Export `getCombatSession()` function returning mock CombatSession
   - Use in-memory store or localStorage for MVP

2. Implement `CombatTracker` component:
   - Load session via adapter
   - Manage local state (current turn, round)
   - Pass data to sub-components

3. Implement sub-components:
   - `InitiativeOrder`: Display sorted participant list with current turn highlight
   - `HPTracker`: Show HP for each participant (numeric + optional bar)
   - `StatusEffectsPanel`: Display status effect pills with duration
   - `CombatLog`: Collapsible log of recent actions

4. Run tests:

   ```bash
   npm run test:ci:parallel
   ```

5. Ensure TypeScript and lint pass:

   ```bash
   npm run type-check
   npm run lint
   ```

### Phase 3: Refinement & Additional Features

1. Add "Next Turn" and "Previous Turn" buttons (User Story 2)
2. Add damage/healing input controls (User Story 3)
3. Add status effect management UI (User Story 4)
4. Add lair action notification (User Story 5)
5. Enhance combat log with filters (User Story 6)

## Key Files to Create/Modify

### New Files

- `src/app/combat/page.tsx` - Main Combat Tracker page
- `src/components/combat/CombatTracker.tsx` - Main tracker component
- `src/components/combat/InitiativeOrder.tsx` - Initiative order list
- `src/components/combat/HPTracker.tsx` - HP management UI
- `src/components/combat/StatusEffectsPanel.tsx` - Status effect management
- `src/components/combat/CombatLog.tsx` - Combat log display
- `src/lib/adapters/combat-session.adapter.ts` - Mock/API adapter
- `src/types/combat-session.ts` - TypeScript types
- `tests/unit/components/combat/*.test.tsx` - Test files

### Modified Files

- `src/app/layout.tsx` (if global navigation needs update)
- `tsconfig.json` (if new path aliases needed)

## Mock Data

A sample CombatSession with 6 participants (mock data defined in `specs/009-combat-tracker/data-model.md`):

```typescript
const mockSession: CombatSession = {
  id: 'session-001',
  encounterId: 'encounter-001',
  status: 'active',
  currentRoundNumber: 3,
  currentTurnIndex: 1, // Orc Warrior's turn
  participants: [
    { id: '1', name: 'Legolas', initiativeValue: 18, maxHP: 45, currentHP: 45, ... },
    { id: '2', name: 'Orc Warrior', initiativeValue: 15, maxHP: 50, currentHP: 38, statusEffects: [{ name: 'Prone', durationInRounds: 2 }], ... },
    // ... 4 more
  ],
  ownerId: 'user-001',
};
```

## Testing

### Unit Tests

Test individual components:

```bash
npm run test tests/unit/components/combat/ -- --watch
```

### Integration Tests

Test user flows (e.g., "load session → advance turn → apply damage"):

```bash
npm run test tests/integration/combat/ -- --watch
```

### E2E Tests

Test in a browser environment:

```bash
npm run test:e2e:ui
```

(Open Playwright UI at <http://localhost:3000/combat> and interact)

## Build & Deployment

### Local Build

```bash
npm run build
npm start
```

### Pre-PR Checks

Before pushing:

```bash
npm run type-check
npm run lint
npm run lint:markdown
npm run test:ci:parallel
npm run build
```

All must pass.

## Common Tasks

### View Coverage

```bash
npm run test:coverage
```

Open `coverage/lcov-report/index.html` to see coverage report.

### Fix Linting Issues

```bash
npm run lint:fix
```

### Run Specific Test

```bash
npm run test -- --testNamePattern="LoadCombatSession"
```

## Resources

- **Feature Spec**: `specs/009-combat-tracker/spec.md`
- **Data Model**: `specs/009-combat-tracker/data-model.md`
- **Research**: `specs/009-combat-tracker/research.md`
- **Next.js Docs**: <https://nextjs.org/docs>
- **React 19 Docs**: <https://react.dev>
- **Tailwind CSS**: <https://tailwindcss.com/docs>
- **shadcn/ui**: <https://ui.shadcn.com>

## Next Phase (Feature 037+)

This feature is UI-first. The following features will integrate backend models and APIs:

- **Feature 036**: CombatSession Model & API
- **Feature 037**: Initiative System
- **Feature 038**: Combat Tracker Basic Integration (connects UI to models)
- **Feature 039**: HP Tracking System
- **Feature 040**: HP Tracking UI Integration
