/**
 * Role Distribution List Component
 * Extracted from PartyCompositionSummary to reduce complexity
 */

import React from 'react';
import { RoleComposition } from '@/types/party';

interface RoleDistributionListProps {
  composition: RoleComposition;
}

const roleColors = {
  Tank: 'bg-blue-100 text-blue-800',
  Healer: 'bg-green-100 text-green-800',
  DPS: 'bg-red-100 text-red-800',
  Support: 'bg-purple-100 text-purple-800',
  Unassigned: 'bg-gray-100 text-gray-800',
};

type RoleKey = keyof typeof roleColors;

const roleEntries: Array<[RoleKey, keyof RoleComposition]> = [
  ['Tank', 'tanks'],
  ['Healer', 'healers'],
  ['DPS', 'dps'],
  ['Support', 'support'],
  ['Unassigned', 'unassigned'],
];

export function RoleDistributionList({ composition }: RoleDistributionListProps): React.ReactElement {
  return (
    <ul className="space-y-2">
      {roleEntries.map(([roleName, countKey]) => {
        const count = composition[countKey];
        if (count === 0) return null;

        return (
          <li key={roleName} className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[roleName]}`}>
              {roleName}
            </span>
            <span className="text-sm font-semibold text-gray-900">{count}</span>
          </li>
        );
      })}
    </ul>
  );
}
