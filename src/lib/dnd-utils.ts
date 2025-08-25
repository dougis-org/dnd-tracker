// src/lib/dnd-utils.ts

/**
 * Calculates the ability modifier for a given ability score.
 * @param score The ability score.
 * @returns The calculated ability modifier.
 */
export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Calculates the proficiency bonus for a given character level.
 * @param totalLevel The total level of the character.
 * @returns The calculated proficiency bonus.
 */
export const calculateProficiencyBonus = (totalLevel: number): number => {
  return Math.ceil(totalLevel / 4) + 1;
};
