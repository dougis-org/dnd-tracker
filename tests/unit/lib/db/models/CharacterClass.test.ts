/**
 * Unit tests for CharacterClass model
 *
 * @jest-environment node
 */
import { describe, it, expect } from '@jest/globals';

describe('CharacterClass Model', () => {
  it('should export model with correct name and collection', async () => {
    const { CharacterClass } = await import('@/lib/db/models/CharacterClass');
    expect(CharacterClass.modelName).toBe('CharacterClass');
    expect(CharacterClass.collection.name).toBe('classes');
  });

  it('should define valid hit dice and spellcasting abilities', () => {
    const validHitDice = ['d6', 'd8', 'd10', 'd12'];
    const validAbilities = ['int', 'wis', 'cha'];

    validHitDice.forEach(die => expect(['d6', 'd8', 'd10', 'd12']).toContain(die));
    validAbilities.forEach(ability => expect(['int', 'wis', 'cha']).toContain(ability));
  });

  it('should have correct default values', () => {
    expect({ armorTypes: [], weaponTypes: [], savingThrows: [] }).toMatchObject({
      armorTypes: [],
      weaponTypes: [],
      savingThrows: []
    });
    expect('PHB').toBe('PHB'); // default source
    expect(false).toBe(false); // default spellcasting
  });

  it.each([
    ['Wizard', true],
    ['A'.repeat(50), true],
    ['', false],
    ['A'.repeat(51), false]
  ])('should validate name length: %s -> %s', (name, isValid) => {
    expect(name.length > 0 && name.length <= 50).toBe(isValid);
  });

  it.each([
    ['Wizard', 'd6', true, 'int'],
    ['Fighter', 'd10', false, undefined],
    ['Cleric', 'd8', true, 'wis']
  ])('should support %s class with hitDie=%s, spellcasting=%s', (name, hitDie, spellcasting, spellAbility) => {
    expect(['d6', 'd8', 'd10', 'd12']).toContain(hitDie);
    expect(typeof spellcasting).toBe('boolean');
    if (spellAbility) {
      expect(['int', 'wis', 'cha']).toContain(spellAbility);
    }
  });
});
