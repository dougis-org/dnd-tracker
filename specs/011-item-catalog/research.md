# Research: Item Catalog Feature

**Feature**: F011 Item Catalog Pages  
**Date**: 2025-11-12  
**Researcher**: AI Agent (speckit.plan)

## Purpose

Resolve technical unknowns and establish implementation patterns for the Item Catalog feature before proceeding to detailed design and task breakdown.

## Research Topics

### 1. Item Data Structure & D&D 5e Compatibility

**Decision**: Use TypeScript interfaces aligned with D&D 5e SRD item structure

**Rationale**:

- D&D 5e defines standard item categories (Weapon, Armor, Consumable, Magical, Wondrous, Tool, Mount, Vehicle)
- Item attributes vary by type (weapons have damage dice, armor has AC bonuses, consumables have uses)
- Conditional typing in TypeScript allows type-safe handling of item-specific fields
- Rarity follows D&D 5e standard: Common, Uncommon, Rare, Very Rare, Legendary, Artifact

**Alternatives Considered**:

- **Generic item model with arbitrary properties**: Rejected due to lack of type safety and validation complexity
- **Separate models per item type**: Rejected due to excessive duplication and poor maintainability
- **Tagged union types**: Considered but deferred to backend API design (Feature 030)

**Implementation Pattern**:

```typescript
// Base item interface with common fields
interface ItemBase {
  id: string;
  name: string;
  type: ItemCategory;
  rarity: ItemRarity;
  weight: number; // in pounds
  cost: { gp: number; sp?: number; cp?: number };
  description: string;
  properties: string[];
  tags: string[];
  isSystem: boolean;
  source: string; // "D&D 5e SRD" or "User Created"
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conditional fields by type
interface WeaponItem extends ItemBase {
  type: ItemCategory.Weapon;
  damage: string; // e.g., "1d8"
  damageType: DamageType; // slashing, piercing, bludgeoning
  weaponProperties: WeaponProperty[]; // Finesse, Versatile, Reach, Light
}

interface ArmorItem extends ItemBase {
  type: ItemCategory.Armor;
  armorClass: number;
  armorType: ArmorType; // Light, Medium, Heavy
  strRequirement?: number;
}

type Item = WeaponItem | ArmorItem | ConsumableItem | MagicalItem | BaseItem;
```

### 2. Filtering & Search Performance

**Decision**: Client-side filtering with lazy-loaded seed data and memoization

**Rationale**:

- MVP dataset size: 50-100 items (well within browser memory limits)
- Requirement: 95th percentile latency ≤1.0s for filter/search operations
- React useMemo and useCallback can optimize re-renders
- Virtual scrolling deferred until performance issues observed

**Alternatives Considered**:

- **Server-side filtering**: Overkill for MVP; backend API not available until Feature 030
- **Web Workers for filtering**: Premature optimization for <100 items
- **IndexedDB caching**: Deferred to offline feature phase (Features 035-039)

**Implementation Pattern**:

```typescript
// Use React Query for data fetching + caching
const { data: items, isLoading } = useQuery(['items'], fetchItems);

// Memoized filtering logic
const filteredItems = useMemo(() => {
  return items
    ?.filter(item => {
      if (filters.type && item.type !== filters.type) return false;
      if (filters.rarity && item.rarity !== filters.rarity) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) 
        return false;
      return true;
    });
}, [items, filters, searchQuery]);
```

### 3. Form State Management for Create/Edit

**Decision**: React Hook Form with Zod schema validation

**Rationale**:

- React Hook Form minimizes re-renders and provides performant validation
- Zod integrates seamlessly with TypeScript for type-safe validation
- Conditional field rendering based on item type requires dynamic schema
- Already used successfully in Features 005, 006, 007

**Alternatives Considered**:

- **Formik**: More boilerplate, heavier bundle size
- **Manual state management**: Error-prone, lacks built-in validation
- **Native HTML5 validation**: Insufficient for complex conditional logic

**Implementation Pattern**:

```typescript
// Define Zod schema with conditional validation
const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(ItemCategory),
  rarity: z.nativeEnum(ItemRarity),
  weight: z.number().min(0),
  cost: z.object({ gp: z.number().min(0) }),
  description: z.string(),
  // Conditional fields
  damage: z.string().optional().refine((val, ctx) => {
    if (ctx.parent.type === ItemCategory.Weapon && !val) {
      ctx.addIssue({ message: "Damage required for weapons" });
      return false;
    }
    return true;
  }),
});

// Use in form component
const { register, handleSubmit, watch, formState } = useForm({
  resolver: zodResolver(itemSchema),
});
```

### 4. Seed Data Strategy (D&D 5e SRD Items)

**Decision**: Hardcoded TypeScript constant array with 50+ canonical D&D items

**Rationale**:

- D&D 5e System Reference Document (SRD) is open content under OGL 1.0a
- Items to include: longsword, shortsword, greatsword, dagger, plate armor, chain mail, leather armor, potion of healing, scroll of fireball, rope (50 ft), torch, etc.
- Hardcoding allows instant load with no API dependency
- Easily replaceable with API calls in Feature 030

**Alternatives Considered**:

- **Fetch from external D&D API (dnd5eapi.co)**: Introduces network dependency for MVP
- **JSON file in public/**: Valid but TypeScript array provides better type safety and IntelliSense
- **Database seeding script**: Requires backend which is out of scope for MVP

**Implementation Pattern**:

```typescript
// src/lib/mocks/sampleItems.ts
export const SAMPLE_ITEMS: Item[] = [
  {
    id: "srd-longsword",
    name: "Longsword",
    type: ItemCategory.Weapon,
    rarity: ItemRarity.Common,
    weight: 3,
    cost: { gp: 15 },
    description: "A martial melee weapon with a double-edged blade.",
    properties: ["Versatile"],
    damage: "1d8",
    damageType: DamageType.Slashing,
    weaponProperties: [WeaponProperty.Versatile],
    isSystem: true,
    source: "D&D 5e SRD",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  // ... 49+ more items
];
```

### 5. Rarity Badge Styling

**Decision**: Tailwind CSS utility classes with color-coded badges per D&D 5e convention

**Rationale**:

- Visual clarity: users can quickly identify item rarity
- Follows established D&D community conventions for rarity colors
- Tailwind provides responsive, accessible color utilities
- Pattern used successfully in Features 006, 007, 009

**Color Mapping**:

- Common: gray (`bg-gray-500`)
- Uncommon: green (`bg-green-500`)
- Rare: blue (`bg-blue-500`)
- Very Rare: purple (`bg-purple-500`)
- Legendary: orange (`bg-orange-500`)
- Artifact: gold/amber (`bg-amber-500`)

**Implementation Pattern**:

```typescript
const rarityColors: Record<ItemRarity, string> = {
  [ItemRarity.Common]: "bg-gray-500 text-white",
  [ItemRarity.Uncommon]: "bg-green-500 text-white",
  [ItemRarity.Rare]: "bg-blue-500 text-white",
  [ItemRarity.VeryRare]: "bg-purple-500 text-white",
  [ItemRarity.Legendary]: "bg-orange-500 text-white",
  [ItemRarity.Artifact]: "bg-amber-500 text-white",
};

// In component
<Badge className={rarityColors[item.rarity]}>
  {item.rarity}
</Badge>
```

### 6. Accessibility Considerations

**Decision**: ARIA labels, keyboard navigation, screen reader announcements

**Rationale**:

- Requirement SC-005: keyboard navigation and screen reader support mandatory
- Filter controls must be keyboard-navigable (tab order)
- Search input must announce results count to screen readers
- Item cards must have proper focus indicators

**Implementation Pattern**:

- Use semantic HTML (`<button>`, `<input>`, `<select>`)
- Add ARIA labels for icon-only buttons: `aria-label="Clear filters"`
- Announce filter results: `<div aria-live="polite">{filteredItems.length} items found</div>`
- Ensure focus visible on all interactive elements
- Test with axe-playwright in E2E tests

### 7. Mobile Responsiveness

**Decision**: Mobile-first responsive design with Tailwind breakpoints

**Rationale**:

- Requirement FR-009: mobile-responsive layouts mandatory
- Item cards should stack vertically on mobile, grid on desktop
- Filters collapse into drawer/modal on mobile
- Search bar full-width on mobile, constrained on desktop

**Breakpoints**:

- Mobile: `<640px` (default, single column)
- Tablet: `640px-1024px` (2 columns)
- Desktop: `>1024px` (3-4 columns)

**Implementation Pattern**:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {filteredItems.map(item => <ItemCard key={item.id} item={item} />)}
</div>
```

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Data Structure | TypeScript interfaces with conditional types | Type safety + D&D 5e compatibility |
| Filtering | Client-side with memoization | Performance + MVP simplicity |
| Form Management | React Hook Form + Zod | Best practice + type safety |
| Seed Data | 50+ hardcoded D&D 5e SRD items | Instant load, no API dependency |
| Rarity Badges | Tailwind color-coded badges | Visual clarity + community convention |
| Accessibility | ARIA labels + keyboard nav | SC-005 requirement |
| Responsiveness | Mobile-first Tailwind grid | FR-009 requirement |

## Next Steps

1. Generate `data-model.md` with detailed entity definitions
2. Create OpenAPI contract in `/contracts/items-api.yaml` for future Feature 030
3. Write `quickstart.md` for developer onboarding
4. Proceed to `/speckit.tasks` for TDD-first task breakdown

---

**Research Status**: ✅ Complete
