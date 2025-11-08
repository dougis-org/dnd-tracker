import { PartialCharacter, Character } from '../../../types/character';

export const DEFAULT_ABILITIES = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

function extractHitPoints(initial: PartialCharacter | Character): number {
  if (typeof initial.hitPoints === 'number') {
    return initial.hitPoints;
  }
  return initial.hitPoints?.current ?? 1;
}

export function getInitialState(initial: PartialCharacter | Character | null | undefined) {
  if (!initial) {
    return {
      name: '',
      className: '',
      race: '',
      level: 1,
      hp: 1,
      ac: 10,
    };
  }

  return {
    name: initial.name ?? '',
    className: initial.className ?? '',
    race: initial.race ?? '',
    level: initial.level ?? 1,
    hp: extractHitPoints(initial),
    ac: initial.armorClass ?? 10,
  };
}

function parseIntSafe(value: string | number, fallback: number): number {
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getAbilitiesFromInitial(
  initial: PartialCharacter | Character | null | undefined
): typeof DEFAULT_ABILITIES {
  return (initial && 'abilities' in initial && initial.abilities)
    ? initial.abilities
    : DEFAULT_ABILITIES;
}

function getEquipmentFromInitial(
  initial: PartialCharacter | Character | null | undefined
): string[] {
  if (!initial || !('equipment' in initial)) return [];
  return Array.isArray(initial.equipment) ? initial.equipment : [];
}

function getNotesFromInitial(
  initial: PartialCharacter | Character | null | undefined
): string {
  return (initial && 'notes' in initial && typeof initial.notes === 'string')
    ? initial.notes
    : '';
}

export function buildPartialCharacter(
  name: string,
  className: string,
  race: string,
  level: number,
  hp: number,
  ac: number,
  initial?: PartialCharacter | Character | null
): PartialCharacter {
  return {
    name: name.trim(),
    className: className.trim() || 'Commoner',
    race: race.trim() || 'Human',
    level: parseIntSafe(level, 1),
    hitPoints: { 
      current: parseIntSafe(hp, 1), 
      max: parseIntSafe(hp, 1) 
    },
    armorClass: parseIntSafe(ac, 10),
    abilities: getAbilitiesFromInitial(initial),
    equipment: getEquipmentFromInitial(initial),
    notes: getNotesFromInitial(initial),
  };
}

export function isEditMode(initial: PartialCharacter | Character | null | undefined): initial is Character {
  return !!(initial && 'id' in initial && typeof initial.id === 'string');
}
