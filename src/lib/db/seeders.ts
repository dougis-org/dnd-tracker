type CharacterClassModel =
  (typeof import('@/lib/db/models/CharacterClass'))['CharacterClass'];
type CharacterRaceModel =
  (typeof import('@/lib/db/models/CharacterRace'))['CharacterRace'];

interface RaceSeed {
  name: string;
  abilityBonuses: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  traits: string[];
  description: string;
  source: string;
}

interface ClassSeed {
  name: string;
  hitDie: 'd6' | 'd8' | 'd10' | 'd12';
  proficiencies: {
    armorTypes: string[];
    weaponTypes: string[];
    savingThrows: string[];
  };
  spellcasting: boolean;
  spellAbility?: 'int' | 'wis' | 'cha';
  description: string;
  source: string;
}

const RACE_SEED_DATA: RaceSeed[] = [
  {
    name: 'Human',
    abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    traits: ['Versatile', 'Extra Language'],
    description:
      'Humans are the most adaptable and ambitious people among the common races.',
    source: 'PHB',
  },
  {
    name: 'Elf',
    abilityBonuses: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    traits: ['Darkvision', 'Keen Senses', 'Fey Ancestry', 'Trance'],
    description:
      'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    source: 'PHB',
  },
  {
    name: 'Dwarf',
    abilityBonuses: { str: 0, dex: 0, con: 2, int: 0, wis: 0, cha: 0 },
    traits: ['Darkvision', 'Dwarven Resilience', 'Stonecunning'],
    description:
      'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.',
    source: 'PHB',
  },
  {
    name: 'Halfling',
    abilityBonuses: { str: 0, dex: 2, con: 0, int: 0, wis: 0, cha: 0 },
    traits: ['Lucky', 'Brave', 'Halfling Nimbleness'],
    description:
      'The diminutive halflings survive in a world full of larger creatures by avoiding notice or, barring that, avoiding offense.',
    source: 'PHB',
  },
  {
    name: 'Dragonborn',
    abilityBonuses: { str: 2, dex: 0, con: 0, int: 0, wis: 0, cha: 1 },
    traits: ['Draconic Ancestry', 'Breath Weapon', 'Damage Resistance'],
    description:
      'Dragonborn look very much like dragons standing erect in humanoid form, though they lack wings or a tail.',
    source: 'PHB',
  },
  {
    name: 'Gnome',
    abilityBonuses: { str: 0, dex: 0, con: 0, int: 2, wis: 0, cha: 0 },
    traits: ['Darkvision', 'Gnome Cunning'],
    description:
      'A gnome’s energy and enthusiasm for living shines through every inch of his or her tiny body.',
    source: 'PHB',
  },
  {
    name: 'Half-Elf',
    abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 2 },
    traits: [
      'Darkvision',
      'Fey Ancestry',
      'Skill Versatility',
      'Ability Score Increase (choose two +1)',
    ],
    description:
      'Half-elves combine the best features of their elf and human parents.',
    source: 'PHB',
  },
  {
    name: 'Half-Orc',
    abilityBonuses: { str: 2, dex: 0, con: 1, int: 0, wis: 0, cha: 0 },
    traits: ['Darkvision', 'Relentless Endurance', 'Savage Attacks'],
    description:
      'Half-orcs are not evil by nature, but evil does lurk within them.',
    source: 'PHB',
  },
  {
    name: 'Tiefling',
    abilityBonuses: { str: 0, dex: 0, con: 0, int: 1, wis: 0, cha: 2 },
    traits: ['Darkvision', 'Hellish Resistance', 'Infernal Legacy'],
    description:
      'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.',
    source: 'PHB',
  },
];

const CLASS_SEED_DATA: ClassSeed[] = [
  {
    name: 'Barbarian',
    hitDie: 'd12',
    proficiencies: {
      armorTypes: ['light armor', 'medium armor', 'shields'],
      weaponTypes: ['simple weapons', 'martial weapons'],
      savingThrows: ['str', 'con'],
    },
    spellcasting: false,
    description:
      'A fierce warrior of primitive background who can enter a battle rage.',
    source: 'PHB',
  },
  {
    name: 'Bard',
    hitDie: 'd8',
    proficiencies: {
      armorTypes: ['light armor'],
      weaponTypes: [
        'simple weapons',
        'hand crossbows',
        'longswords',
        'rapiers',
        'shortswords',
      ],
      savingThrows: ['dex', 'cha'],
    },
    spellcasting: true,
    spellAbility: 'cha',
    description:
      'An inspiring magician whose power echoes the music of creation.',
    source: 'PHB',
  },
  {
    name: 'Cleric',
    hitDie: 'd8',
    proficiencies: {
      armorTypes: ['light armor', 'medium armor', 'shields'],
      weaponTypes: ['simple weapons'],
      savingThrows: ['wis', 'cha'],
    },
    spellcasting: true,
    spellAbility: 'wis',
    description:
      'A priestly champion who wields divine magic in service of a higher power.',
    source: 'PHB',
  },
  {
    name: 'Druid',
    hitDie: 'd8',
    proficiencies: {
      armorTypes: ['light armor', 'medium armor', 'shields (nonmetal)'],
      weaponTypes: [
        'clubs',
        'daggers',
        'darts',
        'javelins',
        'maces',
        'quarterstaffs',
        'scimitars',
        'sickles',
        'slings',
        'spears',
      ],
      savingThrows: ['int', 'wis'],
    },
    spellcasting: true,
    spellAbility: 'wis',
    description: 'A priest of the Old Faith, wielding the powers of nature.',
    source: 'PHB',
  },
  {
    name: 'Fighter',
    hitDie: 'd10',
    proficiencies: {
      armorTypes: ['all armor', 'shields'],
      weaponTypes: ['simple weapons', 'martial weapons'],
      savingThrows: ['str', 'con'],
    },
    spellcasting: false,
    description:
      'A master of martial combat, skilled with a variety of weapons and armor.',
    source: 'PHB',
  },
  {
    name: 'Monk',
    hitDie: 'd8',
    proficiencies: {
      armorTypes: [],
      weaponTypes: ['simple weapons', 'shortswords'],
      savingThrows: ['str', 'dex'],
    },
    spellcasting: false,
    description:
      'A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.',
    source: 'PHB',
  },
  {
    name: 'Paladin',
    hitDie: 'd10',
    proficiencies: {
      armorTypes: ['all armor', 'shields'],
      weaponTypes: ['simple weapons', 'martial weapons'],
      savingThrows: ['wis', 'cha'],
    },
    spellcasting: true,
    spellAbility: 'cha',
    description: 'A holy warrior bound to a sacred oath.',
    source: 'PHB',
  },
  {
    name: 'Ranger',
    hitDie: 'd10',
    proficiencies: {
      armorTypes: ['light armor', 'medium armor', 'shields'],
      weaponTypes: ['simple weapons', 'martial weapons'],
      savingThrows: ['str', 'dex'],
    },
    spellcasting: true,
    spellAbility: 'wis',
    description: 'A warrior who combats threats on the edges of civilization.',
    source: 'PHB',
  },
  {
    name: 'Rogue',
    hitDie: 'd8',
    proficiencies: {
      armorTypes: ['light armor'],
      weaponTypes: [
        'simple weapons',
        'hand crossbows',
        'longswords',
        'rapiers',
        'shortswords',
      ],
      savingThrows: ['dex', 'int'],
    },
    spellcasting: false,
    description:
      'A scoundrel who uses stealth and trickery to overcome obstacles and enemies.',
    source: 'PHB',
  },
  {
    name: 'Sorcerer',
    hitDie: 'd6',
    proficiencies: {
      armorTypes: [],
      weaponTypes: [
        'daggers',
        'darts',
        'slings',
        'quarterstaffs',
        'light crossbows',
      ],
      savingThrows: ['con', 'cha'],
    },
    spellcasting: true,
    spellAbility: 'cha',
    description:
      'A spellcaster who draws on inherent magic from a gift or bloodline.',
    source: 'PHB',
  },
  {
    name: 'Warlock',
    hitDie: 'd8',
    proficiencies: {
      armorTypes: ['light armor'],
      weaponTypes: ['simple weapons'],
      savingThrows: ['wis', 'cha'],
    },
    spellcasting: true,
    spellAbility: 'cha',
    description:
      'A wielder of magic derived from a bargain with an extraplanar entity.',
    source: 'PHB',
  },
  {
    name: 'Wizard',
    hitDie: 'd6',
    proficiencies: {
      armorTypes: [],
      weaponTypes: [
        'daggers',
        'darts',
        'slings',
        'quarterstaffs',
        'light crossbows',
      ],
      savingThrows: ['int', 'wis'],
    },
    spellcasting: true,
    spellAbility: 'int',
    description:
      'A scholarly magic-user capable of manipulating the structures of reality.',
    source: 'PHB',
  },
];

async function resolveCharacterRace(): Promise<CharacterRaceModel> {
  const raceModule = await import('@/lib/db/models/CharacterRace');
  return raceModule.CharacterRace;
}

async function resolveCharacterClass(): Promise<CharacterClassModel> {
  const classModule = await import('@/lib/db/models/CharacterClass');
  return classModule.CharacterClass;
}

async function upsertRace(
  raceModel: CharacterRaceModel,
  race: RaceSeed
): Promise<void> {
  await raceModel.collection.updateOne(
    { name: race.name },
    { $set: race },
    { upsert: true }
  );
}

async function upsertClass(
  classModel: CharacterClassModel,
  characterClass: ClassSeed
): Promise<void> {
  await classModel.collection.updateOne(
    { name: characterClass.name },
    { $set: characterClass },
    { upsert: true }
  );
}

export async function seedSystemEntities(): Promise<void> {
  const [characterRaceModel, characterClassModel] = await Promise.all([
    resolveCharacterRace(),
    resolveCharacterClass(),
  ]);

  for (const race of RACE_SEED_DATA) {
    await upsertRace(characterRaceModel, race);
  }

  for (const characterClass of CLASS_SEED_DATA) {
    await upsertClass(characterClassModel, characterClass);
  }
}
