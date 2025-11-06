"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CharacterProvider } from '../../../lib/characterStore';
import CharacterForm from '../../../components/characters/CharacterForm';
import { Character } from '../../../../types/character';

export default function NewCharacterPage() {
  const router = useRouter();

  const handleCreated = (c: Character | { id?: string } | null) => {
    // navigate to the new character detail page
    if (c && c.id) {
      router.push(`/characters/${c.id}`);
    } else {
      router.push('/characters');
    }
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

