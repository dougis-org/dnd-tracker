import React from 'react';
import { Party } from '@/types/party';
import { PartyCompositionSummary } from './PartyCompositionSummary';

export interface PartyCardProps {
  party: Party;
  onClick: (partyId: string) => void;
}

export function PartyCard({ party, onClick }: PartyCardProps): React.ReactElement {
  const handleClick = () => onClick(party.id);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="party-card border rounded-lg p-4 bg-white shadow-sm h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-900">
        {party.name}
      </h3>

      {party.description && (
        <p className="text-sm text-gray-600 mb-3">{party.description}</p>
      )}

      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">
          {party.members.length} members
        </p>
      </div>

      <div className="flex-1">
        <PartyCompositionSummary party={party} variant="compact" />
      </div>
    </div>
  );
}
