/**
 * Tests for validation enum schemas
 */
import {
  DndRulesetSchema,
  ExperienceLevelSchema,
  UserRoleSchema,
  ThemeSchema,
  InitiativeTypeSchema,
  SubscriptionTierSchema,
  SubscriptionStatusSchema
} from '@/lib/validations/schemas/enums'

describe('Validation Enums', () => {
  describe('DndRulesetSchema', () => {
    it('should accept valid rulesets', () => {
      const validRulesets = ['5e', '3.5e', 'pf1', 'pf2']

      validRulesets.forEach(ruleset => {
        expect(DndRulesetSchema.parse(ruleset)).toBe(ruleset)
      })
    })

    it('should reject invalid rulesets', () => {
      expect(() => DndRulesetSchema.parse('invalid')).toThrow()
    })
  })

  describe('ExperienceLevelSchema', () => {
    it('should accept valid experience levels', () => {
      const validLevels = ['beginner', 'intermediate', 'expert']

      validLevels.forEach(level => {
        expect(ExperienceLevelSchema.parse(level)).toBe(level)
      })
    })

    it('should reject invalid experience levels', () => {
      expect(() => ExperienceLevelSchema.parse('invalid')).toThrow()
    })
  })

  describe('UserRoleSchema', () => {
    it('should accept valid user roles', () => {
      const validRoles = ['player', 'dm', 'both']

      validRoles.forEach(role => {
        expect(UserRoleSchema.parse(role)).toBe(role)
      })
    })

    it('should reject invalid user roles', () => {
      expect(() => UserRoleSchema.parse('invalid')).toThrow()
    })
  })

  describe('ThemeSchema', () => {
    it('should accept valid themes', () => {
      const validThemes = ['light', 'dark', 'auto']

      validThemes.forEach(theme => {
        expect(ThemeSchema.parse(theme)).toBe(theme)
      })
    })

    it('should reject invalid themes', () => {
      expect(() => ThemeSchema.parse('invalid')).toThrow()
    })
  })

  describe('InitiativeTypeSchema', () => {
    it('should accept valid initiative types', () => {
      const validTypes = ['manual', 'auto']

      validTypes.forEach(type => {
        expect(InitiativeTypeSchema.parse(type)).toBe(type)
      })
    })

    it('should reject invalid initiative types', () => {
      expect(() => InitiativeTypeSchema.parse('invalid')).toThrow()
    })
  })

  describe('SubscriptionTierSchema', () => {
    it('should accept valid subscription tiers', () => {
      const validTiers = ['free', 'seasoned', 'expert', 'master', 'guild']

      validTiers.forEach(tier => {
        expect(SubscriptionTierSchema.parse(tier)).toBe(tier)
      })
    })

    it('should reject invalid subscription tiers', () => {
      expect(() => SubscriptionTierSchema.parse('invalid')).toThrow()
    })
  })

  describe('SubscriptionStatusSchema', () => {
    it('should accept valid subscription statuses', () => {
      const validStatuses = ['active', 'cancelled', 'trial']

      validStatuses.forEach(status => {
        expect(SubscriptionStatusSchema.parse(status)).toBe(status)
      })
    })

    it('should reject invalid subscription statuses', () => {
      expect(() => SubscriptionStatusSchema.parse('invalid')).toThrow()
    })
  })
})