/**
 * Profile validation helper functions
 * Extracted to reduce complexity in API route handlers
 *
 * Constitutional: Max 100 lines, max 50 lines per function
 */

/**
 * Validation constants
 */
export const VALID_RULESETS = ['5e', '3.5e', 'pf1', 'pf2'] as const;
export const VALID_EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert'] as const;
export const VALID_ROLES = ['player', 'dm', 'both'] as const;
export const MAX_DISPLAY_NAME_LENGTH = 100;

export type DndRuleset = typeof VALID_RULESETS[number];
export type ExperienceLevel = typeof VALID_EXPERIENCE_LEVELS[number];
export type UserRole = typeof VALID_ROLES[number];

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
  dndRuleset?: DndRuleset;
  experienceLevel?: ExperienceLevel;
  role?: UserRole;
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
  if (body.displayName !== undefined && body.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    errors.push({
      field: 'displayName',
      message: `Display name cannot exceed ${MAX_DISPLAY_NAME_LENGTH} characters`,
    });
  }

  // Validate dndRuleset
  if (body.dndRuleset !== undefined) {
    if (!VALID_RULESETS.includes(body.dndRuleset)) {
      errors.push({
        field: 'dndRuleset',
        message: 'Invalid D&D ruleset',
      });
    }
  }

  // Validate experienceLevel
  if (body.experienceLevel !== undefined) {
    if (!VALID_EXPERIENCE_LEVELS.includes(body.experienceLevel)) {
      errors.push({
        field: 'experienceLevel',
        message: 'Invalid experience level',
      });
    }
  }

  // Validate role
  if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role)) {
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
 * Auth result type
 */
interface AuthResult {
  userId?: string | null;
}

/**
 * Verify user authentication and authorization
 * Returns clerkUserId if authorized, null otherwise
 */
export async function verifyUserAuth(
  context: { params: { id: string }; auth?: AuthResult },
  authFn: () => Promise<AuthResult | null>
): Promise<{ clerkUserId: string | null; error?: { message: string; status: number } }> {
  // Get Clerk authentication
  const authResult = context.auth || (await authFn());
  const clerkUserId = authResult?.userId;

  // Check authentication
  if (!clerkUserId) {
    return {
      clerkUserId: null,
      error: { message: 'Unauthorized', status: 401 },
    };
  }

  return { clerkUserId };
}

/**
 * Check if authenticated user matches the user ID in the request
 */
export function checkUserAuthorization(
  user: UserDocument | null,
  clerkUserId: string
): { error?: { message: string; status: number } } {
  if (!user) {
    return { error: { message: 'User not found', status: 404 } };
  }

  // Authorization check: user can only access their own profile
  if (user.id !== clerkUserId) {
    return { error: { message: 'Forbidden', status: 403 } };
  }

  return {};
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
