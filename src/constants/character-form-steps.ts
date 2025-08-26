/**
 * Character Form Step Constants
 * Centralized step labels for consistency between UI and tests
 */

export const CHARACTER_FORM_STEPS = {
  BASIC_INFO: {
    title: 'Character Information',
    description: 'Basic character details'
  },
  ABILITY_SCORES: {
    title: 'Ability Scores',
    description: 'Set your character\'s abilities'
  },
  SKILLS_PROFICIENCIES: {
    title: 'Skills & Proficiencies',
    description: 'Choose skills and proficiencies'
  },
  SPELLCASTING: {
    title: 'Spellcasting',
    description: 'Configure spells and magic'
  },
  EQUIPMENT_FEATURES: {
    title: 'Equipment & Features',
    description: 'Add equipment and features'
  },
  REVIEW_COMPLETE: {
    title: 'Review & Complete',
    description: 'Review and finalize your character'
  }
} as const;

// Export step count for easy reference
export const TOTAL_STEPS = Object.keys(CHARACTER_FORM_STEPS).length;