/**
 * Tests for validation utility functions
 */
import {
  validateSessionToken,
  validateProfileUpdate,
  validateUserCreation,
  validateUsageLimits
} from '@/lib/validations/utils/validators'

describe('Validation Utilities', () => {
  describe('validateSessionToken', () => {
    it('should validate valid session token', () => {
      const validToken = { sessionToken: 'valid-session-token' }

      const result = validateSessionToken(validToken)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validToken)
      }
    })

    it('should reject invalid session token', () => {
      const result = validateSessionToken(123)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('validateProfileUpdate', () => {
    it('should validate valid profile update', () => {
      const validUpdate = {
        profile: {
          displayName: 'Test User',
          experienceLevel: 'beginner',
          role: 'player',
        }
      }

      const result = validateProfileUpdate(validUpdate)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validUpdate)
      }
    })

    it('should reject invalid profile update', () => {
      const invalidUpdate = {}

      const result = validateProfileUpdate(invalidUpdate)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('validateUserCreation', () => {
    it('should validate valid user creation', () => {
      const validUser = {
        id: 'user_123',
        email: 'test@example.com',
        profile: {
          displayName: 'Test User',
          dndRuleset: '5e',
          experienceLevel: 'beginner',
          role: 'player',
        },
        subscription: {
          tier: 'free',
          status: 'active',
          currentPeriodEnd: new Date(),
        },
        usage: {
          partiesCount: 0,
          encountersCount: 0,
          creaturesCount: 0,
        },
        preferences: {
          theme: 'auto',
          defaultInitiativeType: 'manual',
          autoAdvanceRounds: false,
        },
      }

      const result = validateUserCreation(validUser)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validUser)
      }
    })

    it('should reject invalid user creation', () => {
      const invalidUser = {
        id: '',
        email: 'invalid-email',
      }

      const result = validateUserCreation(invalidUser)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })

  describe('validateUsageLimits', () => {
    it('should validate valid usage limits', () => {
      const validLimits = {
        tier: 'free',
        partiesCount: 1,
        encountersCount: 3,
        creaturesCount: 10,
      }

      const result = validateUsageLimits(validLimits)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validLimits)
      }
    })

    it('should reject invalid usage limits', () => {
      const invalidLimits = {
        tier: 'free',
        partiesCount: 2, // Exceeds free tier limit of 1
        encountersCount: 3,
        creaturesCount: 10,
      }

      const result = validateUsageLimits(invalidLimits)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })
  })
})