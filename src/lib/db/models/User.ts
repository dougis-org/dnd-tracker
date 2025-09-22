/**
 * User Mongoose schema with validation
 * Data Model: data-model.md:User Entity (lines 5-43)
 * Validation Rules: data-model.md:User validation (lines 39-42)
 * Required Fields: id, email, profile, subscription, usage, preferences
 */
import mongoose, { Schema, model, models } from 'mongoose'

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
    index: true,
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
  if (this.subscription.tier === 'free') {
    // Free Adventurer limits: 1 party, 3 encounters, 10 creatures
    if (this.usage.partiesCount > 1) {
      return next(new Error('Free tier allows maximum 1 party'))
    }
    if (this.usage.encountersCount > 3) {
      return next(new Error('Free tier allows maximum 3 encounters'))
    }
    if (this.usage.creaturesCount > 10) {
      return next(new Error('Free tier allows maximum 10 creatures'))
    }
  }

  next()
})

// Instance methods
UserSchema.methods.getTierLimits = function() {
  const tierLimits = {
    free: { parties: 1, encounters: 3, creatures: 10, maxParticipants: 6 },
    seasoned: { parties: 5, encounters: 15, creatures: 50, maxParticipants: 12 },
    expert: { parties: 25, encounters: 100, creatures: 250, maxParticipants: 20 },
    master: { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 }, // Unlimited
    guild: { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 }, // Unlimited
  }

  return tierLimits[this.subscription.tier as keyof typeof tierLimits] || tierLimits.free
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
  return this.updateOne({
    $inc: { [`usage.${type}`]: -1 },
    $max: { [`usage.${type}`]: 0 } // Prevent negative values
  })
}

// Static methods
UserSchema.statics.findByClerkId = function(clerkId: string) {
  return this.findOne({ id: clerkId })
}

UserSchema.statics.createFromClerkUser = function(clerkUser: any, profileData?: any) {
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
UserSchema.index({ id: 1 }, { unique: true })
UserSchema.index({ email: 1 }, { unique: true })
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
  getTierLimits(): any
  canCreateParty(): boolean
  canCreateEncounter(): boolean
  canCreateCreature(): boolean
  incrementUsage(type: 'partiesCount' | 'encountersCount' | 'creaturesCount'): Promise<any>
  decrementUsage(type: 'partiesCount' | 'encountersCount' | 'creaturesCount'): Promise<any>
}

export interface IUserModel extends mongoose.Model<IUser> {
  findByClerkId(clerkId: string): Promise<IUser | null>
  createFromClerkUser(clerkUser: any, profileData?: any): Promise<IUser>
}

// Create and export model
const User = (models.User as IUserModel) || model<IUser, IUserModel>('User', UserSchema)

export default User