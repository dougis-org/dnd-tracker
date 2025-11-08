/**
 * Party Test Helpers & Factories
 * Shared test utilities for generating mock data in tests
 */

import { Party, PartyMember, DnDClass, DnDRace } from '@/types/party';

/**
 * Generate unique ID for testing
 */
function generateTestId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Factory function to create a minimal test party
 */
export function createTestParty(overrides: Partial<Party> = {}): Party {
  return {
    id: generateTestId('test-party'),
    name: 'Test Party',
    description: 'Test party description',
    campaignSetting: 'Test Campaign',
    members: [createTestMember()],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Factory function to create a test party member
 */
export function createTestMember(overrides: Partial<PartyMember> = {}): PartyMember {
  return {
    id: generateTestId('test-member'),
    partyId: 'test-party-id',
    characterName: 'Test Character',
    class: 'Fighter' as DnDClass,
    race: 'Human' as DnDRace,
    level: 5,
    ac: 16,
    hp: 50,
    role: undefined,
    position: 0,
    ...overrides,
  };
}

/**
 * Create test party with multiple members
 */
export function createTestPartyWithMembers(
  memberCount: number,
  partyOverrides?: Partial<Party>,
  memberOverrides?: Partial<PartyMember>,
): Party {
  const partyId = generateTestId('test-party');
  const members = Array.from({ length: memberCount }, (_, i) =>
    createTestMember({
      partyId,
      position: i,
      ...memberOverrides,
    }),
  );

  return createTestParty({
    ...partyOverrides,
    id: partyId,
    members,
  });
}

/**
 * Create a test member with specific role
 */
export function createTestMemberWithRole(role: string, overrides: Partial<PartyMember> = {}) {
  return createTestMember({
    role: role as unknown as typeof overrides['role'],
    ...overrides,
  });
}

/**
 * Create balanced test party (Tank, Healer, DPS, Support)
 */
export function createBalancedTestParty(partyOverrides?: Partial<Party>): Party {
  const partyId = generateTestId('test-party');

  const members: PartyMember[] = [
    createTestMember({
      partyId,
      characterName: 'Tank Hero',
      class: 'Paladin' as DnDClass,
      role: 'Tank',
      ac: 18,
      hp: 60,
      position: 0,
    }),
    createTestMember({
      partyId,
      characterName: 'Healer Hero',
      class: 'Cleric' as DnDClass,
      role: 'Healer',
      ac: 16,
      hp: 40,
      position: 1,
    }),
    createTestMember({
      partyId,
      characterName: 'DPS Hero',
      class: 'Rogue' as DnDClass,
      role: 'DPS',
      ac: 14,
      hp: 30,
      position: 2,
    }),
    createTestMember({
      partyId,
      characterName: 'Support Hero',
      class: 'Wizard' as DnDClass,
      role: 'Support',
      ac: 12,
      hp: 25,
      position: 3,
    }),
  ];

  return createTestParty({
    ...partyOverrides,
    id: partyId,
    members,
  });
}
