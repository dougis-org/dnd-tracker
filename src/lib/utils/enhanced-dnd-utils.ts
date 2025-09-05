/**
 * Enhanced D&D utilities for character management and game mechanics
 */

import { IHitPoints } from '@/models/shared/schema-utils';

// D&D 5e ability score names
export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

// Character type definitions
export type CharacterType = 'pc' | 'npc' | 'monster';

// Size categories
export type SizeCategory = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

// Damage types in D&D 5e
export type DamageType = 
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' 
  | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder';

/**
 * Calculate ability modifier from ability score
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus based on character level
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Get HP status based on current HP percentage
 */
export function getHPStatus(current: number, maximum: number): 'full' | 'healthy' | 'wounded' | 'critical' | 'unconscious' {
  if (current <= 0) return 'unconscious';
  
  const percentage = (current / maximum) * 100;
  if (percentage === 100) return 'full';
  if (percentage > 75) return 'healthy';
  if (percentage > 25) return 'wounded';
  return 'critical';
}

/**
 * Get CSS class for HP status
 */
export function getHPStatusClass(current: number, maximum: number): string {
  const status = getHPStatus(current, maximum);
  return `hp-${status}`;
}

/**
 * Get CSS class for character type
 */
export function getCharacterTypeClass(type: CharacterType): string {
  return `character-${type}`;
}

/**
 * Calculate initiative modifier (Dex modifier + misc bonuses)
 */
export function getInitiativeModifier(dexterityScore: number, bonuses: number = 0): number {
  return getAbilityModifier(dexterityScore) + bonuses;
}

/**
 * Roll dice notation (e.g., "2d6+3")
 */
export interface DiceRoll {
  dice: number[];
  modifier: number;
  total: number;
  notation: string;
  diceType: number;
  diceCount: number;
}

export function rollDice(diceCount: number, diceType: number, modifier: number = 0): DiceRoll {
  const dice = Array.from({ length: diceCount }, () => 
    Math.floor(Math.random() * diceType) + 1
  );
  
  const total = dice.reduce((sum, roll) => sum + roll, 0) + modifier;
  
  const notation = formatDiceNotation(diceCount, diceType, modifier);
  
  return {
    dice,
    modifier,
    total,
    notation,
    diceType,
    diceCount
  };
}

/**
 * Parse dice notation string (e.g., "2d6+3") and roll
 */
export function rollFromNotation(notation: string): DiceRoll | null {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return null;
  
  const diceCount = parseInt(match[1]);
  const diceType = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;
  
  return rollDice(diceCount, diceType, modifier);
}

/**
 * Calculate damage with resistance/vulnerability
 */
export function calculateDamage(
  baseDamage: number, 
  damageType: DamageType, 
  resistances: DamageType[] = [], 
  vulnerabilities: DamageType[] = [],
  immunities: DamageType[] = []
): number {
  if (immunities.includes(damageType)) return 0;
  
  let finalDamage = baseDamage;
  
  if (resistances.includes(damageType)) {
    finalDamage = Math.floor(finalDamage / 2);
  }
  
  if (vulnerabilities.includes(damageType)) {
    finalDamage *= 2;
  }
  
  return Math.max(0, finalDamage);
}

/**
 * Apply damage to hit points with proper order (temp HP first)
 */
export function applyDamage(hitPoints: IHitPoints, damage: number): IHitPoints {
  let remainingDamage = damage;
  const newHitPoints = { ...hitPoints };
  
  // Apply to temporary HP first
  if (newHitPoints.temporary > 0 && remainingDamage > 0) {
    const tempDamage = Math.min(remainingDamage, newHitPoints.temporary);
    newHitPoints.temporary -= tempDamage;
    remainingDamage -= tempDamage;
  }
  
  // Apply remaining damage to current HP
  if (remainingDamage > 0) {
    newHitPoints.current = Math.max(0, newHitPoints.current - remainingDamage);
  }
  
  return newHitPoints;
}

/**
 * Apply healing to hit points
 */
export function applyHealing(hitPoints: IHitPoints, healing: number): IHitPoints {
  return {
    ...hitPoints,
    current: Math.min(hitPoints.maximum, hitPoints.current + healing)
  };
}

/**
 * Add temporary hit points (doesn't stack, takes higher value)
 */
export function addTemporaryHP(hitPoints: IHitPoints, tempHP: number): IHitPoints {
  return {
    ...hitPoints,
    temporary: Math.max(hitPoints.temporary, tempHP)
  };
}

/**
 * Check if character is alive
 */
export function isAlive(hitPoints: IHitPoints): boolean {
  return hitPoints.current > 0;
}

/**
 * Check if character is unconscious
 */
export function isUnconscious(hitPoints: IHitPoints): boolean {
  return hitPoints.current <= 0;
}

/**
 * Get effective HP (current + temporary)
 */
export function getEffectiveHP(hitPoints: IHitPoints): number {
  return hitPoints.current + hitPoints.temporary;
}

/**
 * Generate ability scores using standard array
 */
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

/**
 * Generate random ability scores (4d6 drop lowest)
 */
export function rollAbilityScores(): Record<AbilityName, number> {
  const rollStat = () => {
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => b - a);
    return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
  };

  return {
    strength: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat(),
  };
}

/**
 * Spell level validation
 */
export function isValidSpellLevel(level: number): boolean {
  return level >= 0 && level <= 9;
}

/**
 * Character level validation
 */
export function isValidCharacterLevel(level: number): boolean {
  return level >= 1 && level <= 20;
}

/**
 * Size modifier for combat
 */
export function getSizeModifier(size: SizeCategory): { ac: number; attack: number; stealth: number } {
  switch (size) {
    case 'tiny': return { ac: 2, attack: 2, stealth: 4 };
    case 'small': return { ac: 1, attack: 1, stealth: 2 };
    case 'medium': return { ac: 0, attack: 0, stealth: 0 };
    case 'large': return { ac: -1, attack: -1, stealth: -2 };
    case 'huge': return { ac: -2, attack: -2, stealth: -4 };
    case 'gargantuan': return { ac: -4, attack: -4, stealth: -8 };
  }
}

/**
 * Format dice notation for display
 */
export function formatDiceNotation(diceCount: number, diceType: number, modifier: number = 0): string {
  let notation = `${diceCount}d${diceType}`;
  if (modifier > 0) notation += `+${modifier}`;
  else if (modifier < 0) notation += modifier;
  return notation;
}

/**
 * Calculate average damage for dice notation
 */
export function calculateAverageDamage(diceCount: number, diceType: number, modifier: number = 0): number {
  const averageRoll = (diceType + 1) / 2;
  return Math.floor(diceCount * averageRoll + modifier);
}