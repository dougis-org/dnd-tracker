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
      expect(() => DndRulesetSchema.parse('5e')).not.toThrow()
      expect(() => DndRulesetSchema.parse('3.5e')).not.toThrow()
      expect(() => DndRulesetSchema.parse('pf1')).not.toThrow()
      expect(() => DndRulesetSchema.parse('pf2')).not.toThrow()
    })

    it('should reject invalid rulesets', () => {
      expect(() => DndRulesetSchema.parse('invalid')).toThrow()
    })
  })

  describe('ExperienceLevelSchema', () => {
    it('should accept valid experience levels', () => {
      expect(() => ExperienceLevelSchema.parse('beginner')).not.toThrow()
      expect(() => ExperienceLevelSchema.parse('intermediate')).not.toThrow()
      expect(() => ExperienceLevelSchema.parse('expert')).not.toThrow()
    })
  })

  describe('UserRoleSchema', () => {
    it('should accept valid user roles', () => {
      expect(() => UserRoleSchema.parse('player')).not.toThrow()
      expect(() => UserRoleSchema.parse('dm')).not.toThrow()
      expect(() => UserRoleSchema.parse('both')).not.toThrow()
    })
  })

  describe('ThemeSchema', () => {
    it('should accept valid themes', () => {
      expect(() => ThemeSchema.parse('light')).not.toThrow()
      expect(() => ThemeSchema.parse('dark')).not.toThrow()
      expect(() => ThemeSchema.parse('auto')).not.toThrow()
    })
  })

  describe('SubscriptionTierSchema', () => {
    it('should accept valid subscription tiers', () => {
      expect(() => SubscriptionTierSchema.parse('free')).not.toThrow()
      expect(() => SubscriptionTierSchema.parse('seasoned')).not.toThrow()
      expect(() => SubscriptionTierSchema.parse('expert')).not.toThrow()
      expect(() => SubscriptionTierSchema.parse('master')).not.toThrow()
      expect(() => SubscriptionTierSchema.parse('guild')).not.toThrow()
    })
  })
})