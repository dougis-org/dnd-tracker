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

export function validateMemberForm(data: {
  characterName: string;
  class: string;
  race: string;
  level: number;
  ac: number;
  hp: number;
}): MemberFormErrors {
  const errors: MemberFormErrors = {};

  if (!data.characterName.trim()) {
    errors.characterName = 'Character name is required';
  }

  if (!data.class) {
    errors.class = 'Class is required';
  }

  if (!data.race) {
    errors.race = 'Race is required';
  }

  if (data.level < 1 || data.level > 20) {
    errors.level = 'Level must be between 1 and 20';
  }

  if (data.ac < 1 || data.ac > 30) {
    errors.ac = 'AC must be between 1 and 30';
  }

  if (data.hp <= 0) {
    errors.hp = 'HP must be greater than 0';
  }

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
