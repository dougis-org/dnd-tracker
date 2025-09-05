/**
 * Shared utilities for Mongoose schema definitions
 * Eliminates duplication across model files
 */

import mongoose from 'mongoose';

/**
 * Standard transform function for toJSON
 * Converts _id to id and removes __v field
 */
export const standardJSONTransform = {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

/**
 * Standard transform function for toObject
 * Converts _id to id and removes __v field
 */
export const standardObjectTransform = {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
};

/**
 * Complete schema options with standard transforms
 */
export const getStandardSchemaOptions = () => ({
  timestamps: true,
  toJSON: standardJSONTransform,
  toObject: standardObjectTransform,
});

/**
 * Ability score field definition for D&D 5e
 */
export const abilityScoreField = {
  type: Number,
  required: true,
  min: 1,
  max: 30,
};

/**
 * Saving throw field definition for D&D 5e
 */
export const savingThrowField = {
  type: Boolean,
  default: false,
};

/**
 * D&D 5e specific validation ranges
 */
export const DND_VALIDATION_RANGES = {
  ABILITY_SCORE: { min: 1, max: 30 },
  ARMOR_CLASS: { min: 1, max: 30 },
  INITIATIVE: { min: -10, max: 30 },
  CHARACTER_LEVEL: { min: 1, max: 20 },
  HIT_DIE: { min: 4, max: 12 },
  SPELL_LEVEL: { min: 0, max: 9 },
  HIT_POINTS: { min: 0 },
  HIT_POINTS_MAX: { min: 1 },
} as const;

/**
 * Hit points schema definition with validation
 */
export const hitPointsSchema = {
  maximum: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.HIT_POINTS_MAX,
  },
  current: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.HIT_POINTS,
    validate: {
      validator: function(this: any, value: number) {
        return value <= this.maximum;
      },
      message: 'Current HP cannot exceed maximum HP',
    },
  },
  temporary: {
    type: Number,
    default: 0,
    ...DND_VALIDATION_RANGES.HIT_POINTS,
  },
};

/**
 * Hit points interface for consistent typing
 */
export interface IHitPoints {
  maximum: number;
  current: number;
  temporary: number;
}

/**
 * Hit points management utilities
 */
export const hitPointsUtils = {

  /**
   * Calculate effective HP (current + temporary)
   */
  getEffectiveHP(hitPoints: IHitPoints): number {
    return hitPoints.current + hitPoints.temporary;
  },

  /**
   * Check if entity is alive
   */
  isAlive(hitPoints: IHitPoints): boolean {
    return hitPoints.current > 0;
  },

  /**
   * Check if entity is unconscious
   */
  isUnconscious(hitPoints: IHitPoints): boolean {
    return hitPoints.current <= 0;
  },

  /**
   * Apply damage to hit points
   */
  takeDamage(hitPoints: IHitPoints, damage: number): void {
    if (damage <= 0) return;

    // Apply damage to temporary HP first
    if (hitPoints.temporary > 0) {
      const tempDamage = Math.min(damage, hitPoints.temporary);
      hitPoints.temporary -= tempDamage;
      damage -= tempDamage;
    }

    // Apply remaining damage to current HP
    if (damage > 0) {
      hitPoints.current = Math.max(0, hitPoints.current - damage);
    }
  },

  /**
   * Heal hit points
   */
  heal(hitPoints: IHitPoints, healing: number): void {
    if (healing <= 0) return;
    hitPoints.current = Math.min(hitPoints.maximum, hitPoints.current + healing);
  },

  /**
   * Add temporary hit points
   */
  addTemporaryHP(hitPoints: IHitPoints, tempHP: number): void {
    if (tempHP <= 0) return;
    // Temporary HP doesn't stack, take the higher value
    hitPoints.temporary = Math.max(hitPoints.temporary, tempHP);
  },
};

/**
 * ObjectId field configuration for references
 */
export const mongooseObjectIdField = (ref: string, required: boolean = true) => ({
  type: mongoose.Schema.Types.ObjectId,
  ref,
  required,
  index: true,
});

/**
 * Common field definitions
 */
export const commonFields = {
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  backstory: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000,
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: 5000,
  },
  imageUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
      },
      message: 'Image URL must be a valid URL ending with jpg, jpeg, png, gif, or webp',
    },
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
};

/**
 * D&D specific field definitions
 */
export const dndFields = {
  characterLevel: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.CHARACTER_LEVEL,
  },
  hitDie: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.HIT_DIE,
  },
  armorClass: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.ARMOR_CLASS,
  },
  speed: {
    type: Number,
    required: true,
    min: 0,
    max: 200,
  },
  proficiencyBonus: {
    type: Number,
    required: true,
    min: 2,
    max: 6,
  },
  spellLevel: {
    type: Number,
    required: true,
    ...DND_VALIDATION_RANGES.SPELL_LEVEL,
  },
};

/**
 * Common index definitions
 */
export const commonIndexes = {
  ownerBased: (schema: mongoose.Schema) => {
    schema.index({ ownerId: 1, createdAt: -1 });
    schema.index({ ownerId: 1, name: 1 });
    schema.index({ ownerId: 1, isDeleted: 1 });
  },
  
  publicContent: (schema: mongoose.Schema) => {
    schema.index({ isPublic: 1, createdAt: -1 });
    schema.index({ isPublic: 1, name: 1 });
  },
  
  temporal: (schema: mongoose.Schema) => {
    schema.index({ createdAt: -1 });
    schema.index({ updatedAt: -1 });
  },
  
  dndContent: (schema: mongoose.Schema) => {
    schema.index({ type: 1 });
    schema.index({ race: 1 });
    schema.index({ 'classes.class': 1 });
  },
};

/**
 * Validation helper functions
 */
export const validationHelpers = {
  /**
   * Calculate D&D 5e ability modifier
   */
  getAbilityModifier(score: number): number {
    return Math.floor((score - 10) / 2);
  },

  /**
   * Calculate proficiency bonus by level
   */
  getProficiencyBonus(level: number): number {
    return Math.ceil(level / 4) + 1;
  },
  
  /**
   * Validate D&D race name
   */
  isValidRace(race: string): boolean {
    const validRaces = [
      'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 
      'Half-Elf', 'Half-Orc', 'Tiefling', 'Aarakocra', 'Genasi',
      'Goliath', 'Aasimar', 'Bugbear', 'Firbolg', 'Goblin', 'Hobgoblin',
      'Kenku', 'Kobold', 'Lizardfolk', 'Orc', 'Tabaxi', 'Triton',
      'Yuan-Ti Pureblood', 'Tortle', 'Gith', 'Custom'
    ];
    return validRaces.includes(race);
  },
  
  /**
   * Validate D&D class name
   */
  isValidClass(className: string): boolean {
    const validClasses = [
      'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
      'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
    ];
    return validClasses.includes(className);
  },
};