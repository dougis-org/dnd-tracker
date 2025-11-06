import React from 'react';
import Link from 'next/link';
import { Character } from '../../../types/character';

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <article className="p-4 border rounded">
      <h3 className="text-lg font-semibold">
        <Link href={`/characters/${character.id}`}>{character.name}</Link>
      </h3>
      <div className="text-sm text-muted">{character.className} — {character.race}</div>
      <div className="mt-2 text-sm">
        <span className="mr-3">Level {character.level}</span>
        <span className="mr-3">HP {character.hitPoints.current}</span>
        <span>AC {character.armorClass}</span>
      </div>
    </article>
  );
}
