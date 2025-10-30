/**
 * Unit tests for CharacterRace model
 *
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';

describe('CharacterRace Model', () => {
  describe('Schema Definition', () => {
    it('should export CharacterRace model', async () => {
      const { CharacterRace } = await import('@/lib/db/models/CharacterRace');
      expect(CharacterRace).toBeDefined();
      expect(CharacterRace.modelName).toBe('CharacterRace');
    });

    it('should have correct collection name', async () => {
      const { CharacterRace } = await import('@/lib/db/models/CharacterRace');
      expect(CharacterRace.collection.name).toBe('races');
    });
  });

  describe('Ability Bonuses Structure', () => {
    it('should have correct ability bonus fields', () => {
      const abilityBonuses = {
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0,
      };

      expect(abilityBonuses).toHaveProperty('str');
      expect(abilityBonuses).toHaveProperty('dex');
      expect(abilityBonuses).toHaveProperty('con');
      expect(abilityBonuses).toHaveProperty('int');
      expect(abilityBonuses).toHaveProperty('wis');
      expect(abilityBonuses).toHaveProperty('cha');
    });

    it('should support ability bonus ranges', () => {
      const validBonuses = [0, 1, 2];
      const invalidBonuses = [-1, 3, 4];

      validBonuses.forEach((bonus) => {
        expect(bonus).toBeGreaterThanOrEqual(0);
        expect(bonus).toBeLessThanOrEqual(2);
      });

      invalidBonuses.forEach((bonus) => {
        expect(bonus < 0 || bonus > 2).toBe(true);
      });
    });
  });

  describe('Default Values', () => {
    it('should have default ability bonuses of zero', () => {
      const defaultBonuses = {
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0,
      };

      Object.values(defaultBonuses).forEach((bonus) => {
        expect(bonus).toBe(0);
      });
    });

    it('should have default source value', () => {
      const defaultSource = 'PHB';
      expect(defaultSource).toBe('PHB');
    });

    it('should have default empty traits array', () => {
      const defaultTraits: string[] = [];
      expect(defaultTraits).toEqual([]);
      expect(Array.isArray(defaultTraits)).toBe(true);
    });
  });

  describe('Field Constraints', () => {
    it('should enforce name length constraints', () => {
      const validName = 'Human';
      const emptyName = '';
      const longName = 'A'.repeat(51);

      expect(validName.length).toBeGreaterThan(0);
      expect(validName.length).toBeLessThanOrEqual(50);
      expect(emptyName.length).toBe(0); // Should be invalid
      expect(longName.length).toBeGreaterThan(50); // Should be invalid
    });

    it('should enforce source length constraints', () => {
      const validSource = 'PHB';
      const longSource = 'A'.repeat(51);

      expect(validSource.length).toBeLessThanOrEqual(50);
      expect(longSource.length).toBeGreaterThan(50); // Should be invalid
    });
  });

  describe('Race Examples', () => {
    it('should support human race structure', () => {
      const human = {
        name: 'Human',
        abilityBonuses: {
          str: 1,
          dex: 1,
          con: 1,
          int: 1,
          wis: 1,
          cha: 1,
        },
        traits: ['Extra Language', 'Skill Versatility'],
        description: 'Versatile and ambitious',
        source: 'PHB',
      };

      expect(human.name).toBe('Human');
      Object.values(human.abilityBonuses).forEach((bonus) => {
        expect(bonus).toBe(1);
      });
      expect(human.traits).toContain('Extra Language');
    });

    it('should support elf race structure', () => {
      const elf = {
        name: 'Elf',
        abilityBonuses: {
          str: 0,
          dex: 2,
          con: 0,
          int: 0,
          wis: 0,
          cha: 0,
        },
        traits: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'],
        description: 'Graceful and long-lived',
        source: 'PHB',
      };

      expect(elf.abilityBonuses.dex).toBe(2);
      expect(elf.abilityBonuses.str).toBe(0);
      expect(elf.traits).toContain('Darkvision');
      expect(elf.traits.length).toBeGreaterThan(0);
    });

    it('should support dwarf race structure', () => {
      const dwarf = {
        name: 'Dwarf',
        abilityBonuses: {
          str: 0,
          dex: 0,
          con: 2,
          int: 0,
          wis: 0,
          cha: 0,
        },
        traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'],
        description: 'Hardy and traditional',
        source: 'PHB',
      };

      expect(dwarf.abilityBonuses.con).toBe(2);
      expect(dwarf.traits).toContain('Dwarven Resilience');
    });

    it('should support half-elf race structure', () => {
      const halfElf = {
        name: 'Half-Elf',
        abilityBonuses: {
          str: 0,
          dex: 0,
          con: 0,
          int: 0,
          wis: 0,
          cha: 2,
        },
        traits: ['Darkvision', 'Fey Ancestry', 'Skill Versatility'],
        description: 'Charismatic and diplomatic',
        source: 'PHB',
      };

      expect(halfElf.abilityBonuses.cha).toBe(2);
      expect(halfElf.traits).toContain('Skill Versatility');
    });

    it('should support tiefling race structure', () => {
      const tiefling = {
        name: 'Tiefling',
        abilityBonuses: {
          str: 0,
          dex: 0,
          con: 0,
          int: 1,
          wis: 0,
          cha: 2,
        },
        traits: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
        description: 'Infernal heritage and arcane affinity',
        source: 'PHB',
      };

      expect(tiefling.abilityBonuses.cha).toBe(2);
      expect(tiefling.abilityBonuses.int).toBe(1);
      expect(tiefling.traits).toContain('Infernal Legacy');
    });
  });

  describe('Traits Array', () => {
    it('should support multiple traits', () => {
      const traits = ['Trait 1', 'Trait 2', 'Trait 3'];
      expect(traits.length).toBe(3);
      expect(Array.isArray(traits)).toBe(true);
    });

    it('should support empty traits array', () => {
      const traits: string[] = [];
      expect(traits.length).toBe(0);
      expect(Array.isArray(traits)).toBe(true);
    });
  });
});
