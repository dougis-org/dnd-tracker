# Data Model: Party Management Pages

**Feature**: Party Management Pages (F006)  
**Date**: 2025-11-06  
**Status**: Phase 1 - Design

## Entity Definitions

### Entity 1: Party

Represents a group of adventurers forming a player party for a D&D campaign.

**Purpose**: Core entity for organizing and managing player characters

**Attributes**:

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|-----------|
| id | string | Yes | Unique identifier for party | UUID or nanoid format |
| name | string | Yes | Party name | 1-100 characters, non-empty |
| description | string | No | Campaign/party description | 0-500 characters |
| campaignSetting | string | No | D&D campaign setting | Free text, 0-200 characters |
| members | PartyMember[] | Yes | Array of party members | 1-20 members per party |
| created_at | Date/ISO-8601 | Yes | Party creation timestamp | Automatically set |
| updated_at | Date/ISO-8601 | Yes | Last update timestamp | Automatically updated |

**Relationships**:

- `members`: One-to-many with PartyMember (cascade delete if party deleted)
- Future: One-to-many with Encounter (when F034 implemented)
- Future: Many-to-one with User (when F013 authentication added)

**State Transitions**:

- `draft` → `active` (when members added)
- `active` → `archived` (manual user action)
- Any state → `deleted` (hard delete for now, soft delete when audit needed)

**Validation Rules**:

- name: Required, 1-100 chars, trimmed
- members: Minimum 1 member, maximum 20 members per party
- description: Optional, max 500 chars
- campaignSetting: Optional, max 200 chars

---

### Entity 2: PartyMember

Represents an individual character within a party.

**Purpose**: Store character info within party context with role assignment

**Attributes**:

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|-----------|
| id | string | Yes | Unique member ID | UUID or nanoid, unique within party |
| partyId | string | Yes | Reference to parent party | Must reference valid Party |
| characterName | string | Yes | Character's name | 1-100 characters |
| class | string | Yes | D&D class | Must be valid D&D 5e class |
| race | string | Yes | D&D race | Must be valid D&D 5e race |
| level | number | Yes | Character level | 1-20 inclusive |
| ac | number | Yes | Armor Class | 1-30 (practical limits) |
| hp | number | Yes | Current/Maximum hit points | 1-500 practical limit |
| role | Role enum | No | Party role classification | One of: Tank, Healer, DPS, Support |
| position | number | No | Display order in member list | 0-19 |

**Relationships**:

- `partyId`: Many-to-one with Party (required)
- Future: One-to-one with Character (when F018 implemented)

**Validation Rules**:

- characterName: Required, 1-100 chars, non-empty
- class: Required, must be one of valid D&D 5e classes
- race: Required, must be one of valid D&D 5e races  
- level: Required, range 1-20
- ac: Required, range 1-30 (practical D&D limits)
- hp: Required, must be positive integer
- role: Optional, defaults to undefined if not set

**Type Safety**:

```typescript
type DnDClass = 
  | 'Barbarian' | 'Bard' | 'Cleric' | 'Druid' 
  | 'Fighter' | 'Monk' | 'Paladin' | 'Ranger' 
  | 'Rogue' | 'Sorcerer' | 'Warlock' | 'Wizard';

type DnDRace = 
  | 'Human' | 'Elf' | 'Dwarf' | 'Halfling' 
  | 'Dragonborn' | 'Gnome' | 'Half-Elf' | 'Half-Orc' 
  | 'Tiefling';

type PartyRole = 'Tank' | 'Healer' | 'DPS' | 'Support';
```

---

### Entity 3: Role (Enum)

Classification system for party member roles.

**Values**:

| Role | Color | Description | Icon |
|------|-------|-------------|------|
| Tank | Blue (#2563eb) | Melee combatant with high AC/HP | Shield icon |
| Healer | Green (#16a34a) | Support with healing capabilities | Heart icon |
| DPS | Red (#dc2626) | High damage output specialist | Sword icon |
| Support | Purple (#7c3aed) | Utility/control specialist | Staff icon |
| Undefined | Gray (#6b7280) | Role not assigned | Question icon |

**Usage**:

- Badge display: Color-coded role indicator
- Selection: Dropdown selector in forms
- Filtering: (Future) Filter parties by role composition
- UI: Color-coded styling for visual distinction

---

## Entity Relationships Diagram

```
Party (1)
├─── (1:N) ──→ PartyMember (N)
│              ├── role: Role enum
│              └── position: integer
│
└─── (Future: 1:N) ──→ Encounter (when F034)
     (when F034 implemented)

PartyMember
├── (Future: 1:1) ──→ Character (when F018)
│   (when character system implemented)
└── (Future: N:1) ──→ Party (N)
    (delete behavior: cascade)
```

---

## Mock Data Examples

### Party 1: The Grovewalkers

```typescript
{
  id: 'party-001',
  name: 'The Grovewalkers',
  description: 'A diverse group of adventurers brought together by fate in the Forgotten Realms',
  campaignSetting: 'Forgotten Realms - Sword Coast',
  members: [
    {
      id: 'member-001',
      partyId: 'party-001',
      characterName: 'Theron',
      class: 'Paladin',
      race: 'Half-Orc',
      level: 5,
      ac: 18,
      hp: 52,
      role: 'Tank',
      position: 0
    },
    {
      id: 'member-002',
      partyId: 'party-001',
      characterName: 'Elara',
      class: 'Cleric',
      race: 'Half-Elf',
      level: 5,
      ac: 17,
      hp: 38,
      role: 'Healer',
      position: 1
    },
    {
      id: 'member-003',
      partyId: 'party-001',
      characterName: 'Kess',
      class: 'Rogue',
      race: 'Halfling',
      level: 5,
      ac: 15,
      hp: 28,
      role: 'DPS',
      position: 2
    },
    {
      id: 'member-004',
      partyId: 'party-001',
      characterName: 'Bron',
      class: 'Barbarian',
      race: 'Dwarf',
      level: 4,
      ac: 14,
      hp: 45,
      role: 'DPS',
      position: 3
    }
  ],
  created_at: '2025-11-01T10:00:00Z',
  updated_at: '2025-11-01T10:00:00Z'
}
```

### Party 2: Moonlit Syndicate

```typescript
{
  id: 'party-002',
  name: 'Moonlit Syndicate',
  description: 'Urban adventurers operating in the shadows of major cities',
  campaignSetting: 'Waterdeep',
  members: [
    {
      id: 'member-005',
      partyId: 'party-002',
      characterName: 'Astra',
      class: 'Warlock',
      race: 'Tiefling',
      level: 6,
      ac: 15,
      hp: 30,
      role: 'DPS',
      position: 0
    },
    {
      id: 'member-006',
      partyId: 'party-002',
      characterName: 'Malachai',
      class: 'Wizard',
      race: 'High Elf',
      level: 6,
      ac: 12,
      hp: 25,
      role: 'Support',
      position: 1
    },
    {
      id: 'member-007',
      partyId: 'party-002',
      characterName: 'Torvin',
      class: 'Fighter',
      race: 'Dwarf',
      level: 6,
      ac: 18,
      hp: 62,
      role: 'Tank',
      position: 2
    },
    {
      id: 'member-008',
      partyId: 'party-002',
      characterName: 'Silas',
      class: 'Bard',
      race: 'Human',
      level: 5,
      ac: 14,
      hp: 32,
      role: 'Support',
      position: 3
    },
    {
      id: 'member-009',
      partyId: 'party-002',
      characterName: 'Nyx',
      class: 'Ranger',
      race: 'Wood Elf',
      level: 6,
      ac: 15,
      hp: 45,
      role: 'DPS',
      position: 4
    }
  ],
  created_at: '2025-11-02T14:30:00Z',
  updated_at: '2025-11-02T14:30:00Z'
}
```

---

## Computed Properties (Not Persisted)

These values are calculated from entity data:

| Property | Calculation | Used Where |
|----------|-----------|-----------|
| memberCount | parties.members.length | Party list card, detail summary |
| averageLevel | sum(members.level) / memberCount | Detail page summary |
| roleComposition | { tanks: count, healers: count, dps: count, support: count } | Composition chart |
| partyTier | Logic based on average level | Visual indicator (Beginner/Intermediate/Advanced/Expert) |
| levelRange | `${Math.min(...levels)}-${Math.max(...levels)}` | Display alongside average |

**Example Calculation**:

```typescript
function getPartyComposition(party: Party) {
  const composition = {
    tanks: 0,
    healers: 0,
    dps: 0,
    support: 0,
    unassigned: 0
  };

  party.members.forEach(member => {
    if (member.role === 'Tank') composition.tanks++;
    else if (member.role === 'Healer') composition.healers++;
    else if (member.role === 'DPS') composition.dps++;
    else if (member.role === 'Support') composition.support++;
    else composition.unassigned++;
  });

  return composition;
}
```

---

## Storage Considerations

**Current Phase (F006 - Mock Only)**:

- Data stored in-memory via TypeScript module (`lib/mockData/parties.ts`)
- No persistence between page refreshes
- Mock data sufficient for UI/UX validation

**Future Integration (F014 - MongoDB)**:

- MongoDB collections: `parties`, `members`
- Mongoose schemas: `PartySchema`, `PartyMemberSchema`
- Indexes on: `userId`, `party.id`, `created_at`
- Validation: Field-level via Mongoose + Zod for API routes

---

## API Contract Preview (For F014+)

When backend authentication (F013) and database (F014) implemented:

```
GET    /api/parties              → List all user parties
GET    /api/parties/:id          → Get party detail
POST   /api/parties              → Create party
PATCH  /api/parties/:id          → Update party
DELETE /api/parties/:id          → Delete party
POST   /api/parties/:id/members  → Add member to party
PATCH  /api/parties/:id/members/:memberId → Update member
DELETE /api/parties/:id/members/:memberId → Remove member
```

Request/response validation will use Zod schemas with types derived from entities above.
