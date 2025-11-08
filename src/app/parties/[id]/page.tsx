/* eslint-disable no-undef */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Party } from '@/types/party';
import PartyDetail from '@/components/parties/PartyDetail';

export default function PartyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params?.id as string;

  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);

  // Load party from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !partyId) return;

    setLoading(true);
    const stored = localStorage.getItem('parties');
    if (stored) {
      try {
        const parties: Party[] = JSON.parse(stored);
        const found = parties.find((p) => p.id === partyId);
        setParty(found || null);
      } catch (e) {
        console.error('Failed to parse parties from localStorage', e);
        setParty(null);
      }
    }
    setLoading(false);
  }, [partyId]);

  const handleBack = () => {
    router.push('/parties');
  };

  const handleEditMember = (memberId: string) => {
    // Could navigate to edit page or open modal
    console.log('Edit member:', memberId);
  };

  const handleDeleteMember = (memberId: string) => {
    // Could delete member from party
    console.log('Delete member:', memberId);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <p>Loading party...</p>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Party Not Found</h1>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Parties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <PartyDetail
        party={party}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
        onBack={handleBack}
      />
    </div>
  );
}
