/* eslint-disable no-undef */
'use client';

import { useRouter } from 'next/navigation';
import { PartyForm } from '@/components/parties/PartyForm';
import { Party } from '@/types/party';

export default function PartyCreatePage() {
  const router = useRouter();

  const handleSubmit = (party: Party) => {
    try {
      if (typeof window === 'undefined') {
        return;
      }

      // Generate new party ID if not provided
      const newParty: Party = {
        ...party,
        id: party.id || `party-${Date.now()}`,
        created_at: party.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Get existing parties
      const stored = localStorage.getItem('parties');
      const parties: Party[] = stored ? JSON.parse(stored) : [];

      // Add new party
      parties.push(newParty);

      // Save to localStorage
      localStorage.setItem('parties', JSON.stringify(parties));

      // Navigate to new party detail page
      router.push(`/parties/${newParty.id}`);
    } catch (error) {
      console.error('Failed to create party:', error);
    }
  };

  const handleCancel = () => {
    router.push('/parties');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Party</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new party and add members to get started.
        </p>
      </div>
      <PartyForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
