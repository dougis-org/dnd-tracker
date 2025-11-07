# Research Phase 0: Party Management Pages

**Feature**: Party Management Pages (F006)  
**Date**: 2025-11-06  
**Status**: Complete

## Research Task 1: Form Handling Pattern in Next.js 16 & React 19

### Decision

**Selected Approach**: React Hook Form with shadcn/ui form components

### Rationale

React Hook Form provides:
- Minimal re-renders (performance advantage with React 19 concurrent rendering)
- Built-in validation integration
- Easy integration with shadcn/ui form wrapper component
- Reduces form boilerplate significantly
- Industry standard for Next.js applications

### Alternatives Evaluated

1. **Uncontrolled components with native form**: 
   - Rejected: Requires manual validation, no type safety, harder to test
   
2. **Controlled components with useState**: 
   - Rejected: More boilerplate, more re-renders, harder to manage complex forms

3. **Formik**: 
   - Rejected: Heavier bundle, React Hook Form is lighter and more modern

### Implementation Pattern

```typescript
// Basic usage with shadcn form wrapper
const { control, watch, handleSubmit } = useForm({
  defaultValues: { partyName: '', members: [] }
});

// shadcn/ui provides Form, FormField, FormItem wrapper components
// Validation integrated via Zod schemas
```

### Evidence

- React Hook Form + shadcn/ui: Recommended pattern in shadcn/ui documentation
- Used successfully in Next.js projects
- Type-safe with TypeScript integration
- ~8.5KB gzipped (minimal impact)

---

## Research Task 2: Modal/Dialog Implementation for Delete Confirmation

### Decision

**Selected Approach**: shadcn/ui Dialog component with AlertDialog wrapper (optional)

### Rationale

shadcn/ui Dialog provides:
- Accessible by default (ARIA attributes, focus management)
- Built on Radix UI primitives (battle-tested)
- Integrates perfectly with existing Tailwind styling
- Already installed in project (verified in F001)
- Supports scoped styling within modal

### Implementation Pattern

```typescript
// shadcn/ui Dialog structure
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Party</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Party</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Accessibility Features

- ✅ Automatic focus management (focus trap)
- ✅ Keyboard support (ESC to close, Tab navigation)
- ✅ ARIA attributes for screen readers
- ✅ Semantic heading structure with DialogTitle

### Evidence

- shadcn/ui Dialog: Standard component library pattern
- Radix UI Dialog: Recommended for production accessibility
- Tested with keyboard and screen readers
- Already in project dependencies (F001)

---

## Research Task 3: Mock Data Architecture for Next.js

### Decision

**Selected Approach**: TypeScript module with mock data factory functions

### Rationale

Structured approach provides:
- Type-safe mock data with TypeScript interfaces
- Factory functions for generating variations
- Easy to extend for future tests
- No external dependencies required
- Works in both client and server components

### Implementation Pattern

```typescript
// lib/mockData/parties.ts
import { Party, PartyMember } from '@/types/party';

// Type-safe mock data
export const MOCK_PARTIES: Party[] = [
  {
    id: 'party-001',
    name: 'The Grovewalkers',
    description: 'A diverse group of adventurers',
    members: [
      {
        id: 'member-001',
        name: 'Theron',
        class: 'Paladin',
        // ... full data
      },
      // ... more members
    ]
  },
  // ... more parties
];

// Factory function for tests
export function createMockParty(overrides: Partial<Party> = {}): Party {
  return { ...MOCK_PARTIES[0], ...overrides };
}
```

### Benefits

- ✅ Single source of truth for mock data
- ✅ Easy to find by feature (in `lib/mockData/`)
- ✅ TypeScript ensures data validity
- ✅ Factory functions support test variations
- ✅ Reusable across unit, integration, and E2E tests

### Alternative Considered

1. **JSON files**: Would require import/parsing, adds build step
2. **Hard-coded in components**: Anti-pattern, breaks DRY principle
3. **API mocking library (MSW)**: Overkill for mock-only feature phase

---

## Research Task 4: Responsive Grid Layout with Tailwind CSS 4.x

### Decision

**Selected Approach**: Tailwind CSS `grid-cols-*` with responsive prefixes

### Rationale

Tailwind CSS 4.x provides:
- Built-in responsive utilities (no custom media queries needed)
- Mobile-first approach (default 1 column, expand for larger screens)
- Container queries for adaptive layouts
- Minimal CSS overhead

### Implementation Pattern

```tsx
// PartyList page layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
  {parties.map(party => (
    <PartyCard key={party.id} party={party} />
  ))}
</div>

// Breakpoints used:
// - grid-cols-1: mobile (default, <768px)
// - md:grid-cols-2: tablet (768px-1024px)
// - lg:grid-cols-3: desktop (>1024px)
```

### Performance Impact

- ✅ Zero runtime JavaScript (pure CSS)
- ✅ Minimal CSS classes (~500 bytes for responsive grid)
- ✅ Works with Tailwind CSS 4.x purging
- ✅ No additional dependencies

### Accessibility

- ✅ Semantic HTML (divs with role if needed)
- ✅ Adequate spacing for touch targets (gap-6 = 24px)
- ✅ Responsive text sizing (consider font-responsive utilities)

---

## Research Task 5: Component Composition for Member Display

### Decision

**Selected Approach**: Single MemberCard component with variant prop for context

### Rationale

Reuse across contexts requires:
- `detail` variant: Full display of member stats
- `edit` variant: Display + edit controls (delete button)
- `preview` variant: Compact display in party list

Single component with variants:
- Reduces duplication
- Maintains consistency
- Easy to test (single test file covers all variants)

### Implementation Pattern

```typescript
// MemberCard component
interface MemberCardProps {
  member: PartyMember;
  variant?: 'detail' | 'edit' | 'preview';
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function MemberCard({ member, variant = 'detail', onRemove, onEdit }: MemberCardProps) {
  return (
    <div className="card">
      <div className="member-header">
        <h4>{member.name}</h4>
        <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
      </div>
      
      {/* Always show core stats */}
      <div className="member-stats">
        <Stat label="Class" value={member.class} />
        <Stat label="Level" value={member.level} />
      </div>

      {/* Variant-specific content */}
      {(variant === 'detail' || variant === 'edit') && (
        <div className="member-full-stats">
          <Stat label="AC" value={member.ac} />
          <Stat label="HP" value={member.hp} />
          <Stat label="Race" value={member.race} />
        </div>
      )}

      {/* Edit variant includes actions */}
      {variant === 'edit' && (
        <div className="member-actions">
          <Button onClick={() => onRemove?.(member.id)}>Remove</Button>
          <Button onClick={() => onEdit?.(member.id)}>Edit</Button>
        </div>
      )}
    </div>
  );
}
```

### Benefits

- ✅ Single component definition (DRY principle)
- ✅ Type-safe variants with TypeScript
- ✅ Easy to test all contexts in one test file
- ✅ Consistent styling across all uses

### Alternative Considered

1. **Separate components per variant**: Duplicates 80% of code, hard to maintain
2. **Conditional rendering inline**: Acceptable but less scalable

---

## Summary & Next Steps

All Phase 0 research tasks complete. Key decisions finalized:

| Task | Decision | Evidence |
|------|----------|----------|
| Form Handling | React Hook Form + shadcn/ui | Industry standard, type-safe, minimal bundle |
| Modals | shadcn/ui Dialog component | Accessible by default, already installed |
| Mock Data | TypeScript module with factories | Type-safe, reusable, no dependencies |
| Responsive Layout | Tailwind CSS grid with responsive prefixes | Zero JavaScript, built-in utilities |
| Component Reuse | Single MemberCard with variants | DRY principle, consistent styling |

### Phase 1 Ready

All unknowns resolved. Ready to proceed with:
1. Create data-model.md with entity definitions
2. Create component contracts in `/contracts/` directory
3. Create quickstart.md for implementation guide
