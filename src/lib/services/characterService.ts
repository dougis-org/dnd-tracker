import {
  CharacterModel,
  type CharacterAbilityScores,
  type CharacterCachedStats,
  type CharacterClassLevel,
  type CharacterStatsSource,
  type SkillKey,
} from '@/lib/db/models/Character';
import type {
  CharacterDerivedStatsInput,
} from '@/lib/db/models/characterDerivedStats';
import { TIER_LIMITS, SubscriptionTier } from '@/lib/constants/tierLimits';
import {
  toPlainDocument,
  normaliseCharacterDocument,
  type CharacterDocumentLike,
  type CharacterRecord,
} from './characterService.helpers';

type SupportedTier = Extract<SubscriptionTier, 'free' | 'seasoned' | 'expert'>;

export interface TierUsage {
  used: number;
  limit: number;
  remaining: number;
}

export interface TierCheckResult {
  canCreate: boolean;
  shouldWarn: boolean;
  usage: TierUsage;
}

export interface TierCheckInput {
  subscriptionTier: SupportedTier;
  activeCharacterCount: number;
}

const SUPPORTED_TIERS: SupportedTier[] = ['free', 'seasoned', 'expert'];
const WARNING_THRESHOLD_RATIO = 0.8;

export interface CreateCharacterPayload {
  name: string;
  raceId: string;
  abilityScores: CharacterAbilityScores;
  classes: CharacterClassLevel[];
  hitPoints: number;
  baseArmorClass?: number;
  proficientSkills?: SkillKey[];
  bonusSavingThrows?: CharacterDerivedStatsInput['bonusSavingThrows'];
  classMetadata?: CharacterDerivedStatsInput['classMetadata'];
}

export interface CreateCharacterInput {
  userId: string;
  payload: CreateCharacterPayload;
}

export interface GetCharacterInput {
  userId: string;
  characterId: string;
  includeDeleted?: boolean;
}

export interface ListCharactersInput {
  userId: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListCharactersResult {
  characters: CharacterRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface UpdateCharacterInput {
  userId: string;
  characterId: string;
  updates: Partial<
    Pick<
      CreateCharacterPayload,
      'name' | 'abilityScores' | 'classes' | 'hitPoints' | 'baseArmorClass'
    >
  >;
}

export interface DeleteCharacterInput {
  userId: string;
  characterId: string;
}

export interface DuplicateCharacterInput {
  userId: string;
  characterId: string;
  newName?: string;
}

const clampHitPoints = (hitPoints: number, maxHitPoints: number): number => {
  if (!Number.isFinite(hitPoints)) {
    throw new TypeError('Character hit points must be a finite number');
  }

  const nonNegative = Math.max(0, Math.floor(hitPoints));
  return Math.min(nonNegative, maxHitPoints);
};

const resolveTierLimit = (tier: SupportedTier): number => {
  if (!SUPPORTED_TIERS.includes(tier)) {
    throw new RangeError(`Unsupported subscription tier: ${tier}`);
  }

  const tierDefinition = TIER_LIMITS[tier];
  const creatureLimit = tierDefinition.creatures;

  if (creatureLimit <= 0) {
    throw new RangeError(`Tier ${tier} must define a positive creature limit`);
  }

  return creatureLimit;
};

export class CharacterService {
  static async checkTierLimit(input: TierCheckInput): Promise<TierCheckResult> {
    const { subscriptionTier, activeCharacterCount } = input;

    if (!Number.isInteger(activeCharacterCount) || activeCharacterCount < 0) {
      throw new RangeError(
        'Active character count must be a non-negative integer'
      );
    }

    const limit = resolveTierLimit(subscriptionTier);

    if (activeCharacterCount >= limit) {
      throw new RangeError(
        'Character limit reached for current subscription tier'
      );
    }

    const remaining = limit - activeCharacterCount;
    const warningThreshold = Math.floor(limit * WARNING_THRESHOLD_RATIO);
    const shouldWarn = activeCharacterCount >= warningThreshold;

    const usage: TierUsage = {
      used: activeCharacterCount,
      limit,
      remaining,
    };

    return {
      canCreate: true,
      shouldWarn,
      usage,
    };
  }

  static async createCharacter({
    userId,
    payload,
  }: CreateCharacterInput): Promise<CharacterRecord> {
    if (!userId) {
      throw new TypeError('A userId is required to create a character');
    }

    if (!payload) {
      throw new TypeError('Character payload is required for creation');
    }

    const {
      name,
      raceId,
      abilityScores,
      classes,
      hitPoints,
      baseArmorClass,
      proficientSkills,
      bonusSavingThrows,
      classMetadata,
    } = payload;

    const derivedInput: CharacterDerivedStatsInput = {
      abilityScores,
      classes,
      ...(baseArmorClass !== undefined ? { baseArmorClass } : {}),
      ...(proficientSkills?.length ? { proficientSkills } : {}),
      ...(bonusSavingThrows?.length ? { bonusSavingThrows } : {}),
      ...(classMetadata ? { classMetadata } : {}),
    };

    const derivedStats = CharacterModel.calculateDerivedStats(derivedInput);

    const creationPayload = {
      userId,
      name,
      raceId,
      abilityScores,
      classes,
      hitPoints: clampHitPoints(hitPoints, derivedStats.maxHitPoints),
      maxHitPoints: derivedStats.maxHitPoints,
      armorClass: derivedStats.armorClass,
      initiative: derivedStats.initiative,
      cachedStats: {
        abilityModifiers: derivedStats.abilityModifiers,
        proficiencyBonus: derivedStats.proficiencyBonus,
        skills: derivedStats.skills,
        savingThrows: derivedStats.savingThrows,
      } satisfies CharacterCachedStats,
    };

    const created = await CharacterModel.create(creationPayload);
    const plain = toPlainDocument(created as CharacterDocumentLike);
    return normaliseCharacterDocument(plain, derivedStats);
  }

  static async getCharacter({
    userId,
    characterId,
    includeDeleted = false,
  }: GetCharacterInput): Promise<CharacterRecord> {
    if (!userId) {
      throw new TypeError('A userId is required to fetch a character');
    }

    if (!characterId) {
      throw new TypeError('A characterId is required to fetch a character');
    }

    const baseQuery = CharacterModel.fromUserQuery(userId, includeDeleted);
    const query = {
      ...baseQuery,
      _id: characterId,
    };

    const document = await CharacterModel.findOne(query);

    if (!document) {
      throw new RangeError('Character not found');
    }

    const plain = toPlainDocument(document as CharacterDocumentLike);
    const derivedStats = CharacterModel.getDerivedStats(
      plain as CharacterStatsSource
    );

    return normaliseCharacterDocument(plain, derivedStats);
  }

  static async listCharacters({
    userId,
    includeDeleted = false,
    page = 1,
    pageSize = 25,
  }: ListCharactersInput): Promise<ListCharactersResult> {
    if (!userId) {
      throw new TypeError('A userId is required to list characters');
    }

    if (!Number.isInteger(page) || page < 1) {
      throw new RangeError(
        'page must be an integer greater than or equal to 1'
      );
    }

    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new RangeError('pageSize must be an integer between 1 and 100');
    }

    const filters = CharacterModel.fromUserQuery(userId, includeDeleted);
    const skip = (page - 1) * pageSize;

    const [documents, total] = await Promise.all([
      CharacterModel.find(filters, null, {
        skip,
        limit: pageSize,
        sort: { createdAt: -1 },
      }),
      CharacterModel.countDocuments(filters),
    ]);

    const characters = documents.map((document) => {
      const plain = toPlainDocument(document as CharacterDocumentLike);
      const derived = CharacterModel.getDerivedStats(
        plain as CharacterStatsSource
      );
      return normaliseCharacterDocument(plain, derived);
    });

    const pages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      characters,
      pagination: {
        page,
        pageSize,
        total,
        pages,
      },
    };
  }

  static async updateCharacter({
    userId,
    characterId,
    updates,
  }: UpdateCharacterInput): Promise<CharacterRecord> {
    if (!userId) {
      throw new TypeError('A userId is required to update a character');
    }

    if (!characterId) {
      throw new TypeError('A characterId is required to update a character');
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new TypeError('At least one field must be provided for update');
    }

    // Recalculate derived stats if ability scores or classes changed
    let updatePayload: Record<string, unknown> = { ...updates };

    if ('abilityScores' in updates || 'classes' in updates) {
      // Fetch existing character to merge with updates for recalculation
      const existing = await CharacterModel.findOne({
        _id: characterId,
        ...CharacterModel.fromUserQuery(userId, false),
      });

      if (!existing) {
        throw new RangeError('Character not found');
      }

      const plain = toPlainDocument(existing as CharacterDocumentLike);
      const abilityScores = (updates.abilityScores ??
        plain.abilityScores) as CharacterAbilityScores;
      const classes = (updates.classes ??
        plain.classes) as CharacterClassLevel[];

      const derivedInput: CharacterDerivedStatsInput = {
        abilityScores,
        classes,
        ...(updates.baseArmorClass !== undefined
          ? { baseArmorClass: updates.baseArmorClass }
          : {}),
      };

      const derivedStats = CharacterModel.calculateDerivedStats(derivedInput);

      updatePayload = {
        ...updatePayload,
        maxHitPoints: derivedStats.maxHitPoints,
        armorClass: derivedStats.armorClass,
        initiative: derivedStats.initiative,
        cachedStats: {
          abilityModifiers: derivedStats.abilityModifiers,
          proficiencyBonus: derivedStats.proficiencyBonus,
          skills: derivedStats.skills,
          savingThrows: derivedStats.savingThrows,
        },
      };
    }

    const updated = await CharacterModel.findOneAndUpdate(
      { _id: characterId, userId },
      updatePayload,
      {
        new: true,
        runValidators: true,
        lean: true,
      }
    );

    if (!updated) {
      throw new RangeError('Character not found');
    }

    const plain = toPlainDocument(updated as CharacterDocumentLike);
    const derivedStats = CharacterModel.getDerivedStats(
      plain as CharacterStatsSource
    );

    return normaliseCharacterDocument(plain, derivedStats);
  }

  static async deleteCharacter({
    userId,
    characterId,
  }: DeleteCharacterInput): Promise<void> {
    if (!userId) {
      throw new TypeError('A userId is required to delete a character');
    }

    if (!characterId) {
      throw new TypeError('A characterId is required to delete a character');
    }

    const updated = await CharacterModel.findOneAndUpdate(
      { _id: characterId, userId },
      { deletedAt: new Date() },
      { new: true, lean: true }
    );

    if (!updated) {
      throw new RangeError('Character not found');
    }
  }

  static async duplicateCharacter({
    userId,
    characterId,
    newName,
  }: DuplicateCharacterInput): Promise<CharacterRecord> {
    if (!userId) {
      throw new TypeError('A userId is required to duplicate a character');
    }

    if (!characterId) {
      throw new TypeError('A characterId is required to duplicate a character');
    }

    const source = await CharacterModel.findOne({ _id: characterId, userId });

    if (!source) {
      throw new RangeError('Character not found');
    }

    const plain = toPlainDocument(source as CharacterDocumentLike);

    const nameForDuplicate = newName ?? `${plain.name} (Copy)`;

    const duplicationPayload = {
      userId,
      name: nameForDuplicate,
      raceId: plain.raceId,
      abilityScores: plain.abilityScores,
      classes: plain.classes,
      hitPoints: plain.hitPoints,
      maxHitPoints: plain.maxHitPoints,
      armorClass: plain.armorClass,
      initiative: plain.initiative,
      cachedStats: plain.cachedStats,
    };

    const duplicated = await CharacterModel.create(duplicationPayload);
    const duplicatedPlain = toPlainDocument(duplicated as CharacterDocumentLike);
    const derivedStats = CharacterModel.getDerivedStats(
      duplicatedPlain as CharacterStatsSource
    );

    return normaliseCharacterDocument(duplicatedPlain, derivedStats);
  }
}
