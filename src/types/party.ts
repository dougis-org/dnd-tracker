/**
 * Party Management Types
 * Defines TypeScript interfaces for Party, PartyMember, and related enums
 * Used throughout the party management feature (F006+)
 */

/**
 * D&D 5e Character Classes
 */
export type DnDClass =
  | 'Barbarian'
  | 'Bard'
  | 'Cleric'
  | 'Druid'
  | 'Fighter'
  | 'Monk'
  | 'Paladin'
  | 'Ranger'
  | 'Rogue'
  | 'Sorcerer'
  | 'Warlock'
  | 'Wizard';

/**
 * D&D 5e Character Races
 */
export type DnDRace =
  | 'Human'
  | 'Elf'
  | 'Dwarf'
  | 'Halfling'
  | 'Dragonborn'
  | 'Gnome'
  | 'Half-Elf'
  | 'Half-Orc'
  | 'Tiefling';

/**
 * Party Member Role Classification
 */
export type PartyRole = 'Tank' | 'Healer' | 'DPS' | 'Support';

/**
 * Individual party member within a party
 */
export interface PartyMember {
  id: string;
  partyId: string;
  characterName: string;
  class: DnDClass;
  race: DnDRace;
  level: number;
  ac: number;
  hp: number;
  role?: PartyRole;
  position: number;
}

/**
 * Party - group of adventurers
 */
export interface Party {
  id: string;
  name: string;
  description?: string;
  campaignSetting?: string;
  members: PartyMember[];
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * Computed party statistics (not persisted)
 */
export interface PartyStats {
  memberCount: number;
  averageLevel: number;
  levelRange: string;
  roleComposition: RoleComposition;
  partyTier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

/**
 * Role distribution breakdown
 */
export interface RoleComposition {
  tanks: number;
  healers: number;
  dps: number;
  support: number;
  unassigned: number;
}
