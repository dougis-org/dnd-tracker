import { calculateAbilityModifier, calculateProficiencyBonus } from '@/lib/validations/character';
import { getSpellcastingInfo } from './spellcasting-data';

export interface SpellcastingStats {
  spellAttackBonus: number;
  spellSaveDC: number;
  spellcastingAbility: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
  abilityModifier: number;
}

export function calculateSpellcastingStats(
  classes: Array<{ className: string; level: number }>,
  abilities: Record<string, number>
): SpellcastingStats | null {
  if (!classes.length) return null;

  const primaryClass = classes[0];
  const spellcastingInfo = getSpellcastingInfo(primaryClass.className);
  
  if (!spellcastingInfo) return null;

  const totalLevel = classes.reduce((sum, cls) => sum + cls.level, 0);
  const proficiencyBonus = calculateProficiencyBonus(totalLevel);
  
  const spellcastingAbility = spellcastingInfo.primary;
  const abilityScore = abilities[spellcastingAbility] || 10;
  const abilityModifier = calculateAbilityModifier(abilityScore);
  
  const spellAttackBonus = abilityModifier + proficiencyBonus;
  const spellSaveDC = 8 + abilityModifier + proficiencyBonus;

  return {
    spellAttackBonus,
    spellSaveDC,
    spellcastingAbility,
    abilityModifier
  };
}

export function getSpellListType(className: string): 'known' | 'prepared' | null {
  const info = getSpellcastingInfo(className);
  return info?.type || null;
}

export function getSpellcastingDescription(className: string): string {
  const info = getSpellcastingInfo(className);
  return info?.description || '';
}