import type { AbilityScores } from './character';

// D&D 5e Multiclassing Prerequisites as per Player's Handbook
const MULTICLASSING_PREREQUISITES: Record<string, Partial<AbilityScores>> = {
  'Barbarian': { strength: 13 },
  'Bard': { charisma: 13 },
  'Cleric': { wisdom: 13 },
  'Druid': { wisdom: 13 },
  'Fighter': { strength: 13 },
  'Monk': { dexterity: 13, wisdom: 13 },
  'Paladin': { strength: 13, charisma: 13 },
  'Ranger': { dexterity: 13, wisdom: 13 },
  'Rogue': { dexterity: 13 },
  'Sorcerer': { charisma: 13 },
  'Warlock': { charisma: 13 },
  'Wizard': { intelligence: 13 }
};

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Get the ability score prerequisites for multiclassing into a specific class.
 * 
 * @param className - The D&D class name
 * @returns Object with ability score requirements
 */
export function getMulticlassingPrerequisites(className: string): Partial<AbilityScores> {
  return MULTICLASSING_PREREQUISITES[className] || {};
}

/**
 * Check if character has sufficient ability scores to meet prerequisites.
 * 
 * @param abilities - Character's current ability scores
 * @param prerequisites - Required ability score minimums
 * @returns True if all prerequisites are met
 */
export function hasAbilityScorePrerequisites(
  abilities: AbilityScores, 
  prerequisites: Partial<AbilityScores>
): boolean {
  const abilityKeys = Object.keys(prerequisites) as (keyof AbilityScores)[];
  
  return abilityKeys.every(ability => {
    const required = prerequisites[ability];
    const current = abilities[ability];
    return required === undefined || current >= required;
  });
}

/**
 * Check if character can multiclass into a specific class.
 * 
 * @param className - Target class to multiclass into
 * @param abilities - Character's current ability scores
 * @returns True if multiclassing is allowed
 */
export function canMulticlassInto(className: string, abilities: AbilityScores): boolean {
  const prerequisites = getMulticlassingPrerequisites(className);
  
  // If no prerequisites exist, multiclassing is allowed
  if (Object.keys(prerequisites).length === 0) {
    return true;
  }
  
  return hasAbilityScorePrerequisites(abilities, prerequisites);
}

/**
 * Format ability score requirements for error messages.
 */
function formatPrerequisites(prerequisites: Partial<AbilityScores>): string {
  const requirements = Object.entries(prerequisites).map(([ability, score]) => {
    const capitalizedAbility = ability.charAt(0).toUpperCase() + ability.slice(1);
    return `${capitalizedAbility} ${score}`;
  });
  
  if (requirements.length === 1) {
    return requirements[0] + ' or higher';
  } else if (requirements.length === 2) {
    return requirements.join(' and ') + ' or higher';
  } else {
    const last = requirements.pop();
    return requirements.join(', ') + `, and ${last} or higher`;
  }
}

/**
 * Comprehensive validation of multiclassing prerequisites for a character.
 * Validates both entering new classes and having sufficient stats for current classes.
 * 
 * @param character - Character data with abilities and classes
 * @returns Validation result with errors if any
 */
export function validateMulticlassingPrerequisites(character: {
  abilities: AbilityScores;
  classes: Array<{ className: string; level: number }>;
}): ValidationResult {
  const errors: string[] = [];
  
  // Single class characters don't need multiclassing prerequisites
  if (character.classes.length <= 1) {
    return { isValid: true, errors: [] };
  }
  
  // Check prerequisites for each class the character has
  for (const classData of character.classes) {
    const prerequisites = getMulticlassingPrerequisites(classData.className);
    
    // Skip classes without prerequisites
    if (Object.keys(prerequisites).length === 0) {
      continue;
    }
    
    if (!hasAbilityScorePrerequisites(character.abilities, prerequisites)) {
      const reqText = formatPrerequisites(prerequisites);
      
      // Different message depending on context
      if (character.classes.length > 1) {
        // For existing multiclass characters, this applies to both staying in and leaving the class
        errors.push(`${classData.className} multiclassing requires ${reqText}`);
        errors.push(`${classData.className} multiclassing requires ${reqText} to leave the class`);
      }
    }
  }
  
  // Remove duplicate errors
  const uniqueErrors = Array.from(new Set(errors));
  
  return {
    isValid: uniqueErrors.length === 0,
    errors: uniqueErrors
  };
}

/**
 * Get a user-friendly description of multiclassing prerequisites for a class.
 * 
 * @param className - The D&D class name
 * @returns Human-readable prerequisite description
 */
export function getPrerequisiteDescription(className: string): string {
  const prerequisites = getMulticlassingPrerequisites(className);
  
  if (Object.keys(prerequisites).length === 0) {
    return 'No multiclassing prerequisites';
  }
  
  const reqText = formatPrerequisites(prerequisites);
  return `Requires ${reqText}`;
}

/**
 * Check if a character meets prerequisites to multiclass out of their current classes.
 * In D&D 5e, you need to meet the prerequisite for your current class to multiclass out of it.
 * 
 * @param currentClasses - Character's current classes
 * @param abilities - Character's ability scores
 * @returns List of classes that don't meet prerequisites for leaving
 */
export function getInvalidCurrentClasses(
  currentClasses: Array<{ className: string; level: number }>,
  abilities: AbilityScores
): string[] {
  const invalidClasses: string[] = [];
  
  for (const classData of currentClasses) {
    const prerequisites = getMulticlassingPrerequisites(classData.className);
    
    if (Object.keys(prerequisites).length > 0 && 
        !hasAbilityScorePrerequisites(abilities, prerequisites)) {
      invalidClasses.push(classData.className);
    }
  }
  
  return invalidClasses;
}

/**
 * Get all classes that a character can multiclass into based on ability scores.
 * 
 * @param abilities - Character's ability scores
 * @returns Array of class names available for multiclassing
 */
export function getAvailableMulticlassOptions(abilities: AbilityScores): string[] {
  return Object.keys(MULTICLASSING_PREREQUISITES).filter(className => 
    canMulticlassInto(className, abilities)
  );
}