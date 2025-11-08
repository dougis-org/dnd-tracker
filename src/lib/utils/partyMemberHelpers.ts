/**
 * Party Member Management Utilities
 * Extracted to reduce PartyForm component complexity
 */

import { PartyMember } from '@/types/party';

/**
 * Get default member ID
 */
function getDefaultId(providedId?: string): string {
  return providedId || `member-${Date.now()}`;
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
export function createFullMember(memberData: Partial<PartyMember>): PartyMember {
  return {
    id: getDefaultId(memberData.id),
    partyId: '',
    characterName: getMemberField(memberData.characterName, ''),
    class: getMemberField(memberData.class, 'Fighter'),
    race: getMemberField(memberData.race, 'Human'),
    level: getMemberField(memberData.level, 1),
    ac: getMemberField(memberData.ac, 10),
    hp: getMemberField(memberData.hp, 10),
    role: memberData.role,
    position: getMemberField(memberData.position, 0),
  };
}

/**
 * Updates or adds a member to the members list
 */
export function updateOrAddMember(
  members: PartyMember[],
  memberData: Partial<PartyMember>,
  editingMemberId: string | null,
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
export function removeMember(members: PartyMember[], memberId: string): PartyMember[] {
  return members.filter((m) => m.id !== memberId);
}

/**
 * Finds a member by ID
 */
export function findMemberById(members: PartyMember[], memberId: string | null): PartyMember | undefined {
  if (!memberId) return undefined;
  return members.find((m) => m.id === memberId);
}
