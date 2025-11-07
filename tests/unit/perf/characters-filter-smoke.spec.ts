/**
 * Performance smoke test for character filtering
 * Ensures client-side search/filter operations complete within acceptable time budget
 */

import { Character } from '../../../types/character';
import { describe, it, expect } from '@jest/globals';

const PERF_BUDGET_MS = 200;

/**
 * Mock character generator for performance testing
 */
function generateMockCharacters(count: number): Character[] {
  const classes = [
    'Fighter',
    'Wizard',
    'Rogue',
    'Cleric',
    'Barbarian',
    'Ranger',
  ];
  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Tiefling'];

  return Array.from({ length: count }, (_, i) => ({
    id: `perf-char-${i}`,
    name: `Character ${i}`,
    className: classes[i % classes.length],
    race: races[i % races.length],
    level: (i % 20) + 1,
    hitPoints: { current: 50, max: 50 },
    armorClass: 15,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    equipment: [],
  }));
}

/**
 * Filter logic from CharacterList component
 */
function filterCharacters(
  characters: Character[],
  searchQuery: string,
  classFilter: string
): Character[] {
  return characters.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || c.className === classFilter;
    return matchesSearch && matchesClass;
  });
}

describe('Character Filter Performance', () => {
  it('should filter 100 characters within budget', () => {
    const characters = generateMockCharacters(100);
    const start = Date.now();

    const result = filterCharacters(characters, 'character 5', 'All');

    const duration = Date.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(PERF_BUDGET_MS);
  });

  it('should filter by class within budget', () => {
    const characters = generateMockCharacters(100);
    const start = Date.now();

    const result = filterCharacters(characters, '', 'Fighter');

    const duration = Date.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(PERF_BUDGET_MS);
  });

  it('should filter by search and class within budget', () => {
    const characters = generateMockCharacters(100);
    const start = Date.now();

    const result = filterCharacters(characters, 'character', 'Wizard');

    const duration = Date.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(PERF_BUDGET_MS);
  });

  it('should handle large datasets (500 characters) within budget', () => {
    const characters = generateMockCharacters(500);
    const start = Date.now();

    const result = filterCharacters(characters, 'character 42', 'All');

    const duration = Date.now() - start;

    expect(result.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(PERF_BUDGET_MS);
  });
});
