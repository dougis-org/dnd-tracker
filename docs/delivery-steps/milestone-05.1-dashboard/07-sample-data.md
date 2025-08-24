# Step 07: Sample Data & Content

## Overview

Create comprehensive sample data and content management system to showcase features for non-authenticated users and provide realistic examples in demos.

## Objectives

- [ ] Generate realistic D&D sample data for demos
- [ ] Create sample party "The Crimson Blades" with detailed characters
- [ ] Build sample encounters with tactical information
- [ ] Implement data providers for demo components
- [ ] Ensure sample data is engaging and educational

## Technical Requirements

### 1. Sample Data Providers

**File:** `src/lib/sample-data/characters.ts`
- Pre-defined character data with realistic stats
- Multiple character classes and races
- Proper D&D 5e character progression
- Sample equipment and abilities

**File:** `src/lib/sample-data/encounters.ts`
- Balanced encounter designs
- Multiple difficulty levels
- Environmental descriptions
- Tactical positioning suggestions

**File:** `src/lib/sample-data/creatures.ts`
- Monster stat blocks with lair actions
- Organized by challenge rating
- Environmental themes
- Special abilities descriptions

### 2. Data Management Utilities

**File:** `src/lib/sample-data/index.ts`
- Centralized data export
- Data validation schemas
- Random data generation utilities
- Demo state management

## Implementation Details

### Sample Characters Data

```typescript
// src/lib/sample-data/characters.ts
export interface SampleCharacter {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  armorClass: number;
  hitPoints: { max: number; current: number };
  dexterity: number;
  initiativeModifier: number;
  background?: string;
  equipment?: string[];
  abilities?: string[];
}

export const crimsonBlades: SampleCharacter[] = [
  {
    id: 'kael-brightblade',
    name: 'Kael Brightblade',
    race: 'Human',
    class: 'Paladin',
    level: 5,
    armorClass: 18,
    hitPoints: { max: 45, current: 45 },
    dexterity: 12,
    initiativeModifier: 1,
    background: 'Noble',
    equipment: [
      'Plate Armor',
      'Longsword +1',
      'Shield',
      'Holy Symbol'
    ],
    abilities: [
      'Divine Smite',
      'Lay on Hands',
      'Divine Sense',
      'Protection Fighting Style'
    ]
  },
  {
    id: 'whisper-shadowstep',
    name: 'Whisper Shadowstep',
    race: 'Halfling',
    class: 'Rogue',
    level: 4,
    armorClass: 15,
    hitPoints: { max: 28, current: 28 },
    dexterity: 18,
    initiativeModifier: 4,
    background: 'Criminal',
    equipment: [
      'Studded Leather Armor',
      'Shortsword',
      'Shortbow',
      'Thieves\' Tools'
    ],
    abilities: [
      'Sneak Attack (2d6)',
      'Cunning Action',
      'Thieves\' Cant',
      'Lucky (Halfling)'
    ]
  },
  {
    id: 'eldara-moonweaver',
    name: 'Eldara Moonweaver',
    race: 'Elf',
    class: 'Wizard',
    level: 5,
    armorClass: 13,
    hitPoints: { max: 32, current: 28 },
    dexterity: 16,
    initiativeModifier: 3,
    background: 'Sage',
    equipment: [
      'Robes of the Archmagi',
      'Quarterstaff',
      'Spellbook',
      'Component Pouch'
    ],
    abilities: [
      'Spellcasting (3rd level)',
      'Arcane Recovery',
      'School of Evocation',
      'Fey Ancestry'
    ]
  },
  {
    id: 'thorek-ironbeard',
    name: 'Thorek Ironbeard',
    race: 'Dwarf',
    class: 'Cleric',
    level: 4,
    armorClass: 16,
    hitPoints: { max: 35, current: 35 },
    dexterity: 10,
    initiativeModifier: 0,
    background: 'Acolyte',
    equipment: [
      'Chain Mail',
      'Warhammer',
      'Shield',
      'Holy Symbol'
    ],
    abilities: [
      'Spellcasting (2nd level)',
      'Channel Divinity',
      'Domain: Life',
      'Dwarven Resilience'
    ]
  }
];

export const samplePlayerCharacters = [...crimsonBlades];

export const getRandomCharacter = (): SampleCharacter => {
  return crimsonBlades[Math.floor(Math.random() * crimsonBlades.length)];
};
```

### Sample Encounters Data

```typescript
// src/lib/sample-data/encounters.ts
export interface SampleEncounter {
  id: string;
  name: string;
  description: string;
  environment: string;
  challengeRating: string;
  creatures: Array<{
    name: string;
    count: number;
    armorClass: number;
    hitPoints: { max: number; current: number };
    initiativeModifier: number;
    challengeRating: string;
  }>;
  tacticalNotes: string[];
  lairActions?: {
    description: string;
    actions: string[];
  };
}

export const goblinAmbush: SampleEncounter = {
  id: 'goblin-ambush',
  name: 'Goblin Ambush',
  description: 'A band of goblins attacks the party from the undergrowth along a forest path.',
  environment: 'Forest Road',
  challengeRating: '2 (450 XP)',
  creatures: [
    {
      name: 'Goblin Warrior',
      count: 2,
      armorClass: 15,
      hitPoints: { max: 7, current: 7 },
      initiativeModifier: 2,
      challengeRating: '1/4'
    },
    {
      name: 'Goblin Boss',
      count: 1,
      armorClass: 17,
      hitPoints: { max: 21, current: 21 },
      initiativeModifier: 2,
      challengeRating: '1'
    }
  ],
  tacticalNotes: [
    'Goblins start hidden with advantage on stealth',
    'Boss directs minions to flank the party',
    'Use difficult terrain from undergrowth',
    'Retreat if reduced to 1/4 health'
  ]
};

export const dragonLair: SampleEncounter = {
  id: 'ancient-red-dragon',
  name: 'Ancient Red Dragon\'s Lair',
  description: 'The party faces an ancient red dragon in its volcanic lair, surrounded by lava flows and unstable terrain.',
  environment: 'Volcanic Cavern',
  challengeRating: '24 (62,000 XP)',
  creatures: [
    {
      name: 'Ancient Red Dragon',
      count: 1,
      armorClass: 22,
      hitPoints: { max: 546, current: 546 },
      initiativeModifier: 0,
      challengeRating: '24'
    }
  ],
  tacticalNotes: [
    'Dragon uses breath weapon on grouped enemies',
    'Legendary actions for movement and tail attacks',
    'Flies to avoid melee combat',
    'Uses lair actions to control battlefield'
  ],
  lairActions: {
    description: 'On initiative count 20, the dragon takes a lair action to cause one of the following effects:',
    actions: [
      'Magma erupts from a point within 120 feet. Each creature within 20 feet must make a DC 15 Dexterity saving throw, taking 21 (6d6) fire damage on failure.',
      'A tremor shakes the lair. Each creature on the ground within 60 feet must succeed on a DC 15 Dexterity saving throw or be knocked prone.',
      'Volcanic gases fill a 20-foot radius sphere within 120 feet. The area becomes heavily obscured until initiative count 20 on the next round.'
    ]
  }
};

export const sampleEncounters = [goblinAmbush, dragonLair];

export const getEncounterByDifficulty = (difficulty: 'easy' | 'medium' | 'hard' | 'deadly') => {
  switch (difficulty) {
    case 'easy':
    case 'medium':
      return goblinAmbush;
    case 'hard':
    case 'deadly':
      return dragonLair;
    default:
      return goblinAmbush;
  }
};
```

### Sample Creatures Data

```typescript
// src/lib/sample-data/creatures.ts
export interface SampleCreature {
  id: string;
  name: string;
  type: string;
  challengeRating: string;
  armorClass: number;
  hitPoints: { max: number; current: number };
  speed: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  senses?: string[];
  languages?: string[];
  specialAbilities?: Array<{
    name: string;
    description: string;
  }>;
  actions?: Array<{
    name: string;
    description: string;
  }>;
  legendaryActions?: Array<{
    name: string;
    cost: number;
    description: string;
  }>;
  lairActions?: Array<{
    name: string;
    description: string;
  }>;
}

export const ancientRedDragon: SampleCreature = {
  id: 'ancient-red-dragon',
  name: 'Ancient Red Dragon',
  type: 'Dragon',
  challengeRating: '24',
  armorClass: 22,
  hitPoints: { max: 546, current: 546 },
  speed: '40 ft., climb 40 ft., fly 80 ft.',
  abilities: {
    strength: 30,
    dexterity: 10,
    constitution: 29,
    intelligence: 18,
    wisdom: 15,
    charisma: 23
  },
  skills: ['Perception +16', 'Stealth +7'],
  damageImmunities: ['Fire'],
  senses: ['Blindsight 60 ft.', 'Darkvision 120 ft.', 'Passive Perception 26'],
  languages: ['Common', 'Draconic'],
  specialAbilities: [
    {
      name: 'Legendary Resistance',
      description: 'If the dragon fails a saving throw, it can choose to succeed instead (3/Day).'
    },
    {
      name: 'Fire Aura',
      description: 'At the start of each of the dragon\'s turns, each creature within 5 feet takes 7 (2d6) fire damage.'
    }
  ],
  actions: [
    {
      name: 'Multiattack',
      description: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
    },
    {
      name: 'Bite',
      description: 'Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage.'
    },
    {
      name: 'Fire Breath (Recharge 5-6)',
      description: 'The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 91 (26d6) fire damage on a failed save, or half as much damage on a successful one.'
    }
  ],
  legendaryActions: [
    {
      name: 'Detect',
      cost: 1,
      description: 'The dragon makes a Wisdom (Perception) check.'
    },
    {
      name: 'Tail Attack',
      cost: 1,
      description: 'The dragon makes a tail attack.'
    },
    {
      name: 'Wing Attack',
      cost: 2,
      description: 'The dragon beats its wings. Each creature within 15 feet must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone.'
    }
  ],
  lairActions: [
    {
      name: 'Magma Eruption',
      description: 'Magma erupts from a point on the ground within 120 feet. Each creature within 20 feet must make a DC 15 Dexterity saving throw, taking 21 (6d6) fire damage on failure.'
    },
    {
      name: 'Tremor',
      description: 'A tremor shakes the lair in a 60-foot radius. Each creature on the ground must succeed on a DC 15 Dexterity saving throw or be knocked prone.'
    },
    {
      name: 'Volcanic Gas',
      description: 'Volcanic gases create a 20-foot radius sphere of heavy obscurement within 120 feet. The area clears on initiative count 20 of the next round.'
    }
  ]
};

export const goblinWarrior: SampleCreature = {
  id: 'goblin-warrior',
  name: 'Goblin',
  type: 'Humanoid',
  challengeRating: '1/4',
  armorClass: 15,
  hitPoints: { max: 7, current: 7 },
  speed: '30 ft.',
  abilities: {
    strength: 8,
    dexterity: 14,
    constitution: 10,
    intelligence: 10,
    wisdom: 8,
    charisma: 8
  },
  skills: ['Stealth +6'],
  senses: ['Darkvision 60 ft.', 'Passive Perception 9'],
  languages: ['Common', 'Goblin'],
  specialAbilities: [
    {
      name: 'Nimble Escape',
      description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.'
    }
  ],
  actions: [
    {
      name: 'Scimitar',
      description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.'
    },
    {
      name: 'Shortbow',
      description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
    }
  ]
};

export const sampleCreatures = [ancientRedDragon, goblinWarrior];

export const getCreaturesByCR = (challengeRating: string) => {
  return sampleCreatures.filter(creature => creature.challengeRating === challengeRating);
};
```

### Demo Data Provider

```typescript
// src/lib/sample-data/index.ts
import { crimsonBlades, samplePlayerCharacters } from './characters';
import { sampleEncounters, goblinAmbush, dragonLair } from './encounters';
import { sampleCreatures, ancientRedDragon, goblinWarrior } from './creatures';

export interface DemoState {
  currentEncounter: string;
  initiative: Array<{
    id: string;
    name: string;
    initiative: number;
    hp: { current: number; max: number };
    isActive: boolean;
    type: 'character' | 'creature';
  }>;
  round: number;
  lairActionCountdown: number;
}

export const initialDemoState: DemoState = {
  currentEncounter: 'goblin-ambush',
  initiative: [
    {
      id: 'kael-brightblade',
      name: 'Kael Brightblade',
      initiative: 18,
      hp: { current: 45, max: 45 },
      isActive: false,
      type: 'character'
    },
    {
      id: 'whisper-shadowstep', 
      name: 'Whisper Shadowstep',
      initiative: 15,
      hp: { current: 28, max: 28 },
      isActive: true,
      type: 'character'
    },
    {
      id: 'goblin-1',
      name: 'Goblin Warrior',
      initiative: 12,
      hp: { current: 7, max: 7 },
      isActive: false,
      type: 'creature'
    },
    {
      id: 'goblin-boss',
      name: 'Goblin Boss',
      initiative: 8,
      hp: { current: 21, max: 21 },
      isActive: false,
      type: 'creature'
    }
  ],
  round: 1,
  lairActionCountdown: 3
};

export const sampleData = {
  characters: {
    crimsonBlades,
    all: samplePlayerCharacters
  },
  encounters: {
    goblinAmbush,
    dragonLair,
    all: sampleEncounters
  },
  creatures: {
    ancientRedDragon,
    goblinWarrior,
    all: sampleCreatures
  },
  demo: {
    initialState: initialDemoState
  }
};

export * from './characters';
export * from './encounters';
export * from './creatures';

// Utility functions for demo management
export const getNextInInitiative = (current: DemoState) => {
  const currentIndex = current.initiative.findIndex(char => char.isActive);
  const nextIndex = (currentIndex + 1) % current.initiative.length;
  return nextIndex;
};

export const advanceInitiative = (current: DemoState): DemoState => {
  const nextIndex = getNextInInitiative(current);
  const isNewRound = nextIndex === 0;
  
  return {
    ...current,
    initiative: current.initiative.map((char, index) => ({
      ...char,
      isActive: index === nextIndex
    })),
    round: isNewRound ? current.round + 1 : current.round,
    lairActionCountdown: isNewRound ? 3 : current.lairActionCountdown - 1
  };
};
```

## Testing Requirements

### Unit Tests

**File:** `src/lib/sample-data/__tests__/characters.test.ts`
- Character data validates against schema
- All required properties are present
- Stats are within D&D 5e ranges
- Random character function works

**File:** `src/lib/sample-data/__tests__/encounters.test.ts`
- Encounter balance calculations are correct
- Lair actions format properly
- Challenge ratings match creature totals
- Tactical notes provide value

### Integration Tests

- Demo state management works correctly
- Initiative advancement follows rules
- Sample data loads in demo components
- Performance with large datasets

## Quality Checklist

- [ ] All sample data follows D&D 5e rules accurately
- [ ] Character builds are realistic and balanced
- [ ] Encounter difficulty matches intended challenge
- [ ] Lair actions are thematically appropriate
- [ ] Demo state transitions are smooth
- [ ] Data validation prevents corruption

## Next Steps

After completing this step:
1. Test sample data in all demo components
2. Validate D&D 5e rule accuracy with subject matter experts
3. Performance test with full sample datasets
4. Proceed to Step 08: Analytics & Conversion Tracking
