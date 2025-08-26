/**
 * D&D 5e game data constants
 * This file contains all the static D&D game data used throughout the character creation forms
 */

// Equipment categories
export const EQUIPMENT_CATEGORIES = [
  'Weapon',
  'Armor',
  'Shield',
  'Ammunition',
  'Adventuring Gear',
  'Tool',
  'Mount',
  'Vehicle',
  'Treasure',
  'Magic Item'
] as const;

// Starting equipment by class
export const CLASS_STARTING_EQUIPMENT: Record<string, string[]> = {
  'Artificer': ['Light crossbow and 20 bolts', 'Scale mail or leather armor', 'Shield', 'Thieves\' tools', 'Dungeoneer\'s pack'],
  'Barbarian': ['Greataxe or any martial melee weapon', 'Two handaxes or any simple weapon', 'Explorer\'s pack', 'Four javelins'],
  'Bard': ['Rapier or longsword or any simple weapon', 'Diplomat\'s pack or entertainer\'s pack', 'Lute or any other musical instrument', 'Leather armor', 'Dagger'],
  'Cleric': ['Mace or warhammer', 'Scale mail or leather armor or chain mail', 'Shield', 'Light crossbow and 20 bolts or any simple weapon', 'Priest\'s pack or explorer\'s pack'],
  'Druid': ['Shield or any simple weapon', 'Scimitar or any simple melee weapon', 'Leather armor', 'Explorer\'s pack', 'Druidcraft focus'],
  'Fighter': ['Chain mail or leather armor', 'Shield', 'Martial weapon and shield or two martial weapons', 'Light crossbow and 20 bolts or two handaxes', 'Dungeoneer\'s pack or explorer\'s pack'],
  'Monk': ['Shortsword or any simple weapon', 'Dungeoneer\'s pack or explorer\'s pack', '10 darts'],
  'Paladin': ['Chain mail', 'Shield', 'Martial weapon', 'Five javelins or any simple melee weapon', 'Priest\'s pack or explorer\'s pack'],
  'Ranger': ['Scale mail or leather armor', 'Shield', 'Shortsword or any simple melee weapon', 'Longbow and quiver with 20 arrows', 'Dungeoneer\'s pack or explorer\'s pack'],
  'Rogue': ['Rapier or shortsword', 'Shortbow and quiver with 20 arrows', 'Burglar\'s pack or dungeoneer\'s pack or explorer\'s pack', 'Leather armor', 'Two daggers', 'Thieves\' tools'],
  'Sorcerer': ['Light crossbow and 20 bolts or any simple weapon', 'Component pouch or arcane focus', 'Dungeoneer\'s pack or explorer\'s pack', 'Two daggers'],
  'Warlock': ['Light armor', 'Simple weapon', 'Two daggers', 'Simple weapon', 'Dungeoneer\'s pack or scholar\'s pack'],
  'Wizard': ['Quarterstaff or dagger', 'Component pouch or arcane focus', 'Scholar\'s pack or explorer\'s pack', 'Spellbook', 'Two daggers']
};

// Starting equipment by background
export const BACKGROUND_STARTING_EQUIPMENT: Record<string, string[]> = {
  'Acolyte': ['Holy symbol', 'Prayer book', 'Incense (5 sticks)', 'Vestments', 'Common clothes', 'Pouch (15 gp)'],
  'Criminal': ['Crowbar', 'Dark common clothes with hood', 'Pouch (15 gp)'],
  'Folk Hero': ['Smith\'s tools', 'Brewer\'s supplies or Mason\'s tools', 'Shovel', 'Iron pot', 'Common clothes', 'Pouch (10 gp)'],
  'Noble': ['Signet ring', 'Scroll of pedigree', 'Fine clothes', 'Pouch (25 gp)'],
  'Sage': ['Bottle of black ink', 'Quill', 'Small knife', 'Scroll case with spiritual writings', 'Common clothes', 'Pouch (10 gp)'],
  'Soldier': ['Insignia of rank', 'Trophy from fallen enemy', 'Deck of cards', 'Common clothes', 'Pouch (10 gp)'],
  'Charlatan': ['Disguise kit', 'Forgery kit', 'Signet ring (fake)', 'Fine clothes', 'Pouch (15 gp)'],
  'Entertainer': ['Musical instrument', 'Disguise kit', 'Costume clothes', 'Pouch (15 gp)'],
  'Guild Artisan': ['Artisan\'s tools', 'Letter of introduction from guild', 'Traveler\'s clothes', 'Pouch (15 gp)'],
  'Hermit': ['Herbalism kit', 'Scroll case with spiritual writings', 'Winter blanket', 'Common clothes', 'Pouch (5 gp)'],
  'Outlander': ['Staff', 'Hunting trap', 'Traveler\'s clothes', 'Pouch (10 gp)'],
  'Sailor': ['Navigator\'s tools', '50 feet of silk rope', 'Lucky charm', 'Common clothes', 'Pouch (10 gp)']
};

// Import DND_ABILITIES and DND_SKILLS from character validation
import { DND_ABILITIES, DND_SKILLS } from '@/lib/validations/character';

// Skill to ability mapping
export const SKILL_ABILITIES: Record<string, (typeof DND_ABILITIES)[number]> = {
  'Acrobatics': 'dexterity',
  'Animal Handling': 'wisdom',
  'Arcana': 'intelligence',
  'Athletics': 'strength',
  'Deception': 'charisma',
  'History': 'intelligence',
  'Insight': 'wisdom',
  'Intimidation': 'charisma',
  'Investigation': 'intelligence',
  'Medicine': 'wisdom',
  'Nature': 'intelligence',
  'Perception': 'wisdom',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
  'Religion': 'intelligence',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Survival': 'wisdom'
};

// Class skill proficiencies and limits
export const CLASS_SKILLS: Record<string, { available: string[]; count: number }> = {
  'Artificer': { available: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'], count: 2 },
  'Barbarian': { available: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'], count: 2 },
  'Bard': { available: DND_SKILLS.slice(), count: 3 }, // All skills
  'Cleric': { available: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'], count: 2 },
  'Druid': { available: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'], count: 2 },
  'Fighter': { available: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'], count: 2 },
  'Monk': { available: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'], count: 2 },
  'Paladin': { available: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'], count: 2 },
  'Ranger': { available: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'], count: 3 },
  'Rogue': { available: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'], count: 4 },
  'Sorcerer': { available: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'], count: 2 },
  'Warlock': { available: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'], count: 2 },
  'Wizard': { available: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'], count: 2 }
};

// Background skill suggestions
export const BACKGROUND_SKILLS: Record<string, string[]> = {
  'Acolyte': ['Insight', 'Religion'],
  'Criminal': ['Deception', 'Stealth'],
  'Folk Hero': ['Animal Handling', 'Survival'],
  'Noble': ['History', 'Persuasion'],
  'Sage': ['Arcana', 'History'],
  'Soldier': ['Athletics', 'Intimidation'],
  'Charlatan': ['Deception', 'Sleight of Hand'],
  'Entertainer': ['Acrobatics', 'Performance'],
  'Guild Artisan': ['Insight', 'Persuasion'],
  'Hermit': ['Medicine', 'Religion'],
  'Outlander': ['Athletics', 'Survival'],
  'Sailor': ['Athletics', 'Perception']
};

// Class saving throw proficiencies
export const CLASS_SAVING_THROWS: Record<string, Array<(typeof DND_ABILITIES)[number]>> = {
  'Artificer': ['constitution', 'intelligence'],
  'Barbarian': ['strength', 'constitution'],
  'Bard': ['dexterity', 'charisma'],
  'Cleric': ['wisdom', 'charisma'],
  'Druid': ['intelligence', 'wisdom'],
  'Fighter': ['strength', 'constitution'],
  'Monk': ['strength', 'dexterity'],
  'Paladin': ['wisdom', 'charisma'],
  'Ranger': ['strength', 'dexterity'],
  'Rogue': ['dexterity', 'intelligence'],
  'Sorcerer': ['constitution', 'charisma'],
  'Warlock': ['wisdom', 'charisma'],
  'Wizard': ['intelligence', 'wisdom']
};