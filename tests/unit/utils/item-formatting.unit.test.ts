/**
 * Item Formatting Utilities Tests
 * Tests formatWeight, formatProperties, and resolveSource functions
 */

import {
  formatWeight,
  formatProperties,
  resolveSource,
  rarityStyles,
} from '@/lib/utils/item-formatting';
import { Item, ItemRarity } from '@/types/item';

describe('Item Formatting Utilities', () => {
  describe('formatWeight', () => {
    const weightTests = [
      { input: null, expected: '—', desc: 'null' },
      { input: undefined, expected: '—', desc: 'undefined' },
      { input: 0, expected: '0 lbs', desc: 'zero' },
      { input: 1, expected: '1 lb', desc: 'singular' },
      { input: 5, expected: '5 lbs', desc: 'plural' },
      { input: -5, expected: '-5 lbs', desc: 'negative' },
      { input: 1000, expected: '1000 lbs', desc: 'large number' },
      { input: 0.5, expected: '0.5 lbs', desc: 'decimal' },
      { input: 5.0, expected: '5 lbs', desc: 'decimal integer' },
      { input: 5.234, expected: '5.2 lbs', desc: 'rounded decimal' },
      { input: 5.15, expected: '5.2 lbs', desc: 'rounded with trailing zero' },
    ];

    weightTests.forEach(({ input, expected, desc }) => {
      it(`formats weight (${desc})`, () => {
        expect(formatWeight(input)).toBe(expected);
      });
    });
  });

  describe('formatProperties', () => {
    const propertyTests = [
      { input: undefined, expected: 'No special properties' },
      { input: [], expected: 'No special properties' },
      { input: ['Magical'], expected: 'Magical' },
      { input: ['Property1', 'Property2'], expected: 'Property1 +1 more' },
      { input: ['Magical', 'Cursed', 'Legendary'], expected: 'Magical +2 more' },
      { input: ['Magical & Cursed', 'Legendary'], expected: 'Magical & Cursed +1 more' },
      { input: Array.from({ length: 10 }, (_, i) => `Prop${i}`), expected: 'Prop0 +9 more' },
      { input: ['Magical Property Name'], expected: 'Magical Property Name' },
    ];

    propertyTests.forEach(({ input, expected }) => {
      it(`formats properties: ${Array.isArray(input) ? `${input.length} items` : input}`, () => {
        expect(formatProperties(input as any)).toBe(expected);
      });
    });
  });

  describe('resolveSource', () => {
    const sourceTests = [
      { isSystem: false, source: 'Any', expected: 'User Created', desc: 'non-system item' },
      { isSystem: true, source: 'Player Handbook', expected: 'Player Handbook', desc: 'system with source' },
      { isSystem: true, source: undefined, expected: 'System Catalog', desc: 'system without source' },
      { isSystem: true, source: null, expected: 'System Catalog', desc: 'system with null source' },
      { isSystem: true, source: '', expected: '', desc: 'system with empty source' },
    ];

    sourceTests.forEach(({ isSystem, source, expected, desc }) => {
      it(`resolves source (${desc})`, () => {
        const item: Partial<Item> = { isSystemItem: isSystem, source: source as any };
        expect(resolveSource(item as Item)).toBe(expected);
      });
    });
  });

  describe('rarityStyles', () => {
    const rarities = [
      ItemRarity.Common,
      ItemRarity.Uncommon,
      ItemRarity.Rare,
      ItemRarity.VeryRare,
      ItemRarity.Legendary,
      ItemRarity.Artifact,
    ];

    rarities.forEach((rarity) => {
      it(`defines styles for ${rarity} rarity`, () => {
        expect(rarityStyles[rarity]).toBeDefined();
        expect(typeof rarityStyles[rarity]).toBe('string');
        expect(rarityStyles[rarity]).toMatch(/bg-|text-/);
      });
    });

    it('all rarity styles contain Tailwind classes', () => {
      Object.values(rarityStyles).forEach((style) => {
        expect(style).toMatch(/bg-|text-/);
      });
    });
  });
});
