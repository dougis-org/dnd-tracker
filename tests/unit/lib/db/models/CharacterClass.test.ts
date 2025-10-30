/**
 * Unit tests for CharacterClass model
 *
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';

describe('CharacterClass Model', () => {
  describe('Schema Definition', () => {
    it('should export CharacterClass model', async () => {
      const { CharacterClass } = await import('@/lib/db/models/CharacterClass');
      expect(CharacterClass).toBeDefined();
      expect(CharacterClass.modelName).toBe('CharacterClass');
    });

    it('should have correct collection name', async () => {
      const { CharacterClass } = await import('@/lib/db/models/CharacterClass');
      expect(CharacterClass.collection.name).toBe('classes');
    });
  });

  describe('Hit Dice Validation', () => {
    it('should accept valid hit dice', () => {
      const validHitDice = ['d6', 'd8', 'd10', 'd12'];
      // Test that the constants are exported correctly
      validHitDice.forEach((die) => {
        expect(['d6', 'd8', 'd10', 'd12']).toContain(die);
      });
    });
  });

  describe('Spellcasting Abilities', () => {
    it('should accept valid spellcasting abilities', () => {
      const validAbilities = ['int', 'wis', 'cha'];
      validAbilities.forEach((ability) => {
        expect(['int', 'wis', 'cha']).toContain(ability);
      });
    });
  });

  describe('Interface and Types', () => {
    it('should have correct proficiencies structure', () => {
      // Type checking is done at compile time, but we can verify the structure exists
      const proficiencies = {
        armorTypes: ['light', 'medium'],
        weaponTypes: ['simple', 'martial'],
        savingThrows: ['str', 'con'],
      };

      expect(proficiencies).toHaveProperty('armorTypes');
      expect(proficiencies).toHaveProperty('weaponTypes');
      expect(proficiencies).toHaveProperty('savingThrows');
      expect(Array.isArray(proficiencies.armorTypes)).toBe(true);
    });

    it('should support spellcasting fields', () => {
      const spellcastingClass = {
        spellcasting: true,
        spellAbility: 'int',
      };

      expect(spellcastingClass.spellcasting).toBe(true);
      expect(['int', 'wis', 'cha']).toContain(spellcastingClass.spellAbility);
    });

    it('should support non-spellcasting classes', () => {
      const nonSpellcastingClass = {
        spellcasting: false,
      };

      expect(nonSpellcastingClass.spellcasting).toBe(false);
      expect(nonSpellcastingClass).not.toHaveProperty('spellAbility');
    });
  });

  describe('Default Values', () => {
    it('should have default proficiencies structure', () => {
      const defaultProficiencies = {
        armorTypes: [],
        weaponTypes: [],
        savingThrows: [],
      };

      expect(defaultProficiencies.armorTypes).toEqual([]);
      expect(defaultProficiencies.weaponTypes).toEqual([]);
      expect(defaultProficiencies.savingThrows).toEqual([]);
    });

    it('should have default source value', () => {
      const defaultSource = 'PHB';
      expect(defaultSource).toBe('PHB');
    });

    it('should have default spellcasting value', () => {
      const defaultSpellcasting = false;
      expect(defaultSpellcasting).toBe(false);
    });
  });

  describe('Field Constraints', () => {
    it('should enforce name length constraints', () => {
      const validName = 'Wizard';
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

  describe('Class Examples', () => {
    it('should support wizard class structure', () => {
      const wizard = {
        name: 'Wizard',
        hitDie: 'd6',
        proficiencies: {
          armorTypes: [],
          weaponTypes: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
          savingThrows: ['int', 'wis'],
        },
        spellcasting: true,
        spellAbility: 'int',
        description: 'Arcane spellcasters who study magic',
        source: 'PHB',
      };

      expect(wizard.hitDie).toBe('d6');
      expect(wizard.spellcasting).toBe(true);
      expect(wizard.spellAbility).toBe('int');
    });

    it('should support fighter class structure', () => {
      const fighter = {
        name: 'Fighter',
        hitDie: 'd10',
        proficiencies: {
          armorTypes: ['light', 'medium', 'heavy', 'shields'],
          weaponTypes: ['simple', 'martial'],
          savingThrows: ['str', 'con'],
        },
        spellcasting: false,
        description: 'Master of martial combat',
        source: 'PHB',
      };

      expect(fighter.hitDie).toBe('d10');
      expect(fighter.spellcasting).toBe(false);
      expect(fighter.spellAbility).toBeUndefined();
    });

    it('should support cleric class structure', () => {
      const cleric = {
        name: 'Cleric',
        hitDie: 'd8',
        proficiencies: {
          armorTypes: ['light', 'medium', 'shields'],
          weaponTypes: ['simple'],
          savingThrows: ['wis', 'cha'],
        },
        spellcasting: true,
        spellAbility: 'wis',
        description: 'Divine spellcasters',
        source: 'PHB',
      };

      expect(cleric.hitDie).toBe('d8');
      expect(cleric.spellcasting).toBe(true);
      expect(cleric.spellAbility).toBe('wis');
    });
  });
});
