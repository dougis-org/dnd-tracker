/**
 * PartyCompositionSummary Component
 * Displays party statistics including member count, average level, tier, and role composition
 */

'use client';

import React from 'react';
import { Party } from '@/types/party';
import {
  getPartyMemberCount,
  getAverageLevel,
  getPartyTier,
  getLevelRange,
  getPartyComposition,
} from '@/lib/utils/partyHelpers';

interface PartyCompositionSummaryProps {
  party: Party;
  variant?: 'compact' | 'full';
}

export function PartyCompositionSummary({
  party,
  variant = 'full',
}: PartyCompositionSummaryProps): React.ReactElement {
  const memberCount = getPartyMemberCount(party);
  const avgLevel = getAverageLevel(party);
  const tier = getPartyTier(party);
  const levelRange = getLevelRange(party);
  const composition = getPartyComposition(party);

  // Get role colors
  const roleColors = {
    Tank: 'bg-blue-100 text-blue-800',
    Healer: 'bg-green-100 text-green-800',
    DPS: 'bg-red-100 text-red-800',
    Support: 'bg-purple-100 text-purple-800',
    Unassigned: 'bg-gray-100 text-gray-800',
  };

  if (variant === 'compact') {
    return (
      <div className="party-composition-compact">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <span className="block text-2xl font-bold text-gray-900">{memberCount}</span>
            <span className="text-xs text-gray-600">Members</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-gray-900">{avgLevel}</span>
            <span className="text-xs text-gray-600">Avg Level</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="party-composition-full space-y-4">
      {/* Stats Header */}
      <h3 className="text-lg font-semibold text-gray-900">Party Composition</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <span className="block text-2xl font-bold text-gray-900">{memberCount}</span>
          <span className="block text-xs text-gray-600 mt-1">Members</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <span className="block text-2xl font-bold text-gray-900">{avgLevel}</span>
          <span className="block text-xs text-gray-600 mt-1">Avg Level</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <span className="block text-sm font-bold text-gray-900">{levelRange}</span>
          <span className="block text-xs text-gray-600 mt-1">Level Range</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <span className="block text-sm font-bold text-gray-900">{tier}</span>
          <span className="block text-xs text-gray-600 mt-1">Tier</span>
        </div>
      </div>

      {/* Role Composition */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Role Distribution</h4>
        <ul className="space-y-2">
          {composition.tanks > 0 && (
            <li className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors.Tank}`}>
                Tank
              </span>
              <span className="text-sm font-semibold text-gray-900">{composition.tanks}</span>
            </li>
          )}
          {composition.healers > 0 && (
            <li className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors.Healer}`}>
                Healer
              </span>
              <span className="text-sm font-semibold text-gray-900">{composition.healers}</span>
            </li>
          )}
          {composition.dps > 0 && (
            <li className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors.DPS}`}>
                DPS
              </span>
              <span className="text-sm font-semibold text-gray-900">{composition.dps}</span>
            </li>
          )}
          {composition.support > 0 && (
            <li className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors.Support}`}>
                Support
              </span>
              <span className="text-sm font-semibold text-gray-900">{composition.support}</span>
            </li>
          )}
          {composition.unassigned > 0 && (
            <li className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors.Unassigned}`}
              >
                Unassigned
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {composition.unassigned}
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
