import { z } from 'zod';

/**
 * PHB race options used for validation and UI dropdowns
 */
export const PHB_RACE_OPTIONS = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Dragonborn',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
] as const;

/**
 * PHB class options used for validation and UI dropdowns
 */
export const PHB_CLASS_OPTIONS = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
] as const;

const abilityScoreSchema = z
  .number()
  .int('Ability scores must be whole numbers')
  .min(1, 'Ability scores must be between 1 and 20')
  .max(20, 'Ability scores must be between 1 and 20');

/**
 * Core ability score validation object
 */
export const abilityScoresSchema = z.object({
  str: abilityScoreSchema,
  dex: abilityScoreSchema,
  con: abilityScoreSchema,
  int: abilityScoreSchema,
  wis: abilityScoreSchema,
  cha: abilityScoreSchema,
});

/**
 * Character name validation (1-255 chars, trimmed)
 */
export const characterNameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(255, 'Name cannot exceed 255 characters');

/**
 * Character race validation limited to PHB options
 */
export const characterRaceSchema = z.enum(PHB_RACE_OPTIONS);

/**
 * Character class entry validation (class + level)
 */
export const characterClassEntrySchema = z.object({
  className: z.enum(PHB_CLASS_OPTIONS),
  level: z
    .number()
    .int('Class level must be a whole number')
    .min(1, 'Class level must be between 1 and 20')
    .max(20, 'Class level must be between 1 and 20'),
});

/**
 * Multiclass validation: up to 3 unique classes, total level ≤ 20
 */
export const characterClassesSchema = z
  .array(characterClassEntrySchema)
  .min(1, 'At least one class is required')
  .max(3, 'A character may not have more than three classes')
  .superRefine((classes, ctx) => {
    const seen = new Set<string>();
    let totalLevel = 0;

    for (const entry of classes) {
      totalLevel += entry.level;

      if (seen.has(entry.className)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate class entries are not allowed',
        });
      }

      seen.add(entry.className);
    }

    if (totalLevel > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total character level cannot exceed 20',
      });
    }
  });

/**
 * Base character validation schema covering core inputs
 */
export const characterBaseSchema = z.object({
  name: characterNameSchema,
  race: characterRaceSchema,
  abilityScores: abilityScoresSchema,
  classes: characterClassesSchema,
});

export type AbilityScoresInput = z.infer<typeof abilityScoresSchema>;
export type CharacterClassInput = z.infer<typeof characterClassEntrySchema>;
export type CharacterInput = z.infer<typeof characterBaseSchema>;
