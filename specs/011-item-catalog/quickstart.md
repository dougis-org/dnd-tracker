# Quickstart: Item Catalog Feature

**Feature**: F011 Item Catalog Pages  
**Audience**: Developers implementing or extending the Item Catalog  
**Last Updated**: 2025-11-12

## Overview

The Item Catalog feature provides UI for browsing, searching, creating, and managing D&D 5e items (weapons, armor, consumables, magical items). This guide walks through the architecture, setup, and contribution workflow.

## Prerequisites

- Node.js 25.1.0+ (or compatible version)
- npm 11.0.0+
- Git 2.40+
- VS Code (recommended) or equivalent IDE with TypeScript support

## Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/dougis-org/dnd-tracker.git
cd dnd-tracker
npm install
```

### 2. Checkout Feature Branch

```bash
git checkout feature/011-item-catalog
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/items](http://localhost:3000/items) to see the Item Catalog.

### 4. Run Tests

```bash
# Unit and integration tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Architecture Overview

### Directory Structure

```
specs/011-item-catalog/          # Feature specification & design docs
  ├── spec.md                    # Feature requirements
  ├── plan.md                    # Implementation plan
  ├── research.md                # Technical decisions
  ├── data-model.md              # TypeScript interfaces & Zod schemas
  ├── contracts/
  │   └── items-api.yaml         # OpenAPI spec (for future backend)
  └── quickstart.md              # This file

src/
  ├── app/items/                 # Next.js App Router pages
  │   ├── page.tsx               # List/Browse page (/items)
  │   ├── [id]/page.tsx          # Detail page (/items/:id)
  │   ├── new/page.tsx           # Create page (/items/new)
  │   └── [id]/edit/page.tsx     # Edit page (/items/:id/edit)
  │
  ├── components/items/          # Item-specific React components
  │   ├── ItemCard.tsx           # Card for list view
  │   ├── ItemFilters.tsx        # Filter controls (type, rarity, tags)
  │   ├── ItemSearchBar.tsx      # Search input with debouncing
  │   ├── ItemForm.tsx           # Create/Edit form
  │   └── ItemDetailView.tsx     # Detailed item information display
  │
  ├── lib/adapters/              # Data access layer
  │   └── items.ts               # Mock adapter (in-memory + localStorage)
  │
  ├── lib/mocks/                 # Seed data
  │   └── sampleItems.ts         # 50+ D&D 5e SRD items
  │
  ├── lib/schemas/               # Zod validation schemas
  │   └── item.schema.ts         # Item validation logic
  │
  └── types/                     # TypeScript type definitions
      └── item.ts                # Item, ItemCategory, ItemRarity, etc.

tests/
  ├── unit/items/                # Unit tests for components & utils
  ├── integration/items/         # Integration tests for data flow
  └── e2e/items/                 # Playwright E2E tests
```

### Data Flow

```
User Interaction
    ↓
Next.js Page (/app/items/*.tsx)
    ↓
React Component (/components/items/*.tsx)
    ↓
Item Adapter (/lib/adapters/items.ts)
    ↓
Mock Storage (in-memory Map + localStorage)
    ↓
Seed Data (/lib/mocks/sampleItems.ts)
```

**Future Enhancement (Feature 030)**: Replace mock adapter with REST API client calling backend endpoints defined in `contracts/items-api.yaml`.

## Key Concepts

### Conditional Item Types

Items have a base interface (`ItemBase`) with conditional extensions based on `type`:

- **WeaponItem**: Adds `damage`, `damageType`, `weaponProperties`, `range`
- **ArmorItem**: Adds `armorClass`, `armorType`, `strRequirement`, `stealthDisadvantage`
- **ConsumableItem**: Adds `uses`, `effect`, `duration`
- **MagicalItem**: Adds `requiresAttunement`, `magicalEffect`, `charges`

TypeScript's discriminated unions allow type-safe handling:

```typescript
if (item.type === ItemCategory.Weapon) {
  // TypeScript knows `item.damage` exists here
  console.log(item.damage);
}
```

### Mock Adapter Pattern

The `ItemAdapter` interface defines CRUD operations:

```typescript
interface ItemAdapter {
  getAll(filters?: ItemFilters): Promise<Item[]>;
  getById(id: string): Promise<Item | null>;
  create(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item>;
  update(id: string, updates: Partial<Item>): Promise<Item>;
  delete(id: string): Promise<boolean>;
}
```

Implementation uses a `Map<string, Item>` for session storage and syncs to `localStorage` for persistence across sessions.

### Validation with Zod

All item forms use Zod schemas for runtime validation:

```typescript
const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(ItemCategory),
  rarity: z.nativeEnum(ItemRarity),
  // ... conditional fields based on type
});

// In React Hook Form
const { register, handleSubmit } = useForm({
  resolver: zodResolver(itemSchema),
});
```

### Filtering & Search

Client-side filtering with React `useMemo` for performance:

```typescript
const filteredItems = useMemo(() => {
  return items?.filter(item => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.rarity && item.rarity !== filters.rarity) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return true;
  });
}, [items, filters, searchQuery]);
```

## Development Workflow (TDD-First)

### Step 1: Write Failing Test

Create a test file in `tests/unit/items/` or `tests/integration/items/`:

```typescript
// tests/unit/items/ItemCard.test.tsx
import { render, screen } from "@testing-library/react";
import { ItemCard } from "@/components/items/ItemCard";

test("ItemCard displays item name", () => {
  const item = { id: "1", name: "Longsword", type: "Weapon", /* ... */ };
  render(<ItemCard item={item} />);
  expect(screen.getByText("Longsword")).toBeInTheDocument();
});
```

Run test: `npm test ItemCard.test.tsx` (should fail initially).

### Step 2: Implement Feature

Create the component in `src/components/items/`:

```typescript
// src/components/items/ItemCard.tsx
import { Item } from "@/types/item";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-bold">{item.name}</h3>
      {/* Add more fields */}
    </div>
  );
}
```

### Step 3: Verify Test Passes

Run test: `npm test ItemCard.test.tsx` (should pass now).

### Step 4: Refactor & Ensure Coverage

Check coverage: `npm run test:coverage`  
Goal: 80%+ coverage on all new files.

## Common Tasks

### Adding a New Item Type

1. **Update TypeScript types** (`src/types/item.ts`):

   ```typescript
   enum ItemCategory {
     // ... existing
     Tool = "Tool",
   }

   interface ToolItem extends ItemBase {
     type: ItemCategory.Tool;
     toolType: string; // e.g., "Artisan's Tools"
   }

   type Item = WeaponItem | ArmorItem | ToolItem | ...;
   ```

2. **Update Zod schema** (`src/lib/schemas/item.schema.ts`):

   ```typescript
   const ToolItemSchema = ItemBaseSchema.extend({
     type: z.literal(ItemCategory.Tool),
     toolType: z.string(),
   });
   ```

3. **Update form** (`src/components/items/ItemForm.tsx`):
   Add conditional fields for `toolType` when `type === "Tool"`.

4. **Add tests**:
   - Unit test for `ToolItem` validation
   - Integration test for creating a Tool item
   - E2E test for Tool item workflow

### Extending Filters

1. **Update `ItemFilters` interface** (`src/types/item.ts`):

   ```typescript
   interface ItemFilters {
     type?: ItemCategory;
     rarity?: ItemRarity;
     tags?: string[];
     minWeight?: number; // NEW
     maxWeight?: number; // NEW
   }
   ```

2. **Update `ItemFilters` component** (`src/components/items/ItemFilters.tsx`):
   Add inputs for `minWeight` and `maxWeight`.

3. **Update filter logic** in list page (`src/app/items/page.tsx`):

   ```typescript
   if (filters.minWeight && item.weight < filters.minWeight) return false;
   if (filters.maxWeight && item.weight > filters.maxWeight) return false;
   ```

4. **Add tests**: Verify new filters work correctly.

## Testing Strategy

### Unit Tests

- **Location**: `tests/unit/items/`
- **Scope**: Individual components and utilities
- **Tools**: Jest + React Testing Library
- **Example**:

  ```bash
  npm test ItemCard.test.tsx
  ```

### Integration Tests

- **Location**: `tests/integration/items/`
- **Scope**: Data flow between components and adapters
- **Tools**: Jest + React Testing Library
- **Example**:

  ```bash
  npm test items.integration.test.tsx
  ```

### E2E Tests

- **Location**: `tests/e2e/items/`
- **Scope**: Full user workflows (browse → view → create → edit → delete)
- **Tools**: Playwright
- **Example**:

  ```bash
  npm run test:e2e -- items-catalog.spec.ts
  ```

### Accessibility Tests

- **Tool**: axe-playwright (integrated into E2E tests)
- **Example**:

  ```typescript
  import { test, expect } from "@playwright/test";
  import { injectAxe, checkA11y } from "axe-playwright";

  test("Item list page is accessible", async ({ page }) => {
    await page.goto("/items");
    await injectAxe(page);
    await checkA11y(page);
  });
  ```

## Code Style & Standards

### TypeScript Rules

- **No `any` types**: Use `unknown` or proper type definitions
- **Strict mode enabled**: All type checks enforced
- **Max file size**: 450 lines per file
- **Max function size**: 50 lines per function

### React Patterns

- **Server Components by default**: Use `"use client"` only when needed (forms, hooks)
- **Component naming**: PascalCase for components, kebab-case for files
- **Props interfaces**: Define inline or in separate type file

### Testing Rules

- **80%+ coverage**: Required for all new code
- **Test naming**: `describe("ComponentName", () => { test("should do X", ...) })`
- **Avoid duplication**: Extract common setup into test helpers

### Commit Messages

Follow Conventional Commits format:

```
feat(items): add filter by weight range
test(items): add E2E tests for item creation workflow
fix(items): correct rarity badge color for Legendary items
docs(items): update quickstart with new filter instructions
```

## Linting & Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run Markdown linting
npm run lint:markdown

# Fix Markdown formatting
npm run lint:markdown:fix
```

## Debugging Tips

### Mock Adapter Inspection

View items stored in localStorage:

```javascript
// In browser console
const items = JSON.parse(localStorage.getItem("dnd-tracker:items") || "[]");
console.table(items);
```

### React DevTools

1. Install React DevTools extension
2. Inspect component props and state
3. Profile render performance

### Test Debugging

Run tests in watch mode:

```bash
npm test -- --watch
```

Debug specific test:

```bash
npm test -- ItemCard.test.tsx --no-coverage
```

## Next Steps

### Implementing F011 Tasks

1. **Read the implementation plan**: `specs/011-item-catalog/plan.md`
2. **Review the task breakdown**: Generated via `/speckit.tasks` (coming next)
3. **Pick a task**: Start with T001 (typically the first vertical slice)
4. **Follow TDD workflow**: Write test → Implement → Refactor
5. **Submit PR**: Follow `CONTRIBUTING.md` PR guidelines

### Extending Beyond MVP

- **Feature 030 (Backend Persistence)**: Replace mock adapter with REST API
- **Feature 012 (Inventory Management)**: Link items to characters and parties
- **Feature 035-039 (Offline Support)**: Add IndexedDB caching and sync

## Resources

### Internal Documentation

- `specs/011-item-catalog/spec.md`: Feature requirements
- `specs/011-item-catalog/research.md`: Technical decisions
- `specs/011-item-catalog/data-model.md`: TypeScript interfaces
- `CONTRIBUTING.md`: Repository contribution guidelines
- `TESTING.md`: Testing standards and best practices

### External References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TypeScript 5.9 Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)
- [shadcn/ui Components](https://ui.shadcn.com)

## Getting Help

- **GitHub Issues**: [dougis-org/dnd-tracker/issues](https://github.com/dougis-org/dnd-tracker/issues)
- **Feature Spec**: Comment on Issue #365
- **Team Chat**: (Add Slack/Discord link if applicable)

---

**Quickstart Status**: ✅ Complete
