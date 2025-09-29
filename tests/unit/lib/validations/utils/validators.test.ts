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
    it('should return success for valid session token', () => {
      const validToken = { sessionToken: 'valid-token' }

      const result = validateSessionToken(validToken)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validToken)
      }
    })

    it('should return error for invalid session token', () => {
      const invalidToken = { sessionToken: '' }

      const result = validateSessionToken(invalidToken)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should return error for missing session token', () => {
      const missingToken = {}

      const result = validateSessionToken(missingToken)

      expect(result.success).toBe(false)
    })
  })

  describe('validateProfileUpdate', () => {
    it('should return success for valid profile update', () => {
      const validUpdate = {
        profile: { displayName: 'Test User' }
      }

      const result = validateProfileUpdate(validUpdate)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validUpdate)
      }
    })

    it('should return error for invalid profile update', () => {
      const invalidUpdate = {}

      const result = validateProfileUpdate(invalidUpdate)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should return success for preferences only update', () => {
      const preferencesUpdate = {
        preferences: { theme: 'dark' }
      }

      const result = validateProfileUpdate(preferencesUpdate)

      expect(result.success).toBe(true)
    })
  })

  describe('validateUserCreation', () => {
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

    it('should return success for valid user creation data', () => {
      const result = validateUserCreation(validUserData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('clerk-user-id')
        expect(result.data.email).toBe('test@example.com')
      }
    })

    it('should return error for invalid user creation data', () => {
      const invalidUserData = {
        id: '',
        email: 'invalid-email'
      }

      const result = validateUserCreation(invalidUserData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should return error for missing required fields', () => {
      const incompleteUserData = {
        email: 'test@example.com'
      }

      const result = validateUserCreation(incompleteUserData)

      expect(result.success).toBe(false)
    })
  })

  describe('validateUsageLimits', () => {
    it('should return success for valid usage limits', () => {
      const validUsage = {
        tier: 'free',
        partiesCount: 1,
        encountersCount: 3,
        creaturesCount: 10
      }

      const result = validateUsageLimits(validUsage)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validUsage)
      }
    })

    it('should return error for usage exceeding limits', () => {
      const invalidUsage = {
        tier: 'free',
        partiesCount: 2, // Free tier allows only 1 party
        encountersCount: 3,
        creaturesCount: 10
      }

      const result = validateUsageLimits(invalidUsage)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should return error for negative usage counts', () => {
      const negativeUsage = {
        tier: 'free',
        partiesCount: -1,
        encountersCount: 0,
        creaturesCount: 0
      }

      const result = validateUsageLimits(negativeUsage)

      expect(result.success).toBe(false)
    })
  })
})