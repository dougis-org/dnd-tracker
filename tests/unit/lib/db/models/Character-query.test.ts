/**
 * Unit tests for Character model query builder
 *
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';
import type { Types } from 'mongoose';

describe('CharacterModel.fromUserQuery', () => {
  it('should handle ObjectId instances when mongoose is available', () => {
    // This test will execute the mongoose ObjectId branches in Node environment
    const mongoose = require('mongoose');
    const { CharacterModel } = require('@/lib/db/models/Character');
    const userId = new mongoose.Types.ObjectId();

    const query = CharacterModel.fromUserQuery(userId);

    expect(query).toHaveProperty('userId', userId);
    expect(query).toHaveProperty('deletedAt', null);
  });

  it('should handle ObjectId instances with includeDeleted=true', () => {
    const mongoose = require('mongoose');
    const { CharacterModel } = require('@/lib/db/models/Character');
    const userId = new mongoose.Types.ObjectId();

    const query = CharacterModel.fromUserQuery(userId, true);

    expect(query).toHaveProperty('userId', userId);
    expect(query).not.toHaveProperty('deletedAt');
  });

  it('should convert valid ObjectId strings when mongoose is available', () => {
    const mongoose = require('mongoose');
    const { CharacterModel } = require('@/lib/db/models/Character');
    const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId string

    const query = CharacterModel.fromUserQuery(userId);

    expect(query).toHaveProperty('userId');
    expect(query.userId).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(query).toHaveProperty('deletedAt', null);
  });

  it('should convert valid ObjectId strings with includeDeleted=true', () => {
    const mongoose = require('mongoose');
    const { CharacterModel } = require('@/lib/db/models/Character');
    const userId = '507f1f77bcf86cd799439011'; // Valid ObjectId string

    const query = CharacterModel.fromUserQuery(userId, true);

    expect(query).toHaveProperty('userId');
    expect(query.userId).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(query).not.toHaveProperty('deletedAt');
  });

  it('should throw TypeError for invalid ObjectId strings', () => {
    const { CharacterModel } = require('@/lib/db/models/Character');
    const invalidUserId = 'invalid-objectid';

    expect(() => {
      CharacterModel.fromUserQuery(invalidUserId);
    }).toThrow(TypeError);
    expect(() => {
      CharacterModel.fromUserQuery(invalidUserId);
    }).toThrow('Invalid ObjectId provided');
  });

  it('should validate that classes array cannot be empty', () => {
    const mongoose = require('mongoose');
    const { CharacterModel } = require('@/lib/db/models/Character');

    // Test the validator by checking the schema
    const schema = CharacterModel.schema;
    const classesField = schema.path('classes');

    // Validator should reject empty arrays
    expect(classesField.validators).toBeDefined();
    const validator = classesField.validators.find((v: { message: string }) =>
      v.message?.includes('At least one class')
    );
    expect(validator).toBeDefined();

    // Test that empty array fails validation
    if (validator && validator.validator) {
      expect(validator.validator([])).toBe(false);
      expect(validator.validator([{ classId: new mongoose.Types.ObjectId(), level: 1 }])).toBe(true);
    }
  });
});
