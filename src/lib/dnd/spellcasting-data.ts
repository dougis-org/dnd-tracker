// Spellcasting classes and their primary ability
export const SPELLCASTING_CLASSES = {
  'Artificer': { primary: 'intelligence' as const, type: 'prepared' as const, description: 'Prepare INT modifier + half level spells' },
  'Bard': { primary: 'charisma' as const, type: 'known' as const, description: 'Learn spells from the bard spell list' },
  'Cleric': { primary: 'wisdom' as const, type: 'prepared' as const, description: 'Prepare WIS modifier + level spells' },
  'Druid': { primary: 'wisdom' as const, type: 'prepared' as const, description: 'Prepare WIS modifier + level spells' },
  'Paladin': { primary: 'charisma' as const, type: 'prepared' as const, description: 'Prepare CHA modifier + half level spells (min 1)' },
  'Ranger': { primary: 'wisdom' as const, type: 'known' as const, description: 'Learn spells from the ranger spell list' },
  'Sorcerer': { primary: 'charisma' as const, type: 'known' as const, description: 'Learn spells from the sorcerer spell list' },
  'Warlock': { primary: 'charisma' as const, type: 'known' as const, description: 'Learn spells; regain on short rest' },
  'Wizard': { primary: 'intelligence' as const, type: 'prepared' as const, description: 'Prepare INT modifier + level spells from spellbook' }
} as const;

// Spell slots by class level (Full Caster progression)
export const FULL_CASTER_SPELL_SLOTS: Record<number, Record<string, number>> = {
  1: { '1st': 2 },
  2: { '1st': 3 },
  3: { '1st': 4, '2nd': 2 },
  4: { '1st': 4, '2nd': 3 },
  5: { '1st': 4, '2nd': 3, '3rd': 2 },
  6: { '1st': 4, '2nd': 3, '3rd': 3 },
  7: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 1 },
  8: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 2 },
  9: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 1 },
  10: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2 },
  11: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1 },
  12: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1 },
  13: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1 },
  14: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1 },
  15: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1, '8th': 1 },
  16: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1, '8th': 1 },
  17: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 2, '6th': 1, '7th': 1, '8th': 1, '9th': 1 },
  18: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 3, '6th': 1, '7th': 1, '8th': 1, '9th': 1 },
  19: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 3, '6th': 2, '7th': 1, '8th': 1, '9th': 1 },
  20: { '1st': 4, '2nd': 3, '3rd': 3, '4th': 3, '5th': 3, '6th': 2, '7th': 2, '8th': 1, '9th': 1 }
};

// Half caster classes (Paladin, Ranger)
export const HALF_CASTER_CLASSES = ['Paladin', 'Ranger'];

export function isSpellcaster(className: string): boolean {
  return className in SPELLCASTING_CLASSES;
}

export function getSpellcastingInfo(className: string) {
  return SPELLCASTING_CLASSES[className as keyof typeof SPELLCASTING_CLASSES];
}

export function calculateSpellSlots(classes: Array<{ className: string; level: number }>) {
  if (!classes.length) return {};

  const primaryClass = classes[0];
  if (!isSpellcaster(primaryClass.className)) return {};

  // Calculate effective caster level
  const effectiveLevel = HALF_CASTER_CLASSES.includes(primaryClass.className) 
    ? Math.ceil(primaryClass.level / 2)
    : primaryClass.level;

  return FULL_CASTER_SPELL_SLOTS[effectiveLevel] || {};
}