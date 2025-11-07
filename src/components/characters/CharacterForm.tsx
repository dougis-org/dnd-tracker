"use client";

import React, { useState } from 'react';
import { useCharacterStore } from '../../lib/characterStore';
import { PartialCharacter, Character } from '../../../types/character';

type Props = {
  onCreated?: (c: Character) => void;
  initial?: PartialCharacter | Character | null;
  onSaved?: (c: Character) => void;
};

const DEFAULT_ABILITIES = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
};

function getInitialState(initial: PartialCharacter | Character | null | undefined) {
  if (!initial) {
    return {
      name: '',
      className: '',
      race: '',
      level: 1,
      hp: 1,
      ac: 10,
      abilitiesStr: '',
    };
  }

  const hp = typeof initial.hitPoints === 'number'
    ? initial.hitPoints
    : initial.hitPoints?.current ?? 1;

  return {
    name: initial.name ?? '',
    className: initial.className ?? '',
    race: initial.race ?? '',
    level: initial.level ?? 1,
    hp,
    ac: initial.armorClass ?? 10,
    abilitiesStr: '',
  };
}

function buildPartialCharacter(
  name: string,
  className: string,
  race: string,
  level: number,
  hp: number,
  ac: number,
  initial?: PartialCharacter | Character | null
): PartialCharacter {
  return {
    name: name.trim(),
    className: className.trim() || 'Commoner',
    race: race.trim() || 'Human',
    level: parseInt(String(level), 10) || 1,
    hitPoints: { current: parseInt(String(hp), 10) || 1, max: parseInt(String(hp), 10) || 1 },
    armorClass: parseInt(String(ac), 10) || 10,
    abilities: (initial && 'abilities' in initial && initial.abilities) ? initial.abilities : DEFAULT_ABILITIES,
    equipment: (initial && 'equipment' in initial && initial.equipment) ? initial.equipment : [],
    notes: (initial && 'notes' in initial && initial.notes) ? initial.notes : '',
  };
}

function isEditMode(initial: PartialCharacter | Character | null | undefined): initial is Character {
  return !!(initial && 'id' in initial && typeof initial.id === 'string');
}

export default function CharacterForm({ onCreated, initial = null, onSaved }: Props) {
  const store = useCharacterStore();
  const initialState = getInitialState(initial);

  const [name, setName] = useState(initialState.name);
  const [className, setClassName] = useState(initialState.className);
  const [race, setRace] = useState(initialState.race);
  const [level, setLevel] = useState(initialState.level);
  const [hp, setHp] = useState(initialState.hp);
  const [ac, setAc] = useState(initialState.ac);
  const [abilitiesStr, setAbilitiesStr] = useState(initialState.abilitiesStr);
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

    try {
      const partial = buildPartialCharacter(name, className, race, level, hp, ac, initial);

      if (isEditMode(initial)) {
        const updated: Character = {
          ...(initial as Character),
          ...partial,
          id: initial.id,
        } as Character;
        store.update(updated);
        setCreated(true);
        if (onSaved) onSaved(updated);
        globalThis.setTimeout(() => setCreated(false), 1500);
        return;
      }

      const createdChar = store.add(partial);
      setCreated(true);
      if (onCreated) onCreated(createdChar);
      resetForm();
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
      {created && <div role="status">{isEditMode(initial) ? 'Character updated' : 'Character created'}</div>}

      <button type="submit">Create character</button>
    </form>
  );
}
