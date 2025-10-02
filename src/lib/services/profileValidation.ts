/**
 * Profile validation helper functions
 * Extracted to reduce complexity in API route handlers
 *
 * Constitutional: Max 100 lines, max 50 lines per function
 */

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Profile update request interface
 */
export interface ProfileUpdateRequest {
  displayName?: string;
  dndRuleset?: string;
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  role?: 'player' | 'dm' | 'both';
}

/**
 * Validate profile update request
 * Returns array of validation errors (empty if valid)
 */
export function validateProfileUpdate(
  body: ProfileUpdateRequest
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate displayName
  if (body.displayName !== undefined && body.displayName.length > 100) {
    errors.push({
      field: 'displayName',
      message: 'Display name cannot exceed 100 characters',
    });
  }

  // Validate dndRuleset
  if (body.dndRuleset !== undefined) {
    const validRulesets = ['5e', '3.5e', 'pf1', 'pf2'];
    if (!validRulesets.includes(body.dndRuleset)) {
      errors.push({
        field: 'dndRuleset',
        message: 'Invalid D&D ruleset',
      });
    }
  }

  // Validate experienceLevel
  if (body.experienceLevel !== undefined) {
    const validLevels = ['beginner', 'intermediate', 'expert'];
    if (!validLevels.includes(body.experienceLevel)) {
      errors.push({
        field: 'experienceLevel',
        message: 'Invalid experience level',
      });
    }
  }

  // Validate role
  if (body.role !== undefined) {
    const validRoles = ['player', 'dm', 'both'];
    if (!validRoles.includes(body.role)) {
      errors.push({
        field: 'role',
        message: 'Invalid role',
      });
    }
  }

  return errors;
}

/**
 * User type for sanitization (matches IUser from Mongoose model)
 */
interface UserDocument {
  _id: unknown;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profile: unknown;
  subscription: unknown;
  usage: unknown;
  preferences: unknown;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sanitize user data for API response
 * Returns only safe user fields (no sensitive data)
 */
export function sanitizeUserResponse(user: UserDocument) {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    profile: user.profile,
    subscription: user.subscription,
    usage: user.usage,
    preferences: user.preferences,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
