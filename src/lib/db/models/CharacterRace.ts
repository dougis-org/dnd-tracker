import mongoose, { Schema, models } from 'mongoose';

export interface CharacterAbilityBonuses {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface ICharacterRace extends mongoose.Document {
  name: string;
  abilityBonuses: CharacterAbilityBonuses;
  traits: string[];
  description: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const AbilityBonusesSchema = new Schema<CharacterAbilityBonuses>(
  {
    str: { type: Number, min: 0, max: 2, default: 0 },
    dex: { type: Number, min: 0, max: 2, default: 0 },
    con: { type: Number, min: 0, max: 2, default: 0 },
    int: { type: Number, min: 0, max: 2, default: 0 },
    wis: { type: Number, min: 0, max: 2, default: 0 },
    cha: { type: Number, min: 0, max: 2, default: 0 },
  },
  { _id: false }
);

const CharacterRaceSchema = new Schema<ICharacterRace>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    abilityBonuses: {
      type: AbilityBonusesSchema,
      required: true,
      default: () => ({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }),
    },
    traits: {
      type: [String],
      required: true,
      default: [],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      default: 'PHB',
    },
  },
  {
    timestamps: true,
    collection: 'races',
  }
);

CharacterRaceSchema.index({ name: 1 }, { unique: true });

export const CharacterRace =
  models.CharacterRace ||
  mongoose.model<ICharacterRace>('CharacterRace', CharacterRaceSchema);
