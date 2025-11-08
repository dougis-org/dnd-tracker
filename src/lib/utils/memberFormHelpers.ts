/**
 * Member Form Validation Utilities
 * Extracted to reduce component complexity
 */

import { PartyMember, PartyRole, DnDClass, DnDRace } from '@/types/party';

export interface MemberFormErrors {
  characterName?: string;
  class?: string;
  race?: string;
  level?: string;
  ac?: string;
  hp?: string;
}

export interface FormData {
  characterName: string;
  class: DnDClass;
  race: DnDRace;
  level: number;
  ac: number;
  hp: number;
  role?: PartyRole;
}

// Default values for form fields
const DEFAULTS = {
  CHARACTER_NAME: '',
  CLASS: 'Fighter' as DnDClass,
  RACE: 'Human' as DnDRace,
  LEVEL: 1,
  AC: 10,
  HP: 10, // Consistent default HP value
};

/**
 * Validate character name field
 */
function validateCharacterName(name: string): string | undefined {
  return !name.trim() ? 'Character name is required' : undefined;
}

/**
 * Validate class field
 */
function validateClass(cls: DnDClass): string | undefined {
  return !cls ? 'Class is required' : undefined;
}

/**
 * Validate race field
 */
function validateRace(race: DnDRace): string | undefined {
  return !race ? 'Race is required' : undefined;
}

/**
 * Validate level field
 */
function validateLevel(level: number): string | undefined {
  return level < 1 || level > 20 ? 'Level must be between 1 and 20' : undefined;
}

/**
 * Validate AC field
 */
function validateAC(ac: number): string | undefined {
  return ac < 1 || ac > 30 ? 'AC must be between 1 and 30' : undefined;
}

/**
 * Validate HP field
 */
function validateHP(hp: number): string | undefined {
  return hp <= 0 ? 'HP must be greater than 0' : undefined;
}

export function validateMemberForm(data: FormData): MemberFormErrors {
  const errors: MemberFormErrors = {};

  const charNameError = validateCharacterName(data.characterName);
  if (charNameError) errors.characterName = charNameError;

  const classError = validateClass(data.class);
  if (classError) errors.class = classError;

  const raceError = validateRace(data.race);
  if (raceError) errors.race = raceError;

  const levelError = validateLevel(data.level);
  if (levelError) errors.level = levelError;

  const acError = validateAC(data.ac);
  if (acError) errors.ac = acError;

  const hpError = validateHP(data.hp);
  if (hpError) errors.hp = hpError;

  return errors;
}

export function hasErrors(errors: MemberFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function createDefaultFormData(member?: PartyMember): FormData {
  return {
    characterName: member?.characterName || DEFAULTS.CHARACTER_NAME,
    class: member?.class || DEFAULTS.CLASS,
    race: member?.race || DEFAULTS.RACE,
    level: member?.level || DEFAULTS.LEVEL,
    ac: member?.ac || DEFAULTS.AC,
    hp: member?.hp || DEFAULTS.HP,
    role: member?.role,
  };
}

/**
 * Convert form data to PartyMember object
 * @param data Form data from member form
 * @param partyId Party ID for the member
 * @returns PartyMember object ready for database
 */
export function formDataToPartyMember(
  data: FormData,
  partyId: string
): Omit<PartyMember, 'id' | 'createdAt' | 'updatedAt' | 'position'> {
  return {
    partyId,
    characterName: data.characterName.trim(),
    class: data.class,
    race: data.race,
    level: Math.max(1, Math.min(20, data.level)),
    ac: Math.max(1, Math.min(30, data.ac)),
    hp: Math.max(1, data.hp),
    role: data.role,
  };
}
