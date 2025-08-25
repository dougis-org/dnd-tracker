import mongoose, { Schema, Model, Document } from 'mongoose';

// Character interface and schema for D&D 5e
export interface ICharacter extends Document {
  userId: string; // Clerk ID of owner

  // Basic Information
  name: string;
  race: string;
  subrace?: string;
  background: string;
  alignment: string;
  experiencePoints: number;

  // Multiclassing Support
  classes: Array<{
    className: string;
    level: number;
    subclass?: string;
    hitDiceSize: number; // d6, d8, d10, d12
    hitDiceUsed: number;
  }>;
  totalLevel: number; // Sum of all class levels

  // Ability Scores
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };

  // Calculated Fields
  abilityModifiers?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  proficiencyBonus?: number;

  // Skills and Proficiencies
  skillProficiencies?: string[];
  savingThrowProficiencies?: string[];

  // Combat Stats
  hitPoints?: {
    maximum: number;
    current: number;
    temporary: number;
  };
  armorClass?: number;
  speed?: number;
  initiative?: number;
  passivePerception?: number;

  // Spellcasting (optional)
  spellcasting?: {
    ability: string;
    spellAttackBonus: number;
    spellSaveDC: number;
    spellSlots: {
      [key: string]: { total: number; used: number };
    };
    spellsKnown?: string[];
    spellsPrepared?: string[];
  };

  // Equipment and Features
  equipment?: Array<{
    name: string;
    quantity: number;
    category: string;
  }>;
  features?: string[];
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const CharacterSchema = new Schema<ICharacter>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    index: true,
  },

  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [1, 'Name cannot be empty'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  race: {
    type: String,
    required: [true, 'Race is required'],
    trim: true,
  },
  subrace: {
    type: String,
    trim: true,
  },
  background: {
    type: String,
    required: [true, 'Background is required'],
    trim: true,
  },
  alignment: {
    type: String,
    required: [true, 'Alignment is required'],
    trim: true,
  },
  experiencePoints: {
    type: Number,
    default: 0,
    min: [0, 'Experience points cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Experience points must be an integer',
    },
  },

  // Multiclassing Support
  classes: [{
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Class level is required'],
      min: [1, 'Class level must be between 1 and 20'],
      max: [20, 'Class level must be between 1 and 20'],
      validate: {
        validator: Number.isInteger,
        message: 'Class level must be an integer',
      },
    },
    subclass: {
      type: String,
      trim: true,
    },
    hitDiceSize: {
      type: Number,
      required: [true, 'Hit dice size is required'],
      enum: {
        values: [6, 8, 10, 12],
        message: 'Hit dice size must be 6, 8, 10, or 12',
      },
    },
    hitDiceUsed: {
      type: Number,
      default: 0,
      min: [0, 'Hit dice used cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Hit dice used must be an integer',
      },
    },
  }],
  totalLevel: {
    type: Number,
    required: [true, 'Total level is required'],
    min: [1, 'Total level must be between 1 and 20'],
    max: [20, 'Total level must be between 1 and 20'],
    validate: {
      validator: Number.isInteger,
      message: 'Total level must be an integer',
    },
  },

  // Ability Scores
  abilities: {
    strength: {
      type: Number,
      required: [true, 'Strength is required'],
      min: [1, 'Ability scores must be between 1 and 30'],
      max: [30, 'Ability scores must be between 1 and 30'],
      validate: {
        validator: Number.isInteger,
        message: 'Ability scores must be integers',
      },
    },
    dexterity: {
      type: Number,
      required: [true, 'Dexterity is required'],
      min: [1, 'Ability scores must be between 1 and 30'],
      max: [30, 'Ability scores must be between 1 and 30'],
      validate: {
        validator: Number.isInteger,
        message: 'Ability scores must be integers',
      },
    },
    constitution: {
      type: Number,
      required: [true, 'Constitution is required'],
      min: [1, 'Ability scores must be between 1 and 30'],
      max: [30, 'Ability scores must be between 1 and 30'],
      validate: {
        validator: Number.isInteger,
        message: 'Ability scores must be integers',
      },
    },
    intelligence: {
      type: Number,
      required: [true, 'Intelligence is required'],
      min: [1, 'Ability scores must be between 1 and 30'],
      max: [30, 'Ability scores must be between 1 and 30'],
      validate: {
        validator: Number.isInteger,
        message: 'Ability scores must be integers',
      },
    },
    wisdom: {
      type: Number,
      required: [true, 'Wisdom is required'],
      min: [1, 'Ability scores must be between 1 and 30'],
      max: [30, 'Ability scores must be between 1 and 30'],
      validate: {
        validator: Number.isInteger,
        message: 'Ability scores must be integers',
      },
    },
    charisma: {
      type: Number,
      required: [true, 'Charisma is required'],
      min: [1, 'Ability scores must be between 1 and 30'],
      max: [30, 'Ability scores must be between 1 and 30'],
      validate: {
        validator: Number.isInteger,
        message: 'Ability scores must be integers',
      },
    },
  },

  // Optional fields
  skillProficiencies: [String],
  savingThrowProficiencies: [String],

  hitPoints: {
    maximum: {
      type: Number,
      min: [0, 'Hit points cannot be negative'],
    },
    current: {
      type: Number,
      min: [0, 'Current hit points cannot be negative'],
    },
    temporary: {
      type: Number,
      default: 0,
      min: [0, 'Temporary hit points cannot be negative'],
    },
  },

  armorClass: {
    type: Number,
    min: [0, 'Armor class cannot be negative'],
    max: [50, 'Armor class seems unreasonably high'],
  },

  speed: {
    type: Number,
    min: [0, 'Speed cannot be negative'],
  },

  initiative: {
    type: Number,
  },

  passivePerception: {
    type: Number,
    min: [0, 'Passive perception cannot be negative'],
  },

  spellcasting: {
    ability: {
      type: String,
      enum: {
        values: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
        message: 'Invalid spellcasting ability',
      },
    },
    spellAttackBonus: {
      type: Number,
    },
    spellSaveDC: {
      type: Number,
      min: [8, 'Spell save DC cannot be below 8'],
    },
    spellSlots: {
      type: Map,
      of: {
        total: {
          type: Number,
          min: [0, 'Spell slot total cannot be negative'],
        },
        used: {
          type: Number,
          min: [0, 'Spell slots used cannot be negative'],
        },
      },
    },
    spellsKnown: [String],
    spellsPrepared: [String],
  },

  equipment: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      min: [0, 'Equipment quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Equipment quantity must be an integer',
      },
    },
    category: {
      type: String,
      trim: true,
    },
  }],

  features: [String],
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

import { UserModel } from './User';

// Create models
export const CharacterModel: Model<ICharacter> = 
  mongoose.models.Character || mongoose.model<ICharacter>('Character', CharacterSchema);

export { UserModel };

// Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Validates and sanitizes D&D 5e character data according to comprehensive rules.
 * 
 * This function performs validation of all character fields including multiclassing,
 * ability scores, calculated fields, and optional features. It follows D&D 5e rules
 * for proficiency bonus calculation, ability modifiers, and class restrictions.
 * 
 * @param data - Raw character data object to validate
 * @returns ValidationResult with isValid flag, errors array, and sanitizedData
 */
export function validateCharacter(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Helper function to calculate ability modifier
  const calculateAbilityModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  // Helper function to calculate proficiency bonus from total level
  const calculateProficiencyBonus = (totalLevel: number): number => {
    return Math.ceil(totalLevel / 4) + 1;
  };

  // Validate required basic fields
  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('User ID is required');
  } else {
    sanitizedData.userId = data.userId.trim();
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else {
    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
      errors.push('Name is required');
    } else if (trimmedName.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    } else {
      sanitizedData.name = trimmedName;
    }
  }

  if (!data.race || typeof data.race !== 'string') {
    errors.push('Race is required');
  } else {
    sanitizedData.race = data.race.trim();
  }

  if (data.subrace && typeof data.subrace === 'string') {
    sanitizedData.subrace = data.subrace.trim();
  }

  if (!data.background || typeof data.background !== 'string') {
    errors.push('Background is required');
  } else {
    sanitizedData.background = data.background.trim();
  }

  if (!data.alignment || typeof data.alignment !== 'string') {
    errors.push('Alignment is required');
  } else {
    sanitizedData.alignment = data.alignment.trim();
  }

  // Validate experience points
  if (data.experiencePoints !== undefined) {
    const xp = Number(data.experiencePoints);
    if (isNaN(xp) || !Number.isInteger(xp) || xp < 0) {
      errors.push('Experience points must be a non-negative integer');
    } else {
      sanitizedData.experiencePoints = xp;
    }
  } else {
    sanitizedData.experiencePoints = 0;
  }

  // Validate classes (multiclassing support)
  if (!data.classes || !Array.isArray(data.classes) || data.classes.length === 0) {
    errors.push('Classes are required');
  } else {
    const sanitizedClasses: any[] = [];
    let calculatedTotalLevel = 0;

    for (const classData of data.classes) {
      const sanitizedClass: any = {};

      if (!classData.className || typeof classData.className !== 'string') {
        errors.push('Class name is required');
        continue;
      } else {
        sanitizedClass.className = classData.className.trim();
      }

      if (classData.level === undefined || classData.level === null) {
        errors.push('Class levels must be between 1 and 20');
        continue;
      } else {
        const level = Number(classData.level);
        if (isNaN(level) || !Number.isInteger(level) || level < 1 || level > 20) {
          errors.push('Class levels must be between 1 and 20');
          continue;
        } else {
          sanitizedClass.level = level;
          calculatedTotalLevel += level;
        }
      }

      if (classData.subclass && typeof classData.subclass === 'string') {
        sanitizedClass.subclass = classData.subclass.trim();
      }

      if (classData.hitDiceSize === undefined) {
        errors.push('Hit dice size must be 6, 8, 10, or 12');
        continue;
      } else {
        const hitDiceSize = Number(classData.hitDiceSize);
        if (![6, 8, 10, 12].includes(hitDiceSize)) {
          errors.push('Hit dice size must be 6, 8, 10, or 12');
          continue;
        } else {
          sanitizedClass.hitDiceSize = hitDiceSize;
        }
      }

      const hitDiceUsed = Number(classData.hitDiceUsed || 0);
      if (isNaN(hitDiceUsed) || !Number.isInteger(hitDiceUsed) || hitDiceUsed < 0) {
        errors.push('Hit dice used must be a non-negative integer');
        continue;
      } else if (hitDiceUsed > sanitizedClass.level) {
        errors.push('Hit dice used cannot exceed level');
        continue;
      } else {
        sanitizedClass.hitDiceUsed = hitDiceUsed;
      }

      sanitizedClasses.push(sanitizedClass);
    }

    sanitizedData.classes = sanitizedClasses;

    // Validate total level matches sum of class levels
    if (data.totalLevel !== undefined) {
      const totalLevel = Number(data.totalLevel);
      if (isNaN(totalLevel) || !Number.isInteger(totalLevel)) {
        errors.push('Total level must be an integer');
      } else if (totalLevel !== calculatedTotalLevel) {
        errors.push('Total level must equal sum of class levels');
      } else {
        sanitizedData.totalLevel = totalLevel;
      }
    } else {
      sanitizedData.totalLevel = calculatedTotalLevel;
    }
  }

  // Validate abilities
  if (!data.abilities || typeof data.abilities !== 'object') {
    errors.push('Abilities are required');
  } else {
    const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const sanitizedAbilities: any = {};
    const abilityModifiers: any = {};

    for (const ability of abilityNames) {
      if (data.abilities[ability] === undefined || data.abilities[ability] === null) {
        errors.push(`${ability.charAt(0).toUpperCase() + ability.slice(1)} is required`);
        continue;
      }

      const score = Number(data.abilities[ability]);
      if (isNaN(score)) {
        errors.push('Ability scores must be numbers');
        continue;
      }

      if (!Number.isInteger(score)) {
        errors.push('Ability scores must be integers');
        continue;
      }

      if (score < 1 || score > 30) {
        errors.push('Ability scores must be between 1 and 30');
        continue;
      }

      sanitizedAbilities[ability] = score;
      abilityModifiers[ability] = calculateAbilityModifier(score);
    }

    sanitizedData.abilities = sanitizedAbilities;
    if (Object.keys(abilityModifiers).length === 6) {
      sanitizedData.abilityModifiers = abilityModifiers;
    }
  }

  // Calculate proficiency bonus if total level is valid
  if (sanitizedData.totalLevel) {
    sanitizedData.proficiencyBonus = calculateProficiencyBonus(sanitizedData.totalLevel);
  }

  // Validate optional arrays
  if (data.skillProficiencies && Array.isArray(data.skillProficiencies)) {
    sanitizedData.skillProficiencies = data.skillProficiencies.filter((skill: any) => 
      typeof skill === 'string' && skill.trim().length > 0
    ).map((skill: string) => skill.trim());
  }

  if (data.savingThrowProficiencies && Array.isArray(data.savingThrowProficiencies)) {
    sanitizedData.savingThrowProficiencies = data.savingThrowProficiencies.filter((save: any) => 
      typeof save === 'string' && save.trim().length > 0
    ).map((save: string) => save.trim());
  }

  // Validate hit points object
  if (data.hitPoints && typeof data.hitPoints === 'object') {
    const sanitizedHitPoints: any = {};
    
    if (data.hitPoints.maximum !== undefined) {
      const max = Number(data.hitPoints.maximum);
      if (!isNaN(max) && max >= 0) {
        sanitizedHitPoints.maximum = max;
      }
    }

    if (data.hitPoints.current !== undefined) {
      const current = Number(data.hitPoints.current);
      if (!isNaN(current) && current >= 0) {
        sanitizedHitPoints.current = current;
      }
    }

    const temp = Number(data.hitPoints.temporary || 0);
    if (!isNaN(temp) && temp >= 0) {
      sanitizedHitPoints.temporary = temp;
    }

    if (Object.keys(sanitizedHitPoints).length > 0) {
      sanitizedData.hitPoints = sanitizedHitPoints;
    }
  }

  // Validate optional numeric fields
  const optionalNumbers = ['armorClass', 'speed', 'initiative', 'passivePerception'];
  for (const field of optionalNumbers) {
    if (data[field] !== undefined) {
      const value = Number(data[field]);
      if (!isNaN(value)) {
        sanitizedData[field] = value;
      }
    }
  }

  // Validate spellcasting
  if (data.spellcasting && typeof data.spellcasting === 'object') {
    const sanitizedSpellcasting: any = {};

    if (data.spellcasting.ability) {
      const validAbilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
      if (validAbilities.includes(data.spellcasting.ability)) {
        sanitizedSpellcasting.ability = data.spellcasting.ability;
      } else {
        errors.push('Invalid spellcasting ability');
      }
    }

    if (data.spellcasting.spellAttackBonus !== undefined) {
      const bonus = Number(data.spellcasting.spellAttackBonus);
      if (!isNaN(bonus)) {
        sanitizedSpellcasting.spellAttackBonus = bonus;
      }
    }

    if (data.spellcasting.spellSaveDC !== undefined) {
      const dc = Number(data.spellcasting.spellSaveDC);
      if (!isNaN(dc) && dc >= 8) {
        sanitizedSpellcasting.spellSaveDC = dc;
      }
    }

    // Validate spell slots
    if (data.spellcasting.spellSlots && typeof data.spellcasting.spellSlots === 'object') {
      const sanitizedSlots: any = {};
      
      for (const [level, slots] of Object.entries(data.spellcasting.spellSlots)) {
        if (typeof slots === 'object' && slots !== null) {
          const slotData = slots as any;
          const total = Number(slotData.total || 0);
          const used = Number(slotData.used || 0);
          
          if (!isNaN(total) && !isNaN(used) && total >= 0 && used >= 0) {
            if (used > total) {
              errors.push('Spell slots used cannot exceed total');
              continue;
            }
            sanitizedSlots[level] = { total, used };
          }
        }
      }
      
      sanitizedSpellcasting.spellSlots = sanitizedSlots;
    }

    // Validate spell arrays
    if (data.spellcasting.spellsKnown && Array.isArray(data.spellcasting.spellsKnown)) {
      sanitizedSpellcasting.spellsKnown = data.spellcasting.spellsKnown.filter((spell: any) => 
        typeof spell === 'string' && spell.trim().length > 0
      ).map((spell: string) => spell.trim());
    }

    if (data.spellcasting.spellsPrepared && Array.isArray(data.spellcasting.spellsPrepared)) {
      sanitizedSpellcasting.spellsPrepared = data.spellcasting.spellsPrepared.filter((spell: any) => 
        typeof spell === 'string' && spell.trim().length > 0
      ).map((spell: string) => spell.trim());
    }

    if (Object.keys(sanitizedSpellcasting).length > 0) {
      sanitizedData.spellcasting = sanitizedSpellcasting;
    }
  }

  // Validate equipment
  if (data.equipment && Array.isArray(data.equipment)) {
    const sanitizedEquipment: any[] = [];
    
    for (const item of data.equipment) {
      if (typeof item === 'object' && item !== null && item.name && typeof item.name === 'string') {
        const quantity = Number(item.quantity || 0);
        if (!isNaN(quantity) && quantity >= 0) {
          sanitizedEquipment.push({
            name: item.name.trim(),
            quantity,
            category: typeof item.category === 'string' ? item.category.trim() : '',
          });
        }
      }
    }
    
    if (sanitizedEquipment.length > 0) {
      sanitizedData.equipment = sanitizedEquipment;
    }
  }

  // Validate features and notes
  if (data.features && Array.isArray(data.features)) {
    sanitizedData.features = data.features.filter((feature: any) => 
      typeof feature === 'string' && feature.trim().length > 0
    ).map((feature: string) => feature.trim());
  }

  if (data.notes && typeof data.notes === 'string') {
    const trimmedNotes = data.notes.trim();
    if (trimmedNotes.length > 0) {
      sanitizedData.notes = trimmedNotes;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

/**
 * Validates and sanitizes user data according to the User schema requirements.
 * 
 * This function performs comprehensive validation of all user fields and returns
 * sanitized data with appropriate defaults applied. It's used for both user
 * creation and updates to ensure data integrity.
 * 
 * @param data - Raw user data object to validate
 * @returns ValidationResult with isValid flag, errors array, and sanitizedData
 * 
 * ## Validation Rules
 * 
 * ### Required Fields
 * - clerkId: Non-empty string, trimmed
 * - email: Valid email format, lowercased and trimmed
 * - username: String between 2-30 characters, trimmed
 * 
 * ### Optional Fields
 * - imageUrl: Valid HTTP/HTTPS URL or empty
 * - role: Must be 'player', 'dm', or 'admin' (defaults to 'player')
 * - subscription: Object with tier and status validation
 * - usage: Object with non-negative integer validation
 * 
 * ### Default Behavior
 * - Missing subscription gets free trial with 14-day expiration
 * - Missing usage gets all counters set to 0
 * - Missing role defaults to 'player'
 * - Trial users get automatic trialEndsAt date
 * 
 * ### Error Handling
 * - Returns detailed error messages for each validation failure
 * - Continues validation even after first error (collects all issues)
 * - Returns undefined sanitizedData when validation fails
 * 
 * @example
 * ```typescript
 * // Validate minimal user data
 * const result = validateUser({
 *   clerkId: 'user_12345',
 *   email: 'test@example.com',
 *   username: 'testuser',
 * });
 * 
 * if (result.isValid) {
 *   const user = new UserModel(result.sanitizedData);
 *   await user.save();
 * } else {
 *   console.error('Validation errors:', result.errors);
 * }
 * 
 * // Validate with subscription data
 * const premiumResult = validateUser({
 *   clerkId: 'user_67890',
 *   email: 'premium@example.com',
 *   username: 'premium_user',
 *   subscription: {
 *     tier: 'master',
 *     status: 'active',
 *   },
 *   usage: {
 *     parties: 10,
 *     encounters: 50,
 *     creatures: 200,
 *   },
 * });
 * ```
 */
export function validateUser(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validate required fields first
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

  // Validate optional fields
  // Validate imageUrl (optional)
  if (data.imageUrl !== undefined) {
    if (typeof data.imageUrl === 'string') {
      const trimmedUrl = data.imageUrl.trim();
      if (trimmedUrl && !/^https?:\/\/.+/.test(trimmedUrl)) {
        errors.push('Invalid image URL format');
      } else {
        sanitizedData.imageUrl = trimmedUrl || undefined;
      }
    } else {
      errors.push('Image URL must be a string');
    }
  }

  // Validate role (optional, defaults to 'player')
  const validRoles = ['player', 'dm', 'admin'];
  if (data.role !== undefined) {
    if (!validRoles.includes(data.role)) {
      errors.push('Invalid role. Must be player, dm, or admin');
    } else {
      sanitizedData.role = data.role;
    }
  } else {
    sanitizedData.role = 'player'; // default
  }

  // Initialize default subscription if not provided
  if (!data.subscription) {
    sanitizedData.subscription = {
      tier: 'free',
      status: 'trialing',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    };
  } else {
    // Validate subscription object
    const subscription: any = {};

    // Validate tier
    const validTiers = ['free', 'seasoned', 'expert', 'master', 'guild'];
    if (!data.subscription.tier || !validTiers.includes(data.subscription.tier)) {
      errors.push('Invalid subscription tier');
    } else {
      subscription.tier = data.subscription.tier;
    }

    // Validate status
    const validStatuses = ['active', 'canceled', 'past_due', 'trialing'];
    if (!data.subscription.status || !validStatuses.includes(data.subscription.status)) {
      errors.push('Invalid subscription status');
    } else {
      subscription.status = data.subscription.status;
    }

    // Set optional Stripe fields
    subscription.stripeCustomerId = data.subscription.stripeCustomerId || null;
    subscription.stripeSubscriptionId = data.subscription.stripeSubscriptionId || null;
    subscription.currentPeriodEnd = data.subscription.currentPeriodEnd || null;

    // Set trial end date - auto-calculate for new trialing subscriptions
    if (data.subscription.status === 'trialing' && !data.subscription.trialEndsAt) {
      subscription.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    } else {
      subscription.trialEndsAt = data.subscription.trialEndsAt || null;
    }

    sanitizedData.subscription = subscription;
  }

  // Initialize default usage if not provided
  if (!data.usage) {
    sanitizedData.usage = {
      parties: 0,
      encounters: 0,
      creatures: 0,
      lastResetDate: new Date(),
    };
  } else {
    // Validate usage object
    const usage: any = {};

    // Validate usage numbers
    const usageFields = ['parties', 'encounters', 'creatures'];
    for (const field of usageFields) {
      if (data.usage[field] !== undefined) {
        const value = Number(data.usage[field]);
        if (isNaN(value)) {
          errors.push(`Usage ${field} must be a number`);
        } else if (!Number.isInteger(value)) {
          errors.push('Usage values must be integers');
        } else if (value < 0) {
          errors.push('Usage values cannot be negative');
        } else {
          usage[field] = value;
        }
      } else {
        usage[field] = 0; // default
      }
    }

    // Validate lastResetDate
    if (data.usage.lastResetDate) {
      if (data.usage.lastResetDate instanceof Date) {
        usage.lastResetDate = data.usage.lastResetDate;
      } else {
        const date = new Date(data.usage.lastResetDate);
        if (isNaN(date.getTime())) {
          errors.push('Invalid lastResetDate format');
        } else {
          usage.lastResetDate = date;
        }
      }
    } else {
      usage.lastResetDate = new Date(); // default to now
    }

    sanitizedData.usage = usage;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}