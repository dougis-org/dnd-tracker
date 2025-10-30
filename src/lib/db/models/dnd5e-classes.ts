/**
 * D&D 5e class definitions with metadata
 */

import type { CharacterClassMetadataMap } from './characterDerivedStats';

const CLASSES = [
  { id: 'barbarian', name: 'Barbarian', hitDie: 'd12' as const, savingThrows: ['str', 'con'] as const },
  { id: 'bard', name: 'Bard', hitDie: 'd8' as const, savingThrows: ['dex', 'cha'] as const },
  { id: 'cleric', name: 'Cleric', hitDie: 'd8' as const, savingThrows: ['wis', 'cha'] as const },
  { id: 'druid', name: 'Druid', hitDie: 'd8' as const, savingThrows: ['int', 'wis'] as const },
  { id: 'fighter', name: 'Fighter', hitDie: 'd10' as const, savingThrows: ['str', 'con'] as const },
  { id: 'monk', name: 'Monk', hitDie: 'd8' as const, savingThrows: ['str', 'dex'] as const },
  { id: 'paladin', name: 'Paladin', hitDie: 'd10' as const, savingThrows: ['wis', 'cha'] as const },
  { id: 'ranger', name: 'Ranger', hitDie: 'd10' as const, savingThrows: ['str', 'dex'] as const },
  { id: 'rogue', name: 'Rogue', hitDie: 'd8' as const, savingThrows: ['dex', 'int'] as const },
  { id: 'sorcerer', name: 'Sorcerer', hitDie: 'd6' as const, savingThrows: ['con', 'cha'] as const },
  { id: 'warlock', name: 'Warlock', hitDie: 'd8' as const, savingThrows: ['wis', 'cha'] as const },
  { id: 'wizard', name: 'Wizard', hitDie: 'd6' as const, savingThrows: ['int', 'wis'] as const },
] as const;

export const CLASS_RULES: CharacterClassMetadataMap = CLASSES.reduce(
  (acc, cls) => {
    acc[cls.id] = {
      id: cls.id,
      slug: cls.id,
      name: cls.name,
      hitDie: cls.hitDie,
      savingThrows: [...cls.savingThrows],
    };
    return acc;
  },
  {} as CharacterClassMetadataMap
);
