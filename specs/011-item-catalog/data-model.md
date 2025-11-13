# Data Model: Item Catalog

**Feature**: F011 Item Catalog Pages  
**Version**: 1.0  
**Last Updated**: 2025-11-12

## Overview

The Item Catalog data model defines TypeScript interfaces for managing D&D 5e equipment, weapons, armor, and consumables. This model supports conditional typing for item-specific attributes while maintaining type safety.

## Core Entities

### Item (Base Interface)

The `Item` interface represents the common attributes shared by all item types.

```typescript
/**
 * Base interface for all item types
 * Contains common properties shared across weapons, armor, consumables, etc.
 */
interface ItemBase {
  /** Unique identifier (UUID format recommended) */
  id: string;

  /** Display name of the item */
  name: string;

  /** Item category (weapon, armor, consumable, etc.) */
  type: ItemCategory;

  /** D&D 5e rarity tier */
  rarity: ItemRarity;

  /** Weight in pounds (decimal allowed) */
  weight: number;

  /** Cost in gold pieces (gp, sp, cp breakdown) */
  cost: ItemCost;

  /** Full text description of the item */
  description: string;

  /** Generic properties applicable to item (e.g., "Magical", "Cursed") */
  properties: string[];

  /** User-defined tags for filtering/organization */
  tags: string[];

  /** True if system-provided (D&D SRD), false if user-created */
  isSystem: boolean;

  /** Source reference (e.g., "D&D 5e SRD", "Homebrew") */
  source: string;

  /** User ID of creator (optional, null for system items) */
  createdBy?: string;

  /** ISO 8601 timestamp of creation */
  createdAt: Date;

  /** ISO 8601 timestamp of last update */
  updatedAt: Date;
}
```

### ItemCategory (Enum)

Defines the primary classification of items based on D&D 5e standards.

```typescript
enum ItemCategory {
  Weapon = "Weapon",
  Armor = "Armor",
  Consumable = "Consumable",
  Magical = "Magical",
  Wondrous = "Wondrous",
  Tool = "Tool",
  Mount = "Mount",
  Vehicle = "Vehicle",
  Gear = "Gear", // Adventuring gear (rope, torch, etc.)
}
```

### ItemRarity (Enum)

Represents D&D 5e rarity tiers used for balancing and loot distribution.

```typescript
enum ItemRarity {
  Common = "Common",
  Uncommon = "Uncommon",
  Rare = "Rare",
  VeryRare = "Very Rare",
  Legendary = "Legendary",
  Artifact = "Artifact",
}
```

### ItemCost (Type)

Monetary cost breakdown in D&D currency denominations.

```typescript
type ItemCost = {
  /** Gold pieces (primary currency unit) */
  gp: number;

  /** Silver pieces (optional) */
  sp?: number;

  /** Copper pieces (optional) */
  cp?: number;
};
```

## Conditional Type Extensions

### WeaponItem

Items categorized as `Weapon` have additional combat-specific attributes.

```typescript
interface WeaponItem extends ItemBase {
  type: ItemCategory.Weapon;

  /** Damage dice notation (e.g., "1d8", "2d6+1") */
  damage: string;

  /** Type of damage dealt */
  damageType: DamageType;

  /** Special weapon properties */
  weaponProperties: WeaponProperty[];

  /** Range in feet (for ranged weapons) */
  range?: { normal: number; long: number };
}

enum DamageType {
  Slashing = "Slashing",
  Piercing = "Piercing",
  Bludgeoning = "Bludgeoning",
  Fire = "Fire",
  Cold = "Cold",
  Lightning = "Lightning",
  Poison = "Poison",
  Acid = "Acid",
  Psychic = "Psychic",
  Necrotic = "Necrotic",
  Radiant = "Radiant",
  Force = "Force",
}

enum WeaponProperty {
  Finesse = "Finesse",
  Versatile = "Versatile",
  Reach = "Reach",
  Light = "Light",
  Heavy = "Heavy",
  TwoHanded = "Two-Handed",
  Thrown = "Thrown",
  Ammunition = "Ammunition",
  Loading = "Loading",
}
```

### ArmorItem

Items categorized as `Armor` have defense and mobility attributes.

```typescript
interface ArmorItem extends ItemBase {
  type: ItemCategory.Armor;

  /** Armor class bonus or base AC */
  armorClass: number;

  /** Armor weight classification */
  armorType: ArmorType;

  /** Minimum strength score required to wear without penalty */
  strRequirement?: number;

  /** True if armor imposes stealth disadvantage */
  stealthDisadvantage: boolean;
}

enum ArmorType {
  Light = "Light",
  Medium = "Medium",
  Heavy = "Heavy",
  Shield = "Shield",
}
```

### ConsumableItem

Items that can be used/consumed (potions, scrolls, rations).

```typescript
interface ConsumableItem extends ItemBase {
  type: ItemCategory.Consumable;

  /** Number of uses before item is depleted */
  uses: number;

  /** Effect description when consumed */
  effect: string;

  /** Duration of effect (if applicable, in rounds/minutes/hours) */
  duration?: string;
}
```

### MagicalItem

Items with magical properties beyond simple stat bonuses.

```typescript
interface MagicalItem extends ItemBase {
  type: ItemCategory.Magical;

  /** True if item requires attunement */
  requiresAttunement: boolean;

  /** Magical effects granted by the item */
  magicalEffect: string;

  /** Number of charges (if applicable) */
  charges?: number;

  /** Charges regained per day */
  chargesPerDay?: number;
}
```

## Discriminated Union Type

The `Item` type is a discriminated union based on `type` field:

```typescript
type Item = WeaponItem | ArmorItem | ConsumableItem | MagicalItem | ItemBase;
```

TypeScript can narrow the type using type guards:

```typescript
function isWeaponItem(item: Item): item is WeaponItem {
  return item.type === ItemCategory.Weapon;
}

if (isWeaponItem(item)) {
  // TypeScript knows `item.damage` and `item.damageType` exist here
  console.log(item.damage);
}
```

## Validation Schemas (Zod)

Zod schemas enforce runtime validation with TypeScript inference.

```typescript
import { z } from "zod";

const ItemCostSchema = z.object({
  gp: z.number().min(0),
  sp: z.number().min(0).optional(),
  cp: z.number().min(0).optional(),
});

const ItemBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.nativeEnum(ItemCategory),
  rarity: z.nativeEnum(ItemRarity),
  weight: z.number().min(0),
  cost: ItemCostSchema,
  description: z.string(),
  properties: z.array(z.string()),
  tags: z.array(z.string()),
  isSystem: z.boolean(),
  source: z.string(),
  createdBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const WeaponItemSchema = ItemBaseSchema.extend({
  type: z.literal(ItemCategory.Weapon),
  damage: z.string().regex(/^\d+d\d+([+-]\d+)?$/), // Dice notation
  damageType: z.nativeEnum(DamageType),
  weaponProperties: z.array(z.nativeEnum(WeaponProperty)),
  range: z
    .object({
      normal: z.number().min(5),
      long: z.number().min(5),
    })
    .optional(),
});

const ArmorItemSchema = ItemBaseSchema.extend({
  type: z.literal(ItemCategory.Armor),
  armorClass: z.number().min(10).max(20),
  armorType: z.nativeEnum(ArmorType),
  strRequirement: z.number().min(1).optional(),
  stealthDisadvantage: z.boolean(),
});

const ItemSchema = z.discriminatedUnion("type", [
  WeaponItemSchema,
  ArmorItemSchema,
  ConsumableItemSchema,
  MagicalItemSchema,
  ItemBaseSchema,
]);

// Infer TypeScript type from Zod schema
type Item = z.infer<typeof ItemSchema>;
```

## Relationships & Dependencies

### User-Item Relationship

- **One-to-Many**: A user can create many items (`createdBy` field)
- **Future Enhancement (F030)**: Full user ownership model with permissions

### Character-Item Relationship

- **Future Enhancement (F012)**: Characters will have inventory arrays of `Item` references
- **Out of Scope for F011**: Item assignment to characters is deferred

### Party-Item Relationship

- **Future Enhancement (F012)**: Parties may have shared inventories
- **Out of Scope for F011**: Party inventory management is deferred

## Storage Strategy (MVP)

For the frontend MVP (F011), items are stored using mock adapters:

1. **In-Memory Storage**: `Map<string, Item>` for session persistence
2. **LocalStorage**: JSON serialization of items for cross-session persistence
3. **Seed Data**: 50+ D&D 5e SRD items preloaded from `src/lib/mocks/sampleItems.ts`

### Mock Adapter Interface

```typescript
interface ItemAdapter {
  /** Fetch all items with optional filtering */
  getAll(filters?: ItemFilters): Promise<Item[]>;

  /** Fetch single item by ID */
  getById(id: string): Promise<Item | null>;

  /** Create new item */
  create(item: Omit<Item, "id" | "createdAt" | "updatedAt">): Promise<Item>;

  /** Update existing item */
  update(id: string, updates: Partial<Item>): Promise<Item>;

  /** Delete item by ID */
  delete(id: string): Promise<boolean>;
}

interface ItemFilters {
  type?: ItemCategory;
  rarity?: ItemRarity;
  tags?: string[];
  searchQuery?: string;
}
```

## Future Backend Integration (F030)

When backend persistence is implemented:

- Replace mock adapter with API client calling REST endpoints
- Add MongoDB collections with Mongoose schemas mirroring TypeScript interfaces
- Implement pagination for large datasets (>1000 items)
- Add full-text search via MongoDB Atlas Search or Elasticsearch

---

**Data Model Status**: ✅ Complete
