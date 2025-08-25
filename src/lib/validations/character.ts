import { z } from 'zod';

// D&D 5e ability scores: typically 8-15 base, can go up to 30 with magic items
const abilityScoreSchema = z.number()
  .int('Ability score must be an integer')
  .min(1, 'Ability score must be at least 1')
  .max(30, 'Ability score cannot exceed 30');

// Character class schema for multiclassing
const characterClassSchema = z.object({
  className: z.string()
    .min(1, 'Class name is required')
    .max(50, 'Class name too long'),
  level: z.number()
    .int('Level must be an integer')
    .min(1, 'Level must be at least 1')
    .max(20, 'Level cannot exceed 20'),
  subclass: z.string()
    .max(50, 'Subclass name too long')
    .optional(),
  hitDiceSize: z.number()
    .int('Hit dice size must be an integer')
    .refine((val) => [6, 8, 10, 12].includes(val), {
      message: 'Hit dice size must be 6, 8, 10, or 12'
    }),
  hitDiceUsed: z.number()
    .int('Hit dice used must be an integer')
    .min(0, 'Hit dice used cannot be negative')
});

// Equipment item schema
const equipmentItemSchema = z.object({
  name: z.string()
    .min(1, 'Equipment name is required')
    .max(100, 'Equipment name too long'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(0, 'Quantity cannot be negative'),
  category: z.string()
    .min(1, 'Equipment category is required')
    .max(50, 'Equipment category too long')
});

// Spellcasting schema
const spellcastingSchema = z.object({
  ability: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'], {
    message: 'Invalid spellcasting ability'
  }),
  spellAttackBonus: z.number()
    .int('Spell attack bonus must be an integer'),
  spellSaveDC: z.number()
    .int('Spell save DC must be an integer')
    .min(8, 'Spell save DC must be at least 8'),
  spellSlots: z.record(
    z.string(),
    z.object({
      total: z.number().int().min(0),
      used: z.number().int().min(0)
    })
  ).optional(),
  spellsKnown: z.array(z.string()).optional(),
  spellsPrepared: z.array(z.string()).optional()
}).optional();

// Hit points schema
const hitPointsSchema = z.object({
  maximum: z.number()
    .int('Maximum hit points must be an integer')
    .min(1, 'Maximum hit points must be at least 1'),
  current: z.number()
    .int('Current hit points must be an integer'),
  temporary: z.number()
    .int('Temporary hit points must be an integer')
    .min(0, 'Temporary hit points cannot be negative')
    .default(0)
}).refine((data) => data.current <= data.maximum + data.temporary, {
  message: 'Current hit points cannot exceed maximum + temporary hit points',
  path: ['current']
});

// Main character schema for forms
export const characterFormSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Character name is required')
    .max(50, 'Character name too long')
    .trim(),
  race: z.string()
    .min(1, 'Race is required')
    .max(50, 'Race name too long'),
  subrace: z.string()
    .max(50, 'Subrace name too long')
    .optional(),
  background: z.string()
    .min(1, 'Background is required')
    .max(50, 'Background name too long'),
  alignment: z.string()
    .min(1, 'Alignment is required')
    .max(50, 'Alignment too long'),
  experiencePoints: z.number()
    .int('Experience points must be an integer')
    .min(0, 'Experience points cannot be negative')
    .default(0),

  // Classes (multiclassing support)
  classes: z.array(characterClassSchema)
    .min(1, 'At least one class is required')
    .max(10, 'Too many classes'), // Reasonable limit

  // Ability Scores
  abilities: z.object({
    strength: abilityScoreSchema,
    dexterity: abilityScoreSchema,
    constitution: abilityScoreSchema,
    intelligence: abilityScoreSchema,
    wisdom: abilityScoreSchema,
    charisma: abilityScoreSchema
  }),

  // Skills and Proficiencies (arrays of strings)
  skillProficiencies: z.array(z.string())
    .optional()
    .default([]),
  savingThrowProficiencies: z.array(z.string())
    .optional()
    .default([]),

  // Combat Stats
  hitPoints: hitPointsSchema.optional(),
  armorClass: z.number()
    .int('Armor class must be an integer')
    .min(1, 'Armor class must be at least 1')
    .max(30, 'Armor class cannot exceed 30')
    .optional(),
  speed: z.number()
    .int('Speed must be an integer')
    .min(0, 'Speed cannot be negative')
    .optional(),
  initiative: z.number()
    .int('Initiative must be an integer')
    .optional(),
  passivePerception: z.number()
    .int('Passive perception must be an integer')
    .min(1, 'Passive perception must be at least 1')
    .optional(),

  // Spellcasting
  spellcasting: spellcastingSchema,

  // Equipment and Features
  equipment: z.array(equipmentItemSchema)
    .optional()
    .default([]),
  features: z.array(z.string())
    .optional()
    .default([]),
  notes: z.string()
    .max(2000, 'Notes too long (max 2000 characters)')
    .optional()
});

// Form step schemas for multi-step form validation
export const basicInfoSchema = characterFormSchema.pick({
  name: true,
  race: true,
  subrace: true,
  background: true,
  alignment: true,
  experiencePoints: true
});

export const classesSchema = characterFormSchema.pick({
  classes: true
});

export const abilitiesSchema = characterFormSchema.pick({
  abilities: true
});

export const skillsSchema = characterFormSchema.pick({
  skillProficiencies: true,
  savingThrowProficiencies: true
});

export const combatStatsSchema = characterFormSchema.pick({
  hitPoints: true,
  armorClass: true,
  speed: true,
  initiative: true,
  passivePerception: true
});

export const spellcastingFormSchema = characterFormSchema.pick({
  spellcasting: true
});

export const equipmentSchema = characterFormSchema.pick({
  equipment: true,
  features: true,
  notes: true
});

// Type definitions for form data
export type CharacterFormData = z.infer<typeof characterFormSchema>;
export type CharacterFormInput = z.input<typeof characterFormSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type ClassesFormData = z.infer<typeof classesSchema>;
export type AbilitiesFormData = z.infer<typeof abilitiesSchema>;
export type SkillsFormData = z.infer<typeof skillsSchema>;
export type CombatStatsFormData = z.infer<typeof combatStatsSchema>;
export type SpellcastingFormData = z.infer<typeof spellcastingFormSchema>;
export type EquipmentFormData = z.infer<typeof equipmentSchema>;

// Utility function to calculate ability modifiers
export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Utility function to calculate proficiency bonus based on total level
export function calculateProficiencyBonus(totalLevel: number): number {
  return Math.ceil(totalLevel / 4) + 1;
}

// D&D 5e constants for dropdowns
export const DND_RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc', 'Tiefling'
] as const;

export const DND_CLASSES = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
] as const;

export const DND_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
] as const;

export const DND_ABILITIES = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'
] as const;

export const DND_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History',
  'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'
] as const;

export const ABILITY_SCORE_METHODS = [
  'point-buy', 'standard-array', 'roll'
] as const;

export type AbilityScoreMethod = typeof ABILITY_SCORE_METHODS[number];