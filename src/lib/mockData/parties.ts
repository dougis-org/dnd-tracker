/**
 * Mock Party Data
 * Provides mock data and factory functions for party management feature
 * Used for UI testing before backend integration (F006 phase)
 */

import { Party, PartyMember } from '@/types/party';

/**
 * Mock party 1: The Grovewalkers
 */
const partyOne: Party = {
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
      position: 0,
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
      position: 1,
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
      position: 2,
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
      position: 3,
    },
  ],
  created_at: '2025-11-01T10:00:00Z',
  updated_at: '2025-11-01T10:00:00Z',
};

/**
 * Mock party 2: Moonlit Syndicate
 */
const partyTwo: Party = {
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
      position: 0,
    },
    {
      id: 'member-006',
      partyId: 'party-002',
      characterName: 'Malachai',
      class: 'Wizard',
      race: 'Elf',
      level: 6,
      ac: 12,
      hp: 25,
      role: 'Support',
      position: 1,
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
      position: 2,
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
      position: 3,
    },
    {
      id: 'member-009',
      partyId: 'party-002',
      characterName: 'Nyx',
      class: 'Ranger',
      race: 'Elf',
      level: 6,
      ac: 15,
      hp: 45,
      role: 'DPS',
      position: 4,
    },
  ],
  created_at: '2025-11-02T14:30:00Z',
  updated_at: '2025-11-02T14:30:00Z',
};

/**
 * Complete mock party data
 */
export const MOCK_PARTIES: Party[] = [partyOne, partyTwo];

/**
 * Create a mock party with optional overrides
 * Useful for generating test data variations
 */
export function createMockParty(overrides: Partial<Party> = {}): Party {
  return {
    ...partyOne,
    ...overrides,
  };
}

/**
 * Create a mock party member with optional overrides
 */
export function createMockMember(overrides: Partial<PartyMember> = {}): PartyMember {
  return {
    id: 'test-member-id',
    partyId: 'test-party-id',
    characterName: 'Test Hero',
    class: 'Fighter',
    race: 'Human',
    level: 5,
    ac: 16,
    hp: 50,
    role: undefined,
    position: 0,
    ...overrides,
  };
}

/**
 * Get a party by ID from mock data
 */
export function getMockPartyById(id: string): Party | undefined {
  return MOCK_PARTIES.find((party) => party.id === id);
}

/**
 * Get all mock parties
 */
export function getAllMockParties(): Party[] {
  return [...MOCK_PARTIES];
}
