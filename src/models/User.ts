import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  subscriptionTier: "free" | "seasoned" | "expert" | "master" | "guild";
  usageStats: {
    parties: number;
    encounters: number;
    creatures: number;
  };
  preferences: {
    theme: "light" | "dark" | "system";
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "seasoned", "expert", "master", "guild"],
      default: "free",
    },
    usageStats: {
      parties: { type: Number, default: 0 },
      encounters: { type: Number, default: 0 },
      creatures: { type: Number, default: 0 },
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index is already created by the unique: true option above

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
