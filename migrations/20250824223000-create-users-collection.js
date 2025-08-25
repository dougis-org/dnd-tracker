const mongoose = require('mongoose');

module.exports.up = async function () {
  const userSchema = new mongoose.Schema({
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(email) {
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
    imageUrl: {
      type: String,
      required: false,
      validate: {
        validator: function(url) {
          if (!url) return true; // Optional field
          return /^https?:\/\/.+/.test(url);
        },
        message: 'Invalid image URL format',
      },
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ['player', 'dm', 'admin'],
        message: 'Invalid role. Must be player, dm, or admin',
      },
      default: 'player',
    },
    subscription: {
      tier: {
        type: String,
        required: true,
        enum: {
          values: ['free', 'seasoned', 'expert', 'master', 'guild'],
          message: 'Invalid subscription tier',
        },
        default: 'free',
      },
      status: {
        type: String,
        required: true,
        enum: {
          values: ['active', 'canceled', 'past_due', 'trialing'],
          message: 'Invalid subscription status',
        },
        default: 'trialing',
      },
      stripeCustomerId: {
        type: String,
        required: false,
        default: null,
      },
      stripeSubscriptionId: {
        type: String,
        required: false,
        default: null,
      },
      currentPeriodEnd: {
        type: Date,
        required: false,
        default: null,
      },
      trialEndsAt: {
        type: Date,
        required: false,
        default: null,
      },
    },
    usage: {
      parties: {
        type: Number,
        required: true,
        min: [0, 'Usage values cannot be negative'],
        validate: {
          validator: Number.isInteger,
          message: 'Usage values must be integers',
        },
        default: 0,
      },
      encounters: {
        type: Number,
        required: true,
        min: [0, 'Usage values cannot be negative'],
        validate: {
          validator: Number.isInteger,
          message: 'Usage values must be integers',
        },
        default: 0,
      },
      creatures: {
        type: Number,
        required: true,
        min: [0, 'Usage values cannot be negative'],
        validate: {
          validator: Number.isInteger,
          message: 'Usage values must be integers',
        },
        default: 0,
      },
      lastResetDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  }, {
    timestamps: true,
  });

  const User = mongoose.model('User', userSchema);
  await User.createCollection();
  await User.createIndexes();
};

module.exports.down = async function () {
  await mongoose.connection.db.dropCollection('users');
};
