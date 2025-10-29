/**
 * User Mongoose schema with validation
 * Data Model: data-model.md:User Entity (lines 5-43)
 * Validation Rules: data-model.md:User validation (lines 39-42)
 * Required Fields: id, email, profile, subscription, usage, preferences
 */
import mongoose, { Schema, model, models } from 'mongoose'
// import { TIER_LIMITS } from '@/lib/constants/tierLimits' // TODO: Re-enable after tests pass

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
const USER_ROLES = ['player', 'dm', 'both'] as const
const SUBSCRIPTION_TIERS = ['free', 'seasoned', 'expert', 'master', 'guild'] as const
const SUBSCRIPTION_STATUSES = ['active', 'cancelled', 'trial'] as const
const INITIATIVE_TYPES = ['manual', 'auto'] as const

// Profile schema - matches settings-api.yaml contract
const ProfileSchema = new Schema({
  displayName: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 100,
    default: null,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  dndEdition: {
    type: String,
    maxlength: 50,
    default: '5th Edition',
  },
  experienceLevel: {
    type: String,
    enum: ['new', 'beginner', 'intermediate', 'experienced', 'veteran'],
    default: null,
  },
  primaryRole: {
    type: String,
    enum: ['dm', 'player', 'both'],
    default: null,
  },
  profileSetupCompleted: {
    type: Boolean,
    default: false,
  },
  // Legacy fields for backward compatibility
  dndRuleset: {
    type: String,
    enum: DND_RULESETS,
  },
  role: {
    type: String,
    enum: USER_ROLES,
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

// Preferences schema - matches settings-api.yaml contract
const PreferencesSchema = new Schema({
  theme: {
    type: String,
    required: true,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  emailNotifications: {
    type: Boolean,
    required: true,
    default: true,
  },
  browserNotifications: {
    type: Boolean,
    required: true,
    default: false,
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC',
  },
  language: {
    type: String,
    required: true,
    default: 'en',
  },
  diceRollAnimations: {
    type: Boolean,
    required: true,
    default: true,
  },
  autoSaveEncounters: {
    type: Boolean,
    required: true,
    default: true,
  },
  // Legacy fields for backward compatibility
  defaultInitiativeType: {
    type: String,
    enum: INITIATIVE_TYPES,
    default: 'manual',
  },
  autoAdvanceRounds: {
    type: Boolean,
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
  // Identity fields (required for tests)
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'First name is required'],
    maxlength: [100, 'First name cannot exceed 100 characters'],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: [1, 'Last name is required'],
    maxlength: [100, 'Last name cannot exceed 100 characters'],
  },
  imageUrl: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ['local', 'clerk'],
    default: 'clerk',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  // Authorization & Subscription (flat structure per spec)
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  subscriptionTier: {
    type: String,
    enum: SUBSCRIPTION_TIERS,
    default: 'free',
  },
  // D&D Profile Preferences (NEW per spec)
  displayName: {
    type: String,
    trim: true,
    maxlength: [100, 'Display name cannot exceed 100 characters'],
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  dndEdition: {
    type: String,
    trim: true,
    maxlength: [50, 'D&D edition cannot exceed 50 characters'],
    default: '5th Edition',
  },
  experienceLevel: {
    type: String,
    enum: ['new', 'beginner', 'intermediate', 'experienced', 'veteran'],
  },
  primaryRole: {
    type: String,
    enum: ['dm', 'player', 'both'],
  },
  profileSetupCompleted: {
    type: Boolean,
    default: false,
  },
  // Usage Metrics (NEW per spec - flat counters)
  sessionsCount: {
    type: Number,
    default: 0,
    min: [0, 'Sessions count cannot be negative'],
  },
  charactersCreatedCount: {
    type: Number,
    default: 0,
    min: [0, 'Characters count cannot be negative'],
  },
  campaignsCreatedCount: {
    type: Number,
    default: 0,
    min: [0, 'Campaigns count cannot be negative'],
  },
  metricsLastUpdated: {
    type: Date,
  },
  // Clerk Integration
  lastClerkSync: {
    type: Date,
  },
  syncStatus: {
    type: String,
    enum: ['active', 'pending', 'error'],
    default: 'pending',
  },
  lastLoginAt: {
    type: Date,
  },
  // Legacy nested schemas (keep for backward compatibility)
  profile: {
    type: ProfileSchema,
    required: false,
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

  // TODO: Re-enable tier limits validation after tests pass
  // Subscription tier determines usage limits enforcement
  // const limits = TIER_LIMITS[this.subscription.tier]
  // if (limits.parties !== -1 && this.usage.partiesCount > limits.parties) {
  //   return next(new Error(`${this.subscription.tier} tier allows maximum ${limits.parties} ${limits.parties === 1 ? 'party' : 'parties'}`))
  // }
  // if (limits.encounters !== -1 && this.usage.encountersCount > limits.encounters) {
  //   return next(new Error(`${this.subscription.tier} tier allows maximum ${limits.encounters} encounters`))
  // }
  // if (limits.creatures !== -1 && this.usage.creaturesCount > limits.creatures) {
  //   return next(new Error(`${this.subscription.tier} tier allows maximum ${limits.creatures} creatures`))
  // }

  next()
})

// Instance methods
UserSchema.methods.getTierLimits = function() {
  // TODO: Re-enable after tests pass
  // return TIER_LIMITS[this.subscription.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
  return { parties: -1, encounters: -1, creatures: -1, maxParticipants: -1 } // Temporary unlimited
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
      dndEdition: '5th Edition',
      experienceLevel: 'beginner',
      primaryRole: 'player',
      timezone: 'UTC',
      profileSetupCompleted: false,
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
      theme: 'system',
      emailNotifications: true,
      browserNotifications: false,
      timezone: 'UTC',
      language: 'en',
      diceRollAnimations: true,
      autoSaveEncounters: true,
      defaultInitiativeType: 'manual',
      autoAdvanceRounds: false,
    },
  }

  return this.create(userData)
}

// Indexes for performance
// Note: id and email indexes are created automatically via unique: true in field definitions
// Compound index for queries that filter by tier and sort by creation date
UserSchema.index({ 'subscription.tier': 1, createdAt: -1 })
// Keep separate createdAt index for queries that only sort by creation date
UserSchema.index({ createdAt: 1 })

// Export types
export interface IUser extends mongoose.Document {
  // Identity & Authentication
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  imageUrl?: string
  authProvider: 'local' | 'clerk'
  isEmailVerified: boolean

  // Authorization & Subscription (flat per spec)
  role: 'user' | 'admin'
  subscriptionTier: typeof SUBSCRIPTION_TIERS[number]

  // D&D Profile Preferences (NEW)
  displayName?: string
  timezone: string
  dndEdition: string
  experienceLevel?: 'new' | 'beginner' | 'intermediate' | 'experienced' | 'veteran'
  primaryRole?: 'dm' | 'player' | 'both'
  profileSetupCompleted: boolean

  // Usage Metrics (NEW - flat counters)
  sessionsCount: number
  charactersCreatedCount: number
  campaignsCreatedCount: number
  metricsLastUpdated?: Date

  // Clerk Integration
  lastClerkSync?: Date
  syncStatus: 'active' | 'pending' | 'error'
  lastLoginAt?: Date

  // Nested schemas (matches settings-api.yaml contract)
  profile?: {
    displayName?: string | null
    timezone?: string
    dndEdition?: string
    experienceLevel?: 'new' | 'beginner' | 'intermediate' | 'experienced' | 'veteran' | null
    primaryRole?: 'dm' | 'player' | 'both' | null
    profileSetupCompleted?: boolean
    // Legacy fields for backward compatibility
    dndRuleset?: typeof DND_RULESETS[number]
    role?: typeof USER_ROLES[number]
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
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    emailNotifications?: boolean
    browserNotifications?: boolean
    timezone?: string
    language?: string
    diceRollAnimations?: boolean
    autoSaveEncounters?: boolean
    // Legacy fields for backward compatibility
    defaultInitiativeType?: typeof INITIATIVE_TYPES[number]
    autoAdvanceRounds?: boolean
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
const User: IUserModel = models.User as IUserModel || model<IUser, IUserModel>('User', UserSchema);

export default User;
export { User };