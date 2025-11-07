"use client";

import React, { useState } from 'react';
import { useCharacterStore } from '../../lib/characterStore';
import { PartialCharacter, Character } from '../../../types/character';

type Props = {
  onCreated?: (c: Character) => void;
  // optional initial values to support edit flow
  initial?: PartialCharacter | Character | null;
  // callback when an existing character is updated
  onSaved?: (c: Character) => void;
};

export default function CharacterForm({ onCreated, initial = null, onSaved }: Props) {
  const store = useCharacterStore();

  const [name, setName] = useState(initial?.name ?? '');
  const [className, setClassName] = useState(initial?.className ?? '');
  const [race, setRace] = useState(initial?.race ?? '');
  const [level, setLevel] = useState(initial?.level ?? 1);
  const [hp, setHp] = useState(initial && typeof initial.hitPoints !== 'undefined' ? (typeof initial.hitPoints === 'number' ? initial.hitPoints : initial.hitPoints.current) : 1);
  const [ac, setAc] = useState(initial?.armorClass ?? 10);
  // abilities will map to the typed abilities object; keep as simple string inputs for now and parse into numbers
  const [abilitiesStr, setAbilitiesStr] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function resetForm() {
    setName('');
    setClassName('');
    setRace('');
    setLevel(1);
    setHp(1);
    setAc(10);
    setAbilitiesStr('');
    setError(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    const partial: PartialCharacter = {
      name: name.trim(),
      className: className.trim() || 'Commoner',
      race: race.trim() || 'Human',
      level: Number(level) || 1,
      hitPoints: { current: Number(hp) || 1, max: Number(hp) || 1 },
      armorClass: Number(ac) || 10,
      abilities: initial && 'abilities' in initial && initial.abilities ? initial.abilities : {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
      equipment: initial && 'equipment' in initial && initial.equipment ? initial.equipment : [],
      notes: initial && 'notes' in initial && initial.notes ? initial.notes : '',
    };

    try {
      // If editing (initial provided with id), perform update
      if (initial && 'id' in initial && typeof initial.id === 'string') {
        const updated: Character = {
          ...(initial as Character),
          ...partial,
          id: initial.id as string,
        } as Character;
        store.update(updated);
        setCreated(true);
        if (onSaved) onSaved(updated);
        // hide success after a short time
        globalThis.setTimeout(() => setCreated(false), 1500);
        return;
      }

      const createdChar = store.add(partial);
      setCreated(true);
      if (onCreated) onCreated(createdChar);
      // clear form so user sees it's done
      resetForm();
      // hide success after a short time
      globalThis.setTimeout(() => setCreated(false), 1500);
    } catch (_err) {
      setError('Failed to create/update character');
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="character-form">
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="class">Class</label>
        <input id="class" aria-label="Class" value={className} onChange={(e) => setClassName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="race">Race</label>
        <input id="race" aria-label="Race" value={race} onChange={(e) => setRace(e.target.value)} />
      </div>

      <div>
        <label htmlFor="level">Level</label>
        <input id="level" aria-label="Level" type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} />
      </div>

      <div>
        <label htmlFor="hp">HP</label>
        <input id="hp" aria-label="HP" type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
      </div>

      <div>
        <label htmlFor="ac">AC</label>
        <input id="ac" aria-label="AC" type="number" value={ac} onChange={(e) => setAc(Number(e.target.value))} />
      </div>

      <div>
  <label htmlFor="abilities">Abilities (optional text)</label>
  <textarea id="abilities" aria-label="Abilities" value={abilitiesStr} onChange={(e) => setAbilitiesStr(e.target.value)} />
      </div>

  {error && <div role="alert">{error}</div>}
  {created && <div role="status">{initial?.id ? 'Character updated' : 'Character created'}</div>}

      <button type="submit">Create character</button>
    </form>
  );
}
