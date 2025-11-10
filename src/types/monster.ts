/**
 * Monster and Monster-related type definitions
 * Canonical reference: specs/007-monster-management/data-model.md
 */

export interface Action {
  id: string;
  name: string;
  description: string;
  attackBonus?: number | null;
  damage?: string | null;
}

export interface Abilities {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export type MonsterSize =
  | 'Tiny'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Huge'
  | 'Gargantuan';
export type MonsterScope = 'global' | 'campaign' | 'public';

export interface Monster {
  // Core identity
  id: string;
  name: string;
  cr: number;

  // Physical traits
  size: MonsterSize;
  type: string;
  alignment?: string | null;

  // Combat stats
  hp: number;
  ac: number;
  speed?: string | Record<string, number>;

  // Abilities and derived
  abilities: Abilities;
  savingThrows?: Record<string, number> | null;
  skills?: Record<string, number> | null;
  resistances?: string[];
  immunities?: string[];
  conditionImmunities?: string[];

  // Traits and actions
  senses?: string[];
  languages?: string[];
  tags?: string[];
  actions?: Action[];
  legendaryActions?: Action[];
  lairActions?: Action[];

  // Template and ownership
  templateId?: string | null;
  ownerId: string;
  createdBy: string;
  scope: MonsterScope;
  isPublic: boolean;
  publicAt?: string | null;
  creditedTo?: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface MonsterTemplate {
  templateId: string;
  name: string;
  defaultValues: Partial<Monster>;
  tags?: string[];
  createdBy: string;
  createdAt: string;
}

/** Request/response DTOs for create/update operations */
export interface MonsterCreateInput {
  name: string;
  cr: number;
  size: MonsterSize;
  type: string;
  alignment?: string | null;
  hp: number;
  ac: number;
  speed?: string | Record<string, number>;
  abilities: Abilities;
  savingThrows?: Record<string, number> | null;
  skills?: Record<string, number> | null;
  resistances?: string[];
  immunities?: string[];
  conditionImmunities?: string[];
  senses?: string[];
  languages?: string[];
  tags?: string[];
  actions?: Action[];
  legendaryActions?: Action[];
  lairActions?: Action[];
  scope?: MonsterScope;
  templateId?: string | null;
}

export interface MonsterUpdateInput extends MonsterCreateInput {
  id: string;
}
