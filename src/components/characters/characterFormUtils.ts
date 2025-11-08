import { PartialCharacter, Character } from '../../../types/character';

export const DEFAULT_ABILITIES = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

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

  const hp = typeof initial.hitPoints === 'number'
    ? initial.hitPoints
    : initial.hitPoints?.current ?? 1;

  return {
    name: initial.name ?? '',
    className: initial.className ?? '',
    race: initial.race ?? '',
    level: initial.level ?? 1,
    hp,
    ac: initial.armorClass ?? 10,
  };
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
    level: parseInt(String(level), 10) || 1,
    hitPoints: { current: parseInt(String(hp), 10) || 1, max: parseInt(String(hp), 10) || 1 },
    armorClass: parseInt(String(ac), 10) || 10,
    abilities: (initial && 'abilities' in initial && initial.abilities) ? initial.abilities : DEFAULT_ABILITIES,
    equipment: (initial && 'equipment' in initial && initial.equipment) ? initial.equipment : [],
    notes: (initial && 'notes' in initial && initial.notes) ? initial.notes : '',
  };
}

export function isEditMode(initial: PartialCharacter | Character | null | undefined): initial is Character {
  return !!(initial && 'id' in initial && typeof initial.id === 'string');
}
