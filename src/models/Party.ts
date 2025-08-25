
import mongoose from "mongoose";

export interface IParty {
  userId: string; // Owner's Clerk ID
  name: string;
  description?: string;
  campaignName?: string;

  // Character Management
  characters: Array<{
    characterId: mongoose.Types.ObjectId;
    playerName?: string;
    playerEmail?: string;
    isActive: boolean;
    joinedAt: Date;
  }>;

  // Sharing & Collaboration
  sharedWith: Array<{
    userId: string;
    role: "viewer" | "editor";
    sharedAt: Date;
  }>;

  // Template System
  isTemplate: boolean;
  templateCategory?: string;

  // Metadata
  maxSize: number; // Based on subscription tier
  createdAt: Date;
  updatedAt: Date;
}

const PartySchema = new mongoose.Schema<IParty>({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    campaignName: { type: String },
    characters: [
        {
            characterId: { type: mongoose.Schema.Types.ObjectId, ref: "Character" },
            playerName: { type: String },
            playerEmail: { type: String },
            isActive: { type: Boolean, default: true },
            joinedAt: { type: Date, default: Date.now },
        },
    ],
    sharedWith: [
        {
            userId: { type: String, required: true },
            role: { type: String, enum: ["viewer", "editor"], required: true },
            sharedAt: { type: Date, default: Date.now },
        },
    ],
    isTemplate: { type: Boolean, default: false },
    templateCategory: { type: String },
    maxSize: { type: Number, default: 5 },
}, { timestamps: true });

PartySchema.index({ userId: 1 });
PartySchema.index({ name: 1 });
PartySchema.index({ campaignName: 1 });
PartySchema.index({ isTemplate: 1 });


export const Party = mongoose.models.Party || mongoose.model<IParty>("Party", PartySchema);
