import type { Document, FilterQuery, Model, Types } from 'mongoose';

import type {
  CharacterAbilityModifiers,
  CharacterAbilityScores,
  CharacterCachedStats,
  CharacterClassLevel,
  CharacterDerivedStats,
  CharacterDerivedStatsInput,
  CharacterStatsSource,
} from './characterDerivedStats';
import {
  calculateDerivedStatsCore,
  getDerivedStatsCore,
} from './characterDerivedStats';

type MongooseModule = typeof import('mongoose');

let cachedMongoose: MongooseModule | null | undefined;

const getMongoose = (): MongooseModule | null => {
  if (cachedMongoose !== undefined) {
    return cachedMongoose;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    cachedMongoose = require('mongoose');
  } catch (error) {
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
      cachedMongoose = null;
    } else {
      throw error;
    }
  }

  return cachedMongoose ?? null;
};

export interface ICharacter extends Document {
  userId: Types.ObjectId;
  name: string;
  raceId: Types.ObjectId;
  abilityScores: CharacterAbilityScores;
  classes: CharacterClassLevel[];
  hitPoints: number;
  maxHitPoints: number;
  armorClass: number;
  initiative: number;
  cachedStats: CharacterCachedStats;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CharacterModelStatics {
  calculateDerivedStats(
    input: CharacterDerivedStatsInput
  ): CharacterDerivedStats;
  getDerivedStats(character: CharacterStatsSource): CharacterDerivedStats;
  fromUserQuery(
    userId: string | Types.ObjectId,
    includeDeleted?: boolean
  ): FilterQuery<ICharacter>;
}

export type CharacterModelType = Model<ICharacter> & CharacterModelStatics;

const buildUserQuery = (
  mongooseInstance: MongooseModule | null,
  userId: string | Types.ObjectId,
  includeDeleted = false
): FilterQuery<ICharacter> => {
  if (!mongooseInstance) {
    const filter: FilterQuery<ICharacter> = {
      userId: userId as Types.ObjectId,
    };
    if (!includeDeleted) {
      filter.deletedAt = null as unknown as Date;
    }
    return filter;
  }

  const { Types: MongooseTypes } = mongooseInstance;

  if (userId instanceof MongooseTypes.ObjectId) {
    const filter: FilterQuery<ICharacter> = { userId };
    if (!includeDeleted) {
      filter.deletedAt = null;
    }
    return filter;
  }

  if (!MongooseTypes.ObjectId.isValid(userId)) {
    throw new TypeError('Invalid ObjectId provided');
  }

  const objectId = new MongooseTypes.ObjectId(userId);
  const filter: FilterQuery<ICharacter> = { userId: objectId };
  if (!includeDeleted) {
    filter.deletedAt = null;
  }
  return filter;
};

const createCharacterModel = (
  mongooseInstance: MongooseModule
): CharacterModelType => {
  const { Schema, model, models } = mongooseInstance;

  const AbilityScoresSchema = new Schema<CharacterAbilityScores>(
    {
      str: { type: Number, required: true, min: 1, max: 20 },
      dex: { type: Number, required: true, min: 1, max: 20 },
      con: { type: Number, required: true, min: 1, max: 20 },
      int: { type: Number, required: true, min: 1, max: 20 },
      wis: { type: Number, required: true, min: 1, max: 20 },
      cha: { type: Number, required: true, min: 1, max: 20 },
    },
    { _id: false }
  );

  const AbilityModifiersSchema = new Schema<CharacterAbilityModifiers>(
    {
      str: { type: Number, required: true, min: -5, max: 10 },
      dex: { type: Number, required: true, min: -5, max: 10 },
      con: { type: Number, required: true, min: -5, max: 10 },
      int: { type: Number, required: true, min: -5, max: 10 },
      wis: { type: Number, required: true, min: -5, max: 10 },
      cha: { type: Number, required: true, min: -5, max: 10 },
    },
    { _id: false }
  );

  const ClassLevelSchema = new Schema<CharacterClassLevel>(
    {
      classId: {
        type: Schema.Types.ObjectId,
        ref: 'CharacterClass',
        required: true,
      },
      level: { type: Number, required: true, min: 1, max: 20 },
    },
    { _id: false }
  );

  const CachedStatsSchema = new Schema<CharacterCachedStats>(
    {
      abilityModifiers: { type: AbilityModifiersSchema, required: true },
      proficiencyBonus: { type: Number, required: true, min: 2, max: 6 },
      skills: { type: Map, of: Number, required: true, default: {} },
      savingThrows: { type: Map, of: Number, required: true, default: {} },
    },
    { _id: false }
  );

  const CharacterSchema = new Schema<ICharacter, CharacterModelType>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 100,
      },
      raceId: {
        type: Schema.Types.ObjectId,
        ref: 'CharacterRace',
        required: true,
        index: true,
      },
      abilityScores: { type: AbilityScoresSchema, required: true },
      classes: {
        type: [ClassLevelSchema],
        required: true,
        validate: {
          validator(value: CharacterClassLevel[]) {
            return Array.isArray(value) && value.length > 0;
          },
          message: 'At least one class level is required for a character',
        },
      },
      hitPoints: { type: Number, required: true, min: 0 },
      maxHitPoints: { type: Number, required: true, min: 0 },
      armorClass: { type: Number, required: true, min: 0 },
      initiative: { type: Number, required: true },
      cachedStats: { type: CachedStatsSchema, required: true },
      deletedAt: { type: Date, default: null },
    },
    { timestamps: true, collection: 'characters' }
  );

  CharacterSchema.index({ userId: 1, deletedAt: 1 });
  CharacterSchema.index({ userId: 1, name: 'text' });
  CharacterSchema.index({ userId: 1, createdAt: -1 });
  CharacterSchema.index({ deletedAt: 1 });

  CharacterSchema.statics.calculateDerivedStats =
    function calculateDerivedStats(
      input: CharacterDerivedStatsInput
    ): CharacterDerivedStats {
      return calculateDerivedStatsCore(input);
    };

  CharacterSchema.statics.getDerivedStats = function getDerivedStats(
    character: CharacterStatsSource
  ): CharacterDerivedStats {
    return getDerivedStatsCore(character);
  };

  CharacterSchema.statics.fromUserQuery = function fromUserQuery(
    userId: string | Types.ObjectId,
    includeDeleted = false
  ): FilterQuery<ICharacter> {
    return buildUserQuery(mongooseInstance, userId, includeDeleted);
  };

  return (
    (models.Character as CharacterModelType) ||
    model<ICharacter, CharacterModelType>('Character', CharacterSchema)
  );
};

const mongooseInstance = getMongoose();

export const CharacterModel: CharacterModelType =
  mongooseInstance !== null
    ? createCharacterModel(mongooseInstance)
    : (class StandaloneCharacterModel {
        static calculateDerivedStats(
          input: CharacterDerivedStatsInput
        ): CharacterDerivedStats {
          return calculateDerivedStatsCore(input);
        }

        static getDerivedStats(
          character: CharacterStatsSource
        ): CharacterDerivedStats {
          return getDerivedStatsCore(character);
        }

        static fromUserQuery(
          userId: string | Types.ObjectId,
          includeDeleted = false
        ): FilterQuery<ICharacter> {
          return buildUserQuery(null, userId, includeDeleted);
        }
      } as unknown as CharacterModelType);

export type {
  CharacterAbilityModifiers,
  CharacterAbilityScores,
  CharacterCachedStats,
  CharacterClassLevel,
  CharacterClassMetadata,
  CharacterClassMetadataMap,
  CharacterDerivedStats,
  CharacterDerivedStatsInput,
  CharacterSkills,
  CharacterSavingThrows,
  CharacterStatsSource,
  SkillKey,
} from './characterDerivedStats';

export default CharacterModel;
