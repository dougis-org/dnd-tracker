/**
 * Combat Session API Contract
 *
 * Defines the shape and validation rules for CombatSession data
 * exchanged between frontend and backend (or mock adapter).
 *
 * This contract is used for:
 * - MVP (localStorage adapter): Client-side data shape
 * - Future Feature 036 (backend API): HTTP request/response validation
 *
 * All types exported here use the canonical Zod schemas from `src/lib/schemas/combat.ts`.
 */

import { z } from 'zod';
import {
  CombatSessionSchema,
  ParticipantSchema,
  StatusEffectSchema,
  DamageInputSchema,
  HealingInputSchema,
  StatusEffectInputSchema,
  CombatLogEntrySchema,
} from '../../src/lib/schemas/combat';

/**
 * ============================================================================
 * Core Entity Types (Zod inferred)
 * ============================================================================
 */

/** A single combat session (root entity) */
export type CombatSession = z.infer<typeof CombatSessionSchema>;

/** A participant in combat (embedded in session) */
export type Participant = z.infer<typeof ParticipantSchema>;

/** A status effect applied to a participant */
export type StatusEffect = z.infer<typeof StatusEffectSchema>;

/** A timestamped log entry for audit trail */
export type CombatLogEntry = z.infer<typeof CombatLogEntrySchema>;

/**
 * ============================================================================
 * Request / Response Envelopes
 * ============================================================================
 */

/**
 * Standard API response envelope
 * Used for success or error responses
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * ============================================================================
 * Session Endpoints (Future Feature 036)
 * ============================================================================
 */

/**
 * GET /api/combat-sessions/:sessionId
 * Fetch a single combat session
 */
export interface GetSessionRequest {
  sessionId: string;
}

export interface GetSessionResponse extends ApiResponse<CombatSession> {}

/**
 * PATCH /api/combat-sessions/:sessionId
 * Update a combat session (participants, turn index, etc.)
 *
 * Only fields in the payload are updated; others are unchanged.
 */
export interface UpdateSessionRequest {
  sessionId: string;
  payload: Partial<Pick<
    CombatSession,
    | 'status'
    | 'currentRoundNumber'
    | 'currentTurnIndex'
    | 'participants'
    | 'lairActionInitiative'
  >>;
}

export interface UpdateSessionResponse extends ApiResponse<CombatSession> {}

/**
 * POST /api/combat-sessions
 * Create a new combat session
 */
export interface CreateSessionRequest {
  encounterId?: string;
  participants: Participant[];
  owner_id: string;
  org_id?: string;
}

export interface CreateSessionResponse extends ApiResponse<CombatSession> {}

/**
 * ============================================================================
 * Action Endpoints (MVP: client-side; F036: backend)
 * ============================================================================
 */

/**
 * Apply damage to a participant
 * (MVP: called locally; Feature 036: via API)
 *
 * POST /api/combat-sessions/:sessionId/actions/damage
 */
export interface ApplyDamageRequest {
  sessionId: string;
  participantId: string;
  amount: number; // positive integer
  targetType?: 'currentHP' | 'temporaryHP'; // default: currentHP (temp first)
}

export interface ApplyDamageResponse
  extends ApiResponse<{
    participant: Participant;
    damageApplied: number;
    tempHPApplied: number;
    hpApplied: number;
  }> {}

/**
 * Apply healing to a participant
 * (MVP: called locally; Feature 036: via API)
 *
 * POST /api/combat-sessions/:sessionId/actions/heal
 */
export interface ApplyHealingRequest {
  sessionId: string;
  participantId: string;
  amount: number; // positive integer
}

export interface ApplyHealingResponse
  extends ApiResponse<{
    participant: Participant;
    healingApplied: number;
    newHP: number;
  }> {}

/**
 * Add a status effect to a participant
 *
 * POST /api/combat-sessions/:sessionId/actions/effect-add
 */
export interface AddStatusEffectRequest {
  sessionId: string;
  participantId: string;
  effect: {
    name: string;
    durationInRounds: number | null;
    icon?: string;
    description?: string;
  };
}

export interface AddStatusEffectResponse
  extends ApiResponse<{
    participant: Participant;
    effect: StatusEffect;
  }> {}

/**
 * Remove a status effect from a participant
 *
 * POST /api/combat-sessions/:sessionId/actions/effect-remove
 */
export interface RemoveStatusEffectRequest {
  sessionId: string;
  participantId: string;
  effectId: string;
}

export interface RemoveStatusEffectResponse
  extends ApiResponse<{
    participant: Participant;
  }> {}

/**
 * Advance turn in combat
 *
 * POST /api/combat-sessions/:sessionId/actions/next-turn
 */
export interface NextTurnRequest {
  sessionId: string;
}

export interface NextTurnResponse
  extends ApiResponse<{
    session: CombatSession;
    newTurnIndex: number;
    newRoundNumber: number;
  }> {}

/**
 * Rewind turn in combat
 *
 * POST /api/combat-sessions/:sessionId/actions/previous-turn
 */
export interface PreviousTurnRequest {
  sessionId: string;
}

export interface PreviousTurnResponse
  extends ApiResponse<{
    session: CombatSession;
    newTurnIndex: number;
    newRoundNumber: number;
  }> {}

/**
 * ============================================================================
 * Log Endpoints (Future Feature 046)
 * ============================================================================
 */

/**
 * GET /api/combat-sessions/:sessionId/log
 * Fetch combat log entries
 */
export interface GetCombatLogRequest {
  sessionId: string;
  limit?: number; // default 20, max 100
  offset?: number; // default 0
}

export interface GetCombatLogResponse
  extends ApiResponse<{
    entries: CombatLogEntry[];
    total: number;
    limit: number;
    offset: number;
  }> {}

/**
 * ============================================================================
 * Error Codes (Feature 036)
 * ============================================================================
 */

export enum ApiErrorCode {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  PARTICIPANT_NOT_FOUND = 'PARTICIPANT_NOT_FOUND',
  EFFECT_NOT_FOUND = 'EFFECT_NOT_FOUND',
  INVALID_SESSION_STATE = 'INVALID_SESSION_STATE',
  INVALID_TURN_INDEX = 'INVALID_TURN_INDEX',
  INVALID_DAMAGE_AMOUNT = 'INVALID_DAMAGE_AMOUNT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * ============================================================================
 * Validation & Utilities
 * ============================================================================
 */

/**
 * Validate a combat session against the schema
 * Throws on validation error
 */
export function validateCombatSession(data: unknown): CombatSession {
  return CombatSessionSchema.parse(data);
}

/**
 * Validate a damage input
 */
export function validateDamageInput(data: unknown) {
  return DamageInputSchema.parse(data);
}

/**
 * Validate a healing input
 */
export function validateHealingInput(data: unknown) {
  return HealingInputSchema.parse(data);
}

/**
 * Validate a status effect input
 */
export function validateStatusEffectInput(data: unknown) {
  return StatusEffectInputSchema.parse(data);
}

/**
 * ============================================================================
 * Mock Fixtures (for testing & MVP development)
 * ============================================================================
 */

/**
 * Generate a mock CombatSession for testing
 */
export function createMockCombatSession(overrides?: Partial<CombatSession>): CombatSession {
  const now = new Date().toISOString();

  return {
    id: '12345678-1234-1234-1234-123456789012',
    status: 'active',
    currentRoundNumber: 1,
    currentTurnIndex: 0,
    participants: [
      {
        id: 'p1',
        name: 'Goblin Ambusher',
        type: 'monster',
        initiativeValue: 14,
        maxHP: 7,
        currentHP: 7,
        temporaryHP: 0,
        acValue: 15,
        statusEffects: [],
      },
      {
        id: 'p2',
        name: 'Barbarian',
        type: 'character',
        initiativeValue: 10,
        maxHP: 60,
        currentHP: 60,
        temporaryHP: 0,
        acValue: 16,
        statusEffects: [],
      },
    ],
    lairActionInitiative: 20,
    createdAt: now,
    updatedAt: now,
    owner_id: 'user_123',
    ...overrides,
  };
}

/**
 * Generate a mock Participant for testing
 */
export function createMockParticipant(overrides?: Partial<Participant>): Participant {
  return {
    id: 'p1',
    name: 'Mock Creature',
    type: 'monster',
    initiativeValue: 10,
    maxHP: 20,
    currentHP: 20,
    temporaryHP: 0,
    acValue: 14,
    statusEffects: [],
    ...overrides,
  };
}

/**
 * ============================================================================
 * Notes for Feature 036 Integration
 * ============================================================================
 *
 * When Feature 036 (Backend API) is implemented:
 *
 * 1. Migrate adapter from localStorage to HTTP client
 * 2. Use these request/response types for type safety
 * 3. Add auth token to headers (e.g., Bearer token from Clerk)
 * 4. Implement retry logic with exponential backoff
 * 5. Handle network errors gracefully (offline detection)
 * 6. Use Zod schemas for runtime validation of API responses
 * 7. Implement request/response logging for debugging
 * 8. Add cache layer (optional) for performance
 *
 * Example (pseudo-code):
 *
 *   export async function loadSession(sessionId: string): Promise<CombatSession> {
 *     const response = await fetch(`/api/combat-sessions/${sessionId}`, {
 *       headers: { 'Authorization': `Bearer ${token}` },
 *     });
 *     const body = await response.json();
 *     if (!response.ok) throw new Error(body.error.message);
 *     return validateCombatSession(body.data);
 *   }
 *
 *   export async function applyDamage(
 *     sessionId: string,
 *     participantId: string,
 *     amount: number
 *   ): Promise<Participant> {
 *     const response = await fetch(`/api/combat-sessions/${sessionId}/actions/damage`, {
 *       method: 'POST',
 *       headers: {
 *         'Authorization': `Bearer ${token}`,
 *         'Content-Type': 'application/json',
 *       },
 *       body: JSON.stringify({ participantId, amount }),
 *     });
 *     const body = await response.json();
 *     if (!response.ok) throw new Error(body.error.message);
 *     return body.data.participant;
 *   }
 */

export {}; // Export empty to avoid unused warning
