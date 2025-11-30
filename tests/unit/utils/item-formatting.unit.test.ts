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
    it('returns "—" for null weight', () => {
      expect(formatWeight(null)).toBe('—');
    });

    it('returns "—" for undefined weight', () => {
      expect(formatWeight(undefined)).toBe('—');
    });

    it('formats integer weight with plural "lbs"', () => {
      expect(formatWeight(5)).toBe('5 lbs');
    });

    it('formats weight of 1 with singular "lb"', () => {
      expect(formatWeight(1)).toBe('1 lb');
    });

    it('formats weight of 0 with plural "lbs"', () => {
      expect(formatWeight(0)).toBe('0 lbs');
    });

    it('rounds decimal weight to 1 decimal place', () => {
      expect(formatWeight(5.234)).toBe('5.2 lbs');
    });

    it('rounds decimal weight to 1 decimal place and removes trailing zero', () => {
      expect(formatWeight(5.15)).toBe('5.2 lbs');
    });

    it('handles very small decimal numbers', () => {
      expect(formatWeight(0.5)).toBe('0.5 lbs');
    });

    it('handles large numbers', () => {
      expect(formatWeight(1000)).toBe('1000 lbs');
    });

    it('handles negative numbers', () => {
      expect(formatWeight(-5)).toBe('-5 lbs');
    });

    it('correctly identifies integer decimal numbers', () => {
      expect(formatWeight(5.0)).toBe('5 lbs');
    });
  });

  describe('formatProperties', () => {
    it('returns "No special properties" for undefined properties', () => {
      expect(formatProperties(undefined)).toBe('No special properties');
    });

    it('returns "No special properties" for empty array', () => {
      expect(formatProperties([])).toBe('No special properties');
    });

    it('returns single property as-is', () => {
      expect(formatProperties(['Magical'])).toBe('Magical');
    });

    it('returns first property plus count for multiple properties', () => {
      expect(formatProperties(['Magical', 'Cursed', 'Legendary'])).toBe(
        'Magical +2 more'
      );
    });

    it('handles exactly two properties', () => {
      expect(formatProperties(['Property1', 'Property2'])).toBe(
        'Property1 +1 more'
      );
    });

    it('handles many properties', () => {
      const properties = Array.from({ length: 10 }, (_, i) => `Prop${i}`);
      expect(formatProperties(properties)).toBe('Prop0 +9 more');
    });

    it('preserves property names exactly', () => {
      expect(formatProperties(['Magical Property Name'])).toBe(
        'Magical Property Name'
      );
    });

    it('handles properties with special characters', () => {
      expect(formatProperties(['Magical & Cursed', 'Legendary'])).toBe(
        'Magical & Cursed +1 more'
      );
    });
  });

  describe('resolveSource', () => {
    it('returns "User Created" for non-system items', () => {
      const item: Partial<Item> = {
        isSystemItem: false,
        source: 'Some Source',
      };

      expect(resolveSource(item as Item)).toBe('User Created');
    });

    it('returns item source for system items with source', () => {
      const item: Partial<Item> = {
        isSystemItem: true,
        source: 'Player Handbook',
      };

      expect(resolveSource(item as Item)).toBe('Player Handbook');
    });

    it('returns "System Catalog" for system items without source', () => {
      const item: Partial<Item> = {
        isSystemItem: true,
        source: undefined,
      };

      expect(resolveSource(item as Item)).toBe('System Catalog');
    });

    it('returns "System Catalog" for system items with null source', () => {
      const item: Partial<Item> = {
        isSystemItem: true,
        source: null,
      };

      expect(resolveSource(item as Item)).toBe('System Catalog');
    });

    it('ignores source when item is not system item', () => {
      const item: Partial<Item> = {
        isSystemItem: false,
        source: 'Should be ignored',
      };

      expect(resolveSource(item as Item)).toBe('User Created');
    });

    it('handles empty string source for system items', () => {
      const item: Partial<Item> = {
        isSystemItem: true,
        source: '',
      };

      expect(resolveSource(item as Item)).toBe('');
    });
  });

  describe('rarityStyles', () => {
    it('defines styles for Common rarity', () => {
      expect(rarityStyles[ItemRarity.Common]).toBeDefined();
      expect(typeof rarityStyles[ItemRarity.Common]).toBe('string');
    });

    it('defines styles for Uncommon rarity', () => {
      expect(rarityStyles[ItemRarity.Uncommon]).toBeDefined();
      expect(typeof rarityStyles[ItemRarity.Uncommon]).toBe('string');
    });

    it('defines styles for Rare rarity', () => {
      expect(rarityStyles[ItemRarity.Rare]).toBeDefined();
      expect(typeof rarityStyles[ItemRarity.Rare]).toBe('string');
    });

    it('defines styles for VeryRare rarity', () => {
      expect(rarityStyles[ItemRarity.VeryRare]).toBeDefined();
      expect(typeof rarityStyles[ItemRarity.VeryRare]).toBe('string');
    });

    it('defines styles for Legendary rarity', () => {
      expect(rarityStyles[ItemRarity.Legendary]).toBeDefined();
      expect(typeof rarityStyles[ItemRarity.Legendary]).toBe('string');
    });

    it('defines styles for Artifact rarity', () => {
      expect(rarityStyles[ItemRarity.Artifact]).toBeDefined();
      expect(typeof rarityStyles[ItemRarity.Artifact]).toBe('string');
    });

    it('all rarity styles contain Tailwind classes', () => {
      Object.values(rarityStyles).forEach((style) => {
        expect(style).toMatch(/bg-|text-/);
      });
    });
  });
});
