"use client";
import React from 'react';
import { useCharacterStore } from '../../lib/characterStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeleteCharacterModal from './DeleteCharacterModal';
import type { Character } from '../../../types/character';

export default function CharacterDetail({ id }: { id: string }) {
  const store = useCharacterStore();
  const router = useRouter();
  const character = store.state.characters.find((c: Character) => c.id === id);

  if (!character) {
    return (
      <div>
        <p>Character not found.</p>
        <Link href="/characters">Back to characters</Link>
      </div>
    );
  }

  return (
    <article className="p-4">
      <h2 className="text-2xl font-bold">{character.name}</h2>
      <div className="text-sm text-muted">{character.className} — {character.race} — Level {character.level}</div>

      <section className="mt-4">
        <h3 className="font-semibold">Stats</h3>
        <div>HP: {character.hitPoints.current} / {character.hitPoints.max}</div>
        <div>AC: {character.armorClass}</div>
        <div>Abilities:</div>
        <ul>
          <li>STR: {character.abilities.str}</li>
          <li>DEX: {character.abilities.dex}</li>
          <li>CON: {character.abilities.con}</li>
          <li>INT: {character.abilities.int}</li>
          <li>WIS: {character.abilities.wis}</li>
          <li>CHA: {character.abilities.cha}</li>
        </ul>
      </section>

      <section className="mt-4">
        <h3 className="font-semibold">Equipment</h3>
        <ul>
          {(character.equipment || []).map((e: string, i: number) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </section>

      <div className="mt-4">
        <Link href={`/characters/${id}/edit`}>Edit</Link>
        <span className="mx-2">|</span>
        <DeleteCharacterModal
          id={id}
          characterName={character.name}
          onDeleted={() => router.push('/characters')}
        />
      </div>
    </article>
  );
}
