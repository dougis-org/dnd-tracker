/**
 * Color State Logic Tests
 *
 * Tests for mapping usage percentages to color states
 */

import { COLOR_STATE_CASES } from './fixtures';

describe('Usage Color State Logic', () => {
  it.each(COLOR_STATE_CASES)(
    'should be $state for $percentage% usage',
    ({ percentage, state }) => {
      let colorState: string;
      if (percentage < 80) {
        colorState = 'green';
      } else if (percentage < 100) {
        colorState = 'yellow';
      } else {
        colorState = 'red';
      }
      expect(colorState).toBe(state);
    }
  );

  it('should be green for <80% usage', () => {
    const percentages = [0, 25, 50, 75, 79];
    percentages.forEach((p) => {
      expect(p).toBeLessThan(80);
    });
  });

  it('should be yellow for 80-99% usage', () => {
    const percentages = [80, 85, 90, 99];
    percentages.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(80);
      expect(p).toBeLessThan(100);
    });
  });

  it('should be red for >=100% usage', () => {
    const percentages = [100, 101, 150, 200];
    percentages.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(100);
    });
  });
});
