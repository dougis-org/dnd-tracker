/**
 * Party Utility Functions
 * Helper functions for calculating party statistics and properties
 */

import { Party, PartyMember, RoleComposition } from '@/types/party';

/**
 * Get role composition breakdown for a party
 */
export function getPartyComposition(party: Party): RoleComposition {
  const composition: RoleComposition = {
    tanks: 0,
    healers: 0,
    dps: 0,
    support: 0,
    unassigned: 0,
  };

  party.members.forEach((member) => {
    if (member.role === 'Tank') {
      composition.tanks += 1;
    } else if (member.role === 'Healer') {
      composition.healers += 1;
    } else if (member.role === 'DPS') {
      composition.dps += 1;
    } else if (member.role === 'Support') {
      composition.support += 1;
    } else {
      composition.unassigned += 1;
    }
  });

  return composition;
}

/**
 * Calculate average level of party members
 */
export function getAverageLevel(party: Party): number {
  if (party.members.length === 0) {
    return 0;
  }

  const total = party.members.reduce((sum, member) => sum + member.level, 0);
  return Math.round(total / party.members.length);
}

/**
 * Get level range of party (min-max)
 */
export function getLevelRange(party: Party): string {
  if (party.members.length === 0) {
    return 'N/A';
  }

  const levels = party.members.map((m) => m.level);
  const min = Math.min(...levels);
  const max = Math.max(...levels);

  if (min === max) {
    return `${min}`;
  }

  return `${min}-${max}`;
}

/**
 * Determine party tier based on average level
 */
export function getPartyTier(party: Party): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
  const avgLevel = getAverageLevel(party);

  if (avgLevel < 5) {
    return 'Beginner';
  }

  if (avgLevel < 11) {
    return 'Intermediate';
  }

  if (avgLevel < 17) {
    return 'Advanced';
  }

  return 'Expert';
}

/**
 * Get total party members count
 */
export function getPartyMemberCount(party: Party): number {
  return party.members.length;
}

/**
 * Sort party members by position
 */
export function sortMembersByPosition(members: PartyMember[]): PartyMember[] {
  return [...members].sort((a, b) => a.position - b.position);
}

/**
 * Get role color for styling
 */
export function getRoleColor(role?: string): string {
  switch (role) {
    case 'Tank':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Healer':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'DPS':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Support':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Get role background color for badges
 */
export function getRoleBgColor(role?: string): string {
  switch (role) {
    case 'Tank':
      return '#2563eb';
    case 'Healer':
      return '#16a34a';
    case 'DPS':
      return '#dc2626';
    case 'Support':
      return '#7c3aed';
    default:
      return '#6b7280';
  }
}
