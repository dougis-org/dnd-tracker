/**
 * Tests for tier limit validation utilities
 */
import { UsageLimitSchema, checkTierLimitAllowed } from '@/lib/validations/utils/tierLimits'

describe('Tier Limits', () => {
  describe('UsageLimitSchema', () => {
    it('should accept valid usage within limits', () => {
      const validData = {
        tier: 'free' as const,
        partiesCount: 1,
        encountersCount: 3,
        creaturesCount: 10,
      }

      expect(() => UsageLimitSchema.parse(validData)).not.toThrow()
    })

    it('should reject usage exceeding limits', () => {
      const invalidData = {
        tier: 'free' as const,
        partiesCount: 2, // Free tier allows only 1
        encountersCount: 3,
        creaturesCount: 10,
      }

      expect(() => UsageLimitSchema.parse(invalidData)).toThrow('Usage exceeds tier limits')
    })

    it('should reject negative counts', () => {
      const invalidData = {
        tier: 'free' as const,
        partiesCount: -1,
        encountersCount: 5,
        creaturesCount: 10,
      }

      expect(() => UsageLimitSchema.parse(invalidData)).toThrow()
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

    it('should allow unlimited for master tier', () => {
      const result = checkTierLimitAllowed('master', 'parties', 100, 50)

      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(-1)
      expect(result.wouldExceed).toBe(-1)
    })

    it('should use default additional count of 1', () => {
      const result = checkTierLimitAllowed('free', 'encounters', 2)

      expect(result.allowed).toBe(true)
      expect(result.wouldExceed).toBe(3)
    })
  })
})