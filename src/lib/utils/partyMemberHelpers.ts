/**
 * Party Member Management Utilities
 * Extracted to reduce PartyForm component complexity
 */

import { PartyMember } from '@/types/party';

/**
 * Creates a complete party member object from partial data
 */
export function createFullMember(memberData: Partial<PartyMember>): PartyMember {
  return {
    id: memberData.id || `member-${Date.now()}`,
    partyId: '',
    characterName: memberData.characterName || '',
    class: memberData.class || 'Fighter',
    race: memberData.race || 'Human',
    level: memberData.level || 1,
    ac: memberData.ac || 10,
    hp: memberData.hp || 10,
    role: memberData.role,
    position: memberData.position || 0,
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
