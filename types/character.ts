export type Character = {
  id: string;
  name: string;
  className: string; // canonical field name (maps from spec's "class")
  race: string;
  level: number;
  hitPoints: { current: number; max: number };
  armorClass: number;
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  equipment?: string[];
  notes?: string;
};

export type PartialCharacter = Partial<Character> & { id?: string };
