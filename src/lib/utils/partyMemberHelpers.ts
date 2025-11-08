/**
 * Party Member Management Utilities
 * Extracted to reduce PartyForm component complexity
 */

import { PartyMember, DnDClass, DnDRace } from '@/types/party';

// Default values for member fields
const DEFAULTS = {
  PARTY_ID: '',
  CLASS: 'Fighter' as DnDClass,
  RACE: 'Human' as DnDRace,
  LEVEL: 1,
  AC: 10,
  HP: 10,
  POSITION: 0,
} as const;

/**
 * Generate a unique ID for a new member
 */
function generateMemberId(): string {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    const { randomUUID } = require('crypto');
    return randomUUID();
  }
  // Client-side: use Web Crypto API
  return globalThis.crypto?.randomUUID?.() || `member-${Date.now()}`;
}

/**
 * Get member field with default value
 */
function getMemberField<T>(value: T | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * Creates a complete party member object from partial data
 */
export function createFullMember(
  memberData: Partial<PartyMember>
): PartyMember {
  const id = memberData.id || generateMemberId();

  return {
    id,
    partyId: DEFAULTS.PARTY_ID,
    characterName: getMemberField(memberData.characterName, ''),
    class: getMemberField(memberData.class, DEFAULTS.CLASS),
    race: getMemberField(memberData.race, DEFAULTS.RACE),
    level: getMemberField(memberData.level, DEFAULTS.LEVEL),
    ac: getMemberField(memberData.ac, DEFAULTS.AC),
    hp: getMemberField(memberData.hp, DEFAULTS.HP),
    role: memberData.role,
    position: getMemberField(memberData.position, DEFAULTS.POSITION),
  };
}

/**
 * Updates or adds a member to the members list
 */
export function updateOrAddMember(
  members: PartyMember[],
  memberData: Partial<PartyMember>,
  editingMemberId: string | null
): PartyMember[] {
  const fullMember = createFullMember(memberData);

  if (editingMemberId) {
    return members.map((m) => (m.id === editingMemberId ? fullMember : m));
  }

  return [...members, fullMember];
}

/**
 * Removes a member from the members list
 */
export function removeMember(
  members: PartyMember[],
  memberId: string
): PartyMember[] {
  return members.filter((m) => m.id !== memberId);
}

/**
 * Finds a member by ID
 */
export function findMemberById(
  members: PartyMember[],
  memberId: string | null
): PartyMember | undefined {
  if (!memberId) return undefined;
  return members.find((m) => m.id === memberId);
}
