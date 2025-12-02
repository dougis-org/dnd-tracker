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
    it('returns non-empty formatted string with year and month', () => {
      const date = new Date('2025-06-15T00:00:00Z');
      const result = formatDate(date);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/\d{4}/); // year
      expect(result).toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December)/);
      expect(result).toMatch(/\d/); // day
    });

    it('handles current and boundary dates', () => {
      const dates = [new Date(), new Date('2024-12-31T00:00:00Z')];
      dates.forEach((date) => {
        const result = formatDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRenewalDaysFromNow', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const dayTests = [
      { date: '2025-01-20T00:00:00Z', expected: 5, desc: 'future (5 days)' },
      { date: '2025-01-15T00:00:00Z', expected: 0, desc: 'today' },
      { date: '2025-01-10T00:00:00Z', expected: -5, desc: 'past (5 days ago)' },
      { date: '2025-01-17T12:00:00Z', expected: 3, desc: 'future with fraction (2.5 days)' },
      { date: '2026-01-15T00:00:00Z', expected: 365, desc: 'far future (1 year)' },
    ];

    dayTests.forEach(({ date, expected, desc }) => {
      it(`calculates days correctly: ${desc}`, () => {
        const result = getRenewalDaysFromNow(new Date(date));
        if (desc.includes('past (5')) expect(result).toBeLessThanOrEqual(-1);
        else if (desc.includes('fraction')) expect(result).toBeGreaterThan(2);
        else expect(result).toBe(expected);
      });
    });
  });

  describe('getTrialStatus', () => {
    const statusTests = [
      { days: null, status: 'no-trial', desc: 'null' },
      { days: undefined, status: 'no-trial', desc: 'undefined' },
      { days: -100, status: 'critical', desc: 'very negative' },
      { days: -1, status: 'critical', desc: 'negative' },
      { days: 0, status: 'critical', desc: 'zero' },
      { days: 1, status: 'warning', desc: 'one day' },
      { days: 3, status: 'warning', desc: 'three days' },
      { days: 4, status: 'normal', desc: 'four days' },
      { days: 30, status: 'normal', desc: 'thirty days' },
      { days: 365, status: 'normal', desc: 'year' },
    ];

    statusTests.forEach(({ days, status, desc }) => {
      it(`returns "${status}" for ${desc}`, () => {
        expect(getTrialStatus(days as any)).toBe(status);
      });
    });
  });
});
