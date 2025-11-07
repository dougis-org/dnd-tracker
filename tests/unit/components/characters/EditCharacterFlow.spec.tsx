import React, { useEffect, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CharacterProvider, useCharacterStore } from '../../../../src/lib/characterStore';
import { PartialCharacter } from '../../../../types/character';
import CharacterForm from '../../../../src/components/characters/CharacterForm';
import { Character } from '../../../../types/character';

function Harness() {
  const store = useCharacterStore();
  const [char, setChar] = useState<Character | null>(null);

  useEffect(() => {
    // Prevent re-running effect by checking if already set
    if (char !== null) return;

    const toAdd: PartialCharacter = {
      name: 'Editable Hero',
      className: 'Rogue',
      race: 'Halfling',
      level: 2,
      hitPoints: { current: 8, max: 8 },
      armorClass: 13,
      abilities: { str: 8, dex: 16, con: 12, int: 10, wis: 10, cha: 14 },
      equipment: [],
      notes: '',
    };
    const created = store.add(toAdd);
    setChar(created);
  }, [char, store]);

  const handleSaved = (c: Character) => {
    // show a temporary element we can assert
    const el = document.createElement('div');
    el.textContent = `SAVED:${c.name}`;
    document.body.appendChild(el);
  };

  if (!char) return <div>loading</div>;

  return <CharacterForm initial={char} onSaved={handleSaved} />;
}

describe('EditCharacterFlow', () => {
  it('prefills form, allows editing and updates character via store', async () => {
    const user = userEvent.setup();

    render(
      <CharacterProvider>
        <Harness />
      </CharacterProvider>
    );

    // Wait for the prefilled name to appear
    const nameInput = await screen.findByLabelText(/Name/);
    expect(nameInput).toHaveValue('Editable Hero');

    // Change the name
    await user.clear(nameInput);
    await user.type(nameInput, 'Edited Hero');

    // Submit
    const submit = screen.getByRole('button', { name: /create character/i });
    await user.click(submit);

    // Expect saved marker appended to body
    expect(await screen.findByText(/SAVED:Edited Hero/)).toBeInTheDocument();
  });
});
