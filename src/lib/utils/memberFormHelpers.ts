/**
 * Member Form Validation Utilities
 * Extracted to reduce component complexity
 */

import { PartyMember } from '@/types/party';

export interface MemberFormErrors {
  characterName?: string;
  class?: string;
  race?: string;
  level?: string;
  ac?: string;
  hp?: string;
}

interface FormData {
  characterName: string;
  class: string;
  race: string;
  level: number;
  ac: number;
  hp: number;
}

/**
 * Validate character name field
 */
function validateCharacterName(name: string): string | undefined {
  return !name.trim() ? 'Character name is required' : undefined;
}

/**
 * Validate class field
 */
function validateClass(cls: string): string | undefined {
  return !cls ? 'Class is required' : undefined;
}

/**
 * Validate race field
 */
function validateRace(race: string): string | undefined {
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

export function createDefaultFormData(member?: PartyMember) {
  return {
    characterName: member?.characterName || '',
    class: member?.class || '',
    race: member?.race || '',
    level: member?.level || 1,
    ac: member?.ac || 10,
    hp: member?.hp || 8,
    role: member?.role,
  };
}
