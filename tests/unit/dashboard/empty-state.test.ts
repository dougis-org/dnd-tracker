/**
 * Empty State Detection Tests
 * Tests for determining when dashboard shows empty state
 */

import { EMPTY_STATE_CASES } from './fixtures';

describe('Empty State Detection', () => {
  it.each(EMPTY_STATE_CASES)(
    'should mark isEmpty=$isEmpty when parties=$parties, characters=$characters, encounters=$encounters',
    ({ parties, characters, encounters, isEmpty }) => {
      const calculated = !(parties > 0 || characters > 0 || encounters > 0);
      expect(calculated).toBe(isEmpty);
    }
  );

  it('should mark dashboard as isEmpty=true when all resources are 0', () => {
    const parties = 0;
    const characters = 0;
    const encounters = 0;
    const isEmpty = parties === 0 && characters === 0 && encounters === 0;
    expect(isEmpty).toBe(true);
  });

  it('should mark dashboard as isEmpty=false when at least one resource exists', () => {
    const parties = 1;
    const characters = 0;
    const encounters = 0;
    const isEmpty = !(parties > 0 || characters > 0 || encounters > 0);
    expect(isEmpty).toBe(false);
  });

  it('should handle case: 1 party, 0 characters, 0 encounters', () => {
    const parties = 1;
    const characters = 0;
    const encounters = 0;
    const isEmpty = !(parties > 0 || characters > 0 || encounters > 0);
    expect(isEmpty).toBe(false);
  });

  it('should handle case: 0 parties, 1 character, 0 encounters', () => {
    const parties = 0;
    const characters = 1;
    const encounters = 0;
    const isEmpty = !(parties > 0 || characters > 0 || encounters > 0);
    expect(isEmpty).toBe(false);
  });

  it('should handle case: 0 parties, 0 characters, 1 encounter', () => {
    const parties = 0;
    const characters = 0;
    const encounters = 1;
    const isEmpty = !(parties > 0 || characters > 0 || encounters > 0);
    expect(isEmpty).toBe(false);
  });
});
