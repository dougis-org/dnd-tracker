/**
 * Sample monsters fixture for development and testing
 * Generates 200 representative D&D monsters for performance testing
 */

import { Monster } from '@/types/monster';

const MONSTER_NAMES = [
  'Goblin', 'Kobold', 'Orc', 'Hobgoblin', 'Gnoll',
  'Dire Wolf', 'Giant Spider', 'Wyvern', 'Manticore', 'Chimera',
  'Zombie', 'Skeleton', 'Vampire', 'Lich', 'Ghost',
  'Fire Elemental', 'Water Elemental', 'Air Elemental', 'Earth Elemental', 'Lightning Elemental',
  'Red Dragon', 'Blue Dragon', 'Green Dragon', 'Gold Dragon', 'Silver Dragon',
  'Griffon', 'Phoenix', 'Hydra', 'Basilisk', 'Medusa',
  'Treant', 'Dryad', 'Satyr', 'Nymph', 'Eladrin',
  'Succubus', 'Incubus', 'Demon', 'Devil', 'Celestial',
  'Giant', 'Hill Giant', 'Frost Giant', 'Fire Giant', 'Cloud Giant',
  'Beholder', 'Mind Flayer', 'Aboleth', 'Ancient Dragon', 'Tarrasque',
];

const TYPES = [
  'humanoid', 'beast', 'dragon', 'elemental', 'undead',
  'fiend', 'celestial', 'construct', 'giant', 'aberration',
];

const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;

const ALIGNMENTS = [
  'Chaotic Evil', 'Neutral Evil', 'Lawful Evil',
  'Chaotic Neutral', 'True Neutral', 'Lawful Neutral',
  'Chaotic Good', 'Neutral Good', 'Lawful Good',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickFromArray<T>(arr: readonly T[], seed: number): T {
  const index = Math.floor(seededRandom(seed) * arr.length);
  return arr[index];
}

function generateAbilities(seed: number) {
  return {
    str: 8 + Math.floor(seededRandom(seed) * 12),
    dex: 8 + Math.floor(seededRandom(seed + 1) * 12),
    con: 8 + Math.floor(seededRandom(seed + 2) * 12),
    int: 8 + Math.floor(seededRandom(seed + 3) * 12),
    wis: 8 + Math.floor(seededRandom(seed + 4) * 12),
    cha: 8 + Math.floor(seededRandom(seed + 5) * 12),
  };
}

export function generateSampleMonsters(count: number): Monster[] {
  const monsters: Monster[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < count; i++) {
    const seed = hashCode(`monster-${i}`);
    const name = `${pickFromArray(MONSTER_NAMES, seed)} ${Math.floor(i / MONSTER_NAMES.length) > 0 ? `(${Math.floor(i / MONSTER_NAMES.length)})` : ''}`.trim();

    monsters.push({
      id: `sample-${i}`,
      name,
      cr: Math.floor(seededRandom(seed + 100) * 30) / 2, // 0-15, some fractional
      size: pickFromArray(SIZES, seed + 200),
      type: pickFromArray(TYPES, seed + 300),
      alignment: Math.random() > 0.3 ? pickFromArray(ALIGNMENTS, seed + 400) : null,
      hp: 10 + Math.floor(seededRandom(seed + 500) * 200),
      ac: 10 + Math.floor(seededRandom(seed + 600) * 8),
      speed: '30 ft.',
      abilities: generateAbilities(seed + 700),
      resistances: seededRandom(seed + 800) > 0.5 ? ['fire'] : [],
      immunities: seededRandom(seed + 900) > 0.7 ? ['poison'] : [],
      conditionImmunities: [],
      senses: ['darkvision 60 ft.'],
      languages: seededRandom(seed + 1000) > 0.6 ? ['Common'] : [],
      tags: ['sample'],
      actions: [],
      legendaryActions: [],
      lairActions: [],
      ownerId: 'system',
      createdBy: 'system',
      scope: 'global',
      isPublic: true,
      publicAt: now,
      creditedTo: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  return monsters;
}
