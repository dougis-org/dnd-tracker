/**
 * Tests for user validation schemas
 */
import {
  SessionTokenSchema,
  UserCreationSchema,
  UserResponseSchema
} from '@/lib/validations/schemas/user'

describe('User Validation Schemas', () => {
  describe('SessionTokenSchema', () => {
    it('should accept valid session token', () => {
      const validToken = {
        sessionToken: 'valid-session-token'
      }

      const result = SessionTokenSchema.parse(validToken)
      expect(result).toEqual(validToken)
    })

    it('should reject empty session token', () => {
      const emptyToken = {
        sessionToken: ''
      }

      expect(() => SessionTokenSchema.parse(emptyToken)).toThrow()
    })

    it('should reject missing session token', () => {
      const missingToken = {}

      expect(() => SessionTokenSchema.parse(missingToken)).toThrow()
    })
  })

  describe('UserCreationSchema', () => {
    const validUserData = {
      id: 'clerk-user-id',
      email: 'test@example.com',
      profile: {
        displayName: 'Test User',
        dndRuleset: '5e',
        experienceLevel: 'intermediate',
        role: 'dm'
      },
      subscription: {
        tier: 'free',
        status: 'active',
        currentPeriodEnd: new Date()
      },
      usage: {
        partiesCount: 0,
        encountersCount: 0,
        creaturesCount: 0
      },
      preferences: {
        theme: 'light',
        defaultInitiativeType: 'manual',
        autoAdvanceRounds: false
      }
    }

    it('should accept valid user creation data', () => {
      const result = UserCreationSchema.parse(validUserData)
      expect(result).toEqual(validUserData)
    })

    it('should normalize email to lowercase', () => {
      const userWithUppercaseEmail = {
        ...validUserData,
        email: 'TEST@EXAMPLE.COM'
      }

      const result = UserCreationSchema.parse(userWithUppercaseEmail)
      expect(result.email).toBe('test@example.com')
    })

    it('should trim email whitespace', () => {
      const userWithSpacedEmail = {
        ...validUserData,
        email: '  test@example.com  '
      }

      expect(() => UserCreationSchema.parse(userWithSpacedEmail)).toThrow('Invalid email format')
    })

    it('should reject invalid email format', () => {
      const userWithInvalidEmail = {
        ...validUserData,
        email: 'invalid-email'
      }

      expect(() => UserCreationSchema.parse(userWithInvalidEmail)).toThrow('Invalid email format')
    })

    it('should reject missing required fields', () => {
      const userMissingId = {
        ...validUserData,
        id: ''
      }

      expect(() => UserCreationSchema.parse(userMissingId)).toThrow('Clerk user ID is required')
    })

    it('should reject negative usage counts', () => {
      const userWithNegativeUsage = {
        ...validUserData,
        usage: {
          partiesCount: -1,
          encountersCount: 0,
          creaturesCount: 0
        }
      }

      expect(() => UserCreationSchema.parse(userWithNegativeUsage)).toThrow()
    })
  })

  describe('UserResponseSchema', () => {
    it('should extend UserCreationSchema with timestamps', () => {
      const validUserResponse = {
        id: 'clerk-user-id',
        email: 'test@example.com',
        profile: {
          displayName: 'Test User',
          dndRuleset: '5e',
          experienceLevel: 'intermediate',
          role: 'dm'
        },
        subscription: {
          tier: 'free',
          status: 'active',
          currentPeriodEnd: new Date()
        },
        usage: {
          partiesCount: 0,
          encountersCount: 0,
          creaturesCount: 0
        },
        preferences: {
          theme: 'light',
          defaultInitiativeType: 'manual',
          autoAdvanceRounds: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const result = UserResponseSchema.parse(validUserResponse)
      expect(result).toEqual(validUserResponse)
    })

    it('should require createdAt and updatedAt fields', () => {
      const userWithoutTimestamps = {
        id: 'clerk-user-id',
        email: 'test@example.com'
      }

      expect(() => UserResponseSchema.parse(userWithoutTimestamps)).toThrow()
    })
  })
})