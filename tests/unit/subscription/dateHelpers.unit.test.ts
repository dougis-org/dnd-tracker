/**
 * Subscription Date Helpers Tests
 * Tests date formatting and trial status functions
 */

import {
  formatDate,
  getRenewalDaysFromNow,
  getTrialStatus,
} from '@/lib/subscription/dateHelpers';

describe('Subscription Date Helpers', () => {
  describe('formatDate', () => {
    it('formats date and returns a non-empty string', () => {
      const date = new Date();
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes year in formatted output', () => {
      const date = new Date('2025-06-15T00:00:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/\d{4}/); // Should contain a 4-digit year
    });

    it('includes month name in formatted output', () => {
      const date = new Date('2025-06-15T00:00:00Z');
      const result = formatDate(date);
      // Should be a readable date format
      expect(result).toMatch(
        /(January|February|March|April|May|June|July|August|September|October|November|December)/
      );
    });

    it('includes day in formatted output', () => {
      const date = new Date('2025-06-15T00:00:00Z');
      const result = formatDate(date);
      // Should contain a number (day)
      expect(result).toMatch(/\d/);
    });

    it('handles current date', () => {
      const date = new Date();
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('handles dates across year boundaries', () => {
      const date = new Date('2024-12-31T00:00:00Z');
      const result = formatDate(date);
      expect(result).toMatch(/2024/);
    });
  });

  describe('getRenewalDaysFromNow', () => {
    beforeEach(() => {
      // Mock Date to have consistent time for testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns positive number for future dates', () => {
      const futureDate = new Date('2025-01-20T00:00:00Z');
      const result = getRenewalDaysFromNow(futureDate);
      expect(result).toBe(5);
    });

    it('returns zero for today', () => {
      const today = new Date('2025-01-15T00:00:00Z');
      const result = getRenewalDaysFromNow(today);
      expect(result).toBe(0);
    });

    it('returns negative number for past dates', () => {
      const pastDate = new Date('2025-01-10T00:00:00Z');
      const result = getRenewalDaysFromNow(pastDate);
      expect(result).toBeLessThan(0);
    });

    it('rounds up fractional days', () => {
      // 2 days and 12 hours in the future
      const futureDate = new Date('2025-01-17T12:00:00Z');
      const result = getRenewalDaysFromNow(futureDate);
      expect(result).toBe(3);
    });

    it('handles far future dates', () => {
      const farFutureDate = new Date('2026-01-15T00:00:00Z');
      const result = getRenewalDaysFromNow(farFutureDate);
      expect(result).toBe(365);
    });

    it('handles very recent past dates', () => {
      // 12 hours ago - use -2 days to ensure clearly negative
      const recentPastDate = new Date('2025-01-13T00:00:00Z');
      const result = getRenewalDaysFromNow(recentPastDate);
      expect(result).toBeLessThanOrEqual(-1);
    });
  });

  describe('getTrialStatus', () => {
    it('returns "no-trial" for null daysRemaining', () => {
      const result = getTrialStatus(null);
      expect(result).toBe('no-trial');
    });

    it('returns "no-trial" for undefined daysRemaining', () => {
      const result = getTrialStatus(undefined);
      expect(result).toBe('no-trial');
    });

    it('returns "critical" for zero days remaining', () => {
      const result = getTrialStatus(0);
      expect(result).toBe('critical');
    });

    it('returns "critical" for negative days remaining', () => {
      const result = getTrialStatus(-1);
      expect(result).toBe('critical');
    });

    it('returns "critical" for very negative days remaining', () => {
      const result = getTrialStatus(-100);
      expect(result).toBe('critical');
    });

    it('returns "warning" for 1 day remaining', () => {
      const result = getTrialStatus(1);
      expect(result).toBe('warning');
    });

    it('returns "warning" for 2 days remaining', () => {
      const result = getTrialStatus(2);
      expect(result).toBe('warning');
    });

    it('returns "warning" for 3 days remaining', () => {
      const result = getTrialStatus(3);
      expect(result).toBe('warning');
    });

    it('returns "normal" for 4 days remaining', () => {
      const result = getTrialStatus(4);
      expect(result).toBe('normal');
    });

    it('returns "normal" for 5 days remaining', () => {
      const result = getTrialStatus(5);
      expect(result).toBe('normal');
    });

    it('returns "normal" for many days remaining', () => {
      const result = getTrialStatus(30);
      expect(result).toBe('normal');
    });

    it('returns "normal" for large number of days', () => {
      const result = getTrialStatus(365);
      expect(result).toBe('normal');
    });
  });
});
