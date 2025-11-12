/**
 * Combat validation schemas using Zod
 * Feature 009: Combat Tracker Page
 */

import { z } from 'zod';

// ===== StatusEffect =====
export const StatusEffectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  durationInRounds: z.number().int().positive().nullable(),
  appliedAtRound: z.number().int().nonnegative(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export type StatusEffect = z.infer<typeof StatusEffectSchema>;

// ===== Participant =====
export const ParticipantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  type: z.enum(['monster', 'character', 'npc']),
  initiativeValue: z.number().int().min(1).max(30),
  maxHP: z.number().int().min(1),
  currentHP: z.number().int(),
  temporaryHP: z.number().int().nonnegative(),
  acValue: z.number().int().min(0).max(30),
  statusEffects: z.array(StatusEffectSchema),
  metadata: z.record(z.unknown()).optional(),
});

export type Participant = z.infer<typeof ParticipantSchema>;

// ===== CombatSession =====
export const CombatSessionSchema = z.object({
  id: z.string().uuid(),
  encounterId: z.string().optional(),
  status: z.enum(['active', 'paused', 'ended']),
  currentRoundNumber: z.number().int().min(1),
  currentTurnIndex: z.number().int().nonnegative(),
  participants: z.array(ParticipantSchema).min(1),
  lairActionInitiative: z.number().int().min(1).max(30).default(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  owner_id: z.string().min(1),
  org_id: z.string().optional(),
});

export type CombatSession = z.infer<typeof CombatSessionSchema>;

// ===== Action Inputs =====
export const DamageInputSchema = z.object({
  participantId: z.string(),
  amount: z.number().int().positive(),
  targetType: z.enum(['currentHP', 'temporaryHP']).default('currentHP'),
});

export type DamageInput = z.infer<typeof DamageInputSchema>;

export const HealingInputSchema = z.object({
  participantId: z.string(),
  amount: z.number().int().positive(),
});

export type HealingInput = z.infer<typeof HealingInputSchema>;

export const StatusEffectInputSchema = z.object({
  participantId: z.string(),
  name: z.string().min(1).max(100),
  durationInRounds: z.number().int().positive().nullable(),
});

export type StatusEffectInput = z.infer<typeof StatusEffectInputSchema>;

// ===== Log Entry =====
export const CombatLogEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  roundNumber: z.number().int().min(1),
  turnIndex: z.number().int().nonnegative(),
  actionType: z.enum([
    'damage',
    'heal',
    'effect_applied',
    'effect_removed',
    'initiative_set',
    'turn_advanced',
    'turn_rewound',
    'round_started',
    'round_ended',
    'undo',
    'redo',
  ]),
  actor: z.string().optional(),
  target: z.string().optional(),
  details: z.record(z.unknown()),
  description: z.string(),
});

export type CombatLogEntry = z.infer<typeof CombatLogEntrySchema>;
