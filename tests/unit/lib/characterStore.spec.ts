import seedCharacters from '../../../src/lib/mock/characters';
import { describe, it, expect } from '@jest/globals';

describe('characterStore - scaffold tests', () => {
  it('seed data contains at least 5 characters', () => {
    expect(Array.isArray(seedCharacters)).toBe(true);
    expect(seedCharacters.length).toBeGreaterThanOrEqual(5);
  });
});
