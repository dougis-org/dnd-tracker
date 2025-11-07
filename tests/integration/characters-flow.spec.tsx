/**
 * Integration tests for character management components
 * T031: Verify components work together within shared CharacterProvider
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CharacterList from '@/components/characters/CharacterList';
import CharacterDetail from '@/components/characters/CharacterDetail';
import CharacterForm from '@/components/characters/CharacterForm';
import { CharacterProvider, useCharacterStore } from '@/lib/characterStore';
import type { Character } from '../../types/character';
import mockCharacters from '@/lib/mock/characters';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Extract detail harness
function CharacterDetailHarness({ characterId }: { characterId: string }) {
  const store = useCharacterStore();
  if (store.state.characters.length === 0) store.init();
  return <CharacterDetail id={characterId} />;
}

// Extract form harness
function CharacterFormHarness() {
  const [created, setCreated] = useState(false);
  const store = useCharacterStore();

  if (created) {
    const newChar = store.state.characters.find((c: Character) => c.name === 'Integration Test Character');
    return <div data-testid="success">{newChar?.name}</div>;
  }

  return <CharacterForm onCreated={() => setCreated(true)} />;
}

describe('Character Management Integration', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('CharacterList displays seeded characters', () => {
    render(
      <CharacterProvider>
        <CharacterList />
      </CharacterProvider>
    );

    const firstCharacter = mockCharacters[0];
    expect(screen.getByText(firstCharacter.name)).toBeInTheDocument();
  });

  it('CharacterDetail shows character when valid ID provided', () => {
    const firstCharacter = mockCharacters[0];

    render(
      <CharacterProvider>
        <CharacterDetailHarness characterId={firstCharacter.id} />
      </CharacterProvider>
    );

    expect(screen.getByText(firstCharacter.name)).toBeInTheDocument();
    expect(screen.getByText(/HP:/i)).toBeInTheDocument();
  });

  it('CharacterForm can create a new character', async () => {
    render(
      <CharacterProvider>
        <CharacterFormHarness />
      </CharacterProvider>
    );

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Integration Test Character' } });

    const submitButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('success')).toHaveTextContent('Integration Test Character');
    });
  });
});
