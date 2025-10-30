/**
 * Test fixtures and helpers for characterService tests
 * Extracted to reduce duplication across 25 test clones
 */

import type { Types } from 'mongoose';

export const MOCK_DERIVED_STATS = {
  totalLevel: 5,
  proficiencyBonus: 3,
  armorClass: 12,
  initiative: 2,
  maxHitPoints: 39,
  abilityModifiers: {
    str: 1,
    dex: 2,
    con: 2,
    int: 1,
    wis: 0,
    cha: -1,
  },
  skills: {
    acrobatics: 4,
    animalHandling: 0,
    arcana: 3,
    athletics: 3,
    deception: 2,
    history: 3,
    insight: 0,
    intimidation: 2,
    investigation: 3,
    medicine: 0,
    nature: 3,
    perception: 0,
    performance: 2,
    persuasion: 2,
    religion: 3,
    sleightOfHand: 4,
    stealth: 4,
    survival: 0,
  },
  savingThrows: {
    str: 4,
    dex: 5,
    con: 4,
    int: 3,
    wis: 0,
    cha: 2,
  },
} as const;

export const MOCK_USER_ID = '507f191e810c19729de860ea';

export const BASE_CHARACTER_PAYLOAD = {
  name: 'Test Character',
  raceId: '5f6b9c3e2a1234567890abcd',
  abilityScores: {
    str: 12,
    dex: 14,
    con: 14,
    int: 10,
    wis: 11,
    cha: 9,
  },
  classes: [
    { classId: 'fighter', level: 3 },
    { classId: 'wizard', level: 2 },
  ],
  hitPoints: 32,
};

/**
 * Creates a mock Mongoose document with toObject method
 */
export function createMockCharacterDocument(
  overrides: Record<string, unknown> = {}
) {
  return {
    _id: '60f7d16d2f1bbf1a3c3f1f3a',
    userId: MOCK_USER_ID,
    ...BASE_CHARACTER_PAYLOAD,
    maxHitPoints: MOCK_DERIVED_STATS.maxHitPoints,
    armorClass: MOCK_DERIVED_STATS.armorClass,
    initiative: MOCK_DERIVED_STATS.initiative,
    cachedStats: {
      abilityModifiers: MOCK_DERIVED_STATS.abilityModifiers,
      proficiencyBonus: MOCK_DERIVED_STATS.proficiencyBonus,
      skills: MOCK_DERIVED_STATS.skills,
      savingThrows: MOCK_DERIVED_STATS.savingThrows,
    },
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-02T00:00:00.000Z'),
    deletedAt: null,
    toObject(this: Record<string, unknown>) {
      const { toObject: _omit, ...rest } = this;
      return rest;
    },
    ...overrides,
  };
}

/**
 * Creates multiple mock character documents for list tests
 */
export function createMockCharacterDocuments(
  count: number = 2
): Record<string, unknown>[] {
  return Array.from({ length: count }, (_, i) => 
    createMockCharacterDocument({
      _id: `${60 + i}f7d16d2f1bbf1a3c3f1f3${i}`,
      name: i === 0 ? BASE_CHARACTER_PAYLOAD.name : `Character ${i + 1}`,
      cachedStats: i === 0 
        ? {
            abilityModifiers: MOCK_DERIVED_STATS.abilityModifiers,
            proficiencyBonus: MOCK_DERIVED_STATS.proficiencyBonus,
            skills: MOCK_DERIVED_STATS.skills,
            savingThrows: MOCK_DERIVED_STATS.savingThrows,
          }
        : undefined,
    })
  );
}

/**
 * Default filter for user queries
 */
export const DEFAULT_USER_FILTERS = {
  userId: MOCK_USER_ID,
  deletedAt: null,
};
