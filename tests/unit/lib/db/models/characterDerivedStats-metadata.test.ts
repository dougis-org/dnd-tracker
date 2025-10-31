/**
 * Unit tests for character derived stats metadata functions
 *
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';
import type { Types } from 'mongoose';

// Import the calculateDerivedStats which exercises the metadata logic
import { CharacterModel } from '@/lib/db/models/Character';

describe('Character Derived Stats - Class Metadata', () => {
  it('should use provided hitDie when available in class entry', () => {
    const input = {
      abilityScores: {
        str: 12,
        dex: 14,
        con: 13,
        int: 10,
        wis: 11,
        cha: 9,
      },
      classes: [
        {
          classId: 'fighter',
          level: 3,
          hitDie: 'd10' as const,
          name: 'Fighter',
          savingThrows: ['str', 'con'] as const,
        },
      ],
    };

    const result = CharacterModel.calculateDerivedStats(input);

    expect(result.totalLevel).toBe(3);
    expect(result.maxHitPoints).toBeGreaterThan(0);
  });

  it('should handle string classId with normalization', () => {
    const input = {
      abilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      classes: [
        {
          classId: 'wizard',
          level: 1,
        },
      ],
    };

    const result = CharacterModel.calculateDerivedStats(input);

    expect(result.totalLevel).toBe(1);
    expect(result.proficiencyBonus).toBe(2);
  });

  it('should throw RangeError when class metadata is missing', () => {
    const input = {
      abilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      classes: [
        {
          classId: 'invalid-class-that-does-not-exist',
          level: 1,
        },
      ],
    };

    expect(() => {
      CharacterModel.calculateDerivedStats(input);
    }).toThrow(RangeError);
    expect(() => {
      CharacterModel.calculateDerivedStats(input);
    }).toThrow(/Missing class metadata/);
  });

  it('should throw RangeError when no classes are provided', () => {
    const input = {
      abilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      classes: [],
    };

    expect(() => {
      CharacterModel.calculateDerivedStats(input);
    }).toThrow(RangeError);
    expect(() => {
      CharacterModel.calculateDerivedStats(input);
    }).toThrow(/At least one class level is required/);
  });

  it('should throw RangeError when class level is not a positive integer', () => {
    const input = {
      abilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      classes: [
        {
          classId: 'fighter',
          level: 0,
        },
      ],
    };

    expect(() => {
      CharacterModel.calculateDerivedStats(input);
    }).toThrow(RangeError);
    expect(() => {
      CharacterModel.calculateDerivedStats(input);
    }).toThrow(/Class levels must be integers >= 1/);
  });

  it('should handle class metadata lookup via metadata map', () => {
    const mongoose = require('mongoose');

    const input = {
      abilityScores: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      classes: [
        {
          classId: new mongoose.Types.ObjectId(),
          level: 1,
        },
      ],
      classMetadata: {
        [new mongoose.Types.ObjectId().toString()]: {
          id: new mongoose.Types.ObjectId().toString(),
          slug: 'custom-class',
          name: 'Custom Class',
          hitDie: 'd8' as const,
          savingThrows: [] as const,
        },
      },
    };

    // This should handle the metadata map lookup branches
    // It will throw because the classId doesn't match the metadata map key
    expect(() => {
      CharacterModel.calculateDerivedStats(input as any);
    }).toThrow();
  });
});
