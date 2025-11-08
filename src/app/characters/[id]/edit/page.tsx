"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterProvider, useCharacterStore } from '@/lib/characterStore';
import CharacterForm from '@/components/characters/CharacterForm';
import type { Character } from '../../../../../types/character';

function EditInner({ id }: { id: string }) {
  const store = useCharacterStore();
  const router = useRouter();

  useEffect(() => {
    // Initialize store if empty (direct navigation/page refresh)
    if (store.state.characters.length === 0) {
      store.init();
    }
  }, [store]);

  const character = store.state.characters.find((c) => c.id === id);

  const handleSaved = (c: Character) => {
    // navigate back to detail page
    router.push(`/characters/${c.id}`);
  };

  if (!character) {
    return (
      <div>
        <p>Character not found.</p>
      </div>
    );
  }

  return <CharacterForm initial={character} onSaved={handleSaved} />;
}

export default function EditCharacterPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <CharacterProvider>
      <div>
        <h1>Edit character</h1>
        <EditInner id={id} />
      </div>
    </CharacterProvider>
  );
}
