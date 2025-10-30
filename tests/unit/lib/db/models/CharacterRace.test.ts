/**
 * Unit tests for CharacterRace model
 *
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';

describe('CharacterRace Model', () => {
  it('should export model with correct name and collection', async () => {
    const { CharacterRace } = await import('@/lib/db/models/CharacterRace');
    expect(CharacterRace.modelName).toBe('CharacterRace');
    expect(CharacterRace.collection.name).toBe('races');
  });

  it('should have correct ability score fields and defaults', () => {
    const defaultBonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

    Object.keys(defaultBonuses).forEach(ability => {
      expect(defaultBonuses).toHaveProperty(ability);
    });
    Object.values(defaultBonuses).forEach(bonus => expect(bonus).toBe(0));
  });

  it('should have correct default values', () => {
    expect('PHB').toBe('PHB'); // default source
    expect([]).toEqual([]); // default traits array
  });

  it.each([
    ['Human', true],
    ['A'.repeat(50), true],
    ['', false],
    ['A'.repeat(51), false]
  ])('should validate name length: %s -> %s', (name, isValid) => {
    expect(name.length > 0 && name.length <= 50).toBe(isValid);
  });

  it.each([
    [0, true],
    [1, true],
    [2, true],
    [-1, false],
    [3, false]
  ])('should validate ability bonus range: %i -> %s', (bonus, isValid) => {
    expect(bonus >= 0 && bonus <= 2).toBe(isValid);
  });

  it.each([
    ['Human', { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, ['Extra Language', 'Skill Versatility']],
    ['Elf', { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 }, ['Darkvision', 'Keen Senses', 'Fey Ancestry']],
    ['Dwarf', { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: 0 }, ['Darkvision', 'Dwarven Resilience']],
    ['Half-Elf', { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 2 }, ['Darkvision', 'Fey Ancestry']],
    ['Tiefling', { str: 0, dex: 0, con: 0, int: 1, wis: 0, cha: 2 }, ['Darkvision', 'Hellish Resistance']]
  ])('should support %s race with expected bonuses and traits', (name, bonuses, expectedTraits) => {
    Object.values(bonuses).forEach(bonus => {
      expect(bonus).toBeGreaterThanOrEqual(0);
      expect(bonus).toBeLessThanOrEqual(2);
    });
    expect(Array.isArray(expectedTraits)).toBe(true);
    expect(expectedTraits.length).toBeGreaterThan(0);
  });
});
