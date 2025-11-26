import mongoose, { Schema, Document } from 'mongoose';

/**
 * User document interface - represents a persistent user record
 * Synced via Clerk webhook events
 */
export interface UserDoc extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  email: string;
  displayName: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * UserEvent document interface - immutable event log for webhook payloads
 * Provides audit trail and replay capability
 */
export interface UserEventDoc extends Document {
  _id: mongoose.Types.ObjectId;
  eventId?: string;
  eventType: 'created' | 'updated' | 'deleted';
  userId?: string;
  payload: Record<string, unknown>;
  source?: string;
  signature?: string;
  signatureValid?: boolean | null;
  receivedAt: Date;
  processedAt?: Date;
  status: 'stored' | 'processed' | 'failed';
  error?: string;
}

/**
 * User Schema - stores persistent user records with soft-delete support
 * Indexes:
 * - Unique on userId (auth provider ID)
 * - Unique on email (user email)
 * - Sorted on updatedAt (recency queries)
 * - Compound on deletedAt + updatedAt (soft-delete filtering)
 */
const UserSchema = new Schema<UserDoc>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      immutable: true,
    },
    displayName: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 255,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Compound index for efficient soft-delete filtering
UserSchema.index({ deletedAt: 1, updatedAt: -1 });

/**
 * UserEvent Schema - immutable event log for webhook payloads
 * Provides audit trail, replay capability, and debugging support
 * Indexes:
 * - Sorted on receivedAt (recency queries)
 * - Compound on eventType + receivedAt (filter by event type + sort)
 * - Compound on status + receivedAt (find failed/pending events)
 * - Compound on userId + receivedAt (audit trail by user)
 */
const UserEventSchema = new Schema<UserEventDoc>(
  {
    eventId: {
      type: String,
      sparse: true,
      unique: true,
    },
    eventType: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      required: true,
      index: true,
    },
    userId: {
      type: String,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    source: String,
    signature: String,
    signatureValid: {
      type: Boolean,
      default: null,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    processedAt: Date,
    status: {
      type: String,
      enum: ['stored', 'processed', 'failed'],
      required: true,
      default: 'stored',
      index: true,
    },
    error: String,
  },
  { _id: true, collection: 'user_events' }
);

// Compound indexes for efficient querying
UserEventSchema.index({ eventType: 1, receivedAt: -1 });
UserEventSchema.index({ status: 1, receivedAt: -1 });
UserEventSchema.index({ userId: 1, receivedAt: -1 });

/**
 * Export models with safe registration
 * Prevents "Cannot overwrite model" errors in tests by checking if model exists
 */
let UserModel: mongoose.Model<UserDoc>;
try {
  UserModel = mongoose.model<UserDoc>('User');
} catch {
  UserModel = mongoose.model<UserDoc>('User', UserSchema);
}

let UserEventModel: mongoose.Model<UserEventDoc>;
try {
  UserEventModel = mongoose.model<UserEventDoc>('UserEvent');
} catch {
  UserEventModel = mongoose.model<UserEventDoc>('UserEvent', UserEventSchema);
}

export default UserModel;
export { UserEventModel };
