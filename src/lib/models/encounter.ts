import mongoose, { Schema, Document } from 'mongoose';

// T006: Full Mongoose-backed Encounter model with validation, indexes, and timestamps

export interface ParticipantDoc {
  id?: string;
  type: 'monster' | 'party_member' | 'custom';
  displayName: string;
  quantity: number;
  hp?: number;
  initiative?: number | null;
  metadata?: Record<string, unknown>;
}

export interface EncounterDoc extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  participants: ParticipantDoc[];
  tags?: string[];
  template_flag?: boolean;
  owner_id: string;
  org_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

const ParticipantSchema = new Schema<ParticipantDoc>(
  {
    id: { type: String },
    type: {
      type: String,
      enum: ['monster', 'party_member', 'custom'],
      required: true,
    },
    displayName: { type: String, required: true, minlength: 1 },
    quantity: { type: Number, required: true, min: 1 },
    hp: { type: Number, min: 0 },
    initiative: { type: Number, default: null },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const EncounterSchema = new Schema<EncounterDoc>(
  {
    name: { type: String, required: true, minlength: 1, maxlength: 200 },
    description: { type: String },
    participants: {
      type: [ParticipantSchema],
      required: true,
      validate: { validator: (v: ParticipantDoc[]) => v.length > 0 },
    },
    tags: [String],
    template_flag: { type: Boolean, default: false },
    owner_id: { type: String, required: true, index: true },
    org_id: { type: String, default: null, index: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Indexes per data-model.md
EncounterSchema.index({ owner_id: 1, name: 1 });
EncounterSchema.index({ created_at: 1 });

// Prevent re-registration errors in test/development environments
let EncounterModel: mongoose.Model<EncounterDoc>;

try {
  EncounterModel = mongoose.model<EncounterDoc>('Encounter');
} catch {
  EncounterModel = mongoose.model<EncounterDoc>('Encounter', EncounterSchema);
}

// Export schema and model for use in adapters and API routes
// Types (EncounterDoc, ParticipantDoc) are already exported above as interfaces
export { EncounterSchema };
export default EncounterModel;
