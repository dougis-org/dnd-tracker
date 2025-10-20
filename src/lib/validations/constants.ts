/**
 * Validation constants derived from Zod schemas
 * Single source of truth for dropdown options
 *
 * Constitutional: Max 100 lines
 */

import { experienceLevelSchema, primaryRoleSchema } from './user';

/**
 * Experience level options derived from Zod schema
 */
export const EXPERIENCE_LEVEL_OPTIONS = experienceLevelSchema.options.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

/**
 * Primary role options derived from Zod schema
 */
export const PRIMARY_ROLE_OPTIONS = primaryRoleSchema.options.map((value) => ({
  value,
  label: value === 'dm' ? 'DM' : value === 'player' ? 'Player' : 'Both',
}));
