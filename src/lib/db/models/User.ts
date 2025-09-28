/**
 * User Mongoose schema with validation
 * Data Model: data-model.md:User Entity (lines 5-43)
 * Validation Rules: data-model.md:User validation (lines 39-42)
 * Required Fields: id, email, profile, subscription, usage, preferences
 */
import mongoose, { Schema, model, models } from 'mongoose'
import { TIER_LIMITS } from '@/lib/constants/tierLimits'

// Clerk user type interface
interface ClerkUser {
  id: string
  emailAddresses: Array<{ emailAddress: string }>
  firstName?: string | null
  lastName?: string | null
}

// Profile data interface
interface ProfileData {
  displayName?: string
  dndRuleset?: string
  experienceLevel?: string
  role?: string
}

// Enum definitions matching data-model.md and contracts
const DND_RULESETS = ['5e', '3.5e', 'pf1', 'pf2'] as const
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert'] as const
const USER_ROLES = ['player', 'dm', 'both'] as const
const SUBSCRIPTION_TIERS = ['free', 'seasoned', 'expert', 'master', 'guild'] as const
const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'trial'] as const
const THEMES = ['light', 'dark', 'auto'] as const
const INITIATIVE_TYPES = ['manual', 'auto'] as const

// Profile schema
const ProfileSchema = new Schema({
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  },
  dndRuleset: {
    type: String,
    required: true,
    enum: DND_RULESETS,
    default: '5e',
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: EXPERIENCE_LEVELS,
    default: 'beginner',
  },
  role: {
    type: String,
    required: true,
    enum: USER_ROLES,
    default: 'player',
  },
}, { _id: false })

// Subscription schema
const SubscriptionSchema = new Schema({
  tier: {
    type: String,
    required: true,
    enum: SUBSCRIPTION_TIERS,
    default: 'free',
  },
  status: {
    type: String,
    required: true,
    enum: SUBSCRIPTION_STATUSES,
    default: 'active',
  },
  currentPeriodEnd: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
}, { _id: false })

// Usage schema with validation rules
const UsageSchema = new Schema({
  partiesCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  encountersCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  creaturesCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
}, { _id: false })

// Preferences schema
const PreferencesSchema = new Schema({
  theme: {
    type: String,
    required: true,
    enum: THEMES,
    default: 'auto',
  },
  defaultInitiativeType: {
    type: String,
    required: true,
    enum: INITIATIVE_TYPES,
    default: 'manual',
  },
  autoAdvanceRounds: {
    type: Boolean,
    required: true,
    default: false,
  },
}, { _id: false })

// Main User schema
const UserSchema = new Schema({
  // Clerk user ID as primary identifier
  id: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  profile: {
    type: ProfileSchema,
    required: true,
  },
  subscription: {
    type: SubscriptionSchema,
    required: true,
  },
  usage: {
    type: UsageSchema,
    required: true,
  },
  preferences: {
    type: PreferencesSchema,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users',
})

// Validation rules per data-model.md:User validation (lines 39-42)
UserSchema.pre('save', function(next) {
  // Email must be unique and valid format (handled by schema)

  // Subscription tier determines usage limits enforcement
  const limits = TIER_LIMITS[this.subscription.tier]
  if (limits.parties !== -1 && this.usage.partiesCount > limits.parties) {
    return next(new Error(`${this.subscription.tier} tier allows maximum ${limits.parties} ${limits.parties === 1 ? 'party' : 'parties'}`))
  }
  if (limits.encounters !== -1 && this.usage.encountersCount > limits.encounters) {
    return next(new Error(`${this.subscription.tier} tier allows maximum ${limits.encounters} encounters`))
  }
  if (limits.creatures !== -1 && this.usage.creaturesCount > limits.creatures) {
    return next(new Error(`${this.subscription.tier} tier allows maximum ${limits.creatures} creatures`))
  }

  next()
})

// Instance methods
UserSchema.methods.getTierLimits = function() {
  return TIER_LIMITS[this.subscription.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
}

UserSchema.methods.canCreateParty = function() {
  const limits = this.getTierLimits()
  return limits.parties === -1 || this.usage.partiesCount < limits.parties
}

UserSchema.methods.canCreateEncounter = function() {
  const limits = this.getTierLimits()
  return limits.encounters === -1 || this.usage.encountersCount < limits.encounters
}

UserSchema.methods.canCreateCreature = function() {
  const limits = this.getTierLimits()
  return limits.creatures === -1 || this.usage.creaturesCount < limits.creatures
}

// Usage count atomic update methods
UserSchema.methods.incrementUsage = function(type: 'partiesCount' | 'encountersCount' | 'creaturesCount') {
  return this.updateOne({ $inc: { [`usage.${type}`]: 1 } })
}

UserSchema.methods.decrementUsage = function(type: 'partiesCount' | 'encountersCount' | 'creaturesCount') {
  return this.updateOne(
    { [`usage.${type}`]: { $gt: 0 } }, // Only update if value is greater than 0
    { $inc: { [`usage.${type}`]: -1 } }
  )
}

// Static methods
UserSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ id: clerkId })
}

UserSchema.statics.createFromClerkUser = function(clerkUser: ClerkUser, profileData?: ProfileData) {
  const userData = {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    profile: {
      displayName: profileData?.displayName || clerkUser.firstName || 'Adventurer',
      dndRuleset: profileData?.dndRuleset || '5e',
      experienceLevel: profileData?.experienceLevel || 'beginner',
      role: profileData?.role || 'player',
    },
    subscription: {
      tier: 'free',
      status: 'trial',
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 day trial
    },
    usage: {
      partiesCount: 0,
      encountersCount: 0,
      creaturesCount: 0,
    },
    preferences: {
      theme: 'auto',
      defaultInitiativeType: 'manual',
      autoAdvanceRounds: false,
    },
  }

  return this.create(userData)
}

// Indexes for performance
// Note: id and email indexes are created automatically via unique: true in field definitions
UserSchema.index({ 'subscription.tier': 1 })
UserSchema.index({ createdAt: 1 })

// Export types
export interface IUser extends mongoose.Document {
  id: string
  email: string
  profile: {
    displayName: string
    dndRuleset: typeof DND_RULESETS[number]
    experienceLevel: typeof EXPERIENCE_LEVELS[number]
    role: typeof USER_ROLES[number]
  }
  subscription: {
    tier: typeof SUBSCRIPTION_TIERS[number]
    status: typeof SUBSCRIPTION_STATUSES[number]
    currentPeriodEnd: Date
  }
  usage: {
    partiesCount: number
    encountersCount: number
    creaturesCount: number
  }
  preferences: {
    theme: typeof THEMES[number]
    defaultInitiativeType: typeof INITIATIVE_TYPES[number]
    autoAdvanceRounds: boolean
  }
  createdAt: Date
  updatedAt: Date

  // Methods
  getTierLimits(): { parties: number; encounters: number; creatures: number; maxParticipants: number }
  canCreateParty(): boolean
  canCreateEncounter(): boolean
  canCreateCreature(): boolean
  incrementUsage(type: 'partiesCount' | 'encountersCount' | 'creaturesCount'): Promise<mongoose.UpdateWriteOpResult>
  decrementUsage(type: 'partiesCount' | 'encountersCount' | 'creaturesCount'): Promise<mongoose.UpdateWriteOpResult>
}

export interface IUserModel extends mongoose.Model<IUser> {
  findByClerkId(clerkId: string): Promise<IUser | null>
  createFromClerkUser(clerkUser: ClerkUser, profileData?: ProfileData): Promise<IUser>
}

// Create and export model
const User = (models.User as IUserModel) || model<IUser, IUserModel>('User', UserSchema)

export default User