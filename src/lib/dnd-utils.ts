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
  if (totalLevel >= 1 && totalLevel <= 4) return 2;
  if (totalLevel >= 5 && totalLevel <= 8) return 3;
  if (totalLevel >= 9 && totalLevel <= 12) return 4;
  if (totalLevel >= 13 && totalLevel <= 16) return 5;
  if (totalLevel >= 17 && totalLevel <= 20) return 6;
  // Optionally, handle out-of-bounds levels
  throw new Error("Level out of range for proficiency bonus calculation");
};
