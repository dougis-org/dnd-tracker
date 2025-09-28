import { TIER_LIMITS, type TierLimits, type SubscriptionTier } from '@/lib/constants/tierLimits'

describe('tierLimits', () => {
  describe('TIER_LIMITS', () => {
    it('should have all required tiers', () => {
      expect(TIER_LIMITS).toHaveProperty('free')
      expect(TIER_LIMITS).toHaveProperty('seasoned')
      expect(TIER_LIMITS).toHaveProperty('expert')
      expect(TIER_LIMITS).toHaveProperty('master')
      expect(TIER_LIMITS).toHaveProperty('guild')
    })

    it('should have all required properties for each tier', () => {
      Object.values(TIER_LIMITS).forEach(tier => {
        expect(tier).toHaveProperty('parties')
        expect(tier).toHaveProperty('encounters')
        expect(tier).toHaveProperty('creatures')
        expect(tier).toHaveProperty('maxParticipants')
      })
    })

    it('should have correct free tier limits', () => {
      expect(TIER_LIMITS.free).toEqual({
        parties: 1,
        encounters: 3,
        creatures: 10,
        maxParticipants: 6
      })
    })

    it('should have correct seasoned tier limits', () => {
      expect(TIER_LIMITS.seasoned).toEqual({
        parties: 5,
        encounters: 15,
        creatures: 50,
        maxParticipants: 12
      })
    })

    it('should have correct expert tier limits', () => {
      expect(TIER_LIMITS.expert).toEqual({
        parties: 25,
        encounters: 100,
        creatures: 250,
        maxParticipants: 20
      })
    })

    it('should have unlimited limits for master tier', () => {
      expect(TIER_LIMITS.master).toEqual({
        parties: -1,
        encounters: -1,
        creatures: -1,
        maxParticipants: -1
      })
    })

    it('should have unlimited limits for guild tier', () => {
      expect(TIER_LIMITS.guild).toEqual({
        parties: -1,
        encounters: -1,
        creatures: -1,
        maxParticipants: -1
      })
    })

    it('should have increasing limits for paid tiers', () => {
      expect(TIER_LIMITS.seasoned.parties).toBeGreaterThan(TIER_LIMITS.free.parties)
      expect(TIER_LIMITS.expert.parties).toBeGreaterThan(TIER_LIMITS.seasoned.parties)

      expect(TIER_LIMITS.seasoned.encounters).toBeGreaterThan(TIER_LIMITS.free.encounters)
      expect(TIER_LIMITS.expert.encounters).toBeGreaterThan(TIER_LIMITS.seasoned.encounters)
    })
  })

  describe('type exports', () => {
    it('should export correct TypeScript types', () => {
      const tierKeys: SubscriptionTier[] = ['free', 'seasoned', 'expert', 'master', 'guild']
      tierKeys.forEach(key => {
        expect(TIER_LIMITS[key]).toBeDefined()
      })
    })
  })
})