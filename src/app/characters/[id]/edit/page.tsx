"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CharacterProvider, useCharacterStore } from '../../../lib/characterStore';
import CharacterForm from '../../../components/characters/CharacterForm';
import { Character } from '../../../../types/character';

function EditInner({ id }: { id: string }) {
  const store = useCharacterStore();
  const character = store.state.characters.find((c: Character) => c.id === id) as Character | undefined;
  const router = useRouter();

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
