import React, { useState } from 'react';
import { Party, PartyMember } from '@/types/party';
import { PartyCompositionSummary } from './PartyCompositionSummary';
import { MemberCard } from './MemberCard';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export interface PartyDetailProps {
  party: Party;
  onEditMember: (memberId: string) => void;
  onDeleteMember: (memberId: string) => void;
  onBack: () => void;
}

export default function PartyDetail({
  party,
  onEditMember,
  onDeleteMember,
  onBack,
}: PartyDetailProps) {
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const memberToDelete = party.members?.find((m) => m.id === deletingMemberId);

  const handleDeleteConfirm = () => {
    if (deletingMemberId) {
      onDeleteMember(deletingMemberId);
      setDeletingMemberId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {party.name}
            </h1>
            {party.description && (
              <p className="text-lg text-gray-600">{party.description}</p>
            )}
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        </div>

        {/* Composition Summary */}
        <div className="mb-8">
          <PartyCompositionSummary party={party} variant="full" />
        </div>

        {/* Members Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>

          {party.members && party.members.length > 0 ? (
            <div className="space-y-4">
              {party.members.map((member: PartyMember) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onEdit={() => onEditMember(member.id)}
                  onRemove={() => setDeletingMemberId(member.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No members in this party yet.</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingMemberId !== null}
        onClose={() => setDeletingMemberId(null)}
        onConfirm={handleDeleteConfirm}
        itemName={memberToDelete?.characterName || 'Member'}
        itemType="member"
      />
    </main>
  );
}
