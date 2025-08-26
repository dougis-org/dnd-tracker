import { z } from 'zod';

// D&D 5e Constants
export const DND_RACES = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf', 'Half-Orc', 'Halfling', 'Human', 'Tiefling',
];

export const DND_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard',
];

export const DND_ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const DND_ABILITIES = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
];

export const DND_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 
  'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'
];

export const ABILITY_SCORE_METHODS = [
  'point-buy', 'standard-array', 'roll',
];

export type AbilityScoreMethod = typeof ABILITY_SCORE_METHODS[number];

// Define Zod schema for individual class entries
export const ClassSchema = z.object({
  className: z.string().trim().min(1, 'Class name is required'),
  level: z.number().int().min(1, 'Class level must be between 1 and 20').max(20, 'Class level must be between 1 and 20'),
  subclass: z.string().trim().optional(),
  hitDiceSize: z.union([z.literal(6), z.literal(8), z.literal(10), z.literal(12)]),
  hitDiceUsed: z.number().int().min(0, 'Hit dice used cannot be negative').default(0),
});

// Define Zod schema for ability scores
export const AbilityScoresSchema = z.object({
  strength: z.number().int().min(1, 'Ability scores must be between 1 and 30').max(30, 'Ability scores must be between 1 and 30'),
  dexterity: z.number().int().min(1, 'Ability scores must be between 1 and 30').max(30, 'Ability scores must be between 1 and 30'),
  constitution: z.number().int().min(1, 'Ability scores must be between 1 and 30').max(30, 'Ability scores must be between 1 and 30'),
  intelligence: z.number().int().min(1, 'Ability scores must be between 1 and 30').max(30, 'Ability scores must be between 1 and 30'),
  wisdom: z.number().int().min(1, 'Ability scores must be between 1 and 30').max(30, 'Ability scores must be between 1 and 30'),
  charisma: z.number().int().min(1, 'Ability scores must be between 1 and 30').max(30, 'Ability scores must be between 1 and 30'),
});

// Define Zod schema for hit points
const HitPointsSchema = z.object({
  maximum: z.number().min(0, 'Maximum hit points cannot be negative').optional(),
  current: z.number().min(0, 'Current hit points cannot be negative').optional(),
  temporary: z.number().min(0, 'Temporary hit points cannot be negative').default(0).optional(),
}).optional();

// Define Zod schema for equipment
const EquipmentSchema = z.object({
  name: z.string().trim().min(1, 'Equipment name is required'),
  quantity: z.number().int().min(0, 'Equipment quantity cannot be negative'),
  category: z.string().trim().optional(),
});

// Define Zod schema for spell slots
const SpellSlotsSchema = z.record(z.string(), z.object({
  total: z.number().int().min(0, 'Spell slot total cannot be negative'),
  used: z.number().int().min(0, 'Spell slots used cannot be negative'),
})).optional();

// Define Zod schema for spellcasting
const SpellcastingSchema = z.object({
  ability: z.enum(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']).optional(),
  spellAttackBonus: z.number().optional(),
  spellSaveDC: z.number().min(8, 'Spell save DC cannot be below 8').optional(),
  spellSlots: SpellSlotsSchema,
  spellsKnown: z.array(z.string().trim().min(1)).optional(),
  spellsPrepared: z.array(z.string().trim().min(1)).optional(),
}).optional();

// Main Character Zod Schema
export const CharacterSchema = z.object({
  userId: z.string().trim().min(1, 'User ID is required'),
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  race: z.string().trim().min(1, 'Race is required'),
  subrace: z.string().trim().optional(),
  background: z.string().trim().min(1, 'Background is required'),
  alignment: z.string().trim().min(1, 'Alignment is required'),
  experiencePoints: z.number().int().min(0, 'Experience points cannot be negative').default(0),
  
  classes: z.array(ClassSchema).min(1, 'At least one class is required').max(12, 'Character cannot have more than 12 classes'),
  
  abilities: AbilityScoresSchema,

  // Calculated fields (will be set by backend logic, not directly validated here for input)
  abilityModifiers: z.object({
    strength: z.number(),
    dexterity: z.number(),
    constitution: z.number(),
    intelligence: z.number(),
    wisdom: z.number(),
    charisma: z.number(),
  }).optional(),
  proficiencyBonus: z.number().optional(),

  skillProficiencies: z.array(z.string().trim().min(1)).optional(),
  savingThrowProficiencies: z.array(z.string().trim().min(1)).optional(),

  hitPoints: HitPointsSchema,
  armorClass: z.number().min(0, 'Armor class cannot be negative').max(50, 'Armor class seems unreasonably high').optional(),
  speed: z.number().min(0, 'Speed cannot be negative').optional(),
  initiative: z.number().optional(),
  passivePerception: z.number().min(0, 'Passive perception cannot be negative').optional(),

  spellcasting: SpellcastingSchema,
  equipment: z.array(EquipmentSchema).optional(),
  features: z.array(z.string().trim().min(1)).optional(),
  notes: z.string().trim().max(2000, { message: 'Notes cannot exceed 2000 characters' }).optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Define partial schemas for form steps
export const basicInfoSchema = z.object({
  name: CharacterSchema.shape.name,
  race: CharacterSchema.shape.race,
  subrace: CharacterSchema.shape.subrace,
  background: CharacterSchema.shape.background,
  alignment: CharacterSchema.shape.alignment,
  experiencePoints: CharacterSchema.shape.experiencePoints,
});

export const classesSchema = z.object({
  classes: CharacterSchema.shape.classes,
});

export const abilitiesSchema = z.object({
  abilities: CharacterSchema.shape.abilities,
});

export const skillsSchema = z.object({
  skillProficiencies: z.array(z.string().trim().min(1)).optional(),
  savingThrowProficiencies: z.array(z.string().trim().min(1)).optional(),
});

export const combatStatsSchema = z.object({
  hitPoints: HitPointsSchema,
  armorClass: z.number().min(0, 'Armor class cannot be negative').max(50, 'Armor class seems unreasonably high').optional(),
  speed: z.number().min(0, 'Speed cannot be negative').optional(),
  initiative: z.number().optional(),
  passivePerception: z.number().min(0, 'Passive perception cannot be negative').optional(),
});

export const spellcastingFormSchema = z.object({
  spellcasting: SpellcastingSchema,
});

export const equipmentSchema = z.object({
  equipment: z.array(EquipmentSchema).optional(),
});

export const characterFormSchema = basicInfoSchema
  .merge(classesSchema)
  .merge(abilitiesSchema)
  .extend({
    skillProficiencies: z.array(z.string().trim().min(1)).optional(),
    savingThrowProficiencies: z.array(z.string().trim().min(1)).optional(),
    hitPoints: HitPointsSchema.refine(hp => !hp || hp.current === undefined || hp.maximum === undefined || hp.current <= hp.maximum + (hp.temporary || 0), {
      message: 'Current HP cannot exceed maximum HP + temporary HP',
      path: ['current'],
    }),
    armorClass: z.number().min(0, 'Armor class cannot be negative').max(50, 'Armor class seems unreasonably high').optional(),
    speed: z.number().min(0, 'Speed cannot be negative').optional(),
    initiative: z.number().optional(),
    passivePerception: z.number().min(0, 'Passive perception cannot be negative').optional(),
    spellcasting: SpellcastingSchema,
    equipment: z.array(EquipmentSchema).optional(),
    features: z.array(z.string().trim().min(1)).optional(),
    notes: z.string().trim().max(2000, { message: 'Notes cannot exceed 2000 characters' }).optional(),
  });

export const CharacterSchemaWithTotalLevel = CharacterSchema.extend({
  totalLevel: z.number().int().min(1, 'Total level must be between 1 and 20').max(20, 'Total level must be between 1 and 20'),
}).refine(data => {
  // Custom refinement for totalLevel based on sum of class levels
  const calculatedTotalLevel = data.classes.reduce((sum, cls) => sum + cls.level, 0);
  return data.totalLevel === calculatedTotalLevel;
}, {
  message: 'Total level must equal sum of class levels',
  path: ['totalLevel'],
});

export function calculateAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateProficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

// Type exports
export type CharacterFormData = z.infer<typeof characterFormSchema>;
export type CharacterFormInput = CharacterFormData; // Alias for compatibility
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type AbilitiesFormData = z.infer<typeof abilitiesSchema>;
export type SkillsFormData = z.infer<typeof skillsSchema>;
export type CharacterData = z.infer<typeof CharacterSchema>;
export type CharacterDataWithTotalLevel = z.infer<typeof CharacterSchemaWithTotalLevel>;
export type ClassData = z.infer<typeof ClassSchema>;
export type AbilityScores = z.infer<typeof AbilityScoresSchema>;