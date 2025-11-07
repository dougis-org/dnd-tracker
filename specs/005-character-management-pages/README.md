# Character Management Pages - Feature Documentation

## Overview

This feature implements complete CRUD (Create, Read, Update, Delete) operations for D&D characters with an in-memory store and comprehensive test coverage.

## User Stories Implemented

- **US1 (Browse)**: List all characters with search and class filtering
- **US2 (Detail)**: View character stat blocks with full abilities and equipment
- **US3 (Create)**: Create new characters with validated form input
- **US4 (Edit)**: Edit existing characters with form prefilling
- **US5 (Delete)**: Delete characters with confirmation modal and 5-second undo window

## Architecture

### Components

- **CharacterList** (`src/components/characters/CharacterList.tsx`)
  - Client component with search and class filter
  - Initializes character store on mount
  - Grid layout with links to detail pages

- **CharacterCard** (`src/components/characters/CharacterCard.tsx`)
  - Display card showing name, class, level, HP, AC
  - Linked to detail page

- **CharacterDetail** (`src/components/characters/CharacterDetail.tsx`)
  - Full stat block view with abilities and equipment
  - Edit and Delete actions
  - Integrated DeleteCharacterModal

- **CharacterForm** (`src/components/characters/CharacterForm.tsx`)
  - Reusable form for create and edit flows
  - Validates required name field
  - Supports `initial` prop for prefilling in edit mode

- **DeleteCharacterModal** (`src/components/characters/DeleteCharacterModal.tsx`)
  - Confirmation dialog before deletion
  - Transient undo button (5 seconds)
  - Navigation callback on successful delete

### Data Layer

- **Character Store** (`src/lib/characterStore.tsx`)
  - React Context + useReducer for state management
  - Actions: `init()`, `add()`, `update()`, `remove()`, `undo()`, `clear()`
  - History stack for undo support
  - MongoDB ObjectId generation for character IDs

- **Seed Data** (`src/lib/mock/characters.ts`)
  - 5 pre-seeded characters for development and testing
  - IDs: `char-1` through `char-5`

### Pages

- `/characters` - List page with search/filter
- `/characters/new` - Create new character
- `/characters/[id]` - View character details
- `/characters/[id]/edit` - Edit existing character

## Running Locally

### Prerequisites

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/characters`

### Build for Production

```bash
npm run build
npm start
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in CI Mode (with coverage)

```bash
npm run test:ci
```

### Run Specific Test Suites

**Unit Tests:**

```bash
npm test -- tests/unit/components/characters
npm test -- tests/unit/lib/characterStore.spec.ts
```

**Integration Tests:**

```bash
npm test -- tests/integration/characters-flow.spec.tsx
```

**E2E Tests (Playwright):**

```bash
npm run test:e2e
```

Or specific E2E test:

```bash
npx playwright test tests/e2e/characters.spec.ts
```

### Test Coverage

Run with coverage report:

```bash
npm run test:ci -- --coverage
```

Target: 80%+ coverage on all character-related code.

## Code Quality

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Type Checking

```bash
npm run type-check
```

### Format Code

```bash
npm run format
```

## Security

### Dependency Scanning

After adding dependencies:

```bash
npm audit
```

### Static Analysis

Codacy analysis runs automatically on:

- Pull requests
- After commits to feature branches

Manual local analysis (if Codacy CLI installed):

```bash
codacy analyze --directory /path/to/repo
```

## File Structure

```
specs/005-character-management-pages/
  ├── README.md (this file)
  ├── spec.md (detailed requirements)
  ├── tasks.md (implementation plan)
  └── checklists/requirements.md

src/
  ├── app/characters/
  │   ├── page.tsx (list route)
  │   ├── [id]/page.tsx (detail route)
  │   ├── [id]/edit/page.tsx (edit route)
  │   └── new/page.tsx (create route)
  ├── components/characters/
  │   ├── CharacterCard.tsx
  │   ├── CharacterList.tsx
  │   ├── CharacterDetail.tsx
  │   ├── CharacterForm.tsx
  │   └── DeleteCharacterModal.tsx
  └── lib/
      ├── characterStore.tsx (React Context store)
      └── mock/characters.ts (seed data)

types/
  └── character.ts (TypeScript types)

tests/
  ├── unit/
  │   ├── components/characters/ (component tests)
  │   └── lib/characterStore.spec.ts
  ├── integration/
  │   └── characters-flow.spec.tsx
  └── e2e/
      └── characters.spec.ts
```

## Development Notes

### ID Generation

Characters use MongoDB ObjectId format (24-character hex strings) via the `bson` package. This ensures compatibility with future database integration while maintaining deterministic test IDs (`char-1`, etc.) in seed data.

### Test Configuration

- Jest mocks `bson` module in `jest.setup.js` for test performance
- `transformIgnorePatterns` configured to handle ESM modules
- `useRouter` from Next.js must be mocked in component tests

### State Management

The CharacterProvider must wrap components that use the character store. The store initializes from seed data when `init()` is called (typically in `CharacterList` or test harnesses).

## Troubleshooting

### Tests Fail with "useRouter" Error

Ensure your test includes:

```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
});
```

### Store Not Initialized

Wrap components in `CharacterProvider` and call `store.init()` if needed:

```typescript
const TestHarness = () => {
  const store = useCharacterStore();
  if (store.state.characters.length === 0) store.init();
  return <YourComponent />;
};
```

### Type Errors for Character Imports

Types are in `/types/character.ts` (root level). Use relative import:

```typescript
import type { Character } from '../../../../../types/character';
```

Or use path alias after adding to `tsconfig.json`:

```json
"@types/*": ["./types/*"]
```

## Future Enhancements

- Backend API integration (replace in-memory store)
- Persistent storage with database
- Real-time collaboration features
- Advanced filtering (multi-select, level ranges)
- Character image uploads
- Dice rolling integration
- Party management integration
