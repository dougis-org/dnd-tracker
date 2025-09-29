/**
 * Tests for profile validation schemas
 */
import {
  ProfileSchema,
  PreferencesSchema,
  ProfileUpdateSchema
} from '@/lib/validations/schemas/profile'

describe('Profile Validation Schemas', () => {
  describe('ProfileSchema', () => {
    it('should accept valid profile data', () => {
      const validProfile = {
        displayName: 'Test User',
        dndRuleset: '5e',
        experienceLevel: 'intermediate',
        role: 'dm'
      }

      const result = ProfileSchema.parse(validProfile)
      expect(result).toEqual(validProfile)
    })

    it('should accept partial profile data', () => {
      const partialProfile = {
        displayName: 'Test User'
      }

      const result = ProfileSchema.parse(partialProfile)
      expect(result).toEqual(partialProfile)
    })

    it('should trim display name', () => {
      const profileWithSpaces = {
        displayName: '  Test User  '
      }

      const result = ProfileSchema.parse(profileWithSpaces)
      expect(result.displayName).toBe('Test User')
    })

    it('should reject empty display name', () => {
      const profileWithEmptyName = {
        displayName: ''
      }

      expect(() => ProfileSchema.parse(profileWithEmptyName)).toThrow('Display name is required')
    })

    it('should reject display name over 100 characters', () => {
      const profileWithLongName = {
        displayName: 'a'.repeat(101)
      }

      expect(() => ProfileSchema.parse(profileWithLongName)).toThrow('Display name must be 100 characters or less')
    })

    it('should accept empty object', () => {
      const result = ProfileSchema.parse({})
      expect(result).toEqual({})
    })
  })

  describe('PreferencesSchema', () => {
    it('should accept valid preferences data', () => {
      const validPreferences = {
        theme: 'dark',
        defaultInitiativeType: 'auto',
        autoAdvanceRounds: true
      }

      const result = PreferencesSchema.parse(validPreferences)
      expect(result).toEqual(validPreferences)
    })

    it('should accept partial preferences data', () => {
      const partialPreferences = {
        theme: 'light'
      }

      const result = PreferencesSchema.parse(partialPreferences)
      expect(result).toEqual(partialPreferences)
    })

    it('should accept empty object', () => {
      const result = PreferencesSchema.parse({})
      expect(result).toEqual({})
    })
  })

  describe('ProfileUpdateSchema', () => {
    it('should accept valid profile update with both profile and preferences', () => {
      const validUpdate = {
        profile: {
          displayName: 'Test User'
        },
        preferences: {
          theme: 'dark'
        }
      }

      const result = ProfileUpdateSchema.parse(validUpdate)
      expect(result).toEqual(validUpdate)
    })

    it('should accept profile update with only profile', () => {
      const profileOnlyUpdate = {
        profile: {
          displayName: 'Test User'
        }
      }

      const result = ProfileUpdateSchema.parse(profileOnlyUpdate)
      expect(result).toEqual(profileOnlyUpdate)
    })

    it('should accept profile update with only preferences', () => {
      const preferencesOnlyUpdate = {
        preferences: {
          theme: 'dark'
        }
      }

      const result = ProfileUpdateSchema.parse(preferencesOnlyUpdate)
      expect(result).toEqual(preferencesOnlyUpdate)
    })

    it('should reject update with neither profile nor preferences', () => {
      const emptyUpdate = {}

      expect(() => ProfileUpdateSchema.parse(emptyUpdate)).toThrow(
        'At least one of profile or preferences must be provided'
      )
    })
  })
})