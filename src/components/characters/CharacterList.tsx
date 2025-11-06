"use client";
import React, { useEffect, useMemo, useState } from 'react';
import CharacterCard from './CharacterCard';
import { useCharacterStore, CharacterProvider } from '../../lib/characterStore';

function InnerList() {
  const store = useCharacterStore();
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    // initialize seed data when mounted
    if (store.state.characters.length === 0) store.init();
  }, [store]);

  const chars = store.state.characters;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chars.filter((c) => {
      if (classFilter && c.className !== classFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q) ||
        c.race.toLowerCase().includes(q)
      );
    });
  }, [chars, query, classFilter]);

  if (!chars || chars.length === 0) {
    return (
      <div>
        <p>No characters yet.</p>
        <a href="/characters/new">Create a character</a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          aria-label="Search characters"
          className="border p-2 flex-1"
          placeholder="Search by name, class, or race"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select aria-label="Filter by class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All classes</option>
          {[...new Set(chars.map((c) => c.className))].map((cn) => (
            <option key={cn} value={cn}>
              {cn}
            </option>
          ))}
        </select>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((c) => (
          <CharacterCard key={c.id} character={c} />
        ))}
      </section>
    </div>
  );
}

export default function CharacterList() {
  return (
    <CharacterProvider>
      <InnerList />
    </CharacterProvider>
  );
}
