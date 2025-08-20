# Creature Model Implementation

## Objective
Create comprehensive creature/monster schema with legendary and lair actions

## Schema Definition

```typescript
// models/Creature.ts
export interface ICreature {
  // Ownership
  userId?: string; // Optional for system creatures
  isSystemCreature: boolean;
  
  // Basic Info
  name: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  type: string; // beast, humanoid, dragon, etc.
  alignment: string;
  
  // Combat Stats
  armorClass: number;
  hitPoints: {
    average: number;
    formula: string; // e.g., "8d10 + 16"
  };
  speed: {
    walk: number;
    swim?: number;
    fly?: number;
    burrow?: number;
  };
  
  // Challenge Rating
  challengeRating: number;
  experiencePoints: number;
  proficiencyBonus: number;
  
  // Legendary Actions
  legendaryActions?: {
    count: number;
    actions: Array<{
      name: string;
      cost: number;
      description: string;
    }>;
  };
  
  // Lair Actions
  lairActions?: {
    description: string;
    initiativeCount: 20;
    actions: Array<{
      name: string;
      description: string;
      effect: string;
    }>;
  };
}
```