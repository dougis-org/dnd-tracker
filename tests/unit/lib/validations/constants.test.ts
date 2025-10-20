/**
 * Unit tests for validation constants
 */

import { describe, test, expect } from '@jest/globals';
import { EXPERIENCE_LEVEL_OPTIONS, PRIMARY_ROLE_OPTIONS } from '@/lib/validations/constants';

describe('Validation Constants', () => {
  describe('EXPERIENCE_LEVEL_OPTIONS', () => {
    test('should have all experience levels from schema', () => {
      const expectedValues = ['new', 'beginner', 'intermediate', 'experienced', 'veteran'];
      const actualValues = EXPERIENCE_LEVEL_OPTIONS.map((opt) => opt.value);

      expect(actualValues).toEqual(expectedValues);
    });

    test('should capitalize labels correctly', () => {
      const newOption = EXPERIENCE_LEVEL_OPTIONS.find((opt) => opt.value === 'new');
      const intermediateOption = EXPERIENCE_LEVEL_OPTIONS.find(
        (opt) => opt.value === 'intermediate'
      );

      expect(newOption?.label).toBe('New');
      expect(intermediateOption?.label).toBe('Intermediate');
    });

    test('should have matching value and label pairs', () => {
      EXPERIENCE_LEVEL_OPTIONS.forEach((option) => {
        expect(option.value).toBeTruthy();
        expect(option.label).toBeTruthy();
        expect(option.label.toLowerCase()).toBe(option.value);
      });
    });
  });

  describe('PRIMARY_ROLE_OPTIONS', () => {
    test('should have all primary roles from schema', () => {
      const expectedValues = ['dm', 'player', 'both'];
      const actualValues = PRIMARY_ROLE_OPTIONS.map((opt) => opt.value);

      expect(actualValues).toEqual(expectedValues);
    });

    test('should have correct labels for each role', () => {
      const dmOption = PRIMARY_ROLE_OPTIONS.find((opt) => opt.value === 'dm');
      const playerOption = PRIMARY_ROLE_OPTIONS.find((opt) => opt.value === 'player');
      const bothOption = PRIMARY_ROLE_OPTIONS.find((opt) => opt.value === 'both');

      expect(dmOption?.label).toBe('DM');
      expect(playerOption?.label).toBe('Player');
      expect(bothOption?.label).toBe('Both');
    });

    test('should have exactly 3 options', () => {
      expect(PRIMARY_ROLE_OPTIONS).toHaveLength(3);
    });
  });
});
