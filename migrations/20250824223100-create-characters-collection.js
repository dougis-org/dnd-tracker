const mongoose = require('mongoose');

module.exports.up = async function () {
  const characterSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
      index: true,
    },
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

  const Character = mongoose.model('Character', characterSchema);
  await Character.createCollection();
  await Character.createIndexes();
};

module.exports.down = async function () {
  await mongoose.connection.db.dropCollection('characters');
};
