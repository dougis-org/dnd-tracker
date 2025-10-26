import mongoose, { Schema, models } from 'mongoose';

const HIT_DICE = ['d6', 'd8', 'd10', 'd12'] as const;
const SPELLCASTING_ABILITIES = ['int', 'wis', 'cha'] as const;

export interface CharacterClassProficiencies {
  armorTypes: string[];
  weaponTypes: string[];
  savingThrows: string[];
}

export interface ICharacterClass extends mongoose.Document {
  name: string;
  hitDie: (typeof HIT_DICE)[number];
  proficiencies: CharacterClassProficiencies;
  spellcasting: boolean;
  spellAbility?: (typeof SPELLCASTING_ABILITIES)[number];
  description: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProficienciesSchema = new Schema<CharacterClassProficiencies>(
  {
    armorTypes: {
      type: [String],
      required: true,
      default: [],
    },
    weaponTypes: {
      type: [String],
      required: true,
      default: [],
    },
    savingThrows: {
      type: [String],
      required: true,
      default: [],
    },
  },
  { _id: false }
);

const CharacterClassSchema = new Schema<ICharacterClass>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    hitDie: {
      type: String,
      required: true,
      enum: HIT_DICE,
    },
    proficiencies: {
      type: ProficienciesSchema,
      required: true,
      default: () => ({ armorTypes: [], weaponTypes: [], savingThrows: [] }),
    },
    spellcasting: {
      type: Boolean,
      required: true,
      default: false,
    },
    spellAbility: {
      type: String,
      enum: SPELLCASTING_ABILITIES,
      required: function requiredSpellAbility(this: ICharacterClass) {
        return this.spellcasting;
      },
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
    collection: 'classes',
  }
);

CharacterClassSchema.index({ name: 1 }, { unique: true });

export const CharacterClass =
  models.CharacterClass ||
  mongoose.model<ICharacterClass>('CharacterClass', CharacterClassSchema);
