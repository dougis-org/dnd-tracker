import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import {
  getStandardSchemaOptions,
  commonFields,
  commonIndexes,
} from './shared/schema-utils';
import type { EnhancedCharacterModel } from './EnhancedCharacter';

// Party document interface - uses userId (Clerk ID) instead of ownerId
export interface IEnhancedParty extends Document {
  _id: Types.ObjectId;
  userId: string; // Clerk user ID (preserving existing auth)
  name: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  sharedWith: Array<{ userId: string; role: 'viewer' | 'editor'; sharedAt: Date }>;
  settings: {
    allowJoining: boolean;
    requireApproval: boolean;
    maxMembers: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;

  // Virtual properties
  readonly memberCount: number;

  // Instance methods
  getPlayerCharacterCount(): Promise<number>;
  getAverageLevel(): Promise<number>;
  addMember(_characterId: Types.ObjectId): Promise<void>;
  removeMember(_characterId: Types.ObjectId): Promise<void>;
  getMembers(): Promise<any[]>;
  updateActivity(): Promise<void>;
}

// Party model interface with static methods
export interface EnhancedPartyModel extends Model<IEnhancedParty> {
  findByUserId(_userId: string): Promise<IEnhancedParty[]>;
  findPublic(): Promise<IEnhancedParty[]>;
  searchByName(_searchTerm: string): Promise<IEnhancedParty[]>;
  findSharedWith(_userId: string): Promise<IEnhancedParty[]>;
}

// Mongoose schema definition
const enhancedPartySchema = new Schema<IEnhancedParty, EnhancedPartyModel>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
      index: true,
    },
    name: {
      ...commonFields.name,
      index: 'text',
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Party cannot have more than 10 tags',
      },
    },
    isPublic: commonFields.isPublic,
    sharedWith: {
      type: [
        {
          userId: { type: String, required: true },
          role: { type: String, enum: ['viewer', 'editor'], required: true },
          sharedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      validate: {
        validator: function (sharedAccess: Array<{ userId: string, role: string }>) {
          return sharedAccess.length <= 50;
        },
        message: 'Party cannot be shared with more than 50 users',
      },
    },
    settings: {
      allowJoining: {
        type: Boolean,
        default: false,
      },
      requireApproval: {
        type: Boolean,
        default: true,
      },
      maxMembers: {
        type: Number,
        default: 6,
        min: [1, 'Party must allow at least 1 member'],
        max: [100, 'Party cannot have more than 100 members'],
      },
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  getStandardSchemaOptions()
);

// Virtual for member count
enhancedPartySchema.virtual('memberCount', {
  ref: 'EnhancedCharacter',
  localField: '_id',
  foreignField: 'partyId',
  count: true,
});

// Instance method: Get player character count
enhancedPartySchema.methods.getPlayerCharacterCount = async function (): Promise<number> {
  const EnhancedCharacter = mongoose.models.EnhancedCharacter as EnhancedCharacterModel;
  const count = await EnhancedCharacter.countDocuments({
    partyId: this._id,
    type: 'pc',
    isDeleted: { $ne: true },
  });
  return count;
};

// Instance method: Get average level
enhancedPartySchema.methods.getAverageLevel = async function (): Promise<number> {
  const EnhancedCharacter = mongoose.models.EnhancedCharacter as EnhancedCharacterModel;
  const members = await EnhancedCharacter.find({
    partyId: this._id,
    isDeleted: { $ne: true },
  });

  if (members.length === 0) return 0;
  const totalLevel = members.reduce((sum, character) => {
    return sum + character.classes.reduce((classSum: number, charClass: any) => classSum + charClass.level, 0);
  }, 0);
  return Math.round(totalLevel / members.length);
};

// Helper function to get current member count
async function getCurrentMemberCount(partyId: Types.ObjectId): Promise<number> {
  const EnhancedCharacter = mongoose.models.EnhancedCharacter as EnhancedCharacterModel;
  return await EnhancedCharacter.countDocuments({
    partyId,
    isDeleted: { $ne: true },
  });
}

// Helper function to update character party membership
async function updateCharacterParty(characterId: Types.ObjectId, partyId: Types.ObjectId): Promise<void> {
  const EnhancedCharacter = mongoose.models.EnhancedCharacter as EnhancedCharacterModel;
  await EnhancedCharacter.findByIdAndUpdate(characterId, { partyId });
}

// Helper function to validate party capacity
function validatePartyCapacity(currentCount: number, maxMembers: number): void {
  if (currentCount >= maxMembers) {
    throw new Error('Party is at maximum capacity');
  }
}

// Instance method: Add member to party
enhancedPartySchema.methods.addMember = async function (characterId: Types.ObjectId): Promise<void> {
  const currentMemberCount = await getCurrentMemberCount(this._id);
  validatePartyCapacity(currentMemberCount, this.settings.maxMembers);
  await updateCharacterParty(characterId, this._id);
  await this.updateActivity();
};

// Helper function to remove character from party
async function removeCharacterFromParty(characterId: Types.ObjectId): Promise<void> {
  const EnhancedCharacter = mongoose.models.EnhancedCharacter as EnhancedCharacterModel;
  await EnhancedCharacter.findByIdAndUpdate(characterId, {
    $unset: { partyId: 1 },
  });
}

// Instance method: Remove member from party
enhancedPartySchema.methods.removeMember = async function (characterId: Types.ObjectId): Promise<void> {
  await removeCharacterFromParty(characterId);
  await this.updateActivity();
};

// Helper function to find party members
async function findPartyMembers(partyId: Types.ObjectId): Promise<any[]> {
  const EnhancedCharacter = mongoose.models.EnhancedCharacter as EnhancedCharacterModel;
  return await EnhancedCharacter.find({
    partyId,
    isDeleted: { $ne: true },
  }).sort({ name: 1 });
}

// Instance method: Get all party members
enhancedPartySchema.methods.getMembers = async function (): Promise<any[]> {
  return await findPartyMembers(this._id);
};

// Instance method: Update last activity
enhancedPartySchema.methods.updateActivity = async function (): Promise<void> {
  this.lastActivity = new Date();
  await this.save();
};

// Static method: Find parties by user ID
enhancedPartySchema.statics.findByUserId = function (userId: string) {
  return this.find({ userId }).sort({ name: 1 });
};

// Static method: Find public parties
enhancedPartySchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ name: 1 });
};

// Static method: Search parties by name
enhancedPartySchema.statics.searchByName = function (searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
  }).sort({ score: { $meta: 'textScore' } });
};

// Static method: Find parties shared with user
enhancedPartySchema.statics.findSharedWith = function (userId: string) {
  return this.find({
    'sharedWith.userId': userId,
  }).sort({ name: 1 });
};

// Helper function to validate party name
function validatePartyName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new Error('Party name is required');
  }
}

// Helper function to ensure last activity is set
function ensureLastActivity(party: any): void {
  if (!party.lastActivity) {
    party.lastActivity = new Date();
  }
}

// Pre-save middleware for validation
enhancedPartySchema.pre('save', function (next) {
  try {
    validatePartyName(this.name);
    ensureLastActivity(this);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Post-save middleware for logging
enhancedPartySchema.post('save', function (doc, next) {
  // Production logging would go here if needed
  next();
});

// Party-specific indexes using userId instead of ownerId
enhancedPartySchema.index({ userId: 1, createdAt: -1 });
enhancedPartySchema.index({ userId: 1, name: 1 });
enhancedPartySchema.index({ isPublic: 1, createdAt: -1 });
enhancedPartySchema.index({ isPublic: 1, name: 1 });
enhancedPartySchema.index({ createdAt: -1 });
enhancedPartySchema.index({ updatedAt: -1 });
enhancedPartySchema.index({ name: 'text', description: 'text' });
enhancedPartySchema.index({ tags: 1 });
enhancedPartySchema.index({ 'settings.allowJoining': 1 });
enhancedPartySchema.index({ lastActivity: -1 });

// Create and export the model
export const EnhancedParty =
  (mongoose.models.EnhancedParty as EnhancedPartyModel) ||
  mongoose.model<IEnhancedParty, EnhancedPartyModel>('EnhancedParty', enhancedPartySchema);