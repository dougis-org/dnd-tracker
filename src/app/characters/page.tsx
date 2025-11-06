import React from 'react';
import CharacterList from '../../components/characters/CharacterList';

export const metadata = {
  title: 'Characters',
};

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Characters</h1>
      <CharacterList />
    </main>
  );
}
'use client';

import { NotImplementedPage } from '@/components/NotImplementedPage';

export default function CharactersPage() {
  return <NotImplementedPage />;
}
