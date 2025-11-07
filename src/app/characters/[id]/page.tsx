"use client";
import React from 'react';
import CharacterDetail from '../../../components/characters/CharacterDetail';

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="p-6">
      <CharacterDetail id={id} />
    </main>
  );
}

