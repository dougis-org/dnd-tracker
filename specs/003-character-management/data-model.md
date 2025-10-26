# Data Model: Character Management System

**Feature**: 003 - Character Management System  
**Date**: 2025-10-21  
**Status**: Ready for Implementation

## Overview

This document defines the MongoDB/Mongoose schemas and relationships for Feature 003 (Character Management System). All characters are owned by users, support D&D 5e stat blocks, and enforce tier-based usage limits.

## Core Entities

### 1. Character (Aggregate Root)

Primary entity representing a player character or NPC.

**Schema**:

```typescript
interface Character {
  _id: ObjectId;
  userId: ObjectId;                          // User who owns this character
  name: string;                              // Character name (1-100 chars)
  raceId: ObjectId;                          // Reference to Race entity
  abilityScores: {
    str: number;    // Strength (1-20)
    dex: number;    // Dexterity (1-20)
    con: number;    // Constitution (1-20)
    int: number;    // Intelligence (1-20)
    wis: number;    // Wisdom (1-20)
    cha: number;    // Charisma (1-20)
  };
  classes: [
    {
      classId: ObjectId;
      level: number;  // 1-20
    }
  ];
  hitPoints: number;                         // Current HP
  maxHitPoints: number;                      // Auto-calculated from CON + class HD
  armorClass: number;                        // Auto-calculated (10 + DEX mod)
  initiative: number;                        // Auto-calculated (DEX mod)
  cachedStats: {
    abilityModifiers: AbilityModifiers;
    proficiencyBonus: number;
    skills: Record<string, number>;
    savingThrows: Record<string, number>;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;                    // Soft delete marker
}
```

**Indexes**:
- `{ userId: 1, deletedAt: 1 }` - Fast user-scoped queries
- `{ userId: 1, name: 'text' }` - Text search by name
- `{ userId: 1, createdAt: -1 }` - Recent characters
- `{ deletedAt: 1 }` - Find deleted for hard-delete job

**Validation**:
- `name`: required, 1-100 chars, trimmed
- `userId`: required, must exist in User collection
- `raceId`: required, must exist in Race collection
- `abilityScores`: all required, 1-20 range
- `classes`: required, min 1 class, max 20 total levels
- `hitPoints`: >= 0, <= maxHitPoints
- `maxHitPoints`: >= hitPoints, calculated from CON modifier + class hit dice

**Relationships**:
- `userId` → User (many-to-one, owner)
- `raceId` → Race (many-to-one, configuration)
- `classes[].classId` → Class (many-to-one per class)
- Referenced by PartyMember (many-to-many with Party)
- Referenced by EncounterParticipant (many-to-many with Encounter)

---

### 2. Race (System Entity)

Configuration entity defining D&D 5e race information.

**Schema**:

```typescript
interface Race {
  _id: ObjectId;
  name: string;                              // E.g., "Human", "Elf", "Dwarf"
  abilityBonuses: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  traits: string[];                          // E.g., ["Darkvision", "Dwarven Resilience"]
  description: string;                       // Markdown description
  source: string;                            // E.g., "PHB", "XGTE"
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `{ name: 1 }` - Unique lookup by name

**Validation**:
- `name`: required, 1-50 chars
- `abilityBonuses`: each modifier 0-2 (D&D 5e standard)
- `traits`: array of strings

**Relationships**:
- Referenced by Character (many-to-one, configuration)

**Initial Seed Data** (9 races):
- Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling

---

### 3. Class (System Entity)

Configuration entity defining D&D 5e class information.

**Schema**:

```typescript
interface Class {
  _id: ObjectId;
  name: string;                              // E.g., "Fighter", "Wizard"
  hitDie: string;                            // E.g., "d8", "d10", "d12"
  proficiencies: {
    armorTypes: string[];
    weaponTypes: string[];
    savingThrows: string[];
  };
  spellcasting: boolean;                     // Can this class cast spells?
  spellAbility?: string;                     // "int", "wis", "cha" (if spellcasting)
  description: string;                       // Markdown description
  source: string;                            // E.g., "PHB"
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `{ name: 1 }` - Unique lookup by name

**Validation**:
- `name`: required, 1-50 chars
- `hitDie`: required, one of "d6", "d8", "d10", "d12"
- `spellAbility`: required if spellcasting=true

**Relationships**:
- Referenced by Character (many-to-one per class in multiclass array)

**Initial Seed Data** (12 classes):
- Barbarian (d12), Bard (d8), Cleric (d8), Druid (d8), Fighter (d10), Monk (d8), Paladin (d10), Ranger (d10), Rogue (d8), Sorcerer (d6), Warlock (d8), Wizard (d6)

---

## Derived Calculations

All derived values calculated at read-time and cached in `Character.cachedStats`. Recalculated when base stats change.

### Ability Modifiers

```
modifier(score) = floor((score - 10) / 2)
```

Example: STR 14 → +2 modifier, DEX 9 → -1 modifier

### Proficiency Bonus

```
proficiencyBonus(totalLevel) = ceil(totalLevel / 4) + 1

Level 1-4: +2
Level 5-8: +3
Level 9-12: +4
Level 13-16: +5
Level 17-20: +6
```

### Armor Class

```
AC = 10 + DEX modifier [+ armor bonus, not tracked in this feature]
```

### Initiative

```
initiative = DEX modifier
```

### Skill Modifiers

```
skillModifier(ability, isProficient) =
  abilityModifier(ability) + (isProficient ? proficiencyBonus : 0)
```

### Saving Throws

```
savingThrow(ability, isProficient) =
  abilityModifier(ability) + (isProficient ? proficiencyBonus : 0)
```

### Hit Points

```
maxHP = (hitDie[0] / 2 + 1) + CON modifier     [level 1]
      + (hitDie[1] + CON modifier)              [level 2]
      + (hitDie[2] + CON modifier)              [level 3]
      ... for each multiclass level

Example: Fighter 3 (d10) + Wizard 2 (d6), CON 14 (+2 mod):
= (10/2 + 1 + 2) + (8 + 2) + (5 + 2) + (6 + 2) + (4 + 2)
= 8 + 10 + 7 + 8 + 6
= 39 HP
```

---

## State Transitions

### Character Lifecycle

```
Created
  ↓
[Active] ← ← → [Soft Deleted] (can recover within 30 days)
  ↓
[Hard Deleted] (after 30 days)
```

**State Transitions**:
- Created → Active: On creation
- Active → Soft Deleted: On delete request, sets `deletedAt = now`
- Soft Deleted → Active: On restore request (admin), clears `deletedAt`
- Soft Deleted → Hard Deleted: By cron job, after 30 days

**List Queries** always filter: `{ deletedAt: null }`

---

## Usage Metrics Integration

Character creation enforces tier limits stored in User.subscription:

```typescript
interface User {
  // ... other fields ...
  subscription: {
    tier: "free" | "seasoned" | "expert";
    creatureLimit: number;     // 10, 50, or 250
  };
}
```

**Tier Limits**:
- Free: 10 creatures max
- Seasoned: 50 creatures max
- Expert: 250 creatures max

**Enforcement**:
1. Before creating character: Query `Character.count({ userId, deletedAt: null })`
2. If count >= limit: Return 403 Forbidden with upgrade prompt
3. If count >= (limit * 0.8): Show warning "8 of 10 creature slots used"

---

## API Contract

See `/contracts/characters-api.yaml` for complete RESTful API specification.

**Main Endpoints**:
- `POST /api/characters` - Create character
- `GET /api/characters` - List characters (paginated, searchable)
- `GET /api/characters/:id` - Get character details
- `PUT /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Soft delete character
- `POST /api/characters/:id/duplicate` - Duplicate character

---

## Implementation Notes

### Caching Strategy

Derived values (`cachedStats`) cached in database to optimize list views:

**When to Invalidate**:
- After character creation
- After character update (ability scores, race, classes change)
- After hard delete

**Recalculation**:
```typescript
function recalculateStats(character: Character): CachedStats {
  return {
    abilityModifiers: calculateModifiers(character.abilityScores),
    proficiencyBonus: calculateProficiency(character.totalLevel),
    skills: calculateSkills(character.abilityScores, character.race, character.classes),
    savingThrows: calculateSavingThrows(character.abilityScores, character.classes),
  };
}
```

### Search Performance

**Full-text search** by name uses text index for fast substring matching:

```
db.characters.find({ $text: { $search: "leg" }, userId: userId, deletedAt: null })
```

**Filters** use exact match (indexed):

```
db.characters.find({ "classes.classId": classId, userId: userId, deletedAt: null })
```

### Soft Delete Cleanup

**Daily cron job** (runs at 2 AM UTC):

```typescript
db.characters.deleteMany({
  deletedAt: { $lt: Date.now() - (30 * 24 * 60 * 60 * 1000) }
});
```

---

## References

- **Feature Specification**: `specs/003-character-management/spec.md`
- **Research & Design**: `specs/003-character-management/research.md`
- **API Contract**: `specs/003-character-management/contracts/characters-api.yaml`
- **D&D 5e SRD**: Used for ability calculations, class hit dice, proficiency bonuses
