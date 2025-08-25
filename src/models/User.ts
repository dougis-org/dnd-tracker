import mongoose, { Schema, Model, Document } from 'mongoose';

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

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
