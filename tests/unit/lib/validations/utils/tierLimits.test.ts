/**
 * Tests for tier limits validation utilities
 */
import { UsageLimitSchema, checkTierLimitAllowed } from '@/lib/validations/utils/tierLimits'

describe('Tier Limits Utilities', () => {
  describe('UsageLimitSchema', () => {
    it('should accept valid usage within limits', () => {
      const validUsage = {
        tier: 'free' as const,
        partiesCount: 1,
        encountersCount: 3,
        creaturesCount: 10
      }

      const result = UsageLimitSchema.parse(validUsage)
      expect(result).toEqual(validUsage)
    })

    it('should reject usage exceeding tier limits', () => {
      const invalidUsage = {
        tier: 'free' as const,
        partiesCount: 2, // Free tier allows only 1 party
        encountersCount: 3,
        creaturesCount: 10
      }

      expect(() => UsageLimitSchema.parse(invalidUsage)).toThrow('Usage exceeds tier limits')
    })

    it('should reject negative usage counts', () => {
      const negativeUsage = {
        tier: 'free' as const,
        partiesCount: -1,
        encountersCount: 3,
        creaturesCount: 10
      }

      expect(() => UsageLimitSchema.parse(negativeUsage)).toThrow()
    })
  })

  describe('checkTierLimitAllowed', () => {
    it('should allow action within limits', () => {
      const result = checkTierLimitAllowed('free', 'parties', 0, 1)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(1)
      expect(result.wouldExceed).toBe(1)
    })

    it('should reject action exceeding limits', () => {
      const result = checkTierLimitAllowed('free', 'parties', 1, 1)

      expect(result.allowed).toBe(false)
      expect(result.limit).toBe(1)
      expect(result.wouldExceed).toBe(2)
    })

    it('should allow unlimited actions for unlimited tiers', () => {
      const result = checkTierLimitAllowed('guild', 'parties', 1000, 1)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(-1)
      expect(result.wouldExceed).toBe(-1)
    })

    it('should handle zero additional count', () => {
      const result = checkTierLimitAllowed('free', 'parties', 1, 0)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(1)
      expect(result.wouldExceed).toBe(1)
    })

    it('should handle multiple additional items', () => {
      const result = checkTierLimitAllowed('free', 'creatures', 5, 10)

      expect(result.allowed).toBe(false)
      expect(result.limit).toBe(10)
      expect(result.wouldExceed).toBe(15)
    })
  })
})