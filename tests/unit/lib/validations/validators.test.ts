/**
 * Unit tests for validation utility functions
 * Tests validation functions with various inputs and edge cases
 */
import { describe, it, expect } from '@jest/globals'
import {
  validateSessionToken,
  validateProfileUpdate,
  validateUserCreation,
  validateUsageLimits,
} from '@/lib/validations/utils/validators'

describe('Validation Utilities', () => {
  describe('validateSessionToken', () => {
    it('should validate correct session token', () => {
      const result = validateSessionToken({ sessionToken: 'valid_token_123' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sessionToken).toBe('valid_token_123')
      }
    })

    it('should reject missing sessionToken', () => {
      const result = validateSessionToken({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1)
        expect(result.error.issues[0].path).toContain('sessionToken')
      }
    })

    it('should reject non-string sessionToken', () => {
      const result = validateSessionToken({ sessionToken: 123 })
      expect(result.success).toBe(false)
    })

    it('should reject empty string sessionToken', () => {
      const result = validateSessionToken({ sessionToken: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('validateProfileUpdate', () => {
    it('should validate profile update with all fields', () => {
      const data = {
        profile: {
          displayName: 'Test User',
          dndRuleset: '5e',
          experienceLevel: 'expert',
          role: 'dm',
        },
        preferences: {
          theme: 'dark',
          defaultInitiativeType: 'auto',
          autoAdvanceRounds: true,
        },
      }
      const result = validateProfileUpdate(data)
      expect(result.success).toBe(true)
    })

    it('should validate profile update with only profile', () => {
      const data = {
        profile: {
          displayName: 'Test User',
        },
      }
      const result = validateProfileUpdate(data)
      expect(result.success).toBe(true)
    })

    it('should validate profile update with only preferences', () => {
      const data = {
        preferences: {
          theme: 'light',
        },
      }
      const result = validateProfileUpdate(data)
      expect(result.success).toBe(true)
    })

    it('should reject empty profile update', () => {
      const result = validateProfileUpdate({})
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one')
      }
    })

    it('should reject invalid dndRuleset enum', () => {
      const data = {
        profile: {
          dndRuleset: 'invalid-ruleset',
        },
      }
      const result = validateProfileUpdate(data)
      expect(result.success).toBe(false)
    })

    it('should reject display name too long', () => {
      const data = {
        profile: {
          displayName: 'A'.repeat(101),
        },
      }
      const result = validateProfileUpdate(data)
      expect(result.success).toBe(false)
    })

    it('should trim display name whitespace', () => {
      const data = {
        profile: {
          displayName: '  Test User  ',
        },
      }
      const result = validateProfileUpdate(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.profile?.displayName).toBe('Test User')
      }
    })

    it('should accept whitespace-only display name that trims to empty in optional field', () => {
      const data = {
        profile: {
          displayName: '   ',
        },
      }
      const result = validateProfileUpdate(data)
      // Optional fields can be empty after trim in profile updates
      expect(result.success).toBe(true)
    })

    it('should validate all enum values', () => {
      const validRulesets = ['5e', '3.5e', 'pf1', 'pf2']
      const validLevels = ['beginner', 'intermediate', 'expert']
      const validRoles = ['player', 'dm', 'both']
      const validThemes = ['light', 'dark', 'auto']
      const validInitiatives = ['manual', 'auto']

      validRulesets.forEach(ruleset => {
        const result = validateProfileUpdate({ profile: { dndRuleset: ruleset } })
        expect(result.success).toBe(true)
      })

      validLevels.forEach(level => {
        const result = validateProfileUpdate({ profile: { experienceLevel: level } })
        expect(result.success).toBe(true)
      })

      validRoles.forEach(role => {
        const result = validateProfileUpdate({ profile: { role } })
        expect(result.success).toBe(true)
      })

      validThemes.forEach(theme => {
        const result = validateProfileUpdate({ preferences: { theme } })
        expect(result.success).toBe(true)
      })

      validInitiatives.forEach(initiative => {
        const result = validateProfileUpdate({ preferences: { defaultInitiativeType: initiative } })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('validateUserCreation', () => {
    it('should validate complete user creation data', () => {
      const data = {
        id: 'clerk_123',
        email: 'test@example.com',
        profile: {
          displayName: 'Test User',
          dndRuleset: '5e',
          experienceLevel: 'beginner',
          role: 'player',
        },
        subscription: {
          tier: 'free',
          status: 'trial',
          currentPeriodEnd: new Date('2025-12-31'),
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
      const result = validateUserCreation(data)
      expect(result.success).toBe(true)
    })
  })

  describe('validateUsageLimits', () => {
    it('should validate correct usage limits', () => {
      const data = {
        tier: 'expert',
        partiesCount: 5,
        encountersCount: 10,
        creaturesCount: 20,
      }
      const result = validateUsageLimits(data)
      expect(result.success).toBe(true)
    })

    it('should reject usage exceeding tier limits', () => {
      const data = {
        tier: 'free',
        partiesCount: 10,
        encountersCount: 10,
        creaturesCount: 20,
      }
      const result = validateUsageLimits(data)
      expect(result.success).toBe(false)
    })
  })
})
