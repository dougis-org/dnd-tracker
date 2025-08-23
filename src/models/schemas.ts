import mongoose, { Schema, Model, Document } from 'mongoose';

// Character interface and schema
export interface ICharacter extends Document {
  name: string;
  level: number;
  hitPoints: number;
  armorClass: number;
  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name cannot be empty'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [1, 'Level must be between 1 and 20'],
    max: [20, 'Level must be between 1 and 20'],
    validate: {
      validator: Number.isInteger,
      message: 'Level must be an integer',
    },
  },
  hitPoints: {
    type: Number,
    required: [true, 'Hit points is required'],
    min: [0, 'Hit points cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Hit points must be an integer',
    },
  },
  armorClass: {
    type: Number,
    required: [true, 'Armor class is required'],
    min: [0, 'Armor class must be between 0 and 30'],
    max: [30, 'Armor class must be between 0 and 30'],
    validate: {
      validator: Number.isInteger,
      message: 'Armor class must be an integer',
    },
  },
}, {
  timestamps: true,
});

/**
 * User Model with Clerk Integration and Subscription Management
 * 
 * This interface defines the complete User schema for the D&D Tracker application.
 * It integrates with Clerk for authentication and includes subscription tiers and
 * usage tracking for feature gating.
 * 
 * @interface IUser
 * @extends Document MongoDB document interface
 * 
 * ## Clerk Integration
 * - clerkId: Primary identifier from Clerk authentication service (required, unique)
 * - email: User's email address (required, unique, auto-lowercased)
 * - username: Display name (required, 2-30 characters)
 * - imageUrl: Optional profile picture URL (must be valid HTTP/HTTPS URL)
 * 
 * ## Role Management
 * - role: User role determining permissions ('player' | 'dm' | 'admin'), defaults to 'player'
 * 
 * ## Subscription System
 * Supports 5-tier subscription model for feature gating:
 * - tier: 'free' | 'seasoned' | 'expert' | 'master' | 'guild' (defaults to 'free')
 * - status: 'active' | 'canceled' | 'past_due' | 'trialing' (defaults to 'trialing')
 * - stripeCustomerId: Stripe customer ID for billing (optional)
 * - stripeSubscriptionId: Stripe subscription ID (optional)
 * - currentPeriodEnd: When current billing period ends (optional)
 * - trialEndsAt: When free trial ends (auto-set to 14 days for new users)
 * 
 * ## Usage Tracking
 * Tracks resource usage for enforcing tier-based limits:
 * - parties: Number of parties created (integer >= 0)
 * - encounters: Number of encounters created (integer >= 0)
 * - creatures: Number of creatures created (integer >= 0)
 * - lastResetDate: When usage counters were last reset
 * 
 * ## Validation & Sanitization
 * All input is validated and sanitized:
 * - Email addresses are lowercased and trimmed
 * - Strings are trimmed of whitespace
 * - Enums are strictly validated
 * - URLs are validated for proper format
 * - Numbers are validated as integers >= 0
 * - Dates are validated for proper format
 * 
 * ## Default Values
 * New users get sensible defaults:
 * - role: 'player'
 * - subscription.tier: 'free'
 * - subscription.status: 'trialing'
 * - subscription.trialEndsAt: 14 days from creation
 * - usage: all counters start at 0
 * - usage.lastResetDate: current date
 * 
 * @example
 * ```typescript
 * // Create a new user with minimal data
 * const user = new UserModel({
 *   clerkId: 'user_12345',
 *   email: 'player@example.com',
 *   username: 'dragonslayer',
 * });
 * // Defaults will be applied automatically
 * 
 * // Create a user with full subscription data
 * const premiumUser = new UserModel({
 *   clerkId: 'user_67890',
 *   email: 'dm@example.com',
 *   username: 'dungeon_master',
 *   role: 'dm',
 *   subscription: {
 *     tier: 'master',
 *     status: 'active',
 *     stripeCustomerId: 'cus_12345',
 *     stripeSubscriptionId: 'sub_12345',
 *     currentPeriodEnd: new Date('2024-12-31'),
 *   },
 *   usage: {
 *     parties: 5,
 *     encounters: 25,
 *     creatures: 100,
 *     lastResetDate: new Date('2024-01-01'),
 *   },
 * });
 * ```
 */
export interface IUser extends Document {
  // Clerk Integration
  clerkId: string;
  email: string;
  username: string;
  imageUrl?: string;

  // Role Management
  role: 'player' | 'dm' | 'admin';

  // Subscription Information
  subscription: {
    tier: 'free' | 'seasoned' | 'expert' | 'master' | 'guild';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: Date | null;
    trialEndsAt?: Date | null;
  };

  // Usage Tracking (for tier limits)
  usage: {
    parties: number;
    encounters: number;
    creatures: number;
    lastResetDate: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  // Clerk Integration
  clerkId: {
    type: String,
    required: [true, 'Clerk ID is required'],
    unique: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format',
    },
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be between 2 and 30 characters'],
    maxlength: [30, 'Username must be between 2 and 30 characters'],
  },
  imageUrl: {
    type: String,
    required: false,
    validate: {
      validator: function(url: string) {
        if (!url) return true; // Optional field
        return /^https?:\/\/.+/.test(url);
      },
      message: 'Invalid image URL format',
    },
  },

  // Role Management
  role: {
    type: String,
    required: true,
    enum: {
      values: ['player', 'dm', 'admin'],
      message: 'Invalid role. Must be player, dm, or admin',
    },
    default: 'player',
  },

  // Subscription Information
  subscription: {
    tier: {
      type: String,
      required: true,
      enum: {
        values: ['free', 'seasoned', 'expert', 'master', 'guild'],
        message: 'Invalid subscription tier',
      },
      default: 'free',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['active', 'canceled', 'past_due', 'trialing'],
        message: 'Invalid subscription status',
      },
      default: 'trialing',
    },
    stripeCustomerId: {
      type: String,
      required: false,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      required: false,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      required: false,
      default: null,
    },
    trialEndsAt: {
      type: Date,
      required: false,
      default: null,
    },
  },

  // Usage Tracking (for tier limits)
  usage: {
    parties: {
      type: Number,
      required: true,
      min: [0, 'Usage values cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Usage values must be integers',
      },
      default: 0,
    },
    encounters: {
      type: Number,
      required: true,
      min: [0, 'Usage values cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Usage values must be integers',
      },
      default: 0,
    },
    creatures: {
      type: Number,
      required: true,
      min: [0, 'Usage values cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Usage values must be integers',
      },
      default: 0,
    },
    lastResetDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
}, {
  timestamps: true,
});

// Create models
export const CharacterModel: Model<ICharacter> = 
  mongoose.models.Character || mongoose.model<ICharacter>('Character', CharacterSchema);

export const UserModel: Model<IUser> = 
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Character validation function
export function validateCharacter(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else {
    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
      errors.push('Name is required');
    } else {
      sanitizedData.name = trimmedName;
    }
  }

  // Validate level
  if (data.level === undefined || data.level === null) {
    errors.push('Level is required');
  } else {
    const level = Number(data.level);
    if (isNaN(level) || !Number.isInteger(level)) {
      errors.push('Level must be an integer');
    } else if (level < 1 || level > 20) {
      errors.push('Level must be between 1 and 20');
    } else {
      sanitizedData.level = level;
    }
  }

  // Validate hit points
  if (data.hitPoints === undefined || data.hitPoints === null) {
    errors.push('Hit points is required');
  } else {
    const hitPoints = Number(data.hitPoints);
    if (isNaN(hitPoints) || !Number.isInteger(hitPoints)) {
      errors.push('Hit points must be an integer');
    } else if (hitPoints < 0) {
      errors.push('Hit points cannot be negative');
    } else {
      sanitizedData.hitPoints = hitPoints;
    }
  }

  // Validate armor class
  if (data.armorClass === undefined || data.armorClass === null) {
    errors.push('Armor class is required');
  } else {
    const armorClass = Number(data.armorClass);
    if (isNaN(armorClass) || !Number.isInteger(armorClass)) {
      errors.push('Armor class must be an integer');
    } else if (armorClass < 0 || armorClass > 30) {
      errors.push('Armor class must be between 0 and 30');
    } else {
      sanitizedData.armorClass = armorClass;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

/**
 * Validates and sanitizes user data according to the User schema requirements.
 * 
 * This function performs comprehensive validation of all user fields and returns
 * sanitized data with appropriate defaults applied. It's used for both user
 * creation and updates to ensure data integrity.
 * 
 * @param data - Raw user data object to validate
 * @returns ValidationResult with isValid flag, errors array, and sanitizedData
 * 
 * ## Validation Rules
 * 
 * ### Required Fields
 * - clerkId: Non-empty string, trimmed
 * - email: Valid email format, lowercased and trimmed
 * - username: String between 2-30 characters, trimmed
 * 
 * ### Optional Fields
 * - imageUrl: Valid HTTP/HTTPS URL or empty
 * - role: Must be 'player', 'dm', or 'admin' (defaults to 'player')
 * - subscription: Object with tier and status validation
 * - usage: Object with non-negative integer validation
 * 
 * ### Default Behavior
 * - Missing subscription gets free trial with 14-day expiration
 * - Missing usage gets all counters set to 0
 * - Missing role defaults to 'player'
 * - Trial users get automatic trialEndsAt date
 * 
 * ### Error Handling
 * - Returns detailed error messages for each validation failure
 * - Continues validation even after first error (collects all issues)
 * - Returns undefined sanitizedData when validation fails
 * 
 * @example
 * ```typescript
 * // Validate minimal user data
 * const result = validateUser({
 *   clerkId: 'user_12345',
 *   email: 'test@example.com',
 *   username: 'testuser',
 * });
 * 
 * if (result.isValid) {
 *   const user = new UserModel(result.sanitizedData);
 *   await user.save();
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * 
 * // Validate with subscription data
 * const premiumResult = validateUser({
 *   clerkId: 'user_67890',
 *   email: 'premium@example.com',
 *   username: 'premium_user',
 *   subscription: {
 *     tier: 'master',
 *     status: 'active',
 *   },
 *   usage: {
 *     parties: 10,
 *     encounters: 50,
 *     creatures: 200,
 *   },
 * });
 * ```
 */
export function validateUser(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validate required fields first
  // Validate clerkId
  if (!data.clerkId || typeof data.clerkId !== 'string') {
    errors.push('Clerk ID is required');
  } else {
    const trimmedClerkId = data.clerkId.trim();
    if (trimmedClerkId.length === 0) {
      errors.push('Clerk ID is required');
    } else {
      sanitizedData.clerkId = trimmedClerkId;
    }
  }

  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const email = data.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    } else {
      sanitizedData.email = email;
    }
  }

  // Validate username
  if (!data.username || typeof data.username !== 'string') {
    errors.push('Username is required');
  } else {
    const trimmedUsername = data.username.trim();
    if (trimmedUsername.length < 2 || trimmedUsername.length > 30) {
      errors.push('Username must be between 2 and 30 characters');
    } else {
      sanitizedData.username = trimmedUsername;
    }
  }

  // Validate optional fields
  // Validate imageUrl (optional)
  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl === 'string') {
      const trimmedUrl = data.imageUrl.trim();
      if (trimmedUrl && !/^https?:\/\/.+/.test(trimmedUrl)) {
        errors.push('Invalid image URL format');
      } else {
        sanitizedData.imageUrl = trimmedUrl || undefined;
      }
    } else {
      errors.push('Image URL must be a string');
    }
  }

  // Validate role (optional, defaults to 'player')
  const validRoles = ['player', 'dm', 'admin'];
  if (data.role !== undefined) {
    if (!validRoles.includes(data.role)) {
      errors.push('Invalid role. Must be player, dm, or admin');
    } else {
      sanitizedData.role = data.role;
    }
  } else {
    sanitizedData.role = 'player'; // default
  }

  // Initialize default subscription if not provided
  if (!data.subscription) {
    sanitizedData.subscription = {
      tier: 'free',
      status: 'trialing',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    };
  } else {
    // Validate subscription object
    const subscription: any = {};

    // Validate tier
    const validTiers = ['free', 'seasoned', 'expert', 'master', 'guild'];
    if (!data.subscription.tier || !validTiers.includes(data.subscription.tier)) {
      errors.push('Invalid subscription tier');
    } else {
      subscription.tier = data.subscription.tier;
    }

    // Validate status
    const validStatuses = ['active', 'canceled', 'past_due', 'trialing'];
    if (!data.subscription.status || !validStatuses.includes(data.subscription.status)) {
      errors.push('Invalid subscription status');
    } else {
      subscription.status = data.subscription.status;
    }

    // Set optional Stripe fields
    subscription.stripeCustomerId = data.subscription.stripeCustomerId || null;
    subscription.stripeSubscriptionId = data.subscription.stripeSubscriptionId || null;
    subscription.currentPeriodEnd = data.subscription.currentPeriodEnd || null;

    // Set trial end date - auto-calculate for new trialing subscriptions
    if (data.subscription.status === 'trialing' && !data.subscription.trialEndsAt) {
      subscription.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    } else {
      subscription.trialEndsAt = data.subscription.trialEndsAt || null;
    }

    sanitizedData.subscription = subscription;
  }

  // Initialize default usage if not provided
  if (!data.usage) {
    sanitizedData.usage = {
      parties: 0,
      encounters: 0,
      creatures: 0,
      lastResetDate: new Date(),
    };
  } else {
    // Validate usage object
    const usage: any = {};

    // Validate usage numbers
    const usageFields = ['parties', 'encounters', 'creatures'];
    for (const field of usageFields) {
      if (data.usage[field] !== undefined) {
        const value = Number(data.usage[field]);
        if (isNaN(value)) {
          errors.push(`Usage ${field} must be a number`);
        } else if (!Number.isInteger(value)) {
          errors.push('Usage values must be integers');
        } else if (value < 0) {
          errors.push('Usage values cannot be negative');
        } else {
          usage[field] = value;
        }
      } else {
        usage[field] = 0; // default
      }
    }

    // Validate lastResetDate
    if (data.usage.lastResetDate) {
      if (data.usage.lastResetDate instanceof Date) {
        usage.lastResetDate = data.usage.lastResetDate;
      } else {
        const date = new Date(data.usage.lastResetDate);
        if (isNaN(date.getTime())) {
          errors.push('Invalid lastResetDate format');
        } else {
          usage.lastResetDate = date;
        }
      }
    } else {
      usage.lastResetDate = new Date(); // default to now
    }

    sanitizedData.usage = usage;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}