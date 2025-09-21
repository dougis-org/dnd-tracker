# Data Model: MVP D&D Encounter Tracker

## Core Entity Definitions

### User Entity
**Purpose**: Account holder with authentication and subscription management
**Relationships**: One-to-many with Party, Encounter, Character, Monster

```typescript
interface User {
  id: string;                    // Clerk user ID
  email: string;
  profile: {
    displayName: string;
    dndRuleset: '5e' | '3.5e' | 'pf1' | 'pf2';
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    role: 'player' | 'dm' | 'both';
  };
  subscription: {
    tier: 'free' | 'seasoned' | 'expert' | 'master' | 'guild';
    status: 'active' | 'cancelled' | 'trial';
    currentPeriodEnd: Date;
  };
  usage: {
    partiesCount: number;        // Current usage against tier limits
    encountersCount: number;
    creaturesCount: number;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    defaultInitiativeType: 'manual' | 'auto';
    autoAdvanceRounds: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Email must be unique and valid format
- Subscription tier determines usage limits enforcement
- Usage counts updated atomically with create/delete operations

### Character Entity
**Purpose**: Player character with D&D stats and combat information
**Relationships**: Many-to-many with Party, one-to-many with CombatSession

```typescript
interface Character {
  id: string;
  userId: string;               // Creator/owner
  name: string;
  race: string;
  classes: Array<{
    name: string;
    level: number;
  }>;
  stats: {
    armorClass: number;
    hitPointsMax: number;
    hitPointsCurrent: number;
    dexterity: number;           // For initiative tie-breaking
    initiativeModifier: number;  // Includes Dex mod + other bonuses
  };
  player: {
    name?: string;
    email?: string;
  };
  sharing: {
    isPublic: boolean;           // Allow others to view/use
    allowedUsers: string[];      // Specific user IDs
  };
  isTemplate: boolean;           // Saved as reusable template
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- HP current cannot exceed HP max
- AC and stats must be positive integers
- Initiative modifier calculated from Dex + proficiency + other bonuses

### Monster Entity
**Purpose**: NPCs and monsters with stat blocks and special abilities
**Relationships**: Many-to-many with Encounter, one-to-many with CombatSession

```typescript
interface Monster {
  id: string;
  userId: string;               // Creator/owner
  name: string;
  type: 'aberration' | 'beast' | 'celestial' | 'construct' | 'dragon' |
        'elemental' | 'fey' | 'fiend' | 'giant' | 'humanoid' |
        'monstrosity' | 'ooze' | 'plant' | 'undead';
  challengeRating: string;      // "1/4", "1/2", "1", "2", etc.
  stats: {
    armorClass: number;
    hitPointsMax: number;
    dexterity: number;
    initiativeModifier: number;
  };
  abilities: {
    legendaryActions?: {
      count: number;             // Actions per round
      description: string;
      actions: Array<{
        name: string;
        cost: number;            // Action cost (1-3)
        description: string;
      }>;
    };
    lairActions?: {
      initiative: number;        // Usually 20
      actions: Array<{
        name: string;
        description: string;
        trigger: string;         // When this action occurs
      }>;
    };
    specialAbilities: Array<{
      name: string;
      description: string;
      type: 'passive' | 'action' | 'reaction' | 'legendary';
    }>;
  };
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Challenge rating must be valid D&D value
- Legendary action costs sum cannot exceed available actions
- Lair action initiative typically 20 but configurable

### Party Entity
**Purpose**: Groups of characters representing gaming groups
**Relationships**: Many-to-many with Character, one-to-many with Encounter

```typescript
interface Party {
  id: string;
  userId: string;               // DM/owner
  name: string;
  description?: string;
  members: Array<{
    characterId: string;
    role: 'player' | 'npc' | 'guest';
    joinedAt: Date;
  }>;
  settings: {
    defaultInitiativeType: 'manual' | 'auto';
    allowPlayerHPVisibility: boolean;
    enableDeathSaves: boolean;
  };
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Party size enforced by user's subscription tier
- Member character IDs must exist and be accessible
- Template parties cannot be used directly in encounters

### Encounter Entity
**Purpose**: Combat scenarios with environmental settings and participants
**Relationships**: Many-to-one with Party, many-to-many with Monster

```typescript
interface Encounter {
  id: string;
  userId: string;               // DM/creator
  name: string;
  description?: string;
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
  environment: {
    name: string;
    description?: string;
    hasLairActions: boolean;
    lighting: 'bright' | 'dim' | 'darkness';
    terrain: 'normal' | 'difficult' | 'hazardous';
  };
  participants: {
    partyId?: string;            // Optional preset party
    characters: string[];        // Character IDs
    monsters: Array<{
      monsterId: string;
      count: number;             // Multiple instances
      customName?: string;       // "Goblin 1", "Goblin 2"
    }>;
  };
  maxParticipants: number;       // Tier-based limit
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules**:
- Total participants cannot exceed tier limits
- Monster count must be positive integer
- Environment settings affect combat mechanics

### CombatSession Entity
**Purpose**: Active encounter instance with real-time state
**Relationships**: One-to-one with Encounter

```typescript
interface CombatSession {
  id: string;
  encounterId: string;
  userId: string;               // DM running the session
  status: 'preparing' | 'active' | 'paused' | 'completed';

  initiative: Array<{
    participantId: string;       // Character or Monster instance ID
    participantType: 'character' | 'monster';
    name: string;                // Display name
    initiativeRoll: number;      // Raw d20 roll
    initiativeTotal: number;     // Roll + modifier
    dexterity: number;           // Tie-breaking value
    manualOverride?: number;     // DM override position
  }>;

  currentTurn: {
    participantId: string;
    roundNumber: number;
    turnIndex: number;           // Position in initiative order
  };

  participants: Array<{
    id: string;                  // Instance ID for this session
    sourceId: string;            // Original Character/Monster ID
    type: 'character' | 'monster';
    name: string;
    stats: {
      armorClass: number;
      hitPointsMax: number;
      hitPointsCurrent: number;
      temporaryHP: number;
    };
    statusEffects: StatusEffect[];
    notes?: string;
  }>;

  lairActions: {
    isActive: boolean;
    nextTrigger: number;         // Initiative count for next trigger
    availableActions: Array<{
      name: string;
      description: string;
      used: boolean;             // Some lair actions are once per combat
    }>;
  };

  history: Array<{
    timestamp: Date;
    action: string;              // "damage", "heal", "status_add", "turn_advance"
    participantId: string;
    details: Record<string, unknown>; // Action-specific data
    canUndo: boolean;
  }>;

  createdAt: Date;
  updatedAt: Date;
}
```

**State Transitions**:
- `preparing` → `active`: When initiative is set and first turn begins
- `active` → `paused`: DM can pause for breaks/discussions
- `paused` → `active`: Resume from exact state
- `active` → `completed`: When encounter objectives met

### StatusEffect Entity
**Purpose**: Temporary conditions with duration and game effects
**Relationships**: Many-to-one with CombatSession participants

```typescript
interface StatusEffect {
  id: string;
  name: string;                 // "Poisoned", "Blessed", "Prone"
  description: string;
  type: 'condition' | 'spell' | 'ability' | 'environmental';

  duration: {
    type: 'rounds' | 'minutes' | 'hours' | 'until_save' | 'concentration' | 'permanent';
    remaining: number;           // For round/time-based effects
    endTrigger: 'start_of_turn' | 'end_of_turn' | 'start_of_round' | 'end_of_round';
  };

  effects: {
    modifiers: Array<{
      stat: string;              // "AC", "attack_rolls", "damage"
      value: number;             // Bonus/penalty
      type: 'bonus' | 'penalty' | 'advantage' | 'disadvantage';
    }>;
    restrictions: string[];      // "cannot_move", "cannot_speak"
  };

  source: {
    type: 'spell' | 'ability' | 'environmental' | 'manual';
    name: string;
    casterId?: string;           // For concentration tracking
  };

  appliedAt: Date;
  expiresAt?: Date;
}
```

**Duration Management**:
- Round-based effects decrement at specified turn phases
- Concentration effects removed when caster takes damage and fails save
- Save-based effects prompt for saving throws

### LairAction Entity
**Purpose**: Environmental effects for specific encounter locations
**Relationships**: Many-to-one with Encounter environment

```typescript
interface LairAction {
  id: string;
  encounterId: string;
  initiative: number;           // When action triggers (usually 20)

  action: {
    name: string;
    description: string;
    type: 'automatic' | 'choice' | 'random';

    // For choice-based actions
    options?: Array<{
      name: string;
      description: string;
      mechanicalEffect?: string; // "DC 15 Dex save or 2d6 damage"
    }>;

    // For automatic actions
    automaticEffect?: {
      description: string;
      affectedArea: string;      // "entire lair", "within 60 feet"
      savingThrow?: {
        ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';
        dc: number;
        effect: string;
      };
    };
  };

  triggers: {
    roundInterval: number;       // Every X rounds (1 = every round)
    maxUses?: number;           // Some actions limited per combat
    usesRemaining: number;
  };

  createdAt: Date;
}
```

**Automation Rules**:
- Lair actions automatically trigger at specified initiative
- DM receives prompts with available options
- Usage tracking prevents exceeding limits

## Data Relationships Summary

```
User (1) ←→ (∞) Party
User (1) ←→ (∞) Character
User (1) ←→ (∞) Monster
User (1) ←→ (∞) Encounter

Party (∞) ←→ (∞) Character [members]
Encounter (∞) ←→ (∞) Monster [participants]
Encounter (1) ←→ (1) CombatSession

CombatSession (1) ←→ (∞) StatusEffect
Encounter (1) ←→ (∞) LairAction
```

## Validation & Business Rules

### Tier Limit Enforcement
- **Free Adventurer**: 1 party, 3 encounters, 10 creatures, 6 max participants
- Validation occurs at creation time and during session setup
- Graceful degradation when limits reached during active sessions

### Data Integrity Rules
- Cascade deletion: User deletion removes all related entities
- Soft deletion for active combat sessions (mark as archived)
- Referential integrity enforced through MongoDB references with validation

### Performance Considerations
- Initiative array sorted in-memory for real-time updates
- Status effects filtered by active/expired for UI rendering
- Combat history paginated for long sessions
- Indexes on userId, createdAt, and status for efficient queries