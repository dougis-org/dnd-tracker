import type { Types } from 'mongoose';

import {
  AbilityScoreKey,
  AbilityScores,
  ClassHitDie,
  ClassLevelInput,
  DerivedStats as BaseDerivedStats,
  calculateDerivedStats as calculateBaseDerivedStats,
} from '@/lib/services/dnd5e-calculations';

const ABILITY_KEYS: AbilityScoreKey[] = [
  'str',
  'dex',
  'con',
  'int',
  'wis',
  'cha',
];

const SKILL_DEFINITIONS = [
  { key: 'acrobatics', ability: 'dex' },
  { key: 'animalHandling', ability: 'wis' },
  { key: 'arcana', ability: 'int' },
  { key: 'athletics', ability: 'str' },
  { key: 'deception', ability: 'cha' },
  { key: 'history', ability: 'int' },
  { key: 'insight', ability: 'wis' },
  { key: 'intimidation', ability: 'cha' },
  { key: 'investigation', ability: 'int' },
  { key: 'medicine', ability: 'wis' },
  { key: 'nature', ability: 'int' },
  { key: 'perception', ability: 'wis' },
  { key: 'performance', ability: 'cha' },
  { key: 'persuasion', ability: 'cha' },
  { key: 'religion', ability: 'int' },
  { key: 'sleightOfHand', ability: 'dex' },
  { key: 'stealth', ability: 'dex' },
  { key: 'survival', ability: 'wis' },
] as const;

export type SkillKey = (typeof SKILL_DEFINITIONS)[number]['key'];

export interface CharacterAbilityScores extends AbilityScores {}

export interface CharacterAbilityModifiers {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface CharacterSkills extends Record<SkillKey, number> {}

export interface CharacterSavingThrows
  extends Record<AbilityScoreKey, number> {}

export interface CharacterCachedStats {
  abilityModifiers: CharacterAbilityModifiers;
  proficiencyBonus: number;
  skills: CharacterSkills;
  savingThrows: CharacterSavingThrows;
}

export interface CharacterClassLevel {
  classId: Types.ObjectId | string;
  level: number;
  hitDie?: ClassHitDie;
  savingThrows?: AbilityScoreKey[];
  name?: string;
}

export interface CharacterClassMetadata {
  id: string;
  slug?: string;
  name?: string;
  hitDie: ClassHitDie;
  savingThrows: AbilityScoreKey[];
}

export type CharacterClassMetadataMap = Record<string, CharacterClassMetadata>;

export interface CharacterDerivedStatsInput {
  abilityScores: CharacterAbilityScores;
  classes: CharacterClassLevel[];
  baseArmorClass?: number;
  classMetadata?: CharacterClassMetadataMap;
  proficientSkills?: SkillKey[];
  bonusSavingThrows?: AbilityScoreKey[];
}

export interface CharacterDerivedStats extends BaseDerivedStats {
  skills: CharacterSkills;
  savingThrows: CharacterSavingThrows;
}

export interface CharacterStatsSource {
  abilityScores: CharacterAbilityScores;
  classes: CharacterClassLevel[];
  cachedStats?: CharacterCachedStats;
  maxHitPoints: number;
  armorClass: number;
  initiative: number;
}

const CLASS_RULES: Record<string, CharacterClassMetadata> = {
  barbarian: {
    id: 'barbarian',
    slug: 'barbarian',
    name: 'Barbarian',
    hitDie: 'd12',
    savingThrows: ['str', 'con'],
  },
  bard: {
    id: 'bard',
    slug: 'bard',
    name: 'Bard',
    hitDie: 'd8',
    savingThrows: ['dex', 'cha'],
  },
  cleric: {
    id: 'cleric',
    slug: 'cleric',
    name: 'Cleric',
    hitDie: 'd8',
    savingThrows: ['wis', 'cha'],
  },
  druid: {
    id: 'druid',
    slug: 'druid',
    name: 'Druid',
    hitDie: 'd8',
    savingThrows: ['int', 'wis'],
  },
  fighter: {
    id: 'fighter',
    slug: 'fighter',
    name: 'Fighter',
    hitDie: 'd10',
    savingThrows: ['str', 'con'],
  },
  monk: {
    id: 'monk',
    slug: 'monk',
    name: 'Monk',
    hitDie: 'd8',
    savingThrows: ['str', 'dex'],
  },
  paladin: {
    id: 'paladin',
    slug: 'paladin',
    name: 'Paladin',
    hitDie: 'd10',
    savingThrows: ['wis', 'cha'],
  },
  ranger: {
    id: 'ranger',
    slug: 'ranger',
    name: 'Ranger',
    hitDie: 'd10',
    savingThrows: ['str', 'dex'],
  },
  rogue: {
    id: 'rogue',
    slug: 'rogue',
    name: 'Rogue',
    hitDie: 'd8',
    savingThrows: ['dex', 'int'],
  },
  sorcerer: {
    id: 'sorcerer',
    slug: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 'd6',
    savingThrows: ['con', 'cha'],
  },
  warlock: {
    id: 'warlock',
    slug: 'warlock',
    name: 'Warlock',
    hitDie: 'd8',
    savingThrows: ['wis', 'cha'],
  },
  wizard: {
    id: 'wizard',
    slug: 'wizard',
    name: 'Wizard',
    hitDie: 'd6',
    savingThrows: ['int', 'wis'],
  },
};

const normaliseKey = (value: string): string => value.trim().toLowerCase();

const resolveClassMetadata = (
  entry: CharacterClassLevel,
  metadataMap: CharacterClassMetadataMap | undefined
): CharacterClassMetadata => {
  if (entry.hitDie) {
    const metadata: CharacterClassMetadata = {
      id:
        typeof entry.classId === 'string'
          ? entry.classId
          : entry.classId.toString(),
      hitDie: entry.hitDie,
      savingThrows: entry.savingThrows ?? [],
    };

    if (typeof entry.classId === 'string') {
      const slug = normaliseKey(entry.classId);
      if (slug) {
        metadata.slug = slug;
      }
    }

    if (entry.name) {
      metadata.name = entry.name;
    }

    return metadata;
  }

  const lookupKey =
    typeof entry.classId === 'string'
      ? entry.classId
      : entry.classId.toString();
  const normalisedKey =
    typeof entry.classId === 'string' ? normaliseKey(entry.classId) : undefined;

  const fromMap =
    metadataMap?.[lookupKey] ??
    (normalisedKey ? metadataMap?.[normalisedKey] : undefined);
  if (fromMap) {
    return fromMap;
  }

  if (normalisedKey && CLASS_RULES[normalisedKey]) {
    return CLASS_RULES[normalisedKey];
  }

  throw new RangeError(`Missing class metadata for ${lookupKey}`);
};

const validateClasses = (classes: CharacterClassLevel[]): void => {
  if (!classes.length) {
    throw new RangeError('At least one class level is required');
  }

  classes.forEach((entry) => {
    if (!Number.isInteger(entry.level) || entry.level < 1) {
      throw new RangeError('Class levels must be integers >= 1');
    }
  });

  const totalLevel = classes.reduce((total, entry) => total + entry.level, 0);
  if (totalLevel > 20) {
    throw new RangeError('Total character level cannot exceed 20');
  }
};

const buildSavingThrowSet = (
  classes: CharacterClassLevel[],
  metadataMap: CharacterClassMetadataMap | undefined
): Set<AbilityScoreKey> => {
  return classes.reduce((acc, entry) => {
    const metadata = resolveClassMetadata(entry, metadataMap);
    metadata.savingThrows.forEach((ability) => acc.add(ability));
    return acc;
  }, new Set<AbilityScoreKey>());
};

const calculateSavingThrows = (
  abilityModifiers: CharacterAbilityModifiers,
  proficiencyBonus: number,
  proficientAbilities: Set<AbilityScoreKey>,
  additional: AbilityScoreKey[] = []
): CharacterSavingThrows => {
  const allProficiencies = new Set<AbilityScoreKey>([
    ...proficientAbilities,
    ...additional,
  ]);

  return ABILITY_KEYS.reduce((acc, ability) => {
    const proficient = allProficiencies.has(ability);
    acc[ability] =
      abilityModifiers[ability] + (proficient ? proficiencyBonus : 0);
    return acc;
  }, {} as CharacterSavingThrows);
};

const calculateSkillBonuses = (
  abilityModifiers: CharacterAbilityModifiers,
  proficiencyBonus: number,
  proficientSkills: Set<SkillKey>
): CharacterSkills => {
  return SKILL_DEFINITIONS.reduce((acc, definition) => {
    const proficient = proficientSkills.has(definition.key);
    acc[definition.key] =
      abilityModifiers[definition.ability] +
      (proficient ? proficiencyBonus : 0);
    return acc;
  }, {} as CharacterSkills);
};

export const calculateDerivedStatsCore = (
  input: CharacterDerivedStatsInput
): CharacterDerivedStats => {
  const {
    abilityScores,
    classes,
    baseArmorClass,
    classMetadata,
    proficientSkills,
    bonusSavingThrows,
  } = input;

  validateClasses(classes);

  const normalisedClasses: ClassLevelInput[] = classes.map((entry) => {
    const metadata = resolveClassMetadata(entry, classMetadata);
    return {
      className:
        metadata.name ??
        (typeof entry.classId === 'string'
          ? entry.classId
          : (metadata.slug ?? metadata.id)),
      hitDie: metadata.hitDie,
      level: entry.level,
    };
  });

  const baseStats = calculateBaseDerivedStats({
    abilityScores,
    classes: normalisedClasses,
    ...(baseArmorClass !== undefined ? { baseArmorClass } : {}),
  });

  const savingThrowProficiencies = buildSavingThrowSet(classes, classMetadata);
  const proficientSkillsSet = new Set<SkillKey>(proficientSkills ?? []);

  const savingThrows = calculateSavingThrows(
    baseStats.abilityModifiers,
    baseStats.proficiencyBonus,
    savingThrowProficiencies,
    bonusSavingThrows
  );
  const skills = calculateSkillBonuses(
    baseStats.abilityModifiers,
    baseStats.proficiencyBonus,
    proficientSkillsSet
  );

  return {
    ...baseStats,
    skills,
    savingThrows,
  };
};

export const getDerivedStatsCore = (
  character: CharacterStatsSource
): CharacterDerivedStats => {
  if (character.cachedStats) {
    const { abilityModifiers, proficiencyBonus, skills, savingThrows } =
      character.cachedStats;
    const totalLevel = character.classes.reduce(
      (total, entry) => total + entry.level,
      0
    );

    return {
      abilityModifiers,
      proficiencyBonus,
      armorClass: character.armorClass,
      initiative: character.initiative,
      maxHitPoints: character.maxHitPoints,
      totalLevel,
      skills,
      savingThrows,
    };
  }

  return calculateDerivedStatsCore({
    abilityScores: character.abilityScores,
    classes: character.classes,
  });
};
