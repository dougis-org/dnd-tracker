import React, { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteCharacterModal from '../../../../src/components/characters/DeleteCharacterModal';
import { CharacterProvider, useCharacterStore } from '../../../../src/lib/characterStore';
import { PartialCharacter } from '../../../../types/character';

function Harness() {
  const store = useCharacterStore();
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const toAdd: PartialCharacter = {
      name: 'To Delete',
      className: 'Barbarian',
      race: 'Orc',
      level: 1,
      hitPoints: { current: 10, max: 10 },
      armorClass: 12,
      abilities: { str: 14, dex: 10, con: 12, int: 8, wis: 10, cha: 9 },
      equipment: [],
      notes: '',
    };
    const created = store.add(toAdd);
    setId(created.id);
  }, [store]);

  if (!id) return <div>loading</div>;
  return <DeleteCharacterModal id={id} />;
}

describe('DeleteCharacterModal', () => {
  it('deletes then can undo the delete via store.undo', async () => {
    const user = userEvent.setup();
    render(
      <CharacterProvider>
        <Harness />
      </CharacterProvider>
    );

    // open confirm
    await user.click(screen.getByText(/Delete/));

    // confirm
    await user.click(screen.getByRole('button', { name: /Yes, delete/i }));

    // deleted message shown and Undo button present
    expect(await screen.findByText(/Character deleted/i)).toBeInTheDocument();
    const undo = screen.getByText(/Undo/);
    await user.click(undo);

    // after undo, restored message appears
    expect(await screen.findByText(/Character restored/i)).toBeInTheDocument();
  });
});
