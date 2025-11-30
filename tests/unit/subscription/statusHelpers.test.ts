/**
 * Status Helpers Tests
 * Tests for badge color and usage bar color utilities
 */

import { getPlanStatusBadge, getUsageBarColor } from '@/lib/subscription/statusHelpers';

describe('statusHelpers', () => {
  describe('getPlanStatusBadge', () => {
    it('returns Trial badge when isTrial is true', () => {
      const badge = getPlanStatusBadge('active', true);
      expect(badge.label).toBe('Trial');
      expect(badge.bgColor).toBe('bg-yellow-100');
      expect(badge.textColor).toBe('text-yellow-800');
    });

    it('returns Paused badge when status is paused', () => {
      const badge = getPlanStatusBadge('paused', false);
      expect(badge.label).toBe('Paused');
      expect(badge.bgColor).toBe('bg-gray-100');
      expect(badge.textColor).toBe('text-gray-800');
    });

    it('returns Current Plan badge for active status and not trial', () => {
      const badge = getPlanStatusBadge('active', false);
      expect(badge.label).toBe('Current Plan');
      expect(badge.bgColor).toBe('bg-green-100');
      expect(badge.textColor).toBe('text-green-800');
    });

    it('prioritizes trial over paused status', () => {
      const badge = getPlanStatusBadge('paused', true);
      expect(badge.label).toBe('Trial');
    });

    it('returns Current Plan for unknown status when not trial or paused', () => {
      const badge = getPlanStatusBadge('unknown', false);
      expect(badge.label).toBe('Current Plan');
    });
  });

  describe('getUsageBarColor', () => {
    it('returns green for unlimited usage (max === 0)', () => {
      const color = getUsageBarColor(100, 0);
      expect(color).toBe('bg-green-500');
    });

    it('returns green for low usage (<70%)', () => {
      const color = getUsageBarColor(5, 10);
      expect(color).toBe('bg-green-500');
    });

    it('returns green for exactly 0% usage', () => {
      const color = getUsageBarColor(0, 10);
      expect(color).toBe('bg-green-500');
    });

    it('returns green for 69% usage (below 70% threshold)', () => {
      const color = getUsageBarColor(69, 100);
      expect(color).toBe('bg-green-500');
    });

    it('returns yellow for medium usage (70-89%)', () => {
      const color = getUsageBarColor(7, 10);
      expect(color).toBe('bg-yellow-500');
    });

    it('returns yellow for exactly 70% usage', () => {
      const color = getUsageBarColor(70, 100);
      expect(color).toBe('bg-yellow-500');
    });

    it('returns yellow for 89% usage (below 90% threshold)', () => {
      const color = getUsageBarColor(89, 100);
      expect(color).toBe('bg-yellow-500');
    });

    it('returns red for high usage (>=90%)', () => {
      const color = getUsageBarColor(9, 10);
      expect(color).toBe('bg-red-500');
    });

    it('returns red for exactly 90% usage', () => {
      const color = getUsageBarColor(90, 100);
      expect(color).toBe('bg-red-500');
    });

    it('returns red for over 100% usage', () => {
      const color = getUsageBarColor(150, 100);
      expect(color).toBe('bg-red-500');
    });
  });
});
