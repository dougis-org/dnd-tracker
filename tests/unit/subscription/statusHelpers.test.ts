/**
 * Status Helpers Tests
 * Tests for badge color and usage bar color utilities
 */

import {
  getPlanStatusBadge,
  getUsageBarColor,
} from '@/lib/subscription/statusHelpers';

describe('statusHelpers', () => {
  describe('getPlanStatusBadge', () => {
    const badgeTests = [
      {
        status: 'active' as const,
        isTrial: true,
        label: 'Trial',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        desc: 'Trial badge when isTrial',
      },
      {
        status: 'paused' as const,
        isTrial: false,
        label: 'Paused',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        desc: 'Paused badge',
      },
      {
        status: 'active' as const,
        isTrial: false,
        label: 'Current Plan',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        desc: 'Current Plan for active',
      },
      {
        status: 'paused' as const,
        isTrial: true,
        label: 'Trial',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        desc: 'Trial prioritized over paused',
      },
      {
        status: 'unknown' as const,
        isTrial: false,
        label: 'Current Plan',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        desc: 'Current Plan for unknown',
      },
    ];

    badgeTests.forEach(
      ({ status, isTrial, label, bgColor, textColor, desc }) => {
        it(`returns ${desc}`, () => {
          const badge = getPlanStatusBadge(status, isTrial);
          expect(badge.label).toBe(label);
          expect(badge.bgColor).toBe(bgColor);
          expect(badge.textColor).toBe(textColor);
        });
      }
    );
  });

  describe('getUsageBarColor', () => {
    const colorTests = [
      {
        current: 100,
        max: 0,
        expected: 'bg-green-500',
        desc: 'green for unlimited (max === 0)',
      },
      {
        current: 5,
        max: 10,
        expected: 'bg-green-500',
        desc: 'green for low usage (<70%)',
      },
      {
        current: 0,
        max: 10,
        expected: 'bg-green-500',
        desc: 'green for 0% usage',
      },
      {
        current: 69,
        max: 100,
        expected: 'bg-green-500',
        desc: 'green for 69% usage',
      },
      {
        current: 7,
        max: 10,
        expected: 'bg-yellow-500',
        desc: 'yellow for medium (70-89%)',
      },
      {
        current: 70,
        max: 100,
        expected: 'bg-yellow-500',
        desc: 'yellow for exactly 70%',
      },
      {
        current: 89,
        max: 100,
        expected: 'bg-yellow-500',
        desc: 'yellow for 89% usage',
      },
      {
        current: 9,
        max: 10,
        expected: 'bg-red-500',
        desc: 'red for high usage (>=90%)',
      },
      {
        current: 90,
        max: 100,
        expected: 'bg-red-500',
        desc: 'red for exactly 90%',
      },
      {
        current: 150,
        max: 100,
        expected: 'bg-red-500',
        desc: 'red for over 100%',
      },
    ];

    colorTests.forEach(({ current, max, expected, desc }) => {
      it(`returns ${desc}`, () => {
        const color = getUsageBarColor(current, max);
        expect(color).toBe(expected);
      });
    });
  });
});
