/**
 * Subscription Utilities Tests
 * Tests for subscription tier limits and usage calculation helpers
 * Constitutional: TDD - Tests written before implementation
 */

import { describe, it, expect } from '@jest/globals';

// Import utilities to test (will fail until T031 is implemented)
import {
  getTierLimits,
  calculateUsagePercentage,
  determineWarningLevel,
  generateUsageWarnings,
  SUBSCRIPTION_LIMITS,
} from '@/lib/utils/subscription';

describe('Subscription Utilities', () => {
  describe('SUBSCRIPTION_LIMITS constant', () => {
    it('should define limits for all subscription tiers', () => {
      expect(SUBSCRIPTION_LIMITS).toBeDefined();
      expect(SUBSCRIPTION_LIMITS.free).toBeDefined();
      expect(SUBSCRIPTION_LIMITS.seasoned).toBeDefined();
      expect(SUBSCRIPTION_LIMITS.expert).toBeDefined();
      expect(SUBSCRIPTION_LIMITS.master).toBeDefined();
      expect(SUBSCRIPTION_LIMITS.guild).toBeDefined();
    });

    it('should have correct free tier limits', () => {
      expect(SUBSCRIPTION_LIMITS.free.parties).toBe(1);
      expect(SUBSCRIPTION_LIMITS.free.encounters).toBe(3);
      expect(SUBSCRIPTION_LIMITS.free.characters).toBe(10);
    });
  });

  describe('getTierLimits', () => {
    it('should return limits for free tier', () => {
      const limits = getTierLimits('free');
      expect(limits).toEqual({
        parties: 1,
        encounters: 3,
        characters: 10,
        maxParticipants: 6,
      });
    });

    it('should return limits for seasoned tier', () => {
      const limits = getTierLimits('seasoned');
      expect(limits.parties).toBe(3);
      expect(limits.encounters).toBe(15);
    });

    it('should return limits for expert tier', () => {
      const limits = getTierLimits('expert');
      expect(limits.parties).toBe(10);
      expect(limits.encounters).toBe(50);
    });

    it('should return limits for master tier', () => {
      const limits = getTierLimits('master');
      expect(limits.parties).toBe(25);
      expect(limits.encounters).toBe(100);
    });

    it('should return limits for guild tier', () => {
      const limits = getTierLimits('guild');
      expect(limits.parties).toBe(Infinity);
      expect(limits.encounters).toBe(Infinity);
    });

    it('should handle invalid tier gracefully', () => {
      // @ts-expect-error Testing invalid input
      const limits = getTierLimits('invalid');
      expect(limits).toBeDefined();
    });
  });

  describe('calculateUsagePercentage', () => {
    it('should calculate correct percentage for normal usage', () => {
      expect(calculateUsagePercentage(2, 10)).toBe(20);
      expect(calculateUsagePercentage(5, 10)).toBe(50);
      expect(calculateUsagePercentage(7, 10)).toBe(70);
      expect(calculateUsagePercentage(10, 10)).toBe(100);
    });

    it('should handle zero usage', () => {
      expect(calculateUsagePercentage(0, 10)).toBe(0);
    });

    it('should handle zero limit (division by zero)', () => {
      expect(calculateUsagePercentage(0, 0)).toBe(0);
      expect(calculateUsagePercentage(5, 0)).toBe(100); // Over limit
    });

    it('should handle usage exceeding limit', () => {
      expect(calculateUsagePercentage(12, 10)).toBe(120);
    });

    it('should handle infinite limits', () => {
      expect(calculateUsagePercentage(100, Infinity)).toBe(0);
      expect(calculateUsagePercentage(0, Infinity)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateUsagePercentage(1, 3)).toBeCloseTo(33.33, 2);
      expect(calculateUsagePercentage(2, 3)).toBeCloseTo(66.67, 2);
    });
  });

  describe('determineWarningLevel', () => {
    it('should return info for usage below 50%', () => {
      expect(determineWarningLevel(0)).toBe('info');
      expect(determineWarningLevel(25)).toBe('info');
      expect(determineWarningLevel(49)).toBe('info');
    });

    it('should return warning for usage between 50% and 80%', () => {
      expect(determineWarningLevel(50)).toBe('warning');
      expect(determineWarningLevel(65)).toBe('warning');
      expect(determineWarningLevel(79)).toBe('warning');
    });

    it('should return critical for usage above 80%', () => {
      expect(determineWarningLevel(80)).toBe('critical');
      expect(determineWarningLevel(90)).toBe('critical');
      expect(determineWarningLevel(100)).toBe('critical');
      expect(determineWarningLevel(120)).toBe('critical');
    });

    it('should handle boundary values correctly', () => {
      expect(determineWarningLevel(49.99)).toBe('info');
      expect(determineWarningLevel(50.0)).toBe('warning');
      expect(determineWarningLevel(79.99)).toBe('warning');
      expect(determineWarningLevel(80.0)).toBe('critical');
    });
  });

  describe('generateUsageWarnings', () => {
    const freeLimits = {
      parties: 1,
      encounters: 3,
      characters: 10,
      maxParticipants: 6,
    };

    it('should return empty array when usage is low', () => {
      const usage = {
        parties: 0,
        encounters: 1,
        characters: 2,
      };
      const warnings = generateUsageWarnings(usage, freeLimits);
      expect(warnings).toEqual([]);
    });

    it('should generate warning for encounters at 66%', () => {
      const usage = {
        parties: 0,
        encounters: 2,
        characters: 2,
      };
      const warnings = generateUsageWarnings(usage, freeLimits);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0]).toMatchObject({
        resource: 'encounters',
        severity: 'warning',
      });
      expect(warnings[0].message).toContain('2 of 3');
    });

    it('should generate critical warning for characters at 100%', () => {
      const usage = {
        parties: 0,
        encounters: 1,
        characters: 10,
      };
      const warnings = generateUsageWarnings(usage, freeLimits);
      const charWarning = warnings.find((w) => w.resource === 'characters');
      expect(charWarning).toBeDefined();
      expect(charWarning!.severity).toBe('critical');
      expect(charWarning!.message).toContain('reached your');
    });

    it('should generate multiple warnings when multiple resources high', () => {
      const usage = {
        parties: 1,
        encounters: 3,
        characters: 9,
      };
      const warnings = generateUsageWarnings(usage, freeLimits);
      expect(warnings.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle infinite limits without warnings', () => {
      const guildLimits = {
        parties: Infinity,
        encounters: Infinity,
        characters: Infinity,
        maxParticipants: 50,
      };
      const usage = {
        parties: 100,
        encounters: 100,
        characters: 100,
      };
      const warnings = generateUsageWarnings(usage, guildLimits);
      expect(warnings).toEqual([]);
    });

    it('should include correct message format', () => {
      const usage = {
        parties: 1,
        encounters: 2,
        characters: 5,
      };
      const warnings = generateUsageWarnings(usage, freeLimits);
      warnings.forEach((warning) => {
        expect(warning).toHaveProperty('resource');
        expect(warning).toHaveProperty('message');
        expect(warning).toHaveProperty('severity');
        expect(typeof warning.message).toBe('string');
        expect(['info', 'warning', 'critical']).toContain(warning.severity);
      });
    });
  });
});
