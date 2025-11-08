"use client";

import React, { useState } from 'react';
import { useCharacterStore } from '../../lib/characterStore';
import { PartialCharacter, Character } from '../../../types/character';
import {
  getInitialState,
  buildPartialCharacter,
  isEditMode,
} from './characterFormUtils';

type Props = {
  onCreated?: (c: Character) => void;
  initial?: PartialCharacter | Character | null;
  onSaved?: (c: Character) => void;
};

export default function CharacterForm({ onCreated, initial = null, onSaved }: Props) {
  const store = useCharacterStore();
  const initialState = getInitialState(initial);

  const [name, setName] = useState(initialState.name);
  const [className, setClassName] = useState(initialState.className);
  const [race, setRace] = useState(initialState.race);
  const [level, setLevel] = useState(initialState.level);
  const [hp, setHp] = useState(initialState.hp);
  const [ac, setAc] = useState(initialState.ac);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function resetForm() {
    setName('');
    setClassName('');
    setRace('');
    setLevel(1);
    setHp(1);
    setAc(10);
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
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="class">Class</label>
        <input id="class" value={className} onChange={(e) => setClassName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="race">Race</label>
        <input id="race" value={race} onChange={(e) => setRace(e.target.value)} />
      </div>

      <div>
        <label htmlFor="level">Level</label>
        <input id="level" type="number" value={level} onChange={(e) => setLevel(Number(e.target.value))} />
      </div>

      <div>
        <label htmlFor="hp">HP</label>
        <input id="hp" type="number" value={hp} onChange={(e) => setHp(Number(e.target.value))} />
      </div>

      <div>
        <label htmlFor="ac">AC</label>
        <input id="ac" type="number" value={ac} onChange={(e) => setAc(Number(e.target.value))} />
      </div>

      {error && <div role="alert">{error}</div>}
      {created && <div role="status">{isEditMode(initial) ? 'Character updated' : 'Character created'}</div>}

      <button type="submit">Create character</button>
    </form>
  );
}
