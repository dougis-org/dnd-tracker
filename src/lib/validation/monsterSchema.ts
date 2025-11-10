import { z } from 'zod';

const AbilitiesSchema = z.object({
  str: z.number().int().min(-5).max(30),
  dex: z.number().int().min(-5).max(30),
  con: z.number().int().min(-5).max(30),
  int: z.number().int().min(-5).max(30),
  wis: z.number().int().min(-5).max(30),
  cha: z.number().int().min(-5).max(30),
});

const ActionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  attackBonus: z.number().nullable().optional(),
  damage: z.string().nullable().optional(),
});

export const MonsterSizeEnum = z.enum([
  'Tiny',
  'Small',
  'Medium',
  'Large',
  'Huge',
  'Gargantuan',
]);
export const MonsterScopeEnum = z.enum(['global', 'campaign', 'public']);

export const MonsterCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cr: z.number().min(0, 'CR must be >= 0'),
  size: MonsterSizeEnum,
  type: z.string().min(1, 'Type is required'),
  alignment: z.string().nullable().optional(),
  hp: z.number().int().nonnegative('HP must be non-negative'),
  ac: z.number().int().nonnegative('AC must be non-negative'),
  speed: z.union([z.string(), z.record(z.number())]).optional(),
  abilities: AbilitiesSchema,
  savingThrows: z.record(z.number()).nullable().optional(),
  skills: z.record(z.number()).nullable().optional(),
  resistances: z.array(z.string()).optional(),
  immunities: z.array(z.string()).optional(),
  conditionImmunities: z.array(z.string()).optional(),
  senses: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  actions: z.array(ActionSchema).optional(),
  legendaryActions: z.array(ActionSchema).optional(),
  lairActions: z.array(ActionSchema).optional(),
  scope: MonsterScopeEnum.default('campaign'),
  templateId: z.string().nullable().optional(),
});

export const MonsterUpdateSchema = MonsterCreateSchema.extend({
  id: z.string().uuid('ID must be a valid UUID'),
});

export const MonsterSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cr: z.number(),
  size: MonsterSizeEnum,
  type: z.string(),
  alignment: z.string().nullable().optional(),
  hp: z.number().int(),
  ac: z.number().int(),
  speed: z.union([z.string(), z.record(z.number())]).optional(),
  abilities: AbilitiesSchema,
  savingThrows: z.record(z.number()).nullable().optional(),
  skills: z.record(z.number()).nullable().optional(),
  resistances: z.array(z.string()).optional(),
  immunities: z.array(z.string()).optional(),
  conditionImmunities: z.array(z.string()).optional(),
  senses: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  actions: z.array(ActionSchema).optional(),
  legendaryActions: z.array(ActionSchema).optional(),
  lairActions: z.array(ActionSchema).optional(),
  templateId: z.string().nullable().optional(),
  ownerId: z.string(),
  createdBy: z.string(),
  scope: MonsterScopeEnum,
  isPublic: z.boolean(),
  publicAt: z.string().nullable().optional(),
  creditedTo: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MonsterCreate = z.infer<typeof MonsterCreateSchema>;
export type MonsterUpdate = z.infer<typeof MonsterUpdateSchema>;
export type MonsterData = z.infer<typeof MonsterSchema>;
