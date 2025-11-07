"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CharacterProvider } from '../../../lib/characterStore';
import CharacterForm from '../../../components/characters/CharacterForm';
import { Character } from '../../../../types/character';

export default function NewCharacterPage() {
  const router = useRouter();

  const handleCreated = (c: Character) => {
    // navigate to the new character detail page
    router.push(`/characters/${c.id}`);
  };

  return (
    <CharacterProvider>
      <div>
        <h1>Create a new character</h1>
        <CharacterForm onCreated={handleCreated} />
      </div>
    </CharacterProvider>
  );
}

