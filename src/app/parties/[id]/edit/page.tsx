/* eslint-disable no-undef */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PartyForm } from '@/components/parties/PartyForm';
import { Party } from '@/types/party';

export default function PartyEditPage() {
  const router = useRouter();
  const params = useParams();
  const partyId = params?.id as string;

  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !partyId) return;

    const stored = localStorage.getItem('parties');
    if (stored) {
      const parties: Party[] = JSON.parse(stored);
      const found = parties.find((p) => p.id === partyId);
      setParty(found || null);
    }
    setLoading(false);
  }, [partyId]);

  const handleSubmit = (updatedParty: Party) => {
    try {
      if (typeof window === 'undefined' || !partyId) return;

      // Get existing parties
      const stored = localStorage.getItem('parties');
      const parties: Party[] = stored ? JSON.parse(stored) : [];

      // Find and update the party
      const index = parties.findIndex((p) => p.id === partyId);
      if (index >= 0) {
        parties[index] = {
          ...updatedParty,
          id: partyId,
          updated_at: new Date().toISOString(),
        };

        // Save to localStorage
        localStorage.setItem('parties', JSON.stringify(parties));

        // Navigate back to party detail
        router.push(`/parties/${partyId}`);
      }
    } catch (error) {
      console.error('Failed to update party:', error);
    }
  };

  const handleCancel = () => {
    router.push(`/parties/${partyId}`);
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
        <h1 className="text-3xl font-bold mb-4">Party Not Found</h1>
        <button
          onClick={() => router.push('/parties')}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Back to Parties
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Party</h1>
        <p className="text-muted-foreground mt-2">
          Update party details and manage members.
        </p>
      </div>
      <PartyForm party={party} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
