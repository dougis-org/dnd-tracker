/* eslint-disable no-undef */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Party } from '@/types/party';
import { PartyCard } from '@/components/parties/PartyCard';
import { DeleteConfirmModal } from '@/components/parties/DeleteConfirmModal';

export default function PartyListPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPartyId, setDeletingPartyId] = useState<string | null>(null);

  // Load parties from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('parties');
    if (stored) {
      try {
        setParties(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse parties from localStorage', e);
      }
    }
  }, []);

  // Filter parties based on search query
  const filteredParties = parties.filter((party) =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle party card click (edit)
  const handlePartyClick = (partyId: string) => {
    router.push(`/parties/${partyId}`);
  };

  // Handle delete party
  const handleDeleteParty = (partyId: string) => {
    const updated = parties.filter((p) => p.id !== partyId);
    setParties(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('parties', JSON.stringify(updated));
    }
    setDeletingPartyId(null);
  };

  // Handle create party navigation
  const handleCreateParty = () => {
    router.push('/parties/new');
  };

  const partyToDelete = parties.find((p) => p.id === deletingPartyId);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Parties</h1>

      {/* Search Bar */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Search parties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
          aria-label="Search or filter parties"
        />
        <button
          onClick={handleCreateParty}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Party
        </button>
      </div>

      {/* Empty State */}
      {filteredParties.length === 0 && parties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Create your first party to get started!</p>
          <button
            onClick={handleCreateParty}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Party
          </button>
        </div>
      )}

      {/* No Search Results */}
      {filteredParties.length === 0 && parties.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No parties match your search.</p>
        </div>
      )}

      {/* Party Grid */}
      {filteredParties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party) => (
            <div key={party.id} className="flex gap-2 h-fit">
              <div className="flex-1">
                <PartyCard
                  party={party}
                  onClick={handlePartyClick}
                />
              </div>
              <button
                onClick={() => setDeletingPartyId(party.id)}
                className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                aria-label={`Delete ${party.name}`}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingPartyId !== null}
        onClose={() => setDeletingPartyId(null)}
        onConfirm={() => {
          if (deletingPartyId) {
            handleDeleteParty(deletingPartyId);
          }
        }}
        itemName={partyToDelete?.name || 'Party'}
        itemType="party"
      />
    </div>
  );
}
