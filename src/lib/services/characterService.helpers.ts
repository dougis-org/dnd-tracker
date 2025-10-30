/**
 * Shared helpers for characterService to reduce duplication
 */

import type {
  CharacterAbilityScores,
  CharacterCachedStats,
  CharacterClassLevel,
  CharacterStatsSource,
} from '@/lib/db/models/Character';
import type { CharacterDerivedStats } from '@/lib/db/models/characterDerivedStats';

export type CharacterDocumentLike = CharacterStatsSource & {
  _id: unknown;
  userId: unknown;
  name: string;
  raceId: unknown;
  abilityScores: CharacterAbilityScores;
  classes: CharacterClassLevel[];
  hitPoints: number;
  cachedStats?: CharacterCachedStats;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  toObject?: () => CharacterDocumentLike;
};

export interface CharacterRecord {
  id: string;
  userId: string;
  name: string;
  raceId: string;
  abilityScores: CharacterAbilityScores;
  classes: CharacterClassLevel[];
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  initiative: number;
  totalLevel: number;
  proficiencyBonus: number;
  cachedStats: CharacterCachedStats;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

/**
 * Convert Mongoose document to plain object
 */
export const toPlainDocument = (
  document: CharacterDocumentLike
): CharacterDocumentLike => {
  if (typeof document.toObject === 'function') {
    return document.toObject() as CharacterDocumentLike;
  }
  return document;
};

/**
 * Normalize a value that might be an ObjectId or string to a string
 */
export const normaliseIdentifier = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    return (value as { toString(): string }).toString();
  }
  throw new TypeError('Expected value with string representation');
};

/**
 * Convert a Mongoose document to CharacterRecord format
 */
export const normaliseCharacterDocument = (
  document: CharacterDocumentLike,
  derivedStats: CharacterDerivedStats
): CharacterRecord => {
  const cachedStats: CharacterCachedStats = document.cachedStats ?? {
    abilityModifiers: derivedStats.abilityModifiers,
    proficiencyBonus: derivedStats.proficiencyBonus,
    skills: derivedStats.skills,
    savingThrows: derivedStats.savingThrows,
  };

  const record: CharacterRecord = {
    id: normaliseIdentifier(document._id),
    userId: normaliseIdentifier(document.userId),
    name: document.name,
    raceId: normaliseIdentifier(document.raceId),
    abilityScores: document.abilityScores,
    classes: document.classes,
    hitPoints: document.hitPoints,
    maxHitPoints: derivedStats.maxHitPoints,
    armorClass: derivedStats.armorClass,
    initiative: derivedStats.initiative,
    totalLevel: derivedStats.totalLevel,
    proficiencyBonus: derivedStats.proficiencyBonus,
    cachedStats,
    deletedAt: document.deletedAt ?? null,
  };

  if (document.createdAt) {
    record.createdAt = document.createdAt;
  }
  if (document.updatedAt) {
    record.updatedAt = document.updatedAt;
  }

  return record;
};
