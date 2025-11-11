import { z } from 'zod';

// Minimal Zod schema for Encounter for TDD validation (T007)
export const ParticipantSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['monster', 'party_member', 'custom']),
  displayName: z.string().min(1),
  quantity: z.number().int().min(1),
  hp: z.number().int().min(0).optional(),
  initiative: z.number().int().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
});

export const EncounterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  participants: z.array(ParticipantSchema).min(1),
  tags: z.array(z.string()).optional(),
  template_flag: z.boolean().optional(),
  owner_id: z.string().optional(),
  org_id: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Encounter = z.infer<typeof EncounterSchema>;

export default EncounterSchema;
