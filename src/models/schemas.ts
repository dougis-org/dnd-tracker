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

// User interface and schema
export interface IUser extends Document {
  clerkId: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: {
    type: String,
    required: [true, 'Clerk ID is required'],
    unique: true,
    trim: true,
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

// User validation function
export function validateUser(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

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

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}