// Mock mongoose before importing
jest.mock('mongoose', () => {
  const mockSchemaConstructor = jest.fn().mockImplementation(() => ({}));
  mockSchemaConstructor.Types = {
    Mixed: {},
    ObjectId: {},
    String: String,
    Number: Number,
    Date: Date,
    Boolean: Boolean,
    Array: Array,
  };

  return {
    Schema: mockSchemaConstructor,
    models: {},
    model: jest.fn().mockImplementation((name: string) => ({
      modelName: name,
    })),
    connection: {
      readyState: 0,
    },
  };
});

import mongoose from 'mongoose';
import { CharacterModel, UserModel, validateCharacter, validateUser } from '../schemas';

describe('MongoDB Schemas', () => {

  describe('Character Schema', () => {
    describe('CharacterModel', () => {
      it('should be defined', () => {
        expect(CharacterModel).toBeDefined();
      });

      it('should have correct schema name', () => {
        expect(CharacterModel.modelName).toBe('Character');
      });
    });

    describe('Character validation - D&D 5e comprehensive', () => {
      it('should validate a complete D&D 5e character object', () => {
        const validCharacter = {
          userId: 'user_12345',
          name: 'Aragorn',
          race: 'Human',
          subrace: 'Variant',
          background: 'Ranger',
          alignment: 'Chaotic Good',
          experiencePoints: 6500,
          classes: [
            {
              className: 'Ranger',
              level: 5,
              subclass: 'Hunter',
              hitDiceSize: 10,
              hitDiceUsed: 2,
            },
          ],
          totalLevel: 5,
          abilities: {
            strength: 16,
            dexterity: 14,
            constitution: 13,
            intelligence: 12,
            wisdom: 15,
            charisma: 10,
          },
          skillProficiencies: ['Animal Handling', 'Investigation', 'Nature', 'Survival'],
          savingThrowProficiencies: ['Strength', 'Dexterity'],
          hitPoints: {
            maximum: 45,
            current: 45,
            temporary: 0,
          },
          armorClass: 16,
          speed: 30,
          initiative: 2,
          proficiencyBonus: 3,
          passivePerception: 14,
          spellcasting: {
            ability: 'Wisdom',
            spellAttackBonus: 6,
            spellSaveDC: 14,
            spellSlots: {
              level1: { total: 4, used: 1 },
              level2: { total: 2, used: 0 },
            },
            spellsKnown: ['Cure Wounds', 'Hunter\'s Mark', 'Pass Without Trace'],
          },
          equipment: [
            { name: 'Longsword', quantity: 1, category: 'weapon' },
            { name: 'Leather Armor', quantity: 1, category: 'armor' },
          ],
          features: ['Fighting Style: Archery', 'Favored Enemy: Orcs', 'Natural Explorer: Forest'],
          notes: 'Skilled tracker and hunter',
        };

        const result = validateCharacter(validCharacter);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.sanitizedData?.totalLevel).toBe(5);
        expect(result.sanitizedData?.proficiencyBonus).toBe(3);
      });

      it('should validate a multiclass character', () => {
        const multiclassCharacter = {
          userId: 'user_12345',
          name: 'Gandalf',
          race: 'Human',
          background: 'Sage',
          alignment: 'Lawful Good',
          experiencePoints: 23000,
          classes: [
            {
              className: 'Wizard',
              level: 4,
              subclass: 'School of Evocation',
              hitDiceSize: 6,
              hitDiceUsed: 1,
            },
            {
              className: 'Cleric',
              level: 2,
              subclass: 'Light Domain',
              hitDiceSize: 8,
              hitDiceUsed: 0,
            },
          ],
          totalLevel: 6,
          abilities: {
            strength: 10,
            dexterity: 14,
            constitution: 15,
            intelligence: 18,
            wisdom: 16,
            charisma: 12,
          },
          skillProficiencies: ['Arcana', 'History', 'Investigation', 'Religion'],
          savingThrowProficiencies: ['Intelligence', 'Wisdom'],
          hitPoints: {
            maximum: 38,
            current: 38,
            temporary: 0,
          },
          armorClass: 12,
          speed: 30,
          initiative: 2,
          proficiencyBonus: 3,
          passivePerception: 13,
          spellcasting: {
            ability: 'Intelligence',
            spellAttackBonus: 7,
            spellSaveDC: 15,
            spellSlots: {
              level1: { total: 4, used: 1 },
              level2: { total: 3, used: 0 },
              level3: { total: 2, used: 1 },
            },
            spellsKnown: ['Magic Missile', 'Shield', 'Fireball', 'Cure Wounds'],
          },
        };

        const result = validateCharacter(multiclassCharacter);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.sanitizedData?.classes).toHaveLength(2);
        expect(result.sanitizedData?.totalLevel).toBe(6);
      });

      it('should validate a valid basic character object (backward compatibility)', () => {
        const validCharacter = {
          userId: 'user_12345',
          name: 'Aragorn',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Chaotic Good',
          experiencePoints: 0,
          classes: [
            {
              className: 'Fighter',
              level: 1,
              hitDiceSize: 10,
              hitDiceUsed: 0,
            },
          ],
          totalLevel: 1,
          abilities: {
            strength: 15,
            dexterity: 14,
            constitution: 13,
            intelligence: 12,
            wisdom: 13,
            charisma: 15,
          },
        };

        const result = validateCharacter(validCharacter);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject character with missing required fields', () => {
        const invalidCharacter = {
          name: '',
          // Missing userId, race, background, alignment, classes, abilities
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Name is required');
        expect(result.errors).toContain('User ID is required');
        expect(result.errors).toContain('Race is required');
        expect(result.errors).toContain('Background is required');
        expect(result.errors).toContain('Alignment is required');
        expect(result.errors).toContain('Classes are required');
        expect(result.errors).toContain('Abilities are required');
      });

      it('should reject character with invalid ability scores', () => {
        const invalidCharacter = {
          userId: 'user_12345',
          name: 'Test Character',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Neutral',
          classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
          abilities: {
            strength: 0, // Too low
            dexterity: 31, // Too high
            constitution: 'invalid', // Not a number
            intelligence: 12,
            wisdom: 13,
            charisma: 15,
          },
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Ability scores must be between 1 and 30');
        expect(result.errors).toContain('Ability scores must be numbers');
      });

      it('should reject character with invalid multiclass configuration', () => {
        const invalidCharacter = {
          userId: 'user_12345',
          name: 'Test Character',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Neutral',
          classes: [
            { className: 'Fighter', level: 0, hitDiceSize: 10, hitDiceUsed: 0 }, // Invalid level
            { className: '', level: 5, hitDiceSize: 8, hitDiceUsed: 0 }, // Empty class name
          ],
          totalLevel: 5,
          abilities: {
            strength: 15, dexterity: 14, constitution: 13,
            intelligence: 12, wisdom: 13, charisma: 15,
          },
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Class levels must be between 1 and 20');
        expect(result.errors).toContain('Class name is required');
      });

      it('should reject character with mismatched total level', () => {
        const invalidCharacter = {
          userId: 'user_12345',
          name: 'Test Character',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Neutral',
          classes: [
            { className: 'Fighter', level: 3, hitDiceSize: 10, hitDiceUsed: 0 },
            { className: 'Rogue', level: 2, hitDiceSize: 8, hitDiceUsed: 1 },
          ],
          totalLevel: 10, // Should be 5 (3+2)
          abilities: {
            strength: 15, dexterity: 14, constitution: 13,
            intelligence: 12, wisdom: 13, charisma: 15,
          },
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Total level must equal sum of class levels');
      });

      it('should reject character with invalid hit dice configuration', () => {
        const invalidCharacter = {
          userId: 'user_12345',
          name: 'Test Character',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Neutral',
          classes: [
            { className: 'Fighter', level: 3, hitDiceSize: 5, hitDiceUsed: 0 }, // Invalid hit dice size
            { className: 'Rogue', level: 2, hitDiceSize: 8, hitDiceUsed: 10 }, // More used than available
          ],
          totalLevel: 5,
          abilities: {
            strength: 15, dexterity: 14, constitution: 13,
            intelligence: 12, wisdom: 13, charisma: 15,
          },
        };

        const result = validateCharacter(invalidCharacter);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Hit dice size must be 6, 8, 10, or 12');
        expect(result.errors).toContain('Hit dice used cannot exceed level');
      });

      it('should calculate proficiency bonus correctly based on total level', () => {
        const testCases = [
          { level: 1, expectedBonus: 2 },
          { level: 4, expectedBonus: 2 },
          { level: 5, expectedBonus: 3 },
          { level: 8, expectedBonus: 3 },
          { level: 9, expectedBonus: 4 },
          { level: 12, expectedBonus: 4 },
          { level: 13, expectedBonus: 5 },
          { level: 16, expectedBonus: 5 },
          { level: 17, expectedBonus: 6 },
          { level: 20, expectedBonus: 6 },
        ];

        testCases.forEach(({ level, expectedBonus }) => {
          const character = {
            userId: 'user_12345',
            name: `Level ${level} Character`,
            race: 'Human',
            background: 'Folk Hero',
            alignment: 'Neutral',
            classes: [{ className: 'Fighter', level, hitDiceSize: 10, hitDiceUsed: 0 }],
            totalLevel: level,
            abilities: {
              strength: 15, dexterity: 14, constitution: 13,
              intelligence: 12, wisdom: 13, charisma: 15,
            },
          };

          const result = validateCharacter(character);
          expect(result.isValid).toBe(true);
          expect(result.sanitizedData?.proficiencyBonus).toBe(expectedBonus);
        });
      });

      it('should calculate ability modifiers correctly', () => {
        const character = {
          userId: 'user_12345',
          name: 'Test Character',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Neutral',
          classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
          totalLevel: 1,
          abilities: {
            strength: 8, // -1
            dexterity: 10, // +0
            constitution: 12, // +1
            intelligence: 14, // +2
            wisdom: 16, // +3
            charisma: 18, // +4
          },
        };

        const result = validateCharacter(character);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.abilityModifiers).toEqual({
          strength: -1,
          dexterity: 0,
          constitution: 1,
          intelligence: 2,
          wisdom: 3,
          charisma: 4,
        });
      });

      it('should sanitize character name by trimming whitespace', () => {
        const characterWithWhitespace = {
          userId: 'user_12345',
          name: '  Aragorn  ',
          race: 'Human',
          background: 'Folk Hero',
          alignment: 'Neutral',
          classes: [{ className: 'Fighter', level: 1, hitDiceSize: 10, hitDiceUsed: 0 }],
          totalLevel: 1,
          abilities: {
            strength: 15, dexterity: 14, constitution: 13,
            intelligence: 12, wisdom: 13, charisma: 15,
          },
        };

        const result = validateCharacter(characterWithWhitespace);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.name).toBe('Aragorn');
      });

      it('should validate spellcasting for spellcasters', () => {
        const spellcasterCharacter = {
          userId: 'user_12345',
          name: 'Wizard',
          race: 'Elf',
          background: 'Sage',
          alignment: 'Lawful Good',
          classes: [{ className: 'Wizard', level: 3, hitDiceSize: 6, hitDiceUsed: 0 }],
          totalLevel: 3,
          abilities: {
            strength: 8, dexterity: 14, constitution: 13,
            intelligence: 16, wisdom: 12, charisma: 10,
          },
          spellcasting: {
            ability: 'Intelligence',
            spellAttackBonus: 6,
            spellSaveDC: 14,
            spellSlots: {
              level1: { total: 4, used: 1 },
              level2: { total: 2, used: 0 },
            },
            spellsKnown: ['Magic Missile', 'Shield', 'Misty Step'],
          },
        };

        const result = validateCharacter(spellcasterCharacter);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.spellcasting?.ability).toBe('Intelligence');
      });

      it('should reject invalid spellcasting configuration', () => {
        const invalidSpellcaster = {
          userId: 'user_12345',
          name: 'Bad Wizard',
          race: 'Elf',
          background: 'Sage',
          alignment: 'Lawful Good',
          classes: [{ className: 'Wizard', level: 3, hitDiceSize: 6, hitDiceUsed: 0 }],
          totalLevel: 3,
          abilities: {
            strength: 8, dexterity: 14, constitution: 13,
            intelligence: 16, wisdom: 12, charisma: 10,
          },
          spellcasting: {
            ability: 'InvalidAbility', // Invalid spellcasting ability
            spellAttackBonus: -10, // Invalid attack bonus
            spellSaveDC: 5, // Too low
            spellSlots: {
              level1: { total: 4, used: 10 }, // Used more than total
            },
          },
        };

        const result = validateCharacter(invalidSpellcaster);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid spellcasting ability');
        expect(result.errors).toContain('Spell slots used cannot exceed total');
      });
    });
  });

  describe('User Schema', () => {
    describe('UserModel', () => {
      it('should be defined', () => {
        expect(UserModel).toBeDefined();
      });

      it('should have correct schema name', () => {
        expect(UserModel.modelName).toBe('User');
      });
    });

    describe('User validation', () => {
      it('should validate a valid user object with complete subscription and usage data', () => {
        const validUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          imageUrl: 'https://example.com/avatar.jpg',
          role: 'player',
          subscription: {
            tier: 'free',
            status: 'active',
            stripeCustomerId: 'cus_12345',
            stripeSubscriptionId: 'sub_12345',
            currentPeriodEnd: new Date('2024-12-31'),
            trialEndsAt: new Date('2024-01-31'),
          },
          usage: {
            parties: 2,
            encounters: 5,
            creatures: 10,
            lastResetDate: new Date('2024-01-01'),
          },
        };

        const result = validateUser(validUser);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should validate a valid minimal user object', () => {
        const validUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
        };

        const result = validateUser(validUser);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject user with empty clerkId', () => {
        const invalidUser = {
          clerkId: '',
          email: 'test@example.com',
          username: 'testuser',
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Clerk ID is required');
      });

      it('should reject user with invalid email format', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'invalid-email',
          username: 'testuser',
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid email format');
      });

      it('should reject user with invalid username', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'a', // Too short
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username must be between 2 and 30 characters');
      });

      it('should sanitize user email by converting to lowercase', () => {
        const userWithUppercaseEmail = {
          clerkId: 'user_12345',
          email: 'TEST@EXAMPLE.COM',
          username: 'testuser',
        };

        const result = validateUser(userWithUppercaseEmail);
        expect(result.sanitizedData?.email).toBe('test@example.com');
      });

      it('should sanitize username by trimming whitespace', () => {
        const userWithWhitespace = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: '  testuser  ',
        };

        const result = validateUser(userWithWhitespace);
        expect(result.sanitizedData?.username).toBe('testuser');
      });

      // Role validation tests
      it('should validate valid user roles', () => {
        const roles = ['player', 'dm', 'admin'];
        roles.forEach((role) => {
          const user = {
            clerkId: 'user_12345',
            email: 'test@example.com',
            username: 'testuser',
            role,
          };

          const result = validateUser(user);
          expect(result.isValid).toBe(true);
        });
      });

      it('should reject user with invalid role', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          role: 'invalid-role',
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid role. Must be player, dm, or admin');
      });

      // Subscription validation tests
      it('should validate valid subscription tiers', () => {
        const tiers = ['free', 'seasoned', 'expert', 'master', 'guild'];
        tiers.forEach((tier) => {
          const user = {
            clerkId: 'user_12345',
            email: 'test@example.com',
            username: 'testuser',
            subscription: { tier, status: 'active' },
          };

          const result = validateUser(user);
          expect(result.isValid).toBe(true);
        });
      });

      it('should validate valid subscription statuses', () => {
        const statuses = ['active', 'canceled', 'past_due', 'trialing'];
        statuses.forEach((status) => {
          const user = {
            clerkId: 'user_12345',
            email: 'test@example.com',
            username: 'testuser',
            subscription: { tier: 'free', status },
          };

          const result = validateUser(user);
          expect(result.isValid).toBe(true);
        });
      });

      it('should reject user with invalid subscription tier', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          subscription: { tier: 'invalid-tier', status: 'active' },
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid subscription tier');
      });

      it('should reject user with invalid subscription status', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          subscription: { tier: 'free', status: 'invalid-status' },
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid subscription status');
      });

      // Usage validation tests
      it('should validate usage tracking fields', () => {
        const validUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          usage: {
            parties: 3,
            encounters: 7,
            creatures: 15,
            lastResetDate: new Date(),
          },
        };

        const result = validateUser(validUser);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject negative usage values', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          usage: {
            parties: -1,
            encounters: 5,
            creatures: 10,
            lastResetDate: new Date(),
          },
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Usage values cannot be negative');
      });

      it('should reject non-integer usage values', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          usage: {
            parties: 2.5,
            encounters: 5,
            creatures: 10,
            lastResetDate: new Date(),
          },
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Usage values must be integers');
      });

      it('should validate optional imageUrl field', () => {
        const validUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          imageUrl: 'https://example.com/avatar.jpg',
        };

        const result = validateUser(validUser);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should reject invalid imageUrl format', () => {
        const invalidUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          imageUrl: 'not-a-valid-url',
        };

        const result = validateUser(invalidUser);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid image URL format');
      });

      // Integration tests
      it('should set default values for subscription and usage when not provided', () => {
        const minimalUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
        };

        const result = validateUser(minimalUser);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.subscription).toEqual({
          tier: 'free',
          status: 'trialing',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          trialEndsAt: expect.any(Date), // Should be set to 14 days from now
        });
        expect(result.sanitizedData?.usage).toEqual({
          parties: 0,
          encounters: 0,
          creatures: 0,
          lastResetDate: expect.any(Date),
        });
      });

      it('should initialize trial period for new free tier users', () => {
        const newUser = {
          clerkId: 'user_12345',
          email: 'test@example.com',
          username: 'testuser',
          subscription: { tier: 'free', status: 'trialing' },
        };

        const result = validateUser(newUser);
        expect(result.isValid).toBe(true);
        expect(result.sanitizedData?.subscription?.trialEndsAt).toBeInstanceOf(Date);
        
        const trialEnd = result.sanitizedData?.subscription?.trialEndsAt;
        const now = new Date();
        const daysDiff = Math.ceil((trialEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(14); // 14-day trial
      });
    });
  });

  describe('Schema Integration', () => {
    it('should create models without errors', () => {
      expect(() => {
        mongoose.model('Character');
        mongoose.model('User');
      }).not.toThrow();
    });

    it('should handle validation errors gracefully in production', () => {
      const invalidData = { name: null, level: 'invalid' };
      
      const result = validateCharacter(invalidData);
      expect(result.isValid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});