/**
 * MemberCard Component
 * Displays individual party member information with role badge and stats
 * Supports multiple variants: detail (full info), edit (with remove button), preview (compact)
 */

'use client';

import React from 'react';
import { PartyMember } from '@/types/party';
import { getRoleColor } from '@/lib/utils/partyHelpers';
import { Button } from '@/components/ui/button';

export interface MemberCardProps {
  member: PartyMember;
  variant?: 'detail' | 'edit' | 'preview';
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export function MemberCard({
  member,
  variant = 'detail',
  onRemove,
  onEdit,
}: MemberCardProps): React.ReactElement {
  const roleColor = getRoleColor(member.role);
  const roleName = member.role || 'Unassigned';

  return (
    <div className="member-card border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition-shadow">
      {/* Member Header with Name and Role */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900">{member.characterName}</h4>
          <p className="text-sm text-gray-600">
            {member.class} • {member.race}
          </p>
        </div>
        <div className={`${roleColor} px-3 py-1 rounded-full text-xs font-medium ml-2`}>
          {roleName}
        </div>
      </div>

      {/* Core Stats - Always Visible */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="block text-xs text-gray-500 font-medium">Level</span>
          <span className="block text-lg font-bold text-gray-900">{member.level}</span>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="block text-xs text-gray-500 font-medium">AC</span>
          <span className="block text-lg font-bold text-gray-900">{member.ac}</span>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <span className="block text-xs text-gray-500 font-medium">HP</span>
          <span className="block text-lg font-bold text-gray-900">{member.hp}</span>
        </div>
      </div>

      {/* HP Bar */}
      {(variant === 'detail' || variant === 'edit') && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-600">Hit Points</span>
            <span className="text-xs text-gray-500">{member.hp} HP</span>
          </div>
          <div
            data-testid="hp-bar"
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Detailed Stats - Detail & Edit Variants */}
      {(variant === 'detail' || variant === 'edit') && (
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between py-1 border-t border-gray-100">
            <span className="text-gray-600">Position</span>
            <span className="font-medium text-gray-900">{member.position + 1}</span>
          </div>
        </div>
      )}

      {/* Action Buttons - Edit Variant Only */}
      {variant === 'edit' && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          {onEdit && (
            <Button
              onClick={() => onEdit(member.id)}
              variant="outline"
              size="sm"
              aria-label={`Edit ${member.characterName}`}
              className="flex-1"
            >
              Edit
            </Button>
          )}
          {onRemove && (
            <Button
              onClick={() => onRemove(member.id)}
              variant="destructive"
              size="sm"
              aria-label={`Remove ${member.characterName}`}
              className="flex-1"
            >
              Remove
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
