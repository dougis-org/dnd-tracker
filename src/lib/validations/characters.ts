import { z } from 'zod';

const ABILITY_SCORE_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
const SKILL_KEYS = [
  'acrobatics',
  'animalHandling',
  'arcana',
  'athletics',
  'deception',
  'history',
  'insight',
  'intimidation',
  'investigation',
  'medicine',
  'nature',
  'perception',
  'performance',
  'persuasion',
  'religion',
  'sleightOfHand',
  'stealth',
  'survival',
] as const;

const AbilityScoresSchema = z.object({
  str: z.number().int().min(1).max(20),
  dex: z.number().int().min(1).max(20),
  con: z.number().int().min(1).max(20),
  int: z.number().int().min(1).max(20),
  wis: z.number().int().min(1).max(20),
  cha: z.number().int().min(1).max(20),
});

const ClassLevelSchema = z.object({
  classId: z.union([z.string(), z.string().regex(/^[0-9a-f]{24}$/)]),
  level: z.number().int().min(1).max(20),
  name: z.string().optional(),
  hitDie: z
    .union([
      z.literal('d6'),
      z.literal('d8'),
      z.literal('d10'),
      z.literal('d12'),
    ])
    .optional(),
  savingThrows: z.array(z.enum(ABILITY_SCORE_KEYS)).optional(),
});

export const CreateCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  raceId: z.string().regex(/^[0-9a-f]{24}$/),
  abilityScores: AbilityScoresSchema,
  classes: z.array(ClassLevelSchema).min(1),
  hitPoints: z.number().int().min(0),
  baseArmorClass: z.number().int().min(0).optional(),
  proficientSkills: z.array(z.enum(SKILL_KEYS)).optional(),
  bonusSavingThrows: z.array(z.enum(ABILITY_SCORE_KEYS)).optional(),
});

export type CreateCharacterPayloadSchema = z.infer<
  typeof CreateCharacterSchema
>;

export const validateCreateCharacter = (data: unknown) => {
  return CreateCharacterSchema.safeParse(data);
};

export const UpdateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  abilityScores: AbilityScoresSchema.optional(),
  classes: z.array(ClassLevelSchema).min(1).optional(),
  hitPoints: z.number().int().min(0).optional(),
  baseArmorClass: z.number().int().min(0).optional(),
});

export type UpdateCharacterPayloadSchema = z.infer<
  typeof UpdateCharacterSchema
>;

export const validateUpdateCharacter = (data: unknown) => {
  return UpdateCharacterSchema.safeParse(data);
};

export const ListCharactersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  includeDeleted: z.coerce.boolean().default(false),
});

export type ListCharactersQueryType = z.infer<typeof ListCharactersQuerySchema>;

export const validateListCharactersQuery = (data: unknown) => {
  return ListCharactersQuerySchema.safeParse(data);
};

export const DuplicateCharacterSchema = z.object({
  newName: z.string().min(1).max(100).optional(),
});

export type DuplicateCharacterPayloadSchema = z.infer<
  typeof DuplicateCharacterSchema
>;

export const validateDuplicateCharacter = (data: unknown) => {
  return DuplicateCharacterSchema.safeParse(data);
};
